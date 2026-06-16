import React from 'react';
import { Icons } from './Icon';
import { useInvoices, useQuotes, useProposals } from '../dataStore';

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export const SalesOverviewPage: React.FC = () => {
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
    { label: 'Paid Revenue', value: fmt(totalRevenue), sub: `${invoices.filter(i => i.status === 'Paid').length} invoices`, icon: Icons.TrendingUp, color: 'text-green-600' },
    { label: 'Outstanding', value: fmt(outstanding), sub: `${invoices.filter(i => i.status === 'Pending').length} pending`, icon: Icons.Clock, color: 'text-amber-600' },
    { label: 'Overdue', value: fmt(overdue.reduce((s, i) => s + i.amountDue, 0)), sub: `${overdue.length} invoices`, icon: Icons.AlertCircle, color: 'text-red-600' },
    { label: 'Drafts', value: String(draftCount), sub: 'Invoices, quotes, proposals', icon: Icons.FileText, color: 'text-gray-600' },
    { label: 'Quote Pipeline', value: fmt(quoteValue), sub: `${quotes.length} quotes`, icon: Icons.Sales, color: 'text-blue-600' },
    { label: 'Proposal Pipeline', value: fmt(proposalValue), sub: `${proposals.length} proposals`, icon: Icons.Briefcase, color: 'text-violet-600' },
  ];

  const recent = [
    ...invoices.slice(0, 5).map(i => ({ type: 'Invoice', number: i.number, client: i.clientName, amount: i.amountPaid + i.amountDue, status: i.status, date: i.issuedDate })),
    ...quotes.slice(0, 5).map(q => ({ type: 'Quote', number: q.number, client: q.clientName, amount: q.total, status: q.status, date: q.createdDate })),
    ...proposals.slice(0, 5).map(p => ({ type: 'Proposal', number: p.number, client: p.clientName, amount: p.totalValue, status: p.status, date: p.createdDate })),
  ].slice(0, 12);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All your invoices, quotes and proposals in one place.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Ico = c.icon as any;
          return (
            <div key={c.label} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{c.label}</p>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{c.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.sub}</p>
                </div>
                <Ico size={20} className={c.color} />
              </div>
            </div>
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
            <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesOverviewPage;
