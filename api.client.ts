import { ApiInvoice, ApiUser, AuthResponse } from './api.types.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('Invalid credentials');
  }

  const data = (await res.json()) as AuthResponse;
  localStorage.setItem('auth_token', data.token);
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    throw new Error('Registration failed');
  }

  const data = (await res.json()) as AuthResponse;
  localStorage.setItem('auth_token', data.token);
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string; _devToken?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error('Request failed');
  }

  return await res.json();
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Reset failed');
  }

  return await res.json();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Change password failed');
  }

  return await res.json();
}

export async function fetchInvoices(params?: { search?: string; status?: string }): Promise<ApiInvoice[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/invoices`);
  if (params?.search) url.searchParams.set('search', params.search);
  if (params?.status) url.searchParams.set('status', params.status);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch invoices');
  }

  const data = await res.json();
  return data.invoices as ApiInvoice[];
}

export async function createInvoice(payload: Omit<ApiInvoice, 'id' | 'items'> & { items: { description: string; quantity: number; price: number }[] }): Promise<ApiInvoice> {
  const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to create invoice');
  }

  const data = await res.json();
  return data.invoice as ApiInvoice;
}

export async function deleteInvoice(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete invoice');
  }
}

export async function updateInvoice(
  id: number,
  payload: Omit<ApiInvoice, 'id' | 'items'> & { items: { description: string; quantity: number; price: number }[] }
): Promise<ApiInvoice> {
  const res = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to update invoice');
  }

  const data = await res.json();
  return data.invoice as ApiInvoice;
}

export async function fetchUsers(): Promise<ApiUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/users`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }

  const data = await res.json();
  return data.users as ApiUser[];
}

export async function createUser(payload: { name: string; email: string; role?: string; status?: string }): Promise<ApiUser> {
  const res = await fetch(`${API_BASE_URL}/api/v1/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to create user');
  }

  const data = await res.json();
  return data.user as ApiUser;
}

export async function updateUser(id: number, payload: { role?: string; status?: string }): Promise<ApiUser> {
  const res = await fetch(`${API_BASE_URL}/api/v1/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to update user');
  }

  const data = await res.json();
  return data.user as ApiUser;
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete user');
  }
}
