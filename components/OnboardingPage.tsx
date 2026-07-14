import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/integrations/supabase/client';
import { useOrg } from '../org.context';
import { toast } from './Toast';
import { Icons } from './Icon';

type OrgType = 'freelancer' | 'agency';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { org, orgId, refresh } = useOrg();
  const [type, setType] = useState<OrgType>('freelancer');
  const [companyName, setCompanyName] = useState(org?.name || '');
  const [state, setState] = useState('');
  const [gstin, setGstin] = useState(org?.gstin || '');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!orgId) return;
    if (!companyName.trim()) { toast.error('Enter a company / brand name'); return; }
    if (!state) { toast.error('Pick your state'); return; }
    setSaving(true);
    const { error } = await (supabase as any)
      .from('organizations')
      .update({
        name: companyName.trim(),
        type,
        seat_limit: type === 'agency' ? 5 : 1,
        state,
        default_state_code: state,
        gstin: gstin.trim() || null,
        onboarded: true,
      })
      .eq('id', orgId);
    setSaving(false);
    if (error) { toast.error(`Could not save: ${error.message}`); return; }
    await refresh();
    toast.success('Welcome to Billenty');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set up Billenty</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Two quick questions and we'll tailor invoices, GST and the legal layer for you.</p>

        <div className="mt-8">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">I am a…</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: 'freelancer' as OrgType, title: 'Freelancer', sub: 'Just me. Single seat, personal voice on invoices and proposals.' },
              { id: 'agency' as OrgType, title: 'Agency / Studio', sub: 'Team of up to 5 seats, company voice, shared clients & invoices.' },
            ]).map((opt) => {
              const active = type === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={`text-left p-4 rounded-lg border transition ${active ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900 shadow-sm' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">{opt.title}</span>
                    {active && <Icons.CheckCircle size={18} className="text-gray-900 dark:text-white" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">{opt.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{type === 'agency' ? 'Studio / Agency name' : 'Your brand name'}</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={type === 'agency' ? 'Acme Design Co.' : 'Your name or brand'}
              className="w-full text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">State (for GST)</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
            >
              <option value="">Select state…</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="text-[11px] text-gray-500 mt-1">Used to split CGST/SGST (intra-state) vs IGST (inter-state).</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">GSTIN (optional)</label>
            <input
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="22ABCDE1234F1Z5"
              maxLength={15}
              className="w-full text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white uppercase tracking-wide"
            />
            <p className="text-[11px] text-gray-500 mt-1">You can add this later in Settings. Invoices default to SAC 9983 (Other professional services) at 18%.</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button onClick={async () => {
            if (!orgId) return;
            await supabase.from('organizations').update({ onboarded: true }).eq('id', orgId);
            await refresh();
            navigate('/dashboard', { replace: true });
          }} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Skip for now</button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Continue to Billenty'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;