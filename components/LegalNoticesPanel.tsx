import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { useOrg } from '../org.context';
import { Invoice } from '../types';
import { toast } from './Toast';
import { Icons } from './Icon';

interface Lawyer { id: string; full_name: string; bar_council_no: string; rate_per_hour?: number | null; }
interface LegalNotice {
  id: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'closed';
  subject: string;
  ai_draft: string;
  lawyer_id: string | null;
  sent_at: string | null;
  created_at: string;
}

const PROJECT_REF = (import.meta.env.VITE_SUPABASE_PROJECT_ID as string) || '';
const FN_URL = PROJECT_REF
  ? `https://${PROJECT_REF}.supabase.co/functions/v1/ai-legal-notice`
  : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-legal-notice`;

export const LegalNoticesPanel: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const { org, orgId } = useOrg();
  const db = supabase as any;
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [notices, setNotices] = useState<LegalNotice[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    // Marketplace browsing goes through the safe RPC — contact details stay server-side.
    const [{ data: lw }, { data: ns }] = await Promise.all([
      db.rpc('list_marketplace_lawyers'),
      db.from('legal_notices').select('*').eq('invoice_id', invoice.id).order('created_at', { ascending: false }),
    ]);
    const lawyerList: Lawyer[] = (lw ?? []) as Lawyer[];
    setLawyers(lawyerList);
    setNotices((ns ?? []) as LegalNotice[]);
    if (lawyerList.length && !selectedLawyer) setSelectedLawyer(lawyerList[0].id);
    setLoading(false);
  }, [orgId, invoice.id, selectedLawyer, db]);

  useEffect(() => { load(); }, [load]);

  const computeDaysOverdue = () => {
    if (!invoice.dueDate) return 0;
    const due = new Date(invoice.dueDate);
    if (isNaN(due.getTime())) return 0;
    const diff = Math.floor((Date.now() - due.getTime()) / 86400000);
    return Math.max(0, diff);
  };

  const generate = async () => {
    if (!orgId) return;
    if (lawyers.length === 0) { toast.error('Add a lawyer in Legal → Lawyers first'); return; }
    const lawyerId = selectedLawyer || lawyers[0].id;
    setDrafting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          invoice: {
            number: invoice.number,
            total: invoice.amountPaid + invoice.amountDue,
            amountDue: invoice.amountDue,
            issuedDate: invoice.issuedDate,
            dueDate: invoice.dueDate,
            clientName: invoice.clientName,
            items: invoice.items,
          },
          lawyerId,
          org: org ? { name: org.name, legal_name: (org as any).legal_name, gstin: org.gstin, state: (org as any).state, address_line1: (org as any).address_line1, city: (org as any).city } : undefined,
          daysOverdue: computeDaysOverdue(),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || `AI error ${res.status}`);

      const { error } = await db.from('legal_notices').insert({
        org_id: orgId,
        invoice_id: invoice.id,
        lawyer_id: lawyerId,
        subject: payload.subject || `Demand notice — Invoice ${invoice.number}`,
        ai_draft: payload.draft || '',
        status: 'draft',
      });
      if (error) throw error;

      await db.from('invoices').update({ attached_lawyer_id: lawyerId }).eq('id', invoice.id);
      toast.success('Legal notice drafted by AI');
      await load();
    } catch (e) {
      toast.error((e as Error).message || 'Could not draft notice');
    } finally {
      setDrafting(false);
    }
  };

  const markSent = async (id: string) => {
    await db.from('legal_notices').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id);
    toast.success('Notice marked as sent');
    load();
  };

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading legal notices…</div>;

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Icons.Shield size={16} /> Legal layer</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">AI-drafted demand notice tailored to Indian law. Attach a lawyer, generate the draft, then mark as sent when issued.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedLawyer}
            onChange={(e) => setSelectedLawyer(e.target.value)}
            className="text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 max-w-[180px]"
          >
            {lawyers.length === 0 && <option value="">No lawyers yet</option>}
            {lawyers.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
          </select>
          <button
            onClick={generate}
            disabled={drafting || lawyers.length === 0}
            className="text-xs font-medium px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-gray-900 disabled:opacity-50"
          >
            {drafting ? 'Drafting…' : notices.length ? 'Generate another' : 'Generate AI draft'}
          </button>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">No legal notices yet for this invoice.</div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {notices.map(n => {
            const lw = lawyers.find(l => l.id === n.lawyer_id);
            const expanded = expandedId === n.id;
            return (
              <li key={n.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lw ? `Drafted for ${lw.full_name}` : 'Lawyer removed'} · {new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${n.status === 'sent' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : n.status === 'acknowledged' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : n.status === 'closed' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{n.status}</span>
                    {n.status === 'draft' && (
                      <button onClick={() => markSent(n.id)} className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">Mark sent</button>
                    )}
                    <button onClick={() => setExpandedId(expanded ? null : n.id)} className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white">{expanded ? 'Hide' : 'View'}</button>
                  </div>
                </div>
                {expanded && (
                  <pre className="mt-3 whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3 font-mono text-gray-700 dark:text-gray-300 max-h-[400px] overflow-auto">
{n.ai_draft}
                  </pre>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LegalNoticesPanel;