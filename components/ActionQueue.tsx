import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices, useQuotes, useProposals } from '../dataStore';
import { Icons } from './Icon';

type Priority = 'high' | 'medium' | 'low';

interface ActionItem {
  id: string;
  priority: Priority;
  icon: React.ReactNode;
  title: string;
  meta: string;
  cta: string;
  onClick: () => void;
  amount?: string;
}

const fmtINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const daysBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / 86400000);

const priorityStyle: Record<Priority, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

/**
 * Action Queue — one-click decisions that actually move the needle.
 * Rule: every row must be a decision, not a notification.
 */
export const ActionQueue: React.FC = () => {
  const navigate = useNavigate();
  const { items: invoices } = useInvoices();
  const { items: quotes } = useQuotes();
  const { items: proposals } = useProposals();

  const actions = useMemo<ActionItem[]>(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const list: ActionItem[] = [];

    // 1. Overdue invoices → send legal notice draft
    for (const inv of invoices) {
      if (inv.status !== 'Overdue' && inv.status !== 'Pending') continue;
      const due = new Date(inv.dueDate);
      if (isNaN(due.getTime())) continue;
      const overdueBy = daysBetween(today, due);
      if (overdueBy >= 3) {
        list.push({
          id: `overdue-${inv.id}`,
          priority: overdueBy > 15 ? 'high' : 'medium',
          icon: <Icons.Scale size={14} className="text-rose-600" />,
          title: `${inv.clientName} · invoice ${inv.number} is ${overdueBy} days overdue`,
          meta: `Due ${inv.dueDate}`,
          cta: 'Send notice',
          amount: fmtINR(inv.amountDue),
          onClick: () => navigate(`/invoices/${inv.id}`),
        });
      }
    }

    // 2. Accepted quotes → convert to invoice
    for (const q of quotes) {
      if (q.status !== 'Accepted') continue;
      list.push({
        id: `quote-${q.id}`,
        priority: 'high',
        icon: <Icons.CheckCircle size={14} className="text-emerald-600" />,
        title: `${q.clientName} accepted quote ${q.number}`,
        meta: 'Convert to invoice to lock the deal',
        cta: 'Convert',
        amount: fmtINR(q.total),
        onClick: () => navigate(`/quotes/${q.id}`),
      });
    }

    // 3. Signed proposals → create invoice
    for (const p of proposals) {
      if (p.status !== 'Signed') continue;
      list.push({
        id: `proposal-${p.id}`,
        priority: 'high',
        icon: <Icons.FileText size={14} className="text-indigo-600" />,
        title: `${p.clientName} signed ${p.title || p.number}`,
        meta: 'Turn this proposal into a billable invoice',
        cta: 'Create invoice',
        amount: fmtINR(p.totalValue),
        onClick: () => navigate(`/proposals/${p.id}`),
      });
    }

    // 4. Draft invoices sitting > 2 days → send
    for (const inv of invoices) {
      if (inv.status !== 'Draft') continue;
      const issued = new Date(inv.issuedDate);
      if (isNaN(issued.getTime())) continue;
      const age = daysBetween(today, issued);
      if (age >= 2) {
        list.push({
          id: `draft-${inv.id}`,
          priority: 'medium',
          icon: <Icons.Send size={14} className="text-amber-600" />,
          title: `Draft ${inv.number} for ${inv.clientName} sitting ${age} days`,
          meta: 'Send it — drafts don\u2019t get paid',
          cta: 'Review & send',
          amount: fmtINR(inv.amountDue),
          onClick: () => navigate(`/invoices/${inv.id}`),
        });
      }
    }

    // Sort: high → medium → low, cap to 6
    const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return list.sort((a, b) => rank[a.priority] - rank[b.priority]).slice(0, 6);
  }, [invoices, quotes, proposals, navigate]);

  return (
    <div className="bg-white border border-[#E8E4D8] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-semibold text-[#808080] tracking-wider uppercase">Action Queue</h2>
          {actions.length > 0 && (
            <span className="text-[10px] font-medium bg-[#0F172A] text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {actions.length}
            </span>
          )}
        </div>
        <div className="text-[11px] text-gray-400">Decisions that get you paid</div>
      </div>

      {actions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 flex items-center justify-center">
            <Icons.CheckCircle size={18} className="text-emerald-600" />
          </div>
          <div className="text-sm font-medium text-[#0F172A]">Inbox zero</div>
          <div className="text-xs text-gray-500 mt-1">Nothing needs your attention right now.</div>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {actions.map(a => (
            <div key={a.id} className="flex items-center gap-3 py-3 group">
              <span className={`w-1 h-8 rounded-full ${priorityStyle[a.priority]}`} />
              <span className="w-7 h-7 rounded-md bg-[#faf9f4] border border-[#EFEBDE] flex items-center justify-center shrink-0">
                {a.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#0F172A] truncate">{a.title}</div>
                <div className="text-[11px] text-gray-500 truncate">{a.meta}</div>
              </div>
              {a.amount && (
                <div className="text-[13px] font-semibold text-[#0F172A] tabular-nums hidden sm:block">{a.amount}</div>
              )}
              <button
                onClick={a.onClick}
                className="text-[12px] font-medium bg-[#1A1A1A] text-white py-1.5 px-3 rounded-md hover:bg-[#333333] transition-colors shrink-0"
              >
                {a.cta}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionQueue;