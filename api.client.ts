import { ApiInvoice, ApiUser, AuthResponse } from './api.types.ts';
import { INVOICES_DATA, USERS_DATA } from './constants.ts';
import type { Invoice, User } from './types.ts';

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
    id: parseNumericId(invoice.id),
    number: invoice.number,
    status: invoice.status,
    clientName: invoice.clientName,
    clientType: invoice.clientType,
    issuedAt: invoice.issuedDate,
    dueAt: invoice.dueDate,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    items: invoice.items.map((item, index) => ({
      id: parseNumericId(item.id) || index + 1,
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

export async function fetchInvoices(params?: { search?: string; status?: string }): Promise<ApiInvoice[]> {
  await wait();
  const search = params?.search?.toLowerCase().trim();
  const status = params?.status;
  return getInvoices()
    .filter((invoice) => !search || invoice.number.toLowerCase().includes(search) || invoice.clientName.toLowerCase().includes(search))
    .filter((invoice) => !status || invoice.status === status)
    .map(toApiInvoice);
}

export async function createInvoice(payload: Omit<ApiInvoice, 'id' | 'items'> & { items: { description: string; quantity: number; price: number }[] }): Promise<ApiInvoice> {
  await wait();
  const newInvoice: Invoice = {
    id: String(Date.now()),
    number: payload.number,
    status: payload.status as Invoice['status'],
    clientName: payload.clientName,
    clientType: payload.clientType,
    issuedDate: payload.issuedAt,
    dueDate: payload.dueAt,
    amountPaid: payload.amountPaid,
    amountDue: payload.amountDue,
    items: payload.items.map((item, index) => ({ ...item, id: `${Date.now()}-${index}` })),
  };
  const invoices = [newInvoice, ...getInvoices()];
  saveInvoices(invoices);
  return toApiInvoice(newInvoice);
}

export async function deleteInvoice(id: number): Promise<void> {
  await wait();
  saveInvoices(getInvoices().filter((invoice) => parseNumericId(invoice.id) !== id));
}

export async function updateInvoice(
  id: number,
  payload: Omit<ApiInvoice, 'id' | 'items'> & { items: { description: string; quantity: number; price: number }[] }
): Promise<ApiInvoice> {
  await wait();
  let updatedInvoice: Invoice | undefined;
  const invoices = getInvoices().map((invoice) => {
    if (parseNumericId(invoice.id) !== id) return invoice;
    updatedInvoice = {
      id: invoice.id,
      number: payload.number,
      status: payload.status as Invoice['status'],
      clientName: payload.clientName,
      clientType: payload.clientType,
      issuedDate: payload.issuedAt,
      dueDate: payload.dueAt,
      amountPaid: payload.amountPaid,
      amountDue: payload.amountDue,
      items: payload.items.map((item, index) => ({ ...item, id: `${id}-${index}` })),
    };
    return updatedInvoice;
  });

  if (!updatedInvoice) throw new Error('Invoice not found');
  saveInvoices(invoices);
  return toApiInvoice(updatedInvoice);
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
