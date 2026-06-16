import { ApiInvoice, ApiUser, AuthResponse } from './api.types.ts';
import { INVOICES_DATA, USERS_DATA } from './constants.ts';
import type { Invoice, User } from './types.ts';
import { supabase } from './src/integrations/supabase/client';

const db = supabase as any;

async function getCurrentOrgId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await db.from('organization_members')
    .select('org_id').eq('user_id', user.id)
    .order('joined_at', { ascending: true }).limit(1).maybeSingle();
  return data?.org_id ?? null;
}

function rowToApiInvoice(r: any): ApiInvoice {
  const total = Number(r.total);
  const paid = Number(r.amount_paid);
  return {
    id: r.id,
    number: r.number,
    status: (r.status?.[0]?.toUpperCase() + r.status?.slice(1)) || 'Draft',
    clientName: r.client_name ?? '',
    clientType: r.client_type ?? '',
    issuedAt: r.issue_date ?? '',
    dueAt: r.due_date ?? '',
    amountPaid: paid,
    amountDue: total - paid,
    items: (r.items ?? []).map((it: any, i: number) => ({
      id: String(it.id ?? i),
      description: it.description ?? '',
      quantity: Number(it.quantity ?? 1),
      price: Number(it.price ?? 0),
    })),
  };
}

const STORAGE_KEYS = {
  invoices: 'billenty_invoices',
  users: 'billenty_users',
  resetToken: 'billenty_reset_token',
};

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 150));

function readStored<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function writeStored<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function parseNumericId(id: string): number {
  const numeric = Number(id.replace(/\D/g, ''));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : Date.now();
}

function toApiInvoice(invoice: Invoice): ApiInvoice {
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    clientName: invoice.clientName,
    clientType: invoice.clientType,
    issuedAt: invoice.issuedDate,
    dueAt: invoice.dueDate,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    items: invoice.items.map((item, index) => ({
      id: String(item.id ?? index),
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    })),
  };
}

function toApiUser(user: User): ApiUser {
  return {
    id: parseNumericId(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

function getInvoices(): Invoice[] {
  return readStored(STORAGE_KEYS.invoices, INVOICES_DATA);
}

function saveInvoices(invoices: Invoice[]) {
  writeStored(STORAGE_KEYS.invoices, invoices);
}

function getUsers(): User[] {
  return readStored(STORAGE_KEYS.users, USERS_DATA);
}

function saveUsers(users: User[]) {
  writeStored(STORAGE_KEYS.users, users);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  await wait();
  if (!email || !password) throw new Error('Email and password required');
  const data: AuthResponse = {
    token: 'mock-token',
    user: { id: 1, email, name: email.split('@')[0] || 'User', role: 'admin' },
  };
  localStorage.setItem('auth_token', data.token);
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  await wait();
  if (!name || !email || !password) throw new Error('All fields required');
  const data: AuthResponse = {
    token: 'mock-token',
    user: { id: 1, email, name, role: 'admin' },
  };
  localStorage.setItem('auth_token', data.token);
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string; _devToken?: string }> {
  await wait();
  if (!email) throw new Error('Email is required');
  const token = Math.random().toString(36).slice(2, 10).toUpperCase();
  localStorage.setItem(STORAGE_KEYS.resetToken, token);
  return { message: 'Reset instructions generated.', _devToken: token };
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  await wait();
  if (!token || token !== localStorage.getItem(STORAGE_KEYS.resetToken)) throw new Error('Invalid reset token');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');
  localStorage.removeItem(STORAGE_KEYS.resetToken);
  return { message: 'Password reset successfully' };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  await wait();
  if (!currentPassword || !newPassword) throw new Error('Both passwords are required');
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters');
  return { message: 'Password changed successfully' };
}

function toDbDate(s: string | undefined | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function payloadToRow(payload: any, orgId: string) {
  const total = (payload.amountPaid ?? 0) + (payload.amountDue ?? 0);
  return {
    org_id: orgId,
    number: payload.number || `INV-${Date.now()}`,
    status: (payload.status || 'Draft').toLowerCase(),
    client_name: payload.clientName ?? null,
    client_type: payload.clientType ?? null,
    issue_date: toDbDate(payload.issuedAt) ?? new Date().toISOString().slice(0, 10),
    due_date: toDbDate(payload.dueAt),
    amount_paid: payload.amountPaid ?? 0,
    subtotal: total,
    total,
    items: (payload.items ?? []).map((it: any, i: number) => ({
      id: String(it.id ?? `${Date.now()}-${i}`),
      description: it.description,
      quantity: it.quantity,
      price: it.price,
    })),
  };
}

export async function fetchInvoices(params?: { search?: string; status?: string }): Promise<ApiInvoice[]> {
  const orgId = await getCurrentOrgId();
  if (!orgId) return [];
  let q = db.from('invoices').select('*').eq('org_id', orgId).order('created_at', { ascending: false });
  if (params?.status) q = q.eq('status', params.status.toLowerCase());
  const { data, error } = await q;
  if (error || !data) return [];
  const search = params?.search?.toLowerCase().trim();
  return (data as any[])
    .map(rowToApiInvoice)
    .filter((inv) => !search || inv.number.toLowerCase().includes(search) || inv.clientName.toLowerCase().includes(search));
}

export async function createInvoice(payload: any): Promise<ApiInvoice> {
  const orgId = await getCurrentOrgId();
  if (!orgId) throw new Error('No organization');
  const { data, error } = await db.from('invoices').insert(payloadToRow(payload, orgId)).select('*').single();
  if (error || !data) throw new Error(error?.message || 'Create failed');
  return rowToApiInvoice(data);
}

export async function deleteInvoice(id: string | number): Promise<void> {
  const { error } = await db.from('invoices').delete().eq('id', String(id));
  if (error) throw new Error(error.message);
}

export async function updateInvoice(id: string | number, payload: any): Promise<ApiInvoice> {
  const orgId = await getCurrentOrgId();
  if (!orgId) throw new Error('No organization');
  const { data, error } = await db.from('invoices').update(payloadToRow(payload, orgId)).eq('id', String(id)).select('*').single();
  if (error || !data) throw new Error(error?.message || 'Update failed');
  return rowToApiInvoice(data);
}

export async function fetchUsers(): Promise<ApiUser[]> {
  await wait();
  return getUsers().map(toApiUser);
}

export async function createUser(payload: { name: string; email: string; role?: string; status?: string }): Promise<ApiUser> {
  await wait();
  const user: User = {
    id: String(Date.now()),
    name: payload.name,
    email: payload.email,
    role: (payload.role || 'Viewer') as User['role'],
    status: (payload.status || 'Invited') as User['status'],
    lastActive: 'Just now',
  };
  saveUsers([...getUsers(), user]);
  return toApiUser(user);
}

export async function updateUser(id: number, payload: { role?: string; status?: string }): Promise<ApiUser> {
  await wait();
  let updatedUser: User | undefined;
  const users = getUsers().map((user) => {
    if (parseNumericId(user.id) !== id) return user;
    updatedUser = {
      ...user,
      role: (payload.role || user.role) as User['role'],
      status: (payload.status || user.status) as User['status'],
    };
    return updatedUser;
  });

  if (!updatedUser) throw new Error('User not found');
  saveUsers(users);
  return toApiUser(updatedUser);
}

export async function deleteUser(id: number): Promise<void> {
  await wait();
  saveUsers(getUsers().filter((user) => parseNumericId(user.id) !== id));
}
