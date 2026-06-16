import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { useOrg } from '../org.context';
import { useAuth } from '../auth.context';
import { Icons } from './Icon';
import { toast } from './Toast';
import { useConfirmDialog } from './ConfirmDialog';

interface Lawyer {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  bar_council_no: string;
  states: string[];
  specialties: string[];
  rate_per_hour: number | null;
  bio: string | null;
  verified: boolean;
  active: boolean;
}

interface Engagement {
  id: string;
  case_id: string;
  lawyer_id: string;
  status: 'proposed' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  scope: string | null;
  fee: number | null;
  created_at: string;
  lawyers?: Lawyer;
  legal_cases?: { id: string; title: string; case_number: string };
}

interface LegalCase {
  id: string;
  title: string;
  case_number: string;
}

const db = supabase as any;

const STATUS_BADGE: Record<Engagement['status'], string> = {
  proposed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const emptyLawyer = {
  full_name: '', email: '', phone: '', bar_council_no: '',
  states: '', specialties: '', rate_per_hour: '', bio: '',
};

export const LawyersPage: React.FC = () => {
  const { orgId } = useOrg();
  const { user } = useAuth();
  const { confirm } = useConfirmDialog();

  const [tab, setTab] = useState<'engagements' | 'marketplace'>('engagements');
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);

  const [stateFilter, setStateFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyLawyer });
  const [saving, setSaving] = useState(false);

  const [engageFor, setEngageFor] = useState<Lawyer | null>(null);
  const [engageCaseId, setEngageCaseId] = useState('');
  const [engageScope, setEngageScope] = useState('');
  const [engageFee, setEngageFee] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    const [lq, eq, cq] = await Promise.all([
      db.from('lawyers').select('*').eq('active', true).order('full_name'),
      orgId
        ? db.from('lawyer_engagements')
            .select('*, lawyers(*), legal_cases(id, title, case_number)')
            .eq('org_id', orgId).order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
      orgId
        ? db.from('legal_cases').select('id, title, case_number').eq('org_id', orgId).order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);
    setLawyers(lq.data || []);
    setEngagements(eq.data || []);
    setCases(cq.data || []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { reload(); }, [reload]);

  // -------- Custom lawyer CRUD --------
  const openCreate = () => { setForm({ ...emptyLawyer }); setEditingId(null); setShowForm(true); };
  const openEdit = (l: Lawyer) => {
    setForm({
      full_name: l.full_name, email: l.email, phone: l.phone || '',
      bar_council_no: l.bar_council_no, states: (l.states || []).join(', '),
      specialties: (l.specialties || []).join(', '),
      rate_per_hour: l.rate_per_hour != null ? String(l.rate_per_hour) : '',
      bio: l.bio || '',
    });
    setEditingId(l.id);
    setShowForm(true);
  };

  const saveLawyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('You must be signed in'); return; }
    if (!form.full_name.trim() || !form.email.trim() || !form.bar_council_no.trim()) {
      toast.error('Name, email and Bar Council No. are required'); return;
    }
    setSaving(true);
    const payload: any = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      bar_council_no: form.bar_council_no.trim(),
      states: form.states.split(',').map(s => s.trim()).filter(Boolean),
      specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
      rate_per_hour: form.rate_per_hour ? Number(form.rate_per_hour) : null,
      bio: form.bio.trim() || null,
    };
    let error;
    if (editingId) {
      ({ error } = await db.from('lawyers').update(payload).eq('id', editingId));
    } else {
      payload.user_id = user.id;
      ({ error } = await db.from('lawyers').insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Lawyer updated' : 'Lawyer added to roster');
    setShowForm(false);
    reload();
  };

  const deleteLawyer = async (l: Lawyer) => {
    const ok = await confirm({
      title: 'Remove Lawyer',
      message: `Remove ${l.full_name} from your roster? Existing engagements will be deleted.`,
      variant: 'danger', confirmLabel: 'Remove',
    });
    if (!ok) return;
    const { error } = await db.from('lawyers').delete().eq('id', l.id);
    if (error) toast.error(error.message);
    else { toast.success('Lawyer removed'); reload(); }
  };

  // -------- Engagements --------
  const openEngage = (l: Lawyer) => {
    if (!cases.length) {
      toast.error('Create a Legal Case first before engaging a lawyer');
      return;
    }
    setEngageFor(l);
    setEngageCaseId(cases[0].id);
    setEngageScope(`Engage ${l.full_name}`);
    setEngageFee(l.rate_per_hour ? String(l.rate_per_hour) : '');
  };

  const submitEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !engageFor) return;
    const { error } = await db.from('lawyer_engagements').insert({
      org_id: orgId, lawyer_id: engageFor.id, case_id: engageCaseId,
      status: 'proposed', scope: engageScope || null,
      fee: engageFee ? Number(engageFee) : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(`Engagement proposed to ${engageFor.full_name}`);
    setEngageFor(null);
    reload();
  };

  const updateEngagementStatus = async (eng: Engagement, status: Engagement['status']) => {
    const { error } = await db.from('lawyer_engagements').update({ status }).eq('id', eng.id);
    if (error) toast.error(error.message);
    else { toast.success(`Engagement ${status}`); reload(); }
  };

  const cancelEngagement = async (eng: Engagement) => {
    const ok = await confirm({
      title: 'Cancel Engagement', message: 'Cancel this engagement?',
      variant: 'danger', confirmLabel: 'Cancel Engagement',
    });
    if (!ok) return;
    await updateEngagementStatus(eng, 'cancelled');
  };

  // -------- Derived --------
  const myLawyerIds = new Set(engagements.map(e => e.lawyer_id));
  const statesList = Array.from(new Set(lawyers.flatMap(l => l.states || []))).sort();
  const specsList = Array.from(new Set(lawyers.flatMap(l => l.specialties || []))).sort();

  const filteredMarket = lawyers.filter(l =>
    l.verified &&
    (!stateFilter || l.states.includes(stateFilter)) &&
    (!specFilter || l.specialties.includes(specFilter)) &&
    (!search || l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())),
  );

  const myLawyers = lawyers.filter(l => l.user_id === user?.id);

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading lawyers…</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lawyers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage engagements on your cases and browse verified counsel across India.
          </p>
        </div>
        <button onClick={openCreate} className="px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md text-sm font-medium hover:opacity-90 flex items-center gap-1.5">
          <Icons.Plus size={14} /> Add Lawyer
        </button>
      </header>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {([
          ['engagements', `My Engagements (${engagements.length})`],
          ['marketplace', `Marketplace (${filteredMarket.length})`],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === k
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== Tab: Engagements ===== */}
      {tab === 'engagements' && (
        engagements.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
            <Icons.User size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-700 dark:text-gray-300">No engagements yet</p>
            <p className="text-sm mt-1">Browse the Marketplace tab to propose an engagement on one of your cases.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3">Lawyer</th>
                  <th className="text-left px-4 py-3">Case</th>
                  <th className="text-left px-4 py-3">Scope</th>
                  <th className="text-right px-4 py-3">Fee</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {engagements.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{e.lawyers?.full_name || '—'}</div>
                      <div className="text-xs text-gray-500">{e.lawyers?.bar_council_no}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white">{e.legal_cases?.title || '—'}</div>
                      <div className="text-xs text-gray-500 font-mono">{e.legal_cases?.case_number}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">{e.scope || '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{e.fee ? `₹${Number(e.fee).toLocaleString('en-IN')}` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${STATUS_BADGE[e.status]}`}>{e.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      {e.status === 'proposed' && (
                        <>
                          <button onClick={() => updateEngagementStatus(e, 'accepted')} className="px-2 py-1 text-xs rounded border border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/20">Accept</button>
                          <button onClick={() => updateEngagementStatus(e, 'declined')} className="px-2 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20">Decline</button>
                        </>
                      )}
                      {e.status === 'accepted' && (
                        <button onClick={() => updateEngagementStatus(e, 'completed')} className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Mark complete</button>
                      )}
                      {(e.status === 'proposed' || e.status === 'accepted') && (
                        <button onClick={() => cancelEngagement(e)} className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ===== Tab: Marketplace ===== */}
      {tab === 'marketplace' && (
        <>
          <div className="flex gap-3 flex-wrap items-center">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="">All States</option>
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="">All Specialties</option>
              {specsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {myLawyers.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Your Roster</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myLawyers.map(l => (
                  <LawyerCard key={l.id} lawyer={l} engaged={myLawyerIds.has(l.id)}
                    onEngage={() => openEngage(l)} onEdit={() => openEdit(l)} onDelete={() => deleteLawyer(l)} owner />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Verified Counsel</h2>
            {filteredMarket.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                No lawyers match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMarket.filter(l => l.user_id !== user?.id).map(l => (
                  <LawyerCard key={l.id} lawyer={l} engaged={myLawyerIds.has(l.id)} onEngage={() => openEngage(l)} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ===== Add / Edit Lawyer Modal ===== */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={saveLawyer}
            className="bg-white dark:bg-gray-950 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{editingId ? 'Edit Lawyer' : 'Add Lawyer'}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Added lawyers appear in your roster. They start as unverified until our team reviews.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} />
              <Field label="Bar Council No. *" value={form.bar_council_no} onChange={v => setForm({ ...form, bar_council_no: v })} />
              <Field label="Email *" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
              <Field label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
              <Field label="States (comma separated)" value={form.states} onChange={v => setForm({ ...form, states: v })} placeholder="Maharashtra, Karnataka" />
              <Field label="Specialties (comma separated)" value={form.specialties} onChange={v => setForm({ ...form, specialties: v })} placeholder="Commercial, MSME" />
              <Field label="Rate per hour (₹)" type="number" value={form.rate_per_hour} onChange={v => setForm({ ...form, rate_per_hour: v })} />
              <div className="col-span-2">
                <label className="block text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== Engage Modal ===== */}
      {engageFor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEngageFor(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submitEngagement}
            className="bg-white dark:bg-gray-950 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Engage {engageFor.full_name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Attach this engagement to one of your legal cases.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Case *</label>
                <select value={engageCaseId} onChange={(e) => setEngageCaseId(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>)}
                </select>
              </div>
              <Field label="Scope" value={engageScope} onChange={setEngageScope} />
              <Field label="Fee (₹)" type="number" value={engageFee} onChange={setEngageFee} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEngageFor(null)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md text-sm font-medium">Propose Engagement</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
  </div>
);

const LawyerCard: React.FC<{
  lawyer: Lawyer; engaged: boolean; owner?: boolean;
  onEngage: () => void; onEdit?: () => void; onDelete?: () => void;
}> = ({ lawyer: l, engaged, owner, onEngage, onEdit, onDelete }) => (
  <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5 flex flex-col">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {l.full_name.split(' ').slice(-2).map(n => n[0]).join('').toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{l.full_name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">BCN {l.bar_council_no}</p>
        </div>
      </div>
      {l.verified
        ? <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded"><Icons.CheckCircle size={12} /> Verified</span>
        : <span className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded">Unverified</span>}
    </div>
    {l.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 flex-1">{l.bio}</p>}
    <div className="mt-3 flex flex-wrap gap-1">
      {(l.specialties || []).map(s => <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">{s}</span>)}
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
      <span className="text-sm font-semibold text-gray-900 dark:text-white">
        {l.rate_per_hour ? `₹${Number(l.rate_per_hour).toLocaleString('en-IN')}/hr` : 'Rate on request'}
      </span>
      <div className="flex gap-1">
        {owner && onEdit && <button onClick={onEdit} title="Edit" className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white"><Icons.Edit size={14} /></button>}
        {owner && onDelete && <button onClick={onDelete} title="Remove" className="p-1.5 text-red-500 hover:text-red-700"><Icons.Trash size={14} /></button>}
        <button onClick={onEngage} className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-md hover:opacity-90">
          {engaged ? '+ New Engagement' : 'Engage'}
        </button>
      </div>
    </div>
  </div>
);

export default LawyersPage;
