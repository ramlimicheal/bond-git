import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icons } from './Icon';
import { Invoice, InvoiceItem } from '../types';
import { toast } from './Toast';
import { useOrg } from '../org.context';
import { supabase } from '../src/integrations/supabase/client';
import { DEFAULT_SAC, DEFAULT_GST_RATE, computeGst, isIntraState } from '../utils/gst';

interface CreateInvoicePageProps {
    onBack: () => void;
    onSubmit: (invoice: Omit<Invoice, 'id'>) => void;
}

// === CURRENCY DATA ===
const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

const TAX_RATES = [
    { label: 'No Tax', value: 0 },
    { label: 'GST 5%', value: 5 },
    { label: 'GST 12%', value: 12 },
    { label: 'GST 18%', value: 18 },
    { label: 'GST 28%', value: 28 },
    { label: 'VAT 5%', value: 5 },
    { label: 'VAT 10%', value: 10 },
    { label: 'VAT 15%', value: 15 },
    { label: 'VAT 20%', value: 20 },
];

const PAYMENT_TERMS = [
    { label: 'Due on Receipt', days: 0 },
    { label: 'Net 15 Days', days: 15 },
    { label: 'Net 30 Days', days: 30 },
    { label: 'Net 45 Days', days: 45 },
    { label: 'Net 60 Days', days: 60 },
];

export const CreateInvoicePage: React.FC<CreateInvoicePageProps> = ({ onBack, onSubmit }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const { org } = useOrg();

    // === SENDER (FROM) ===
    const [fromName, setFromName] = useState('');
    const [fromCompany, setFromCompany] = useState('');
    const [fromAddress, setFromAddress] = useState('');
    const [fromCity, setFromCity] = useState('');
    const [fromCountry, setFromCountry] = useState('');
    const [fromEmail, setFromEmail] = useState('');
    const [fromPhone, setFromPhone] = useState('');
    const [fromTaxId, setFromTaxId] = useState('');

    // === CLIENT (BILL TO) ===
    const [toName, setToName] = useState('');
    const [toCompany, setToCompany] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [toCity, setToCity] = useState('');
    const [toCountry, setToCountry] = useState('');
    const [toEmail, setToEmail] = useState('');
    const [toPhone, setToPhone] = useState('');
    const [toTaxId, setToTaxId] = useState('');

    // === INVOICE DETAILS ===
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-8)}`);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
    const [poNumber, setPoNumber] = useState('');

    // === CURRENCY & TAX ===
    const [currency, setCurrency] = useState(CURRENCIES.find(c => c.code === 'INR') || CURRENCIES[0]);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const [taxRate, setTaxRate] = useState(DEFAULT_GST_RATE);
    const [taxLabel, setTaxLabel] = useState('Tax');
    const [sacCode, setSacCode] = useState(DEFAULT_SAC);
    const [supplyType, setSupplyType] = useState<'intra' | 'inter'>('intra');
    const [polishingIdx, setPolishingIdx] = useState<number | null>(null);

    // === DISCOUNT ===
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState(0);

    // === LINE ITEMS ===
    const [items, setItems] = useState<{ description: string; quantity: number; rate: number }[]>([
        { description: '', quantity: 1, rate: 0 }
    ]);

    // === ADDITIONAL ===
    const [notes, setNotes] = useState('');
    const [terms, setTerms] = useState('Payment is due within the specified terms. Please include invoice number with your payment.');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    const [showBankDetails, setShowBankDetails] = useState(false);

    // Auto-calculate due date
    useEffect(() => {
        const term = PAYMENT_TERMS.find(t => t.label === paymentTerms);
        if (term && invoiceDate) {
            const date = new Date(invoiceDate);
            date.setDate(date.getDate() + term.days);
            setDueDate(date.toISOString().split('T')[0]);
        }
    }, [paymentTerms, invoiceDate]);

    // === CALCULATIONS ===
    const calculations = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const discountAmount = discountType === 'percentage'
            ? (subtotal * discountValue) / 100
            : discountValue;
        const afterDiscount = subtotal - discountAmount;
        const gst = computeGst(afterDiscount, taxRate, supplyType === 'intra');
        const taxAmount = gst.total;
        const total = afterDiscount + taxAmount;
        return { subtotal, discountAmount, afterDiscount, taxAmount, total, gst };
    }, [items, taxRate, discountType, discountValue, supplyType]);

    // Sync supply type from org state vs client state when both known
    useEffect(() => {
        if (currency.code !== 'INR') return;
        if (org?.default_state_code && toCity) {
            setSupplyType(isIntraState(org.default_state_code, toCity) ? 'intra' : 'inter');
        }
    }, [org?.default_state_code, toCity, currency.code]);

    const polishLine = async (index: number) => {
        const line = items[index];
        if (!line?.description?.trim()) { toast.error('Type something first, then polish'); return; }
        setPolishingIdx(index);
        try {
            const PROJECT_REF = (import.meta.env.VITE_SUPABASE_PROJECT_ID as string) || '';
            const FN_URL = PROJECT_REF
                ? `https://${PROJECT_REF}.supabase.co/functions/v1/ai-assist`
                : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`;
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(FN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
                body: JSON.stringify({ mode: 'invoice-line', description: line.description, projectType: 'design services' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `AI error ${res.status}`);
            handleItemChange(index, 'description', String(data.text || line.description).trim());
            toast.success('Polished');
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setPolishingIdx(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return `${currency.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, rate: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = () => {
        if (!toName && !toCompany) {
            toast.error('Please enter client name or company');
            return;
        }
        if (items.every(i => !i.description || i.rate === 0)) {
            toast.error('Please add at least one line item');
            return;
        }

        const finalItems: InvoiceItem[] = items
            .filter(item => item.description && item.rate > 0)
            .map((item, idx) => ({
                id: `item-${Date.now()}-${idx}`,
                description: item.description,
                quantity: item.quantity,
                price: item.rate
            }));

        onSubmit({
            number: invoiceNumber,
            status: 'Pending',
            clientName: toName || toCompany,
            clientType: 'Service',
            issuedDate: new Date(invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            dueDate: new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            amountPaid: 0,
            amountDue: calculations.total,
            items: finalItems
        });
    };

    return (
        <div className="h-full flex bg-gray-50 dark:bg-gray-900">

            {/* === LEFT SIDEBAR === */}
            <div className="w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden">

                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Icons.ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">New Invoice</h1>
                            <p className="text-xs text-gray-500">Configure settings</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Currency */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Currency</label>
                        <div className="relative">
                            <button
                                onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">{currency.symbol}</span>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{currency.code}</p>
                                        <p className="text-xs text-gray-500">{currency.name}</p>
                                    </div>
                                </div>
                                <Icons.ChevronDown size={16} className={`text-gray-400 transition-transform ${showCurrencyPicker ? 'rotate-180' : ''}`} />
                            </button>

                            {showCurrencyPicker && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                                    {CURRENCIES.map((c) => (
                                        <button
                                            key={c.code}
                                            onClick={() => { setCurrency(c); setShowCurrencyPicker(false); }}
                                            className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${currency.code === c.code ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                                        >
                                            <span className="text-lg font-medium text-gray-600 dark:text-gray-400 w-8">{c.symbol}</span>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.code}</p>
                                                <p className="text-xs text-gray-500">{c.name}</p>
                                            </div>
                                            {currency.code === c.code && <Icons.CheckCircle size={16} className="ml-auto text-gray-900 dark:text-white" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tax Rate */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tax Rate</label>
                        <select
                            value={taxRate}
                            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                        >
                            {TAX_RATES.map(t => (
                                <option key={t.label} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Terms */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Payment Terms</label>
                        <select
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                        >
                            {PAYMENT_TERMS.map(t => (
                                <option key={t.label} value={t.label}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Discount */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Discount</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="0"
                                value={discountValue || ''}
                                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                onFocus={(e) => e.target.select()}
                                placeholder="0"
                                className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                            />
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setDiscountType('percentage')}
                                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${discountType === 'percentage' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                                >
                                    %
                                </button>
                                <button
                                    onClick={() => setDiscountType('fixed')}
                                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${discountType === 'fixed' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                                >
                                    {currency.symbol}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* P.O. Number */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">P.O. Number (Optional)</label>
                        <input
                            value={poNumber}
                            onChange={(e) => setPoNumber(e.target.value)}
                            placeholder="Enter PO number"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                        />
                    </div>

                    {/* Bank Details Toggle */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showBankDetails}
                                onChange={(e) => setShowBankDetails(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Include bank details</span>
                        </label>
                    </div>

                </div>

                {/* Sidebar Footer - Totals */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(calculations.subtotal)}</span>
                        </div>
                        {calculations.discountAmount > 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Discount</span>
                                <span className="font-medium text-green-600">-{formatCurrency(calculations.discountAmount)}</span>
                            </div>
                        )}
                        {taxRate > 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Tax ({taxRate}%)</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(calculations.taxAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-semibold text-gray-900 dark:text-white">Total ({currency.code})</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(calculations.total)}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="w-full mt-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* === MAIN CONTENT - Invoice Preview === */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">

                    {/* Invoice Document */}
                    <div
                        ref={invoiceRef}
                        className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm"
                    >

                        {/* Document Header */}
                        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">INVOICE</h2>
                                    <div className="mt-4 space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 w-24">Invoice No.</span>
                                            <input
                                                value={invoiceNumber}
                                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                                className="font-mono font-medium text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-white focus:outline-none px-1"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 w-24">Date</span>
                                            <input
                                                type="date"
                                                value={invoiceDate}
                                                onChange={(e) => setInvoiceDate(e.target.value)}
                                                className="text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-white focus:outline-none px-1"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 w-24">Due Date</span>
                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-white focus:outline-none px-1"
                                            />
                                        </div>
                                        {poNumber && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500 dark:text-gray-400 w-24">P.O. Number</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{poNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Amount Due ({currency.code})</div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(calculations.total)}</div>
                                </div>
                            </div>
                        </div>

                        {/* FROM / TO Section */}
                        <div className="grid grid-cols-2 gap-8 p-8 border-b border-gray-200 dark:border-gray-800">
                            {/* FROM */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">From</h3>
                                <div className="space-y-2">
                                    <input
                                        value={fromCompany}
                                        onChange={(e) => setFromCompany(e.target.value)}
                                        placeholder="Your Company Name"
                                        className="w-full text-base font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                    <input
                                        value={fromName}
                                        onChange={(e) => setFromName(e.target.value)}
                                        placeholder="Contact Name"
                                        className="w-full text-sm text-gray-700 dark:text-gray-300 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                    <input
                                        value={fromAddress}
                                        onChange={(e) => setFromAddress(e.target.value)}
                                        placeholder="Street Address"
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            value={fromCity}
                                            onChange={(e) => setFromCity(e.target.value)}
                                            placeholder="City, State ZIP"
                                            className="flex-1 text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                        />
                                        <input
                                            value={fromCountry}
                                            onChange={(e) => setFromCountry(e.target.value)}
                                            placeholder="Country"
                                            className="flex-1 text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                        />
                                    </div>
                                    <input
                                        value={fromEmail}
                                        onChange={(e) => setFromEmail(e.target.value)}
                                        placeholder="email@company.com"
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                    <input
                                        value={fromTaxId}
                                        onChange={(e) => setFromTaxId(e.target.value)}
                                        placeholder="Tax ID / GST / VAT Number"
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            {/* TO */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Bill To</h3>
                                <div className="space-y-2">
                                    <input
                                        value={toCompany}
                                        onChange={(e) => setToCompany(e.target.value)}
                                        placeholder="Client Company Name"
                                        className="w-full text-base font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                    <input
                                        value={toName}
                                        onChange={(e) => setToName(e.target.value)}
                                        placeholder="Client Contact Name"
                                        className="w-full text-sm text-gray-700 dark:text-gray-300 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                    <input
                                        value={toAddress}
                                        onChange={(e) => setToAddress(e.target.value)}
                                        placeholder="Street Address"
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            value={toCity}
                                            onChange={(e) => setToCity(e.target.value)}
                                            placeholder="City, State ZIP"
                                            className="flex-1 text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                        />
                                        <input
                                            value={toCountry}
                                            onChange={(e) => setToCountry(e.target.value)}
                                            placeholder="Country"
                                            className="flex-1 text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                        />
                                    </div>
                                    <input
                                        value={toEmail}
                                        onChange={(e) => setToEmail(e.target.value)}
                                        placeholder="client@email.com"
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                    <input
                                        value={toTaxId}
                                        onChange={(e) => setToTaxId(e.target.value)}
                                        placeholder="Tax ID / GST / VAT Number"
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-900 dark:border-white">
                                        <th className="py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Description</th>
                                        <th className="py-3 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider w-24">Qty</th>
                                        <th className="py-3 text-right text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider w-32">Rate</th>
                                        <th className="py-3 text-right text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider w-32">Amount</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 group">
                                            <td className="py-4">
                                                <input
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    placeholder="Service or product description"
                                                    className="w-full text-sm text-gray-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-gray-400"
                                                />
                                            </td>
                                            <td className="py-4">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity || ''}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    onFocus={(e) => e.target.select()}
                                                    className="w-full text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-center focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                                />
                                            </td>
                                            <td className="py-4">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{currency.symbol}</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.rate || ''}
                                                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                                        onFocus={(e) => e.target.select()}
                                                        className="w-full text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded pl-6 pr-2 py-1 text-right focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(item.quantity * item.rate)}
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 disabled:opacity-0 transition-opacity"
                                                >
                                                    <Icons.Trash size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button
                                onClick={addItem}
                                className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
                            >
                                <Icons.Plus size={14} />
                                Add Line Item
                            </button>
                        </div>

                        {/* Totals */}
                        <div className="p-8 flex justify-end border-b border-gray-200 dark:border-gray-800">
                            <div className="w-72">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                        <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(calculations.subtotal)}</span>
                                    </div>
                                    {calculations.discountAmount > 0 && (
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-500 dark:text-gray-400">Discount</span>
                                            <span className="text-green-600 font-medium">-{formatCurrency(calculations.discountAmount)}</span>
                                        </div>
                                    )}
                                    {taxRate > 0 && (
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-500 dark:text-gray-400">Tax ({taxRate}%)</span>
                                            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(calculations.taxAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 border-t-2 border-gray-900 dark:border-white mt-2">
                                        <span className="text-base font-bold text-gray-900 dark:text-white">Total ({currency.code})</span>
                                        <span className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(calculations.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Terms */}
                        <div className="p-8 grid grid-cols-2 gap-8 border-b border-gray-200 dark:border-gray-800">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional notes or payment instructions..."
                                    rows={3}
                                    className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent resize-none"
                                />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Terms & Conditions</h3>
                                <textarea
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                    rows={3}
                                    className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        {/* Bank Details */}
                        {showBankDetails && (
                            <div className="p-8">
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Payment Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bank Name</label>
                                        <input
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            placeholder="Enter bank name"
                                            className="w-full text-sm text-gray-900 dark:text-white bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</label>
                                        <input
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            placeholder="Enter account number"
                                            className="w-full text-sm text-gray-900 dark:text-white bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Routing / IFSC Code</label>
                                        <input
                                            value={routingNumber}
                                            onChange={(e) => setRoutingNumber(e.target.value)}
                                            placeholder="Enter routing number"
                                            className="w-full text-sm text-gray-900 dark:text-white bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">SWIFT / BIC Code</label>
                                        <input
                                            value={swiftCode}
                                            onChange={(e) => setSwiftCode(e.target.value)}
                                            placeholder="Enter SWIFT code"
                                            className="w-full text-sm text-gray-900 dark:text-white bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};
