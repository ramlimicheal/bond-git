import React, { useEffect, useState } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { useAuth } from '../auth.context';
import { Icons } from './Icon';
import { toast } from './Toast';

interface AttachedInvoice {
  id: string;
  number: string;
  status: string;
  due_date: string | null;
  issued_date: string | null;
  total: number;
  amount_paid: number;
  client_name?: string;
  org_name?: string;
}

interface NoticeRow {
  id: string;
  invoice_id: string;
  subject: string;
  status: string;
  sent_at: string | null;
  ai_draft: string;
  created_at: string;
}

export const LawyerPortalPage: React.FC = () => {
  const { user } = useAuth();
  const db = supabase as any;
  const [loading, setLoading] = useState(true);
  const [isLawyer, setIsLawyer] = useState(false);
  const [invoices, setInvoices] = useState<AttachedInvoice[]>([]);
  const [notices, setNotices] = useState<Record<string, NoticeRow[]>>({});
  const [openInvoice, setOpenInvoice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const { data: lawyer } = await db.from('lawyers').select('id, full_name').eq('user_id', user.id).maybeSingle();
      if (!lawyer) { setIsLawyer(false); setLoading(false); return; }
      setIsLawyer(true);

      const { data: invs } = await db
        .from('invoices')
        .select('id, number, status, due_date, issued_date, total, amount_paid, client_id, org_id')
        .eq('attached_lawyer_id', lawyer.id)
        .order('due_date', { ascending: true });
      const list = invs ?? [];

      const clientIds = Array.from(new Set(list.map((i: any) => i.client_id).filter(Boolean)));
      const orgIds = Array.from(new Set(list.map((i: any) => i.org_id).filter(Boolean)));
      const [{ data: clients }, { data: orgs }] = await Promise.all([
        clientIds.length ? db.from('clients').select('id, name, company_name').in('id', clientIds) : Promise.resolve({ data: [] }),
        orgIds.length ? db.from('organizations').select('id, name').in('id', orgIds) : Promise.resolve({ data: [] }),
      ]);
      const cmap = new Map((clients ?? []).map((c: any) => [c.id, c.company_name || c.name]));
      const omap = new Map((orgs ?? []).map((o: any) => [o.id, o.name]));

      const enriched: AttachedInvoice[] = list.map((i: any) => ({
        id: i.id, number: i.number, status: i.status, due_date: i.due_date,
        issued_date: i.issued_date, total: i.total, amount_paid: i.amount_paid,
        client_name: cmap.get(i.client_id) as string, org_name: omap.get(i.org_id) as string,
      }));
      setInvoices(enriched);

      if (enriched.length) {
        const { data: ns } = await db.from('legal_notices').select('*').in('invoice_id', enriched.map(i => i.id)).order('created_at', { ascending: false });
        const grouped: Record<string, NoticeRow[]> = {};
        (ns ?? []).forEach((n: any) => { (grouped[n.invoice_id] ||= []).push(n); });
        setNotices(grouped);
      }
      setLoading(false);
    })();
  }, [user, db]);

  const markSent = async (id: string, invId: string) => {
    const { error } = await db.from('legal_notices').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Marked as sent');
    setNotices(prev => ({ ...prev, [invId]: (prev[invId] || []).map(n => n.id === id ? { ...n, status: 'sent', sent_at: new Date().toISOString() } : n) }));
  };

  if (loading) return <div className="p-8 text-gray-500">Loading lawyer portal…</div>;
  if (!isLawyer) return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Lawyer portal</h1>
      <p className="text-sm text-gray-500">Your account isn't linked to a lawyer profile yet. Ask the company that engaged you to add your email under <em>Legal → Lawyers</em>, then sign in again.</p>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <Icons.Shield size={20} className="text-gray-700 dark:text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Engaged invoices</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">Read-only access to invoices where you've been attached as counsel. You can view the AI-drafted demand notice and mark it sent once issued.</p>

      {invoices.length === 0 ? (
        <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-10 text-center text-sm text-gray-500">No invoices have engaged you yet.</div>
      ) : (
        <ul className="space-y-3">
          {invoices.map(inv => {
            const open = openInvoice === inv.id;
            const ns = notices[inv.id] || [];
            const amountDue = Number(inv.total) - Number(inv.amount_paid);
            return (
              <li key={inv.id} className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950">
                <button onClick={() => setOpenInvoice(open ? null : inv.id)} className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-gray-500">{inv.number} · {inv.org_name}</p>
                    <p className="font-semibold text-gray-900 dark:text-white truncate mt-0.5">{inv.client_name || 'Client'}</p>
                    <p className="text-xs text-gray-500 mt-1">Due {inv.due_date} · {ns.length} notice{ns.length === 1 ? '' : 's'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{Math.round(amountDue).toLocaleString('en-IN')}</p>
                    <p className="text-[11px] uppercase tracking-wide text-amber-700 dark:text-amber-400">{inv.status}</p>
                  </div>
                </button>
                {open && (
                  <div className="border-t border-gray-200 dark:border-gray-800 p-5 space-y-4">
                    {ns.length === 0 ? <p className="text-sm text-gray-500">No notice drafted yet for this invoice.</p> : ns.map(n => (
                      <div key={n.id} className="border border-gray-200 dark:border-gray-800 rounded-md">
                        <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.subject}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Drafted {new Date(n.created_at).toLocaleDateString('en-GB')} · status <span className="uppercase">{n.status}</span></p>
                          </div>
                          {n.status === 'draft' && (
                            <button onClick={() => markSent(n.id, inv.id)} className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-md dark:bg-white dark:text-gray-900">Mark sent</button>
                          )}
                        </div>
                        <pre className="whitespace-pre-wrap text-xs font-mono p-3 max-h-[400px] overflow-auto text-gray-700 dark:text-gray-300">{n.ai_draft}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LawyerPortalPage;