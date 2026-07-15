import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/integrations/supabase/client';
import { toast } from './Toast';

type OrgRow = {
  org_id: string;
  org_name: string;
  created_at: string;
  plan_code: string | null;
  plan_name: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  member_count: number;
  invoice_count: number;
  quote_count: number;
  proposal_count: number;
  monthly_price_inr: number | null;
};

type MrrSummary = {
  mrr_inr: number;
  arr_inr: number;
  total_orgs: number;
  active_subscriptions: number;
  trialing: number;
  paying: number;
  by_plan: Array<{ code: string; name: string; price_inr: number | null; active_count: number; trialing_count: number; mrr_inr: number }>;
};

const inr = (n: number | null | undefined) =>
  '₹' + (Number(n || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function AdminConsolePage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [mrr, setMrr] = useState<MrrSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trialing' | 'cancelled'>('all');

  async function verify() {
    setChecking(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }
    const { data, error } = await (supabase as any).rpc('is_platform_admin', { _user_id: user.id });
    setIsAdmin(!error && !!data);
    setChecking(false);
  }

  async function loadData() {
    setLoading(true);
    const [orgsRes, mrrRes] = await Promise.all([
      (supabase as any).rpc('admin_list_orgs'),
      (supabase as any).rpc('admin_mrr_summary'),
    ]);
    if (orgsRes.error) toast.error('Failed to load orgs: ' + orgsRes.error.message);
    else setOrgs((orgsRes.data || []) as OrgRow[]);
    if (mrrRes.error) toast.error('Failed to load MRR: ' + mrrRes.error.message);
    else setMrr(mrrRes.data as MrrSummary);
    setLoading(false);
  }

  async function bootstrap() {
    const { data, error } = await (supabase as any).rpc('bootstrap_first_platform_admin');
    if (error) { toast.error(error.message); return; }
    if (data === true) { toast.success('You are now the first platform admin.'); await verify(); }
    else toast.warning('A platform admin already exists. Ask them to grant access.');
  }

  useEffect(() => { verify(); }, []);
  useEffect(() => { if (isAdmin) loadData(); }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orgs.filter(o => {
      if (statusFilter !== 'all' && (o.subscription_status || '') !== statusFilter) return false;
      if (!q) return true;
      return o.org_name.toLowerCase().includes(q) || (o.plan_name || '').toLowerCase().includes(q);
    });
  }, [orgs, query, statusFilter]);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Verifying…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-gray-200 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-gray-950">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Billenty · Platform</div>
          <h1 className="text-2xl font-serif mb-2">Super-admin console</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            This area is restricted to platform administrators. If no admin exists yet, you can claim it here — this only works once.
          </p>
          <div className="flex gap-3">
            <button onClick={bootstrap} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800">
              Claim first admin
            </button>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm">
              Back to app
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'MRR', value: inr(mrr?.mrr_inr), sub: 'Active subscriptions' },
    { label: 'ARR', value: inr(mrr?.arr_inr), sub: 'Annualised' },
    { label: 'Paying orgs', value: (mrr?.paying ?? 0).toString(), sub: `${mrr?.trialing ?? 0} on trial` },
    { label: 'Total orgs', value: (mrr?.total_orgs ?? 0).toString(), sub: `${mrr?.active_subscriptions ?? 0} active` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-500">Billenty · Platform</div>
            <h1 className="text-xl font-serif">Super-admin console</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} disabled={loading} className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-xs">
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button onClick={() => navigate('/dashboard')} className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs">
              Back to app
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-950">
              <div className="text-[11px] uppercase tracking-widest text-gray-500">{k.label}</div>
              <div className="text-2xl font-serif mt-2">{k.value}</div>
              <div className="text-xs text-gray-500 mt-1">{k.sub}</div>
            </div>
          ))}
        </section>

        {/* MRR by plan */}
        <section className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 text-[11px] uppercase tracking-widest text-gray-500">
            MRR by plan
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-900">
            {(mrr?.by_plan || []).map(p => (
              <div key={p.code} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{inr(p.price_inr)} / mo · {p.active_count} active · {p.trialing_count} trialing</div>
                </div>
                <div className="font-mono tabular-nums">{inr(p.mrr_inr)}</div>
              </div>
            ))}
            {(!mrr?.by_plan || mrr.by_plan.length === 0) && (
              <div className="px-5 py-8 text-sm text-gray-500 text-center">No plans yet.</div>
            )}
          </div>
        </section>

        {/* Org directory */}
        <section className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-3">
            <div className="text-[11px] uppercase tracking-widest text-gray-500 mr-auto">Organizations ({filtered.length})</div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-xs border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 bg-transparent"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name or plan…"
              className="text-xs border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 bg-transparent w-56"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="text-left px-5 py-2">Organization</th>
                  <th className="text-left px-5 py-2">Plan</th>
                  <th className="text-left px-5 py-2">Status</th>
                  <th className="text-right px-5 py-2">Members</th>
                  <th className="text-right px-5 py-2">Invoices</th>
                  <th className="text-right px-5 py-2">Quotes</th>
                  <th className="text-right px-5 py-2">Proposals</th>
                  <th className="text-right px-5 py-2">MRR</th>
                  <th className="text-left px-5 py-2">Renews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {filtered.map(o => (
                  <tr key={o.org_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-5 py-3">
                      <div className="font-medium">{o.org_name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{o.org_id.slice(0, 8)}</div>
                    </td>
                    <td className="px-5 py-3">{o.plan_name || <span className="text-gray-400">—</span>}</td>
                    <td className="px-5 py-3">
                      <span className={
                        'inline-block px-2 py-0.5 rounded-full text-[11px] ' +
                        (o.subscription_status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : o.subscription_status === 'trialing'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')
                      }>{o.subscription_status || 'none'}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">{o.member_count}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">{o.invoice_count}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">{o.quote_count}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">{o.proposal_count}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">
                      {o.subscription_status === 'active' ? inr(o.monthly_price_inr) : '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {o.current_period_end ? new Date(o.current_period_end).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-sm text-gray-500">No organizations match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}