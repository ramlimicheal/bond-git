import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icon';
import { useInvoices, useQuotes, useProposals } from '../dataStore';

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export const SalesOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { items: invoices, loading: li } = useInvoices();
  const { items: quotes, loading: lq } = useQuotes();
  const { items: proposals, loading: lp } = useProposals();

  if (li || lq || lp) return <div className="p-8 text-gray-500">Loading…</div>;

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amountPaid, 0);
  const outstanding = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Draft').reduce((s, i) => s + i.amountDue, 0);
  const overdue = invoices.filter(i => i.status === 'Overdue');
  const draftCount = invoices.filter(i => i.status === 'Draft').length + quotes.filter(q => q.status === 'Draft').length + proposals.filter(p => p.status === 'Draft').length;
  const quoteValue = quotes.reduce((s, q) => s + q.total, 0);
  const proposalValue = proposals.reduce((s, p) => s + p.totalValue, 0);

  const cards = [
    { label: 'Paid Revenue', value: fmt(totalRevenue), sub: `${invoices.filter(i => i.status === 'Paid').length} invoices`, icon: Icons.TrendingUp, color: 'text-green-600', tip: 'Sum of amount_paid across invoices with status = Paid.', go: '/invoices' },
    { label: 'Outstanding', value: fmt(outstanding), sub: `${invoices.filter(i => i.status === 'Pending').length} pending`, icon: Icons.Clock, color: 'text-amber-600', tip: 'Sum of amount_due across invoices that are Pending or Overdue (excludes Drafts).', go: '/invoices' },
    { label: 'Overdue', value: fmt(overdue.reduce((s, i) => s + i.amountDue, 0)), sub: `${overdue.length} invoices`, icon: Icons.AlertCircle, color: 'text-red-600', tip: 'Sum of amount_due across invoices with status = Overdue.', go: '/invoices' },
    { label: 'Drafts', value: String(draftCount), sub: 'Invoices, quotes, proposals', icon: Icons.FileText, color: 'text-gray-600', tip: 'Count of Draft invoices + Draft quotes + Draft proposals.', go: '/invoices' },
    { label: 'Quote Pipeline', value: fmt(quoteValue), sub: `${quotes.length} quotes`, icon: Icons.Sales, color: 'text-blue-600', tip: 'Sum of total across every quote (regardless of status).', go: '/quotes' },
    { label: 'Proposal Pipeline', value: fmt(proposalValue), sub: `${proposals.length} proposals`, icon: Icons.Briefcase, color: 'text-violet-600', tip: 'Sum of total_value across every proposal (regardless of status).', go: '/proposals' },
  ];

  const recent = [
    ...invoices.slice(0, 5).map(i => ({ type: 'Invoice', id: i.id, number: i.number, client: i.clientName, amount: i.amountPaid + i.amountDue, status: i.status, date: i.issuedDate, href: `/invoices/${i.id}` })),
    ...quotes.slice(0, 5).map(q => ({ type: 'Quote', id: q.id, number: q.number, client: q.clientName, amount: q.total, status: q.status, date: q.createdDate, href: `/quotes/${q.id}` })),
    ...proposals.slice(0, 5).map(p => ({ type: 'Proposal', id: p.id, number: p.number, client: p.clientName, amount: p.totalValue, status: p.status, date: p.createdDate, href: `/proposals/${p.id}` })),
  ].slice(0, 12);

  const isEmpty = invoices.length === 0 && quotes.length === 0 && proposals.length === 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All your invoices, quotes and proposals in one place.</p>
      </header>

      {isEmpty && (
        <div className="bg-white dark:bg-gray-950 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Nothing here yet. Get started by creating your first document.</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button onClick={() => navigate('/invoices/new')} className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-gray-900">Create invoice</button>
            <button onClick={() => navigate('/quotes/new')} className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">Create quote</button>
            <button onClick={() => navigate('/proposals/new')} className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">Create proposal</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Ico = c.icon as any;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => navigate(c.go)}
              title={c.tip}
              className="text-left bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{c.label}</p>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{c.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.sub}</p>
                </div>
                <Ico size={20} className={c.color} />
              </div>
              <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500 leading-snug">{c.tip}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No sales activity yet. Create your first invoice or quote.</div>
          ) : recent.map((r, i) => (
            <button
              key={`${r.type}-${r.id}-${i}`}
              type="button"
              onClick={() => navigate(r.href)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{r.type}</span>
                <span className="font-medium text-gray-900 dark:text-white">{r.number}</span>
                <span className="text-gray-500 dark:text-gray-400">{r.client}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">{r.date}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{r.status}</span>
                <span className="font-semibold text-gray-900 dark:text-white w-24 text-right">{fmt(r.amount)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesOverviewPage;
