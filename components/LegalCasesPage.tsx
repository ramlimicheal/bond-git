import React, { useEffect, useState } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { useOrg } from '../org.context';
import { useInvoices } from '../dataStore';
import { Icons } from './Icon';
import { toast } from './Toast';
import { generateLegalNoticePDF, downloadBlob, type LegalNoticeData } from '../utils/pdfGenerator';

const db = supabase as any;
const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

interface LegalCase {
  id: string;
  invoice_id: string | null;
  client_id: string | null;
  stage: string;
  amount_claimed: number;
  interest_rate: number;
  notes: string | null;
  opened_at: string;
}

export const LegalCasesPage: React.FC = () => {
  const { orgId, org } = useOrg();
  const { items: invoices } = useInvoices();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!orgId) return;
    const { data } = await db.from('legal_cases').select('*').eq('org_id', orgId).order('opened_at', { ascending: false });
    setCases(data || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [orgId]);

  const overdue = invoices.filter(i => i.status === 'Overdue' || (i.status === 'Pending' && new Date(i.dueDate) < new Date()));

  const openCase = async (invoiceId: string, noticeType: LegalNoticeData['noticeType']) => {
    if (!orgId) return;
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    const { data: caseRow, error } = await db.from('legal_cases').insert({
      org_id: orgId,
      invoice_id: invoiceId,
      stage: 'notice_sent',
      amount_claimed: inv.amountDue,
      interest_rate: 18,
      notes: `${noticeType} notice generated`,
    }).select('*').single();
    if (error || !caseRow) { toast.error(`Couldn't open case: ${error?.message}`); return; }

    const blob = await generateLegalNoticePDF({
      noticeType,
      caseNumber: `CASE-${caseRow.id.slice(0, 8).toUpperCase()}`,
      org: {
        name: org?.name || 'Your Company',
        legal_name: org?.legal_name,
        gstin: org?.gstin,
        email: org?.email,
        phone: org?.phone,
      },
      client: { name: inv.clientName, email: '' },
      invoiceNumber: inv.number,
      invoiceDate: inv.issuedDate,
      amountClaimed: inv.amountDue,
      interestRate: 18,
      replyDays: 15,
    });
    downloadBlob(blob, `legal-notice-${inv.number}.pdf`);
    toast.success('Legal notice generated and downloaded');
    refresh();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Legal Cases</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Auto-generate demand notices, Section 138 NI Act memos and MSME Samadhaan letters for overdue invoices.</p>
      </header>

      {/* Overdue invoices needing action */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Icons.AlertCircle size={18} className="text-red-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Overdue Invoices ({overdue.length})</h2>
        </div>
        {overdue.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No overdue invoices. Great work staying on top.</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {overdue.map(inv => (
              <div key={inv.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{inv.number} · {inv.clientName}</p>
                  <p className="text-xs text-gray-500">Due {inv.dueDate} · {fmt(inv.amountDue)} outstanding</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => openCase(inv.id, 'demand')} className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-md hover:opacity-90">
                    Demand Notice
                  </button>
                  <button onClick={() => openCase(inv.id, 'section_138')} className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                    §138 NI Act
                  </button>
                  <button onClick={() => openCase(inv.id, 'msme_samadhaan')} className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                    MSME Samadhaan
                  </button>
                  {inv.amountDue >= 100000 && (
                    <button onClick={() => openCase(inv.id, 'section_8_ibc')} className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-700 rounded-md hover:bg-red-50">
                      §8 IBC
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open cases */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Icons.Scale size={18} />
          <h2 className="font-semibold text-gray-900 dark:text-white">Open Cases ({cases.length})</h2>
        </div>
        {loading ? <div className="p-8 text-center text-gray-500">Loading…</div> : cases.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No open legal cases yet. Generate a notice above to start.</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {cases.map(c => {
              const inv = invoices.find(i => i.id === c.invoice_id);
              return (
                <div key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">CASE-{c.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{inv?.number ?? 'Invoice removed'} · {inv?.clientName ?? '—'} · opened {new Date(c.opened_at).toLocaleDateString('en-GB')}</p>
                    {c.notes && <p className="text-xs text-gray-500 mt-1">{c.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{fmt(c.amount_claimed)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{c.stage.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalCasesPage;
