import React, { useMemo } from 'react';
import { useInvoices } from '../dataStore';
import { Icons } from './Icon';

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export const FinanceReportsPage: React.FC = () => {
  const { items: invoices, loading } = useInvoices();

  const data = useMemo(() => {
    const byMonth = new Map<string, { paid: number; outstanding: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' });
      byMonth.set(key, { paid: 0, outstanding: 0 });
    }
    const ageing = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    const clientTotals = new Map<string, number>();
    let totalGST = 0;
    let totalSubtotal = 0;

    for (const inv of invoices) {
      const d = new Date(inv.issuedDate);
      const key = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' });
      const bucket = byMonth.get(key);
      if (bucket) { bucket.paid += inv.amountPaid; bucket.outstanding += inv.amountDue; }

      if (inv.amountDue > 0) {
        const due = new Date(inv.dueDate);
        const daysOverdue = Math.floor((now.getTime() - due.getTime()) / 86400000);
        if (daysOverdue <= 30) ageing['0-30'] += inv.amountDue;
        else if (daysOverdue <= 60) ageing['31-60'] += inv.amountDue;
        else if (daysOverdue <= 90) ageing['61-90'] += inv.amountDue;
        else ageing['90+'] += inv.amountDue;
      }

      const total = inv.amountPaid + inv.amountDue;
      const sub = total / 1.18;
      totalSubtotal += sub;
      totalGST += total - sub;
      clientTotals.set(inv.clientName, (clientTotals.get(inv.clientName) || 0) + total);
    }

    const topClients = Array.from(clientTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { byMonth: Array.from(byMonth.entries()), ageing, totalGST, totalSubtotal, topClients };
  }, [invoices]);

  const maxBar = Math.max(1, ...data.byMonth.map(([, v]) => v.paid + v.outstanding));

  const exportCSV = () => {
    const rows = [['Invoice', 'Client', 'Issued', 'Due', 'Status', 'Amount Paid', 'Amount Due', 'Total']];
    for (const inv of invoices) {
      rows.push([inv.number, inv.clientName, inv.issuedDate, inv.dueDate, inv.status, String(inv.amountPaid), String(inv.amountDue), String(inv.amountPaid + inv.amountDue)]);
    }
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `billenty-invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Revenue, ageing, GST and top clients.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
          <Icons.Download size={16} /> Export CSV
        </button>
      </header>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue — Last 6 Months</h2>
        <div className="flex items-end gap-3 h-48">
          {data.byMonth.map(([month, v]) => {
            const totalH = ((v.paid + v.outstanding) / maxBar) * 100;
            const paidH = v.paid ? (v.paid / (v.paid + v.outstanding)) * totalH : 0;
            return (
              <div key={month} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="text-[10px] text-gray-500 mb-1">{fmt(v.paid + v.outstanding)}</div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t overflow-hidden flex flex-col justify-end" style={{ height: `${Math.max(totalH, 4)}%` }}>
                  <div className="bg-amber-400" style={{ height: `${100 - (paidH / totalH) * 100}%` }} />
                  <div className="bg-green-500" style={{ height: `${(paidH / totalH) * 100}%` }} />
                </div>
                <div className="text-xs text-gray-500">{month}</div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 text-xs text-gray-500 mt-3">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-sm" />Paid</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 rounded-sm" />Outstanding</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ageing */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Outstanding Ageing</h2>
          <div className="space-y-3">
            {Object.entries(data.ageing).map(([range, val]) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{range} days</span>
                <span className={`text-sm font-semibold ${range === '90+' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{fmt(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GST */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">GST Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Taxable value (subtotal)</span><span className="font-medium">{fmt(data.totalSubtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">CGST (9%)</span><span className="font-medium">{fmt(data.totalGST / 2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">SGST (9%)</span><span className="font-medium">{fmt(data.totalGST / 2)}</span></div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-3"><span className="font-semibold">Total GST</span><span className="font-bold text-gray-900 dark:text-white">{fmt(data.totalGST)}</span></div>
          </div>
        </div>
      </div>

      {/* Top clients */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top Clients by Revenue</h2>
        {data.topClients.length === 0 ? (
          <p className="text-sm text-gray-500">No invoices yet.</p>
        ) : (
          <div className="space-y-2">
            {data.topClients.map(([name, total]) => (
              <div key={name} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                <span className="font-semibold">{fmt(total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceReportsPage;
