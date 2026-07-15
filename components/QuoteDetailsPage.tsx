import React, { useRef } from 'react';
import { Quote } from '../types';
import { Icons } from './Icon';
import { toast } from './Toast';
import { useConfirmDialog } from './ConfirmDialog';
import { generateQuotePDF, downloadBlob } from '../utils/pdfGenerator';
import { useOrg } from '../org.context';
import { resolveOrgBranding } from '../utils/branding';
import { useQuotes } from '../dataStore';

interface QuoteDetailsPageProps {
    quote: Quote;
    onBack: () => void;
    onEdit: (quote: Quote) => void;
    onDelete: (id: string) => void;
    onConvertToInvoice: (quote: Quote) => void;
}

export const QuoteDetailsPage: React.FC<QuoteDetailsPageProps> = ({
    quote,
    onBack,
    onEdit,
    onDelete,
    onConvertToInvoice,
}) => {
    const { confirm, DialogComponent } = useConfirmDialog();
    const { org } = useOrg();
    const { update } = useQuotes();
    const quoteRef = useRef<HTMLDivElement>(null);

    const isAccepted = quote.status === 'Accepted';
    const isDeclined = quote.status === 'Declined';
    const isExpired = quote.status === 'Expired';

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Quote',
            message: `Are you sure you want to delete quote ${quote.number}? This action cannot be undone.`,
            variant: 'danger',
            confirmLabel: 'Delete Quote',
        });

        if (confirmed) {
            onDelete(quote.id);
            toast.success('Quote deleted');
            onBack();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Quote link copied to clipboard');
    };

    const handleSendToClient = async () => {
        await update(quote.id, { status: 'Sent' } as any);
        toast.success('Quote sent to client');
    };

    const handleDuplicate = () => {
        toast.success('Quote duplicated');
    };

    const handleDownloadPDF = async () => {
        try {
            const branded = (await resolveOrgBranding(org)) || {};
            const blob = await generateQuotePDF(quote, branded);
            downloadBlob(blob, `Quote-${quote.number}.pdf`);
            toast.success('Quote PDF downloaded');
        } catch (e) { console.error(e); toast.error('Failed to generate PDF'); }
    };

    const handleMarkAsAccepted = async () => {
        await update(quote.id, { status: 'Accepted' } as any);
        toast.success('Quote marked as accepted');
    };

    const handleMarkAsDeclined = async () => {
        await update(quote.id, { status: 'Declined' } as any);
        toast.success('Quote marked as declined');
    };

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

    const activityLog = [
        { id: 1, type: 'created', text: `Quote ${quote.number} created`, date: quote.createdDate },
        ...(quote.status !== 'Draft' ? [{ id: 2, type: 'sent', text: 'Quote sent to client', date: quote.createdDate }] : []),
        ...(isAccepted ? [{ id: 3, type: 'accepted', text: 'Quote accepted by client', date: quote.validUntil }] : []),
        ...(isDeclined ? [{ id: 3, type: 'declined', text: 'Quote declined by client', date: quote.validUntil }] : []),
    ];

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
                            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">{quote.number}</h1>
                            <p className="text-xs text-gray-500">Quote Details</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</label>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(quote.status)}`}>
                            {isAccepted ? <Icons.CheckCircle size={16} /> :
                                isDeclined ? <Icons.Clear size={16} /> :
                                    isExpired ? <Icons.Clock size={16} /> :
                                        quote.status === 'Sent' ? <Icons.Send size={16} /> :
                                            <Icons.FileText size={16} />}
                            {quote.status}
                        </div>
                    </div>

                    {/* Client */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Client</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                                {quote.clientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.clientName}</p>
                                <p className="text-xs text-gray-500">{quote.clientType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Dates</label>
                        <div className="space-y-2">
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-500">Created</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{quote.createdDate}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-500">Valid Until</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{quote.validUntil}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quick Actions</label>
                        <div className="space-y-2">
                            {quote.status === 'Draft' && (
                                <button
                                    onClick={handleSendToClient}
                                    className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Icons.Send size={16} />
                                    Send to Client
                                </button>
                            )}
                            <button
                                onClick={() => onEdit(quote)}
                                className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Icons.Edit size={16} />
                                Edit Quote
                            </button>
                            <button
                                onClick={handleDuplicate}
                                className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Icons.Plus size={16} />
                                Duplicate Quote
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Icons.Download size={16} />
                                Download PDF
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Icons.Share size={16} />
                                Copy Share Link
                            </button>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Activity</label>
                        <div className="relative pl-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
                            {activityLog.map((log) => (
                                <div key={log.id} className="relative">
                                    <div className={`absolute -left-[13px] top-1 w-2 h-2 rounded-full ${log.type === 'accepted' ? 'bg-green-500' :
                                            log.type === 'declined' ? 'bg-red-500' : 'bg-gray-400'
                                        }`}></div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{log.text}</p>
                                    <p className="text-xs text-gray-400">{log.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-3">
                    {/* Amount Summary */}
                    <div className="flex justify-between pt-2">
                        <span className="font-semibold text-gray-900 dark:text-white">Quote Total</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">${quote.total.toLocaleString()}</span>
                    </div>

                    {/* Actions based on status */}
                    {quote.status === 'Sent' && (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleMarkAsAccepted}
                                className="py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Accept
                            </button>
                            <button
                                onClick={handleMarkAsDeclined}
                                className="py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Decline
                            </button>
                        </div>
                    )}

                    {isAccepted && (
                        <button
                            onClick={() => onConvertToInvoice(quote)}
                            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        >
                            Convert to Invoice
                        </button>
                    )}

                    {(quote.status === 'Draft' || quote.status === 'Sent') && (
                        <button
                            onClick={handleDelete}
                            className="w-full py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium rounded-lg transition-colors"
                        >
                            Delete Quote
                        </button>
                    )}
                </div>
            </div>

            {/* === MAIN CONTENT - Quote Document === */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">

                    {/* Quote Document */}
                    <div
                        ref={quoteRef}
                        className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm"
                    >

                        {/* Document Header */}
                        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">QUOTE</h2>
                                    <div className="mt-4 space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 w-24">Quote No.</span>
                                            <span className="font-mono font-medium text-gray-900 dark:text-white">{quote.number}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 w-24">Date</span>
                                            <span className="text-gray-900 dark:text-white">{quote.createdDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 w-24">Valid Until</span>
                                            <span className="text-gray-900 dark:text-white">{quote.validUntil}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Quoted Amount</div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">${quote.total.toLocaleString()}</div>
                                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                                        {quote.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FROM / TO Section */}
                        <div className="grid grid-cols-2 gap-8 p-8 border-b border-gray-200 dark:border-gray-800">
                            {/* FROM */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">From</h3>
                                <div className="space-y-1">
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">{org?.name || 'Your Company'}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{org?.address_line1 || ''}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{[org?.city, org?.state].filter(Boolean).join(', ') || ''}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{org?.country || 'India'}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">{org?.email || ''}</p>
                                </div>
                            </div>

                            {/* TO */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Quote For</h3>
                                <div className="space-y-1">
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">{quote.clientName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{quote.clientType}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">client@example.com</p>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {quote.items && quote.items.length > 0 ? (
                                        quote.items.map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                                                <td className="py-4 text-sm text-gray-900 dark:text-white">{item.description}</td>
                                                <td className="py-4 text-sm text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                                <td className="py-4 text-sm text-right text-gray-600 dark:text-gray-400">${item.price.toFixed(2)}</td>
                                                <td className="py-4 text-sm text-right font-medium text-gray-900 dark:text-white">${(item.quantity * item.price).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-400 italic">No line items</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="p-8 flex justify-end border-b border-gray-200 dark:border-gray-800">
                            <div className="w-72">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                        <span className="text-gray-900 dark:text-white font-medium">${quote.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-t-2 border-gray-900 dark:border-white mt-2">
                                        <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                                        <span className="text-base font-bold text-gray-900 dark:text-white">${quote.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Notes */}
                        <div className="p-8">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Terms & Conditions</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                This quote is valid until {quote.validUntil}. Prices are subject to change after the validity period expires.
                                Payment terms will be specified in the final invoice. All work will be completed according to the agreed specifications.
                            </p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-400">
                        Powered by BILLENTY
                    </div>
                </div>
            </div>
            {DialogComponent}
        </div>
    );
};
