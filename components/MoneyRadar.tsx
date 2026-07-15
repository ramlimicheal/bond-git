import React, { useMemo } from 'react';
import { useInvoices } from '../dataStore';
import { Icons } from './Icon';

const fmtINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const daysBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / 86400000);

/**
 * Money Radar — a single-glance strip that answers "am I getting paid this month?"
 * Expected in 7 days · At risk (due soon) · Overdue (past due)
 */
export const MoneyRadar: React.FC = () => {
  const { items: invoices } = useInvoices();

  const { expected, atRisk, overdue, expectedCount, atRiskCount, overdueCount } = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let expected = 0, atRisk = 0, overdue = 0;
    let expectedCount = 0, atRiskCount = 0, overdueCount = 0;
    for (const inv of invoices) {
      if (inv.status === 'Paid' || inv.status === 'Draft') continue;
      const due = new Date(inv.dueDate);
      if (isNaN(due.getTime())) continue;
      const d = daysBetween(due, today); // positive = future, negative = overdue
      if (d < 0) { overdue += inv.amountDue; overdueCount++; }
      else if (d <= 7) { expected += inv.amountDue; expectedCount++; }
      else if (d <= 30) { atRisk += inv.amountDue; atRiskCount++; }
    }
    return { expected, atRisk, overdue, expectedCount, atRiskCount, overdueCount };
  }, [invoices]);

  const total = Math.max(1, expected + atRisk + overdue);
  const w = (v: number) => `${(v / total) * 100}%`;

  const cells: Array<{ key: string; label: string; value: number; count: number; tone: string; dot: string; icon: React.ReactNode }> = [
    { key: 'expected', label: 'Expected in 7 days', value: expected, count: expectedCount, tone: 'text-emerald-700', dot: 'bg-emerald-500', icon: <Icons.TrendingUp size={14} className="text-emerald-600" /> },
    { key: 'risk', label: 'At risk · due soon', value: atRisk, count: atRiskCount, tone: 'text-amber-700', dot: 'bg-amber-500', icon: <Icons.AlertCircle size={14} className="text-amber-600" /> },
    { key: 'overdue', label: 'Overdue', value: overdue, count: overdueCount, tone: 'text-rose-700', dot: 'bg-rose-500', icon: <Icons.Clock size={14} className="text-rose-600" /> },
  ];

  return (
    <div className="bg-white border border-[#E8E4D8] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-[11px] font-semibold text-[#808080] tracking-wider uppercase">Money Radar</h2>
        </div>
        <div className="text-[11px] text-gray-400">Live · based on due dates</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {cells.map(c => (
          <div key={c.key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#faf9f4] border border-[#EFEBDE]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0">{c.icon}</span>
              <div className="min-w-0">
                <div className="text-[10px] text-[#808080] uppercase tracking-wider truncate">{c.label}</div>
                <div className={`text-[15px] font-semibold ${c.tone}`}>{fmtINR(c.value)}</div>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 shrink-0">{c.count} inv</div>
          </div>
        ))}
      </div>

      {/* Segmented bar showing distribution */}
      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
        <div style={{ width: w(expected) }} className="bg-emerald-500" />
        <div style={{ width: w(atRisk) }} className="bg-amber-500" />
        <div style={{ width: w(overdue) }} className="bg-rose-500" />
      </div>
    </div>
  );
};

export default MoneyRadar;