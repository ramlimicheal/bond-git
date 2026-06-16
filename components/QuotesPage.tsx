import React, { useState, useMemo } from 'react';
import { Icons } from './Icon';
import { toast } from './Toast';
import { Quote, Page } from '../types';

interface QuotesPageProps {
    searchQuery: string;
    onNavigate: (page: Page, id?: string) => void;
}

// Mock data for quotes
const MOCK_QUOTES: Quote[] = [
    {
        id: '1',
        number: 'QT-2026-0001',
        status: 'Sent',
        clientName: 'Tech Solutions Inc.',
        clientType: 'Software Development',
        createdDate: '10 Jan 2026',
        validUntil: '10 Feb 2026',
        total: 15000,
        items: [{ id: '1', description: 'Web Application Development', quantity: 1, price: 15000 }]
    },
    {
        id: '2',
        number: 'QT-2026-0002',
        status: 'Draft',
        clientName: 'Creative Agency',
        clientType: 'Branding',
        createdDate: '08 Jan 2026',
        validUntil: '08 Feb 2026',
        total: 5500,
        items: [{ id: '1', description: 'Brand Identity Package', quantity: 1, price: 5500 }]
    },
    {
        id: '3',
        number: 'QT-2026-0003',
        status: 'Accepted',
        clientName: 'Global Enterprises',
        clientType: 'Consulting',
        createdDate: '05 Jan 2026',
        validUntil: '05 Feb 2026',
        total: 25000,
        items: [{ id: '1', description: 'Strategic Consulting Package', quantity: 1, price: 25000 }]
    },
    {
        id: '4',
        number: 'QT-2026-0004',
        status: 'Declined',
        clientName: 'StartUp Hub',
        clientType: 'MVP Development',
        createdDate: '03 Jan 2026',
        validUntil: '03 Feb 2026',
        total: 8000,
        items: [{ id: '1', description: 'MVP Application', quantity: 1, price: 8000 }]
    },
    {
        id: '5',
        number: 'QT-2026-0005',
        status: 'Expired',
        clientName: 'Old Client Corp',
        clientType: 'Maintenance',
        createdDate: '01 Dec 2025',
        validUntil: '01 Jan 2026',
        total: 3000,
        items: [{ id: '1', description: 'Annual Maintenance', quantity: 1, price: 3000 }]
    },
];

export const QuotesPage: React.FC<QuotesPageProps> = ({ searchQuery, onNavigate }) => {
    const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            const matchesSearch = quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.number.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'all' || quote.status.toLowerCase() === filterStatus.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [quotes, searchQuery, filterStatus]);

    const stats = useMemo(() => {
        const total = quotes.reduce((sum, q) => sum + q.total, 0);
        const sent = quotes.filter(q => q.status === 'Sent').length;
        const accepted = quotes.filter(q => q.status === 'Accepted').length;
        const pending = quotes.filter(q => q.status === 'Draft' || q.status === 'Sent').length;
        return { total, sent, accepted, pending };
    }, [quotes]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            case 'Declined': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Expired': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleConvertToInvoice = (quote: Quote) => {
        toast.success(`Converting ${quote.number} to invoice...`);
    };

    const handleDuplicate = (quote: Quote) => {
        const newQuote: Quote = {
            ...quote,
            id: Date.now().toString(),
            number: `QT-2026-${(quotes.length + 1).toString().padStart(4, '0')}`,
            status: 'Draft',
            createdDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        };
        setQuotes([newQuote, ...quotes]);
        toast.success('Quote duplicated');
    };

    const handleDelete = (id: string) => {
        setQuotes(quotes.filter(q => q.id !== id));
        toast.success('Quote deleted');
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotes</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage quotations for your clients</p>
                </div>
                <button
                    onClick={() => onNavigate(Page.CREATE_QUOTE)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                    <Icons.Plus size={16} />
                    New Quote
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.total.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Sent</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.sent}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Accepted</p>
                    <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    {['all', 'draft', 'sent', 'accepted', 'declined', 'expired'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filterStatus === status
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Icons.Grid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Icons.List size={18} />
                    </button>
                </div>
            </div>

            {/* Quotes Grid/List */}
            {filteredQuotes.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.FileText size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No quotes found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first quote to get started</p>
                    <button
                        onClick={() => onNavigate(Page.CREATE_QUOTE)}
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg"
                    >
                        Create Quote
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{quote.number}</p>
                                    <p className="text-xs text-gray-500">{quote.createdDate}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                                    {quote.status}
                                </span>
                            </div>
                            <div className="mb-4">
                                <p className="font-medium text-gray-900 dark:text-white">{quote.clientName}</p>
                                <p className="text-sm text-gray-500">{quote.clientType}</p>
                            </div>
                            <div className="flex items-end justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="text-xs text-gray-500">Valid until</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.validUntil}</p>
                                </div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">${quote.total.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => onNavigate(Page.QUOTE_DETAILS, quote.id)}
                                    className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    View
                                </button>
                                {quote.status === 'Accepted' && (
                                    <button
                                        onClick={() => handleConvertToInvoice(quote)}
                                        className="flex-1 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                    >
                                        Convert to Invoice
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quote</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valid Until</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotes.map((quote) => (
                                <tr key={quote.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="py-4 px-4">
                                        <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{quote.number}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.clientName}</p>
                                        <p className="text-xs text-gray-500">{quote.clientType}</p>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{quote.createdDate}</td>
                                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{quote.validUntil}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right text-sm font-semibold text-gray-900 dark:text-white">${quote.total.toLocaleString()}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onNavigate(Page.QUOTE_DETAILS, quote.id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <Icons.View size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDuplicate(quote)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <Icons.Plus size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quote.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600"
                                            >
                                                <Icons.Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
