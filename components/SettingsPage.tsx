import React, { useState } from 'react';
import { Icons } from './Icon';
import { toast } from './Toast';
import { useOrg } from '../org.context';
import { supabase } from '../src/integrations/supabase/client';
import DemoSeedButton from './DemoSeedButton';

interface SettingsPageProps {
    onBack: () => void;
}

type SettingsTab = 'company' | 'banking' | 'invoice' | 'notifications' | 'integrations';

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('company');
    const { org, orgId, refresh } = useOrg();
    const [autoNoticeEnabled, setAutoNoticeEnabled] = useState<boolean>(org?.auto_notice_enabled ?? false);
    const [autoNoticeDays, setAutoNoticeDays] = useState<number>(org?.auto_notice_days ?? 30);
    const [savingAuto, setSavingAuto] = useState(false);

    React.useEffect(() => {
        if (org) {
            setAutoNoticeEnabled(org.auto_notice_enabled ?? false);
            setAutoNoticeDays(org.auto_notice_days ?? 30);
        }
    }, [org]);

    const saveAutoNotice = async () => {
        if (!orgId) return;
        setSavingAuto(true);
        const { error } = await (supabase as any)
            .from('organizations')
            .update({ auto_notice_enabled: autoNoticeEnabled, auto_notice_days: autoNoticeDays })
            .eq('id', orgId);
        setSavingAuto(false);
        if (error) { toast.error(`Could not save: ${error.message}`); return; }
        await refresh();
        toast.success('Legal notice settings saved');
    };

    const [scanning, setScanning] = useState(false);
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
        } catch (e) {
            toast.error((e as Error).message);
        } finally { setScanning(false); }
    };

    // Company Settings State
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

    // Banking Settings State
    const [bankName, setBankName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [branchName, setBranchName] = useState('');
    const [upiId, setUpiId] = useState('');

    // Invoice Settings State
    const [invoicePrefix, setInvoicePrefix] = useState('INV-');
    const [quotePrefix, setQuotePrefix] = useState('QT-');
    const [defaultCurrency, setDefaultCurrency] = useState('INR');
    const [defaultTaxRate, setDefaultTaxRate] = useState('18');
    const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('15');
    const [invoiceNotes, setInvoiceNotes] = useState('Thank you for your business!');
    const [invoiceTerms, setInvoiceTerms] = useState('Payment is due within the specified terms. Late payments may incur additional charges.');

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    const tabs = [
        { id: 'company' as SettingsTab, label: 'Company Profile', icon: Icons.Business },
        { id: 'banking' as SettingsTab, label: 'Bank & UPI', icon: Icons.CreditCard },
        { id: 'invoice' as SettingsTab, label: 'Invoice Defaults', icon: Icons.FileText },
        { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Icons.Notification },
        { id: 'integrations' as SettingsTab, label: 'Integrations', icon: Icons.Plus },
    ];

    return (
        <div className="h-full flex bg-gray-50 dark:bg-gray-900">

            {/* === LEFT SIDEBAR === */}
            <div className="w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden">

                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Icons.ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Settings</h1>
                            <p className="text-xs text-gray-500">Configure your account</p>
                        </div>
                    </div>
                </div>

                {/* Settings Navigation */}
                <div className="flex-1 overflow-y-auto p-4">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                        Save All Settings
                    </button>
                </div>
            </div>

            {/* === MAIN CONTENT === */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl">

                    {/* COMPANY PROFILE TAB */}
                    {activeTab === 'company' && (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Company Profile</h2>
                                <p className="text-sm text-gray-500 mt-1">This information will appear on your invoices and quotes</p>
                            </div>

                            {/* Logo Upload */}
                            <div className="mb-8 p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Company Logo</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600">
                                        <Icons.Plus size={24} />
                                    </div>
                                    <div>
                                        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                            Upload Logo
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Details */}
                            <div className="p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Business Name *</label>
                                    <input
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Your Company Name"
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={companyEmail}
                                            onChange={(e) => setCompanyEmail(e.target.value)}
                                            placeholder="billing@company.com"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                                        <input
                                            value={companyPhone}
                                            onChange={(e) => setCompanyPhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Street Address</label>
                                    <input
                                        value={companyAddress}
                                        onChange={(e) => setCompanyAddress(e.target.value)}
                                        placeholder="123 Business Street, Suite 100"
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">City</label>
                                        <input
                                            value={companyCity}
                                            onChange={(e) => setCompanyCity(e.target.value)}
                                            placeholder="Mumbai"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">State</label>
                                        <input
                                            value={companyState}
                                            onChange={(e) => setCompanyState(e.target.value)}
                                            placeholder="Maharashtra"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Pincode</label>
                                        <input
                                            value={companyPincode}
                                            onChange={(e) => setCompanyPincode(e.target.value)}
                                            placeholder="400001"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">GSTIN</label>
                                        <input
                                            value={companyGSTIN}
                                            onChange={(e) => setCompanyGSTIN(e.target.value)}
                                            placeholder="22AAAAA0000A1Z5"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">PAN</label>
                                        <input
                                            value={companyPAN}
                                            onChange={(e) => setCompanyPAN(e.target.value)}
                                            placeholder="AAAAA1234A"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Website</label>
                                    <input
                                        value={companyWebsite}
                                        onChange={(e) => setCompanyWebsite(e.target.value)}
                                        placeholder="https://yourcompany.com"
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BANKING TAB */}
                    {activeTab === 'banking' && (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bank & UPI Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Payment information for your invoices</p>
                            </div>

                            {/* Bank Account */}
                            <div className="p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg space-y-6 mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Icons.Business size={16} />
                                    Bank Account Details
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Bank Name</label>
                                        <input
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            placeholder="HDFC Bank"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Branch</label>
                                        <input
                                            value={branchName}
                                            onChange={(e) => setBranchName(e.target.value)}
                                            placeholder="Andheri West Branch"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Account Holder Name</label>
                                    <input
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        placeholder="Your Name or Business Name"
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Account Number</label>
                                        <input
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            placeholder="00000000000000"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">IFSC Code</label>
                                        <input
                                            value={ifscCode}
                                            onChange={(e) => setIfscCode(e.target.value)}
                                            placeholder="HDFC0000001"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* UPI Details */}
                            <div className="p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg space-y-6">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Icons.CreditCard size={16} />
                                    UPI Payment
                                </h3>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">UPI ID</label>
                                    <input
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="yourname@upi"
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">This UPI ID will generate a QR code on your invoices for easy payment via PhonePe, GPay, Paytm, etc.</p>
                                </div>

                                {upiId && (
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">QR Code Preview</p>
                                        <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                                                    <Icons.Search size={24} className="text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">QR code will be auto-generated</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* INVOICE DEFAULTS TAB */}
                    {activeTab === 'invoice' && (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Defaults</h2>
                                <p className="text-sm text-gray-500 mt-1">Default settings for new invoices and quotes</p>
                            </div>

                            <div className="p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Invoice Number Prefix</label>
                                        <input
                                            value={invoicePrefix}
                                            onChange={(e) => setInvoicePrefix(e.target.value)}
                                            placeholder="INV-"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quote Number Prefix</label>
                                        <input
                                            value={quotePrefix}
                                            onChange={(e) => setQuotePrefix(e.target.value)}
                                            placeholder="QT-"
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Default Currency</label>
                                        <select
                                            value={defaultCurrency}
                                            onChange={(e) => setDefaultCurrency(e.target.value)}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                        >
                                            <option value="INR">₹ INR - Indian Rupee</option>
                                            <option value="USD">$ USD - US Dollar</option>
                                            <option value="EUR">€ EUR - Euro</option>
                                            <option value="GBP">£ GBP - British Pound</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Default Tax Rate (%)</label>
                                        <select
                                            value={defaultTaxRate}
                                            onChange={(e) => setDefaultTaxRate(e.target.value)}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                        >
                                            <option value="0">0% - No Tax</option>
                                            <option value="5">5% - GST</option>
                                            <option value="12">12% - GST</option>
                                            <option value="18">18% - GST</option>
                                            <option value="28">28% - GST</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Payment Terms (Days)</label>
                                        <select
                                            value={defaultPaymentTerms}
                                            onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                        >
                                            <option value="0">Due on Receipt</option>
                                            <option value="7">Net 7 Days</option>
                                            <option value="15">Net 15 Days</option>
                                            <option value="30">Net 30 Days</option>
                                            <option value="45">Net 45 Days</option>
                                            <option value="60">Net 60 Days</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Default Notes</label>
                                    <textarea
                                        value={invoiceNotes}
                                        onChange={(e) => setInvoiceNotes(e.target.value)}
                                        rows={3}
                                        placeholder="Thank you for your business!"
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Default Terms & Conditions</label>
                                    <textarea
                                        value={invoiceTerms}
                                        onChange={(e) => setInvoiceTerms(e.target.value)}
                                        rows={4}
                                        placeholder="Payment terms and conditions..."
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                                <p className="text-sm text-gray-500 mt-1">Configure how you receive updates</p>
                            </div>

                            <div className="p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
                                {[
                                    { label: 'Invoice Paid', desc: 'Get notified when a client pays an invoice' },
                                    { label: 'Invoice Overdue', desc: 'Reminder when an invoice becomes overdue' },
                                    { label: 'Quote Accepted', desc: 'When a client accepts your quote' },
                                    { label: 'Quote Declined', desc: 'When a client declines your quote' },
                                    { label: 'Weekly Summary', desc: 'Weekly report of your invoicing activity' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                        <button className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors">
                                            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"></span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Auto legal notice</h3>
                                    <p className="text-xs text-gray-500 mt-1">When an invoice is overdue by N days, Billenty will auto-draft a demand notice and attach your primary lawyer.</p>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Enable auto-draft</p>
                                        <p className="text-xs text-gray-500">You still review and send the notice yourself.</p>
                                    </div>
                                    <button
                                        onClick={() => setAutoNoticeEnabled(v => !v)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${autoNoticeEnabled ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        aria-pressed={autoNoticeEnabled}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 rounded-full shadow transition-transform ${autoNoticeEnabled ? 'left-7 bg-white dark:bg-gray-900' : 'left-1 bg-white'}`} />
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Days overdue before auto-draft</label>
                                    <input
                                        type="number" min={1} max={120}
                                        value={autoNoticeDays}
                                        onChange={(e) => setAutoNoticeDays(Math.max(1, Math.min(120, Number(e.target.value) || 30)))}
                                        disabled={!autoNoticeEnabled}
                                        className="w-32 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={saveAutoNotice}
                                        disabled={savingAuto}
                                        className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 dark:bg-white dark:text-gray-900 disabled:opacity-50"
                                    >
                                        {savingAuto ? 'Saving…' : 'Save legal notice settings'}
                                    </button>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Run overdue scan now</p>
                                        <p className="text-xs text-gray-500">Manually trigger the auto-notice scanner for this workspace.</p>
                                    </div>
                                    <button
                                        onClick={runScanNow}
                                        disabled={scanning || !autoNoticeEnabled}
                                        className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        {scanning ? 'Scanning…' : 'Run scan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INTEGRATIONS TAB */}
                    {activeTab === 'integrations' && (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Integrations</h2>
                                <p className="text-sm text-gray-500 mt-1">Connect with payment gateways and other services</p>
                            </div>

                            <div className="mb-6">
                                <DemoSeedButton />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { name: 'Razorpay', desc: 'Accept online payments', status: 'coming' },
                                    { name: 'Stripe', desc: 'International payments', status: 'coming' },
                                    { name: 'PayU', desc: 'UPI & Card payments', status: 'coming' },
                                    { name: 'WhatsApp', desc: 'Share invoices via WhatsApp', status: 'coming' },
                                    { name: 'Wise', desc: 'International transfers', status: 'coming' },
                                    { name: 'Payoneer', desc: 'Freelancer payments', status: 'coming' },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">Coming Soon</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
