import { useEffect, useState, useCallback } from 'react';
import type { Client, Product, Quote, Proposal } from './types';

const STORAGE_KEYS = {
  clients: 'billenty_clients',
  products: 'billenty_products',
  quotes: 'billenty_quotes',
  proposals: 'billenty_proposals',
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('billenty:store', { detail: { key } }));
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ============ SEED DATA ============
const SEED_CLIENTS: Client[] = [
  { id: 'c1', name: 'Rahul Sharma', company: 'Tech Solutions Inc.', email: 'rahul@techsolutions.in', phone: '+91 98765 43210', city: 'Mumbai', state: 'Maharashtra', gstin: '27AABCT1234A1Z5', createdAt: new Date().toISOString() },
  { id: 'c2', name: 'Priya Patel', company: 'Creative Studio', email: 'priya@creativestudio.com', phone: '+91 97654 32109', city: 'Bangalore', state: 'Karnataka', createdAt: new Date().toISOString() },
  { id: 'c3', name: 'Amit Kumar', company: 'StartUp Hub', email: 'amit@startuphub.io', phone: '+91 96543 21098', city: 'Delhi', state: 'Delhi', createdAt: new Date().toISOString() },
];

const SEED_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Logo Design', description: 'Custom brand identity package', category: 'Design', price: 15000, taxRate: 18, unit: 'project', createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Website Development', description: 'Full-stack website with CMS', category: 'Development', price: 75000, taxRate: 18, unit: 'project', createdAt: new Date().toISOString() },
  { id: 'p3', name: 'Strategic Consulting', description: 'Business strategy session', category: 'Consulting', price: 5000, taxRate: 18, unit: 'hour', createdAt: new Date().toISOString() },
  { id: 'p4', name: 'Maintenance Support', description: 'Monthly maintenance retainer', category: 'Support', price: 12000, taxRate: 18, unit: 'month', createdAt: new Date().toISOString() },
];

const SEED_QUOTES: Quote[] = [
  { id: 'q1', number: 'QT-2026-0001', status: 'Sent', clientName: 'Tech Solutions Inc.', clientType: 'Software Development', createdDate: '10 Jan 2026', validUntil: '10 Feb 2026', total: 15000, items: [{ id: 'qi1', description: 'Web Application Development', quantity: 1, price: 15000 }] },
  { id: 'q2', number: 'QT-2026-0002', status: 'Draft', clientName: 'Creative Agency', clientType: 'Branding', createdDate: '08 Jan 2026', validUntil: '08 Feb 2026', total: 5500, items: [{ id: 'qi2', description: 'Brand Identity Package', quantity: 1, price: 5500 }] },
  { id: 'q3', number: 'QT-2026-0003', status: 'Accepted', clientName: 'Global Enterprises', clientType: 'Consulting', createdDate: '05 Jan 2026', validUntil: '05 Feb 2026', total: 25000, items: [{ id: 'qi3', description: 'Strategic Consulting Package', quantity: 1, price: 25000 }] },
];

const SEED_PROPOSALS: Proposal[] = [
  { id: 'pr1', number: 'PROP-2026-0001', title: 'Logo Design & Brand Identity', status: 'Signed', clientName: 'Rahul Sharma', clientEmail: 'rahul@techsolutions.in', projectType: 'Branding', createdDate: '05 Jan 2026', validUntil: '05 Feb 2026', totalValue: 45000, sections: [], clientSignature: 'Rahul Sharma', clientSignedAt: '07 Jan 2026', senderSignature: 'Billenty User', senderSignedAt: '05 Jan 2026' },
  { id: 'pr2', number: 'PROP-2026-0002', title: 'E-Commerce Website Development', status: 'Sent', clientName: 'Priya Patel', clientEmail: 'priya@creativestudio.com', projectType: 'Web Development', createdDate: '08 Jan 2026', validUntil: '08 Feb 2026', totalValue: 150000, sections: [] },
  { id: 'pr3', number: 'PROP-2026-0003', title: 'Mobile App UI/UX Design', status: 'Draft', clientName: 'Amit Kumar', clientEmail: 'amit@startuphub.io', projectType: 'UI/UX Design', createdDate: '10 Jan 2026', validUntil: '10 Feb 2026', totalValue: 75000, sections: [] },
];

// ============ GENERIC HOOK ============
function useCollection<T extends { id: string }>(key: string, seed: T[]) {
  const [items, setItems] = useState<T[]>(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) {
      if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    try { return JSON.parse(raw) as T[]; } catch { return seed; }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === key) setItems(read<T[]>(key, seed));
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === key) setItems(read<T[]>(key, seed));
    };
    window.addEventListener('billenty:store', handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('billenty:store', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, [key]); // eslint-disable-line

  const create = useCallback((data: Omit<T, 'id'>) => {
    const item = { ...data, id: uid() } as T;
    const next = [item, ...read<T[]>(key, seed)];
    write(key, next);
    return item;
  }, [key]);

  const update = useCallback((id: string, patch: Partial<T>) => {
    const next = read<T[]>(key, seed).map((it) => (it.id === id ? { ...it, ...patch } : it));
    write(key, next);
  }, [key]);

  const remove = useCallback((id: string) => {
    const next = read<T[]>(key, seed).filter((it) => it.id !== id);
    write(key, next);
  }, [key]);

  const getById = useCallback((id: string) => items.find((it) => it.id === id), [items]);

  return { items, create, update, remove, getById };
}

export const useClients = () => useCollection<Client>(STORAGE_KEYS.clients, SEED_CLIENTS);
export const useProducts = () => useCollection<Product>(STORAGE_KEYS.products, SEED_PRODUCTS);
export const useQuotes = () => useCollection<Quote>(STORAGE_KEYS.quotes, SEED_QUOTES);
export const useProposals = () => useCollection<Proposal>(STORAGE_KEYS.proposals, SEED_PROPOSALS);

// Sync accessors (for non-hook code)
export const getQuotes = () => read<Quote[]>(STORAGE_KEYS.quotes, SEED_QUOTES);
export const getProposals = () => read<Proposal[]>(STORAGE_KEYS.proposals, SEED_PROPOSALS);
export const getClients = () => read<Client[]>(STORAGE_KEYS.clients, SEED_CLIENTS);
export const getProducts = () => read<Product[]>(STORAGE_KEYS.products, SEED_PRODUCTS);