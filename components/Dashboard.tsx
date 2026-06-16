import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchInvoices } from '../api.client';
import { mapApiInvoiceToInvoice } from '../mappers';
import { useQuotes, useProposals, useClients } from '../dataStore';
import type { Invoice } from '../types';
import { Icons } from './Icon';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const { items: quotes } = useQuotes();
    const { items: proposals } = useProposals();
    const { items: clients } = useClients();

    useEffect(() => {
        fetchInvoices()
            .then(r => setInvoices(r.map(mapApiInvoiceToInvoice)))
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = invoices.reduce((s, i) => s + i.amountPaid, 0);
    const outstanding = invoices.reduce((s, i) => s + i.amountDue, 0);
    const overdue = invoices.filter(i => i.status === 'Overdue' || (i.status === 'Pending' && new Date(i.dueDate) < new Date())).length;
    const paid = invoices.filter(i => i.status === 'Paid').length;
    const signedProposals = proposals.filter(p => p.status === 'Signed').length;
    const acceptedQuotes = quotes.filter(q => q.status === 'Accepted').length;
    const recent = [...invoices].slice(0, 5);

    const Card = ({ label, value, icon, color, sub }: any) => (
        <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-start justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>{icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-500">Overview of your business</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/invoices/new')} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-md text-sm font-medium flex items-center gap-2">
                        <Icons.Plus size={16} /> New Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<Icons.Dashboard size={16} className="text-green-600" />} color="bg-green-50 dark:bg-green-950/30" sub={`${paid} paid invoices`} />
                <Card label="Outstanding" value={`₹${outstanding.toLocaleString()}`} icon={<Icons.Reports size={16} className="text-amber-600" />} color="bg-amber-50 dark:bg-amber-950/30" sub={`${invoices.length - paid} unpaid`} />
                <Card label="Overdue" value={overdue} icon={<Icons.X size={16} className="text-red-600" />} color="bg-red-50 dark:bg-red-950/30" sub="Past due date" />
                <Card label="Total Invoices" value={invoices.length} icon={<Icons.Dashboard size={16} className="text-gray-600" />} color="bg-gray-100 dark:bg-gray-900" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => navigate('/quotes')} className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-5 text-left hover:border-gray-400 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase text-gray-500">Quotes</span>
                        <Icons.ChevronDown size={16} className="-rotate-90 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{quotes.length}</p>
                    <p className="text-xs text-green-600 mt-1">{acceptedQuotes} accepted</p>
                </button>
                <button onClick={() => navigate('/proposals')} className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-5 text-left hover:border-gray-400 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase text-gray-500">Proposals</span>
                        <Icons.ChevronDown size={16} className="-rotate-90 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{proposals.length}</p>
                    <p className="text-xs text-green-600 mt-1">{signedProposals} signed</p>
                </button>
                <button onClick={() => navigate('/clients')} className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-5 text-left hover:border-gray-400 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase text-gray-500">Clients</span>
                        <Icons.ChevronDown size={16} className="-rotate-90 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</p>
                    <p className="text-xs text-gray-500 mt-1">In your book</p>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900 dark:text-white">Recent Invoices</h2>
                    <button onClick={() => navigate('/invoices')} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">View all →</button>
                </div>
                {loading ? <p className="text-sm text-gray-500">Loading…</p> :
                    recent.length === 0 ? <p className="text-sm text-gray-500">No invoices yet</p> :
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {recent.map(inv => (
                                <button key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)} className="w-full flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-900 px-2 rounded-md">
                                    <div className="text-left">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">{inv.number}</p>
                                        <p className="text-xs text-gray-500">{inv.clientName} • {inv.issuedDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">₹{inv.amountDue.toLocaleString()}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{inv.status}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                }
            </div>
        </div>
    );
};

export default DashboardPage;