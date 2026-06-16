import React, { useEffect, useState } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { useOrg } from '../org.context';
import { Icons } from './Icon';
import { toast } from './Toast';

interface Lawyer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  bar_council_no: string;
  states: string[];
  specialties: string[];
  rate_per_hour: number | null;
  bio: string | null;
  verified: boolean;
}

const db = supabase as any;

export const LawyersPage: React.FC = () => {
  const { orgId } = useOrg();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<string>('');
  const [specFilter, setSpecFilter] = useState<string>('');
  const [engaging, setEngaging] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await db.from('lawyers').select('*').eq('verified', true).eq('active', true).order('full_name');
      setLawyers(data || []);
      setLoading(false);
    })();
  }, []);

  const states = Array.from(new Set(lawyers.flatMap(l => l.states))).sort();
  const specs = Array.from(new Set(lawyers.flatMap(l => l.specialties))).sort();

  const filtered = lawyers.filter(l =>
    (!stateFilter || l.states.includes(stateFilter)) &&
    (!specFilter || l.specialties.includes(specFilter)),
  );

  const engage = async (lawyer: Lawyer) => {
    if (!orgId) return;
    setEngaging(lawyer.id);
    const { error } = await db.from('lawyer_engagements').insert({
      org_id: orgId,
      lawyer_id: lawyer.id,
      status: 'requested',
      scope: `Consultation with ${lawyer.full_name}`,
    });
    setEngaging(null);
    if (error) toast.error(`Couldn't request engagement: ${error.message}`);
    else toast.success(`Engagement request sent to ${lawyer.full_name}`);
  };

  if (loading) return <div className="p-8 text-gray-500">Loading lawyers…</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lawyer Marketplace</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verified, bar-council-registered lawyers across India. Engage for demand notices, §138 cases or contract disputes.</p>
      </header>

      <div className="flex gap-3 flex-wrap">
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900">
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900">
          <option value="">All Specialties</option>
          {specs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
          No lawyers match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(l => (
            <div key={l.id} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {l.full_name.split(' ').slice(-2).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{l.full_name}</h3>
                    <p className="text-xs text-gray-500">BCN {l.bar_council_no}</p>
                  </div>
                </div>
                {l.verified && <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded"><Icons.CheckCircle size={12} /> Verified</span>}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 flex-1">{l.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {l.specialties.map(s => <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{s}</span>)}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{l.rate_per_hour ? `₹${l.rate_per_hour}/hr` : 'Rate on request'}</span>
                <button onClick={() => engage(l)} disabled={engaging === l.id} className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-md hover:opacity-90 disabled:opacity-50">
                  {engaging === l.id ? 'Sending…' : 'Engage'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LawyersPage;
