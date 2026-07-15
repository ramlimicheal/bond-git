import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotes, useProposals, useClients, useInvoices } from '../dataStore';
import { useAuth } from '../auth.context';
import { Icons } from './Icon';
import { MoneyRadar } from './MoneyRadar';
import { ActionQueue } from './ActionQueue';

const fmtINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/* --- Small primitives matching the Spark Pixel reference --- */
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <div className={`bg-white border border-neutral-200 rounded-2xl ${className}`}>
    {children}
  </div>
);

const Sparkline: React.FC<{ values: number[]; highlightIndex?: number }> = ({ values, highlightIndex }) => {
  const max = Math.max(1, ...values);
  const hi = highlightIndex ?? values.indexOf(Math.max(...values));
  return (
    <div className="h-8 w-14 flex items-end justify-between gap-0.5 opacity-60">
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-1 rounded-t-sm ${i === hi ? 'bg-[#1A1A1A]' : 'bg-gray-300'}`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

const KPI: React.FC<{ label: string; value: React.ReactNode; unit?: string; series: number[]; delta?: string }>
  = ({ label, value, unit, series, delta = '+0.94 last year' }) => (
    <Card className="p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-[10px] text-[#808080] font-semibold tracking-wider uppercase mb-1">{label}</div>
          <div className="text-[22px] font-bold text-[#0F172A] flex items-baseline gap-1">
            {value}
            {unit && <span className="text-sm font-medium text-[#808080]">{unit}</span>}
          </div>
        </div>
        <Sparkline values={series} />
      </div>
      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-50">
        <span className="text-gray-400">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
        </span>
        <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">{delta}</span>
      </div>
    </Card>
  );

/* --- The dashboard --- */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: invoices, loading } = useInvoices();
  const { items: quotes } = useQuotes();
  const { items: proposals } = useProposals();
  const { items: clients } = useClients();
  const [range, setRange] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  const firstName = (user?.email ?? 'there').split('@')[0].split('.')[0];
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const paidRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amountPaid, 0);
  const outstanding = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Draft').reduce((s, i) => s + i.amountDue, 0);
  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const newClients = clients.length;
  const conversion = quotes.length ? Math.round((quotes.filter(q => q.status === 'Accepted').length / quotes.length) * 1000) / 10 : 0;

  // Series for sparklines / bar chart (deterministic from data length so it feels alive)
  const series = useMemo(() => {
    const seed = invoices.length + quotes.length + proposals.length + 3;
    return Array.from({ length: 30 }, (_, i) => ((Math.sin(i * 0.7 + seed) + 1.2) * 24 + (i % 5) * 6));
  }, [invoices.length, quotes.length, proposals.length]);
  const spark = (offset: number) => series.slice(offset, offset + 6).map(v => Math.max(4, v));

  const recent = [...invoices].slice(0, 6);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthly = useMemo(() => months.map((_, i) => {
    const seed = invoices.length + i;
    return {
      existing: Math.max(10, (Math.sin(seed) + 1.2) * 22 + (i % 4) * 4),
      newUsers: Math.max(4, (Math.cos(seed * 1.3) + 1.1) * 12),
    };
  }), [invoices.length]);
  const chartMax = Math.max(...monthly.map(m => m.existing + m.newUsers));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] leading-[1.05] tracking-tight text-neutral-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 }}>
          Welcome back, <span className="capitalize italic">{firstName}</span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
              className="appearance-none bg-white border border-neutral-200 text-[#0F172A] py-1.5 pl-3 pr-8 rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-neutral-300"
            >
              <option>Weekly</option><option>Monthly</option><option>Yearly</option>
            </select>
            <Icons.ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 bg-white border border-neutral-200 text-[#0F172A] py-1.5 px-3 rounded-md text-sm font-medium hover:bg-[#faf9f4]">
            <Icons.Calendar size={14} className="text-gray-400" />
            {today}
          </button>
          <button onClick={() => navigate('/invoices/new')} className="flex items-center gap-2 bg-[#1A1A1A] text-white py-1.5 px-4 rounded-md text-sm font-medium hover:bg-[#333333]">
            <Icons.Plus size={14} /> New Invoice
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Paid Revenue" value={fmtINR(paidRevenue)} series={spark(0)} delta={`${paidCount} paid`} />
        <KPI label="Outstanding" value={fmtINR(outstanding)} series={spark(5)} delta={`${invoices.length - paidCount} unpaid`} />
        <KPI label="New Clients" value={newClients} unit="Clients" series={spark(11)} delta={`${clients.length} total`} />
        <KPI label="Quote Conversion" value={`${conversion}%`} series={spark(17)} delta={`${quotes.length} quotes`} />
      </div>

      {/* Money Radar + Action Queue — the cockpit strip */}
      <MoneyRadar />
      <ActionQueue />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales trend */}
        <Card className="lg:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-[#808080] tracking-wider uppercase">Sales Trend</h2>
            </div>
            <button className="w-6 h-6 flex items-center justify-center rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500">
              <Icons.More size={14} />
            </button>
          </div>

          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs text-[#808080] mb-1">Total Revenue</div>
              <div className="text-xl font-bold text-[#0F172A]">{fmtINR(paidRevenue + outstanding)}</div>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium text-gray-500 mr-auto ml-10 mb-1">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-gray-300" /> NEW</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1A1A1A]" /> EXISTING</div>
            </div>
            <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-200">
              {(['Weekly', 'Monthly', 'Yearly'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 text-xs font-medium rounded-sm ${range === r ? 'bg-white text-[#0F172A] border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >{r}</button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex-1 relative pl-8">
            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pointer-events-none pb-6">
              {['60k', '50k', '40k', '30k', '20k', '10k', '0k'].map(l => (
                <div key={l} className="flex items-center gap-2 border-b border-dashed border-gray-200 w-full pb-1"><span>{l}</span></div>
              ))}
            </div>
            <div className="relative z-10 h-[180px] grid grid-cols-12 gap-3 items-end">
              {monthly.map((m, i) => {
                const total = m.existing + m.newUsers;
                const hExisting = (m.existing / chartMax) * 100;
                const hNew = (m.newUsers / chartMax) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full flex flex-col justify-end h-full gap-0.5" title={`${months[i]} • ${Math.round(total)}`}>
                      <div className="w-full bg-gray-300 rounded-t-[2px]" style={{ height: `${hNew}%` }} />
                      <div className="w-full bg-[#1A1A1A] rounded-t-[2px]" style={{ height: `${hExisting}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-12 gap-3 pl-0 mt-2 text-[10px] text-gray-400 uppercase tracking-wide">
              {months.map(m => <div key={m} className="text-center">{m.slice(0, 3)}</div>)}
            </div>
          </div>
        </Card>

        {/* Revenue breakdown */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-xs font-semibold text-[#808080] tracking-wider uppercase">Revenue Breakdown</h2>
            <button className="w-6 h-6 flex items-center justify-center rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500">
              <Icons.More size={14} />
            </button>
          </div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-[#808080] mb-1">Revenue by Category</div>
              <div className="text-xl font-bold text-[#0F172A]">{fmtINR(paidRevenue)}</div>
            </div>
            <div className="text-[11px] text-gray-500 border border-gray-200 rounded-md px-2 py-1 flex items-center gap-1">
              <Icons.Calendar size={12} /> Jan 1 – {today.slice(0, 6)}
            </div>
          </div>
          <button className="w-full text-left text-xs font-medium text-[#0F172A] bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mb-4 flex items-center justify-between hover:bg-gray-100">
            <span>✨ Get AI insight for better analysis</span>
            <Icons.ChevronRight size={14} />
          </button>
          <div className="flex-1 flex items-end justify-between gap-1 h-[160px]">
            {series.map((v, i) => (
              <div key={i} className="w-1 bg-[#1A1A1A] rounded-t-[2px]" style={{ height: `${Math.min(100, (v / Math.max(...series)) * 100)}%` }} />
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2">
            <span>1 JAN</span><span>{today.toUpperCase()}</span>
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card className="p-0">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-[#808080] tracking-wider uppercase">Recent Invoices</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/invoices')} className="text-xs text-gray-500 hover:text-[#0F172A]">View all →</button>
            <button onClick={() => navigate('/invoices/new')} className="flex items-center gap-1 bg-white border border-gray-200 text-[#0F172A] py-1 px-2 rounded-md text-xs font-medium hover:bg-gray-50">
              <Icons.Plus size={12} /> Add
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[#808080]">
                <th className="text-left font-medium px-5 py-2">ID</th>
                <th className="text-left font-medium px-5 py-2">Client</th>
                <th className="text-left font-medium px-5 py-2">Issued</th>
                <th className="text-left font-medium px-5 py-2">Status</th>
                <th className="text-right font-medium px-5 py-2">Amount Due</th>
                <th className="text-right font-medium px-5 py-2">Total</th>
                <th className="w-8 px-5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-6 text-sm text-gray-500">Loading…</td></tr>
              ) : recent.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-6 text-sm text-gray-500">No invoices yet. <button onClick={() => navigate('/invoices/new')} className="underline">Create your first invoice</button></td></tr>
              ) : recent.map((inv) => {
                const s = inv.status;
                const chip = s === 'Paid' ? 'bg-emerald-50 text-emerald-700' : s === 'Overdue' ? 'bg-red-50 text-red-700' : s === 'Draft' ? 'bg-gray-100 text-gray-700' : 'bg-amber-50 text-amber-700';
                return (
                  <tr key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)} className="cursor-pointer hover:bg-gray-50/60">
                    <td className="px-5 py-3 text-gray-400 font-medium">{inv.number}</td>
                    <td className="px-5 py-3 font-medium text-[#0F172A]">{inv.clientName}</td>
                    <td className="px-5 py-3 text-gray-500">{inv.issuedDate}</td>
                    <td className="px-5 py-3"><span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${chip}`}><span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />{s}</span></td>
                    <td className="px-5 py-3 text-right text-gray-700">{fmtINR(inv.amountDue)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#0F172A]">{fmtINR(inv.amountPaid + inv.amountDue)}</td>
                    <td className="px-5 py-3 text-right text-gray-400"><Icons.More size={14} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;