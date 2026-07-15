import { useEffect, useState, useCallback } from 'react';
import { supabase } from './src/integrations/supabase/client';
import { useOrg } from './org.context';
import type { Client, Product, Quote, Proposal, Invoice } from './types';
import { checkEntitlement, incrementUsage, type Meter } from './utils/entitlements';
import { toast } from './components/Toast';

// One-time listener: surface entitlement blocks as toasts without coupling
// every create call site to the toast module.
if (typeof window !== 'undefined' && !(window as any).__billentyEntitlementListener) {
  (window as any).__billentyEntitlementListener = true;
  window.addEventListener('billenty:entitlement-blocked', (e: any) => {
    const d = e.detail || {};
    const label = String(d.feature || 'this action').replace(/_/g, ' ');
    const msg = d.reason === 'forbidden' ? 'Not authorised.'
      : d.reason === 'no_subscription' ? 'No active subscription. Please choose a plan.'
      : `Plan limit reached for ${label} (${d.used}/${d.limit}). Upgrade to continue.`;
    toast.warning(msg);
  });
}

// ============ MAPPERS ============
const mapClient = (r: any): Client => ({
  id: r.id, name: r.name, company: r.company ?? undefined, email: r.email ?? '',
  phone: r.phone ?? undefined, address: r.address_line1 ?? undefined,
  city: r.city ?? undefined, state: r.state ?? undefined, pincode: r.pincode ?? undefined,
  gstin: r.gstin ?? undefined, pan: r.pan ?? undefined, notes: r.notes ?? undefined,
  createdAt: r.created_at,
});
const clientToRow = (c: Partial<Client>, orgId: string) => ({
  org_id: orgId, name: c.name!, company: c.company ?? null, email: c.email ?? null,
  phone: c.phone ?? null, address_line1: c.address ?? null, city: c.city ?? null,
  state: c.state ?? null, pincode: c.pincode ?? null, gstin: c.gstin ?? null,
  pan: c.pan ?? null, notes: c.notes ?? null,
});

const mapProduct = (r: any): Product => ({
  id: r.id, name: r.name, description: r.description ?? undefined,
  category: (r.category as Product['category']) ?? 'Other',
  price: Number(r.price), taxRate: Number(r.tax_rate), unit: r.unit ?? 'unit',
  createdAt: r.created_at,
});
const productToRow = (p: Partial<Product>, orgId: string) => ({
  org_id: orgId, name: p.name!, description: p.description ?? null,
  category: p.category ?? null, price: p.price ?? 0, tax_rate: p.taxRate ?? 18,
  unit: p.unit ?? 'unit',
});

const fmtDate = (d: string | undefined) => {
  if (!d) return '';
  // already formatted "10 Jan 2026" => store as ISO
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
};
const showDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const mapQuote = (r: any): Quote => ({
  id: r.id, number: r.number, status: (r.status?.[0]?.toUpperCase() + r.status?.slice(1)) as Quote['status'],
  clientName: r.client_name ?? '', clientType: r.client_type ?? '',
  createdDate: showDate(r.issue_date), validUntil: showDate(r.valid_until),
  total: Number(r.total), items: (r.items || []) as Quote['items'],
});
const quoteToRow = (q: Partial<Quote>, orgId: string) => ({
  org_id: orgId,
  number: q.number || `QT-${Date.now()}`,
  status: (q.status || 'Draft').toLowerCase(),
  client_name: q.clientName ?? null, client_type: q.clientType ?? null,
  issue_date: fmtDate(q.createdDate), valid_until: q.validUntil ? fmtDate(q.validUntil) : null,
  total: q.total ?? 0, subtotal: q.total ?? 0,
  items: q.items ?? [],
});

const mapProposal = (r: any): Proposal => ({
  id: r.id, number: r.number, title: r.title,
  status: (r.status?.[0]?.toUpperCase() + r.status?.slice(1)) as Proposal['status'],
  clientName: r.client_name ?? '', clientEmail: r.client_email ?? '',
  projectType: r.project_type ?? '',
  createdDate: showDate(r.issue_date), validUntil: showDate(r.valid_until),
  totalValue: Number(r.total_value), sections: (r.sections || []) as Proposal['sections'],
  clientSignature: r.client_signature ?? undefined,
  clientSignedAt: r.client_signed_at ? showDate(r.client_signed_at) : undefined,
  senderSignature: r.sender_signature ?? undefined,
  senderSignedAt: r.sender_signed_at ? showDate(r.sender_signed_at) : undefined,
});
const proposalToRow = (p: Partial<Proposal>, orgId: string) => ({
  org_id: orgId,
  number: p.number || `PROP-${Date.now()}`,
  title: p.title || 'Untitled Proposal',
  status: (p.status || 'Draft').toLowerCase(),
  client_name: p.clientName ?? null, client_email: p.clientEmail ?? null,
  project_type: p.projectType ?? null,
  issue_date: fmtDate(p.createdDate), valid_until: p.validUntil ? fmtDate(p.validUntil) : null,
  total_value: p.totalValue ?? 0,
  sections: p.sections ?? [],
  client_signature: p.clientSignature ?? null,
  sender_signature: p.senderSignature ?? null,
});

const mapInvoice = (r: any): Invoice => ({
  id: r.id, number: r.number,
  status: (r.status?.[0]?.toUpperCase() + r.status?.slice(1)) as Invoice['status'],
  clientName: r.client_name ?? '', clientType: r.client_type ?? '',
  issuedDate: showDate(r.issue_date), dueDate: showDate(r.due_date),
  amountPaid: Number(r.amount_paid), amountDue: Number(r.total) - Number(r.amount_paid),
  items: (r.items || []) as Invoice['items'],
});
const invoiceToRow = (inv: Partial<Invoice>, orgId: string) => {
  const total = (inv.amountPaid ?? 0) + (inv.amountDue ?? 0);
  return {
    org_id: orgId,
    number: inv.number || `INV-${Date.now()}`,
    status: (inv.status || 'Draft').toLowerCase(),
    client_name: inv.clientName ?? null, client_type: inv.clientType ?? null,
    issue_date: fmtDate(inv.issuedDate), due_date: inv.dueDate ? fmtDate(inv.dueDate) : null,
    amount_paid: inv.amountPaid ?? 0, total, subtotal: total,
    items: inv.items ?? [],
  };
};

// ============ GENERIC HOOK ============
type Mapper<T> = {
  table: string;
  toApp: (r: any) => T;
  toRow: (item: any, orgId: string) => any;
  meter?: Meter; // when set, create() runs check_entitlement + increments the meter
};

function useTable<T extends { id: string }>(m: Mapper<T>) {
  const { orgId, loading: orgLoading } = useOrg();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const db = supabase as any;

  const refresh = useCallback(async () => {
    if (!orgId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await db.from(m.table).select('*').eq('org_id', orgId).order('created_at', { ascending: false });
    if (!error && data) setItems(data.map(m.toApp));
    setLoading(false);
  }, [orgId, m.table, db]);

  useEffect(() => { if (!orgLoading) refresh(); }, [orgLoading, refresh]);

  const create = useCallback(async (data: Omit<T, 'id'> | Partial<T>): Promise<T | null> => {
    if (!orgId) return null;
    if (m.meter) {
      const ent = await checkEntitlement(orgId, m.meter);
      if (!ent.allowed) {
        console.warn(`[${m.table}] blocked by entitlement`, ent);
        // Broadcast so a top-level listener can toast without importing here.
        try {
          window.dispatchEvent(new CustomEvent('billenty:entitlement-blocked', {
            detail: { feature: m.meter, ...ent },
          }));
        } catch { /* SSR-safe no-op */ }
        return null;
      }
    }
    const row = m.toRow(data, orgId);
    const { data: inserted, error } = await db.from(m.table).insert(row).select('*').single();
    if (error || !inserted) { console.error(`[${m.table}] insert`, error); return null; }
    const mapped = m.toApp(inserted);
    if (m.meter) { void incrementUsage(orgId, m.meter, 1); }
    setItems((prev) => [mapped, ...prev]);
    return mapped;
  }, [orgId, m, db]);

  const update = useCallback(async (id: string, patch: Partial<T>) => {
    if (!orgId) return;
    const row = m.toRow({ ...items.find((i) => i.id === id), ...patch }, orgId);
    const { data: updated, error } = await db.from(m.table).update(row).eq('id', id).select('*').single();
    if (error || !updated) { console.error(`[${m.table}] update`, error); return; }
    const mapped = m.toApp(updated);
    setItems((prev) => prev.map((it) => (it.id === id ? mapped : it)));
  }, [orgId, items, m, db]);

  const remove = useCallback(async (id: string) => {
    if (!orgId) return;
    const { error } = await db.from(m.table).delete().eq('id', id);
    if (error) { console.error(`[${m.table}] delete`, error); return; }
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, [orgId, m.table, db]);

  const getById = useCallback((id: string) => items.find((it) => it.id === id), [items]);

  return { items, loading, create, update, remove, getById, refresh };
}

export const useClients = () => useTable<Client>({ table: 'clients', toApp: mapClient, toRow: clientToRow });
export const useProducts = () => useTable<Product>({ table: 'products', toApp: mapProduct, toRow: productToRow });
export const useQuotes = () => useTable<Quote>({ table: 'quotes', toApp: mapQuote, toRow: quoteToRow, meter: 'quotes' });
export const useProposals = () => useTable<Proposal>({ table: 'proposals', toApp: mapProposal, toRow: proposalToRow, meter: 'proposals' });
export const useInvoices = () => useTable<Invoice>({ table: 'invoices', toApp: mapInvoice, toRow: invoiceToRow, meter: 'invoices' });

// Sync accessors kept for back-compat (return empty; server-backed now)
export const getQuotes = (): Quote[] => [];
export const getProposals = (): Proposal[] => [];
export const getClients = (): Client[] => [];
export const getProducts = (): Product[] => [];
