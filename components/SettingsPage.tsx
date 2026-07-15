import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from './Icon';
import { toast } from './Toast';
import { useOrg } from '../org.context';
import { useAuth } from '../auth.context';
import { supabase } from '../src/integrations/supabase/client';
import DemoSeedButton from './DemoSeedButton';
import { User, Building2, Palette, Wallet, FileText, Bell, Scale, Puzzle, LogOut } from 'lucide-react';

interface SettingsPageProps { onBack: () => void; }

type SectionId =
  | 'account' | 'workspace' | 'branding' | 'billing'
  | 'invoicing' | 'notifications' | 'legal' | 'integrations';

/* ---------- Design primitives (Linear-style) ---------- */

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, description, children, footer }) => (
  <section className="mb-8 bg-white border border-neutral-200 rounded-xl overflow-hidden">
    <header className="px-6 py-4 border-b border-neutral-200">
      <h3 className="text-[15px] font-semibold text-[#0F172A]">{title}</h3>
      {description && <p className="text-[13px] text-[#6B7280] mt-0.5">{description}</p>}
    </header>
    <div className="divide-y divide-neutral-100">{children}</div>
    {footer && <div className="px-6 py-3 bg-[#faf9f4] border-t border-neutral-200 flex justify-end">{footer}</div>}
  </section>
);

const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode; stacked?: boolean }> = ({ label, hint, children, stacked }) => (
  <div className={`px-6 py-4 ${stacked ? '' : 'md:flex md:items-start md:gap-6'}`}>
    <div className={stacked ? 'mb-3' : 'md:w-[260px] md:shrink-0 mb-2 md:mb-0 md:pt-2'}>
      <div className="text-[13px] font-medium text-[#0F172A]">{label}</div>
      {hint && <div className="text-[12px] text-[#6B7280] mt-0.5 leading-snug">{hint}</div>}
    </div>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

const inputCls =
  'w-full px-3 py-2 bg-white border border-neutral-200 rounded-md text-[13px] text-[#0F172A] placeholder:text-neutral-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (p) => <input {...p} className={`${inputCls} ${p.className || ''}`} />;
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (p) => <select {...p} className={`${inputCls} ${p.className || ''}`} />;
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (p) => <textarea {...p} className={`${inputCls} resize-none ${p.className || ''}`} />;

const Toggle: React.FC<{ on: boolean; onChange: (v: boolean) => void; label?: string }> = ({ on, onChange, label }) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={() => onChange(!on)}
    className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors ${on ? 'bg-[#0F172A]' : 'bg-neutral-300'}`}
  >
    <span className={`inline-block w-4 h-4 bg-white rounded-full transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
    {label && <span className="sr-only">{label}</span>}
  </button>
);

const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...p }) => (
  <button {...p} className={`inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium bg-[#0F172A] text-white rounded-md hover:bg-[#1f2937] disabled:opacity-50 transition-colors ${className || ''}`}>{children}</button>
);
const GhostBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...p }) => (
  <button {...p} className={`inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium bg-white border border-neutral-200 text-[#0F172A] rounded-md hover:bg-[#faf9f4] disabled:opacity-50 transition-colors ${className || ''}`}>{children}</button>
);

/* ---------- Page ---------- */

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { org, orgId, refresh } = useOrg();
  const { user, logout } = useAuth();
  const [section, setSection] = useState<SectionId>('account');

  // Branding
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [brandAccent, setBrandAccent] = useState('#c98a26');

  // Workspace
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyState, setCompanyState] = useState('');
  const [companyPincode, setCompanyPincode] = useState('');
  const [companyCountry, setCompanyCountry] = useState('India');
  const [companyGSTIN, setCompanyGSTIN] = useState('');
  const [companyPAN, setCompanyPAN] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Billing (bank + UPI)
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [upiId, setUpiId] = useState('');

  // Invoicing defaults
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [quotePrefix, setQuotePrefix] = useState('QT');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultTaxRate, setDefaultTaxRate] = useState('18');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('15');
  const [invoiceNotes, setInvoiceNotes] = useState('Thank you for your business!');
  const [invoiceTerms, setInvoiceTerms] = useState('Payment is due within the specified terms. Late payments may incur additional charges.');

  // Notifications
  const [notifEmail, setNotifEmail] = useState<Record<string, boolean>>({ sent: true, viewed: true, paid: true, overdue: true });
  const [notifWhatsapp, setNotifWhatsapp] = useState<Record<string, boolean>>({ sent: false, viewed: false, paid: false, overdue: false });

  // Legal automation
  const [autoNoticeEnabled, setAutoNoticeEnabled] = useState<boolean>(org?.auto_notice_enabled ?? false);
  const [autoNoticeDays, setAutoNoticeDays] = useState<number>(org?.auto_notice_days ?? 30);
  const [savingAuto, setSavingAuto] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!org) return;
    setCompanyName(org.name || '');
    setCompanyEmail(org.email || '');
    setCompanyPhone(org.phone || '');
    setCompanyAddress(org.address_line1 || '');
    setCompanyCity(org.city || '');
    setCompanyState(org.state || '');
    setCompanyPincode(org.pincode || '');
    setCompanyCountry(org.country || 'India');
    setCompanyGSTIN(org.gstin || '');
    setCompanyPAN(org.pan || '');
    setCompanyWebsite(org.website || '');
    setUpiId(org.upi_vpa || '');
    setBankName(org.bank_name || '');
    setAccountNumber(org.bank_account_number || '');
    setIfscCode(org.bank_ifsc || '');
    setInvoicePrefix(org.invoice_prefix || 'INV');
    setQuotePrefix(org.quote_prefix || 'QT');
    setInvoiceNotes(org.default_notes || 'Thank you for your business!');
    setInvoiceTerms(org.default_terms || 'Payment is due within the specified terms. Late payments may incur additional charges.');
    setDefaultTaxRate(String(org.default_tax_rate ?? 18));
    setAutoNoticeEnabled(org.auto_notice_enabled ?? false);
    setAutoNoticeDays(org.auto_notice_days ?? 30);
    const anyOrg = org as any;
    setLogoPath(anyOrg.logo_url || null);
    setBrandAccent(anyOrg.brand_accent || '#c98a26');
    if (org.notifications) {
      setNotifEmail(org.notifications.email || { sent: true, viewed: true, paid: true, overdue: true });
      setNotifWhatsapp(org.notifications.whatsapp || { sent: false, viewed: false, paid: false, overdue: false });
    }
  }, [org]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!logoPath) { setLogoPreview(null); return; }
      if (/^(https?:|data:)/i.test(logoPath)) { setLogoPreview(logoPath); return; }
      const { data } = await supabase.storage.from('brand-assets').createSignedUrl(logoPath, 600);
      if (!cancelled) setLogoPreview(data?.signedUrl || null);
    })();
    return () => { cancelled = true; };
  }, [logoPath]);

  const handleLogoUpload = async (file: File) => {
    if (!orgId) { toast.error('No organization found'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const path = `${orgId}/logo-${Date.now()}.${ext}`;
    setUploadingLogo(true);
    const { error: upErr } = await supabase.storage.from('brand-assets').upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setUploadingLogo(false); toast.error(`Upload failed: ${upErr.message}`); return; }
    const { error } = await (supabase as any).from('organizations').update({ logo_url: path, brand_accent: brandAccent }).eq('id', orgId);
    setUploadingLogo(false);
    if (error) { toast.error(`Could not save logo: ${error.message}`); return; }
    setLogoPath(path); await refresh(); toast.success('Logo uploaded');
  };
  const handleRemoveLogo = async () => {
    if (!orgId || !logoPath) return;
    if (!/^(https?:|data:)/i.test(logoPath)) { await supabase.storage.from('brand-assets').remove([logoPath]); }
    const { error } = await (supabase as any).from('organizations').update({ logo_url: null }).eq('id', orgId);
    if (error) { toast.error(error.message); return; }
    setLogoPath(null); await refresh(); toast.success('Logo removed');
  };
  const saveBrandAccent = async (hex: string) => {
    setBrandAccent(hex);
    if (!orgId) return;
    await (supabase as any).from('organizations').update({ brand_accent: hex }).eq('id', orgId);
    await refresh();
  };

  const handleSave = async () => {
    if (!orgId) { toast.error('No organization found'); return; }
    setSaving(true);
    const updates: Record<string, unknown> = {
      name: companyName, email: companyEmail, phone: companyPhone,
      address_line1: companyAddress, city: companyCity, state: companyState,
      pincode: companyPincode, country: companyCountry, gstin: companyGSTIN,
      pan: companyPAN, website: companyWebsite, upi_vpa: upiId, bank_name: bankName,
      bank_account_number: accountNumber, bank_ifsc: ifscCode,
      invoice_prefix: invoicePrefix, quote_prefix: quotePrefix,
      default_tax_rate: Number(defaultTaxRate), default_notes: invoiceNotes,
      default_terms: invoiceTerms, notifications: { email: notifEmail, whatsapp: notifWhatsapp },
      brand_accent: brandAccent,
    };
    const { error } = await (supabase as any).from('organizations').update(updates).eq('id', orgId);
    setSaving(false);
    if (error) { toast.error(`Could not save: ${error.message}`); return; }
    await refresh(); toast.success('Settings saved');
  };

  const saveAutoNotice = async () => {
    if (!orgId) return;
    setSavingAuto(true);
    const { error } = await (supabase as any).from('organizations').update({ auto_notice_enabled: autoNoticeEnabled, auto_notice_days: autoNoticeDays }).eq('id', orgId);
    setSavingAuto(false);
    if (error) { toast.error(`Could not save: ${error.message}`); return; }
    await refresh(); toast.success('Legal automation saved');
  };

  const runScanNow = async () => {
    if (!orgId) return;
    setScanning(true);
    try {
      const PROJECT_REF = (import.meta.env.VITE_SUPABASE_PROJECT_ID as string) || '';
      const FN_URL = PROJECT_REF
        ? `https://${PROJECT_REF}.supabase.co/functions/v1/auto-notice-cron`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-notice-cron`;
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ orgId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Scan error ${res.status}`);
      toast.success(`Scan complete: ${data.drafted || 0} drafted from ${data.scanned || 0} overdue`);
    } catch (e) { toast.error((e as Error).message); } finally { setScanning(false); }
  };

  const nav: { group: string; items: { id: SectionId; label: string; icon: any }[] }[] = [
    { group: 'Personal', items: [
      { id: 'account', label: 'Account', icon: User },
    ]},
    { group: 'Workspace', items: [
      { id: 'workspace', label: 'General', icon: Building2 },
      { id: 'branding', label: 'Branding', icon: Palette },
      { id: 'billing', label: 'Payments', icon: Wallet },
      { id: 'invoicing', label: 'Invoicing defaults', icon: FileText },
    ]},
    { group: 'Automations', items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'legal', label: 'Legal automation', icon: Scale },
      { id: 'integrations', label: 'Integrations', icon: Puzzle },
    ]},
  ];

  const flat = useMemo(() => nav.flatMap(g => g.items), []);
  const current = flat.find(i => i.id === section)!;

  return (
    <div className="h-full flex bg-white">
      {/* ============ LEFT NAV ============ */}
      <aside className="w-[240px] shrink-0 bg-[#faf9f4] border-r border-neutral-200 flex flex-col">
        <div className="px-4 py-4 border-b border-neutral-200 flex items-center gap-2">
          <button onClick={onBack} aria-label="Back" className="p-1.5 -ml-1 text-[#6B7280] hover:text-[#0F172A] rounded-md hover:bg-white transition-colors">
            <Icons.ArrowLeft size={16} />
          </button>
          <div className="text-[13px] font-semibold text-[#0F172A]">Settings</div>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          {nav.map(group => (
            <div key={group.group} className="mb-4">
              <div className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8A8A8A]">{group.group}</div>
              <nav className="px-2 space-y-0.5">
                {group.items.map(item => {
                  const active = section === item.id;
                  const Ico = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${active ? 'bg-white text-[#0F172A] border border-neutral-200' : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-white/60 border border-transparent'}`}
                    >
                      <Ico size={14} className="shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="px-3 py-3 border-t border-neutral-200">
          <button onClick={() => { logout().then(() => window.location.href = '/'); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-[#6B7280] hover:text-red-600 rounded-md hover:bg-white transition-colors">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* ============ CONTENT ============ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Page header */}
          <div className="mb-8">
            <div className="text-[12px] text-[#8A8A8A] font-medium mb-1">Settings</div>
            <h1 className="text-[26px] font-semibold text-[#0F172A] tracking-tight">{current.label}</h1>
          </div>

          {section === 'account' && (
            <>
              <Section title="Profile" description="Your personal identity across Billenty.">
                <Row label="Email" hint="Used to sign in. Contact support to change.">
                  <Input value={user?.email || ''} disabled />
                </Row>
                <Row label="Role" hint="Your access level in this workspace.">
                  <div className="inline-flex items-center px-2 py-1 rounded-md bg-[#faf9f4] border border-neutral-200 text-[12px] font-medium text-[#0F172A]">Owner</div>
                </Row>
              </Section>
              <Section title="Session" description="Sign out of this workspace on this device.">
                <Row label="Log out" hint="You'll need to sign in again to access Billenty.">
                  <GhostBtn onClick={() => logout().then(() => window.location.href = '/')}><LogOut size={14} /> Log out</GhostBtn>
                </Row>
              </Section>
            </>
          )}

          {section === 'workspace' && (
            <Section title="Business details" description="This information appears on your invoices, quotes and proposals." footer={<PrimaryBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</PrimaryBtn>}>
              <Row label="Business name"><Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your Studio" /></Row>
              <Row label="Contact email"><Input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder="billing@studio.com" /></Row>
              <Row label="Phone"><Input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="+91 98765 43210" /></Row>
              <Row label="Website"><Input value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="https://studio.com" /></Row>
              <Row label="Address" stacked>
                <div className="space-y-2">
                  <Input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Street address" />
                  <div className="grid grid-cols-3 gap-2">
                    <Input value={companyCity} onChange={e => setCompanyCity(e.target.value)} placeholder="City" />
                    <Input value={companyState} onChange={e => setCompanyState(e.target.value)} placeholder="State" />
                    <Input value={companyPincode} onChange={e => setCompanyPincode(e.target.value)} placeholder="Pincode" />
                  </div>
                  <Input value={companyCountry} onChange={e => setCompanyCountry(e.target.value)} placeholder="Country" />
                </div>
              </Row>
              <Row label="GSTIN" hint="15-digit GST Identification Number."><Input value={companyGSTIN} onChange={e => setCompanyGSTIN(e.target.value)} placeholder="22AAAAA0000A1Z5" /></Row>
              <Row label="PAN"><Input value={companyPAN} onChange={e => setCompanyPAN(e.target.value)} placeholder="AAAAA1234A" /></Row>
            </Section>
          )}

          {section === 'branding' && (
            <Section title="PDF branding" description="Applied to every invoice, quote and proposal PDF you generate.">
              <Row label="Logo" hint="PNG or JPG under 2MB. Square works best.">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md border border-neutral-200 bg-[#faf9f4] flex items-center justify-center overflow-hidden">
                    {logoPreview ? <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" /> : <Palette size={20} className="text-neutral-400" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className={`inline-flex items-center px-3 py-1.5 text-[13px] font-medium bg-white border border-neutral-200 rounded-md hover:bg-[#faf9f4] cursor-pointer ${uploadingLogo ? 'opacity-60 pointer-events-none' : ''}`}>
                      {uploadingLogo ? 'Uploading…' : (logoPreview ? 'Replace' : 'Upload')}
                      <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.currentTarget.value = ''; }} />
                    </label>
                    {logoPreview && <button onClick={handleRemoveLogo} className="px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50 rounded-md">Remove</button>}
                  </div>
                </div>
              </Row>
              <Row label="Accent color" hint="Used for rules and eyebrow labels on PDFs.">
                <div className="flex items-center gap-3">
                  <input type="color" value={brandAccent} onChange={e => saveBrandAccent(e.target.value)} className="w-9 h-9 rounded-md border border-neutral-200 cursor-pointer bg-transparent" aria-label="Accent color" />
                  <Input value={brandAccent} onChange={e => setBrandAccent(e.target.value)} onBlur={e => saveBrandAccent(e.target.value)} className="w-32 font-mono" />
                  <div className="flex-1 h-2 rounded-full" style={{ background: brandAccent }} />
                </div>
              </Row>
            </Section>
          )}

          {section === 'billing' && (
            <>
              <Section title="Bank account" description="Displayed on invoices for direct bank transfers." footer={<PrimaryBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</PrimaryBtn>}>
                <Row label="Bank name"><Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="HDFC Bank" /></Row>
                <Row label="Branch"><Input value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="Andheri West" /></Row>
                <Row label="Account holder"><Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Your business name" /></Row>
                <Row label="Account number"><Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="00000000000000" className="font-mono" /></Row>
                <Row label="IFSC code"><Input value={ifscCode} onChange={e => setIfscCode(e.target.value)} placeholder="HDFC0000001" className="font-mono" /></Row>
              </Section>
              <Section title="UPI" description="Generates a scannable QR on your invoices for PhonePe, GPay, Paytm.">
                <Row label="UPI ID"><Input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" /></Row>
              </Section>
            </>
          )}

          {section === 'invoicing' && (
            <Section title="Document defaults" description="Applied when you create new invoices, quotes and proposals." footer={<PrimaryBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</PrimaryBtn>}>
              <Row label="Invoice prefix"><Input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} className="w-32 font-mono" /></Row>
              <Row label="Quote prefix"><Input value={quotePrefix} onChange={e => setQuotePrefix(e.target.value)} className="w-32 font-mono" /></Row>
              <Row label="Currency">
                <Select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)} className="w-56">
                  <option value="INR">₹ INR — Indian Rupee</option>
                  <option value="USD">$ USD — US Dollar</option>
                  <option value="EUR">€ EUR — Euro</option>
                  <option value="GBP">£ GBP — British Pound</option>
                </Select>
              </Row>
              <Row label="Tax rate" hint="Default GST applied to line items.">
                <Select value={defaultTaxRate} onChange={e => setDefaultTaxRate(e.target.value)} className="w-40">
                  <option value="0">0% — None</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST</option>
                  <option value="28">28% GST</option>
                </Select>
              </Row>
              <Row label="Payment terms">
                <Select value={defaultPaymentTerms} onChange={e => setDefaultPaymentTerms(e.target.value)} className="w-56">
                  <option value="0">Due on receipt</option>
                  <option value="7">Net 7</option>
                  <option value="15">Net 15</option>
                  <option value="30">Net 30</option>
                  <option value="45">Net 45</option>
                  <option value="60">Net 60</option>
                </Select>
              </Row>
              <Row label="Default notes" stacked><Textarea value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} rows={3} /></Row>
              <Row label="Terms & conditions" stacked><Textarea value={invoiceTerms} onChange={e => setInvoiceTerms(e.target.value)} rows={4} /></Row>
            </Section>
          )}

          {section === 'notifications' && (
            <Section title="Delivery channels" description="Choose how you want Billenty to reach you." footer={<PrimaryBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</PrimaryBtn>}>
              {[
                { key: 'paid', label: 'Invoice paid', hint: 'When a client pays.' },
                { key: 'overdue', label: 'Invoice overdue', hint: 'When an invoice crosses its due date.' },
                { key: 'viewed', label: 'Quote viewed', hint: 'When a client opens your quote.' },
                { key: 'sent', label: 'Document sent', hint: 'Confirmation when a document is delivered.' },
              ].map(item => (
                <Row key={item.key} label={item.label} hint={item.hint}>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-[13px] text-[#0F172A]">
                      <Toggle on={!!notifEmail[item.key]} onChange={v => setNotifEmail(p => ({ ...p, [item.key]: v }))} label="Email" /> Email
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-[#0F172A]">
                      <Toggle on={!!notifWhatsapp[item.key]} onChange={v => setNotifWhatsapp(p => ({ ...p, [item.key]: v }))} label="WhatsApp" /> WhatsApp
                    </label>
                  </div>
                </Row>
              ))}
            </Section>
          )}

          {section === 'legal' && (
            <Section title="Auto legal notice" description="When an invoice is overdue by N days, Billenty auto-drafts a demand notice for your review." footer={<PrimaryBtn onClick={saveAutoNotice} disabled={savingAuto}>{savingAuto ? 'Saving…' : 'Save changes'}</PrimaryBtn>}>
              <Row label="Enable auto-draft" hint="You still review and send the notice yourself.">
                <Toggle on={autoNoticeEnabled} onChange={setAutoNoticeEnabled} />
              </Row>
              <Row label="Days overdue" hint="Number of days past due before drafting.">
                <Input type="number" min={1} max={120} value={autoNoticeDays} onChange={e => setAutoNoticeDays(Math.max(1, Math.min(120, Number(e.target.value) || 30)))} disabled={!autoNoticeEnabled} className="w-32" />
              </Row>
              <Row label="Run scan now" hint="Manually trigger the auto-notice scanner.">
                <GhostBtn onClick={runScanNow} disabled={scanning || !autoNoticeEnabled}>{scanning ? 'Scanning…' : 'Run scan'}</GhostBtn>
              </Row>
            </Section>
          )}

          {section === 'integrations' && (
            <>
              <Section title="Payment gateways" description="Accept online payments — landing soon.">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'Razorpay', desc: 'UPI, cards, netbanking' },
                    { name: 'Stripe', desc: 'International cards' },
                    { name: 'PayU', desc: 'UPI & cards' },
                    { name: 'WhatsApp', desc: 'Share invoices in chat' },
                    { name: 'Wise', desc: 'International transfers' },
                    { name: 'Payoneer', desc: 'Freelancer payouts' },
                  ].map(i => (
                    <div key={i.name} className="flex items-center justify-between px-3 py-3 border border-neutral-200 rounded-lg bg-white">
                      <div>
                        <div className="text-[13px] font-medium text-[#0F172A]">{i.name}</div>
                        <div className="text-[12px] text-[#6B7280]">{i.desc}</div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#faf9f4] border border-neutral-200 text-[#6B7280]">Soon</span>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="Developer" description="Utilities for testing your workspace.">
                <div className="p-4"><DemoSeedButton /></div>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
