
import { ApiInvoice, ApiUser, AuthResponse } from '../api.types';

// Mock DB for demonstration if backend is not reachable
const MOCK_DELAY = 500;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for real fetch calls
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...options?.headers,
        }
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }

    return res.json() as Promise<T>;
}

export const api = {
    proposals: {
        list: () => fetchAPI('/api/v1/proposals'),
        create: (data: any) => fetchAPI('/api/v1/proposals', { method: 'POST', body: JSON.stringify(data) }),
        get: (id: string) => fetchAPI(`/api/v1/proposals/${id}`),
        update: (id: string, data: any) => fetchAPI(`/api/v1/proposals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => fetchAPI(`/api/v1/proposals/${id}`, { method: 'DELETE' }),
    },
    clients: {
        list: () => fetchAPI('/api/v1/clients'),
        create: (data: any) => fetchAPI('/api/v1/clients', { method: 'POST', body: JSON.stringify(data) }),
    },
    products: {
        list: () => fetchAPI('/api/v1/products'),
        create: (data: any) => fetchAPI('/api/v1/products', { method: 'POST', body: JSON.stringify(data) }),
    },
    upload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('auth_token');

        const res = await fetch(`${API_BASE_URL}/api/v1/upload`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });

        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    }
};