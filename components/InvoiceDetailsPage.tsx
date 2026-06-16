import React, { useRef } from 'react';
import { Invoice } from '../types';
import { Icons } from './Icon';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { useOrg } from '../org.context';
import { toast } from './Toast';
import { useConfirmDialog } from './ConfirmDialog';

interface InvoiceDetailsPageProps {
    invoice: Invoice;
    onBack: () => void;
    onEdit: (invoice: Invoice) => void;
    onDelete: (id: string) => void;
}

export const InvoiceDetailsPage: React.FC<InvoiceDetailsPageProps> = ({
    invoice,
    onBack,
    onEdit,
    onDelete,
}) => {
    const { confirm } = useConfirmDialog();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const { org } = useOrg();

    const isPaid = invoice.status === 'Paid';
    const totalAmount = invoice.amountDue + invoice.amountPaid;

    const handleDownloadPDF = async () => {
        try {
            const blob = await generateInvoicePDF(invoice, org || {});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Invoice-${invoice.number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Invoice',
            message: `Are you sure you want to delete invoice ${invoice.number}? This action cannot be undone.`,
            variant: 'danger',
            confirmLabel: 'Delete Invoice',
        });

        if (confirmed) {
            onDelete(invoice.id);
            toast.success('Invoice deleted');
            onBack();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Invoice link copied to clipboard');
    };

    const handleSendReminder = () => {
        toast.success('Reminder sent to client');
    };

    const handleMarkAsPaid = () => {
        toast.success('Invoice marked as paid');
    };

    const handleDuplicate = () => {
        toast.success('Invoice duplicated');
    };

    const activityLog = [
        { id: 1, type: 'created', text: `Invoice ${invoice.number} created`, date: invoice.issuedDate },
        { id: 2, type: 'sent', text: 'Invoice sent to client', date: invoice.issuedDate },
        ...(isPaid ? [{ id: 3, type: 'paid', text: 'Payment received', date: invoice.dueDate }] : []),
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
                            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">{invoice.number}</h1>
                            <p className="text-xs text-gray-500">Invoice Details</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</label>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isPaid
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            }`}>
                            {isPaid ? <Icons.CheckCircle size={16} /> : <Icons.Clock size={16} />}
                            {invoice.status}
                        </div>
                    </div>

                    {/* Client */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Client</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                                {invoice.clientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.clientName}</p>
                                <p className="text-xs text-gray-500">{invoice.clientType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Dates</label>
                        <div className="space-y-2">
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-500">Issued</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.issuedDate}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-500">Due Date</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.dueDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quick Actions</label>
                        <div className="space-y-2">
                            <button
                                onClick={() => onEdit(invoice)}
                                className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Icons.Edit size={16} />
                                Edit Invoice
                            </button>
                            <button
                                onClick={handleDuplicate}
                                className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Icons.Plus size={16} />
                                Duplicate Invoice
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
                            {!isPaid && (
                                <button
                                    onClick={handleSendReminder}
                                    className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Icons.Send size={16} />
                                    Send Reminder
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Activity</label>
                        <div className="relative pl-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
                            {activityLog.map((log) => (
                                <div key={log.id} className="relative">
                                    <div className={`absolute -left-[13px] top-1 w-2 h-2 rounded-full ${log.type === 'paid' ? 'bg-green-500' : 'bg-gray-400'
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
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span className="font-medium text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</span>
                        </div>
                        {invoice.amountPaid > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Paid</span>
                                <span className="font-medium">-${invoice.amountPaid.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-semibold text-gray-900 dark:text-white">Amount Due</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">${invoice.amountDue.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Mark as Paid or Delete */}
                    {!isPaid ? (
                        <button
                            onClick={handleMarkAsPaid}
                            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        >
                            Mark as Paid
                        </button>
                    ) : (
                        <div className="flex items-center justify-center gap-2 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                            <Icons.CheckCircle size={16} />
                            Paid in Full
                        </div>
                    )}
                    <button
                        onClick={handleDelete}
                        className="w-full py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium rounded-lg transition-colors"
                    >
                        Delete Invoice
                    </button>
                </div>
            </div>

            {/* === MAIN CONTENT - Invoice Document === */}
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
                                            <span className="font-mono font-medium text-gray-900 dark:text-white">{invoice.number}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 w-24">Date</span>
                                            <span className="text-gray-900 dark:text-white">{invoice.issuedDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 w-24">Due Date</span>
                                            <span className="text-gray-900 dark:text-white">{invoice.dueDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Amount Due</div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">${invoice.amountDue.toFixed(2)}</div>
                                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isPaid
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                        }`}>
                                        {isPaid ? <Icons.CheckCircle size={12} /> : <Icons.Clock size={12} />}
                                        {invoice.status}
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
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">Breez Inc.</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">123 Business Rd.</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">San Francisco, CA 94107</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">United States</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">billing@breezinc.com</p>
                                </div>
                            </div>

                            {/* TO */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Bill To</h3>
                                <div className="space-y-1">
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">{invoice.clientName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.clientType}</p>
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
                                    {invoice.items && invoice.items.length > 0 ? (
                                        invoice.items.map((item, idx) => (
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
                                        <span className="text-gray-900 dark:text-white font-medium">${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-500 dark:text-gray-400">Tax (0%)</span>
                                        <span className="text-gray-900 dark:text-white font-medium">$0.00</span>
                                    </div>
                                    {invoice.amountPaid > 0 && (
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-500 dark:text-gray-400">Paid to date</span>
                                            <span className="text-green-600 font-medium">-${invoice.amountPaid.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 border-t-2 border-gray-900 dark:border-white mt-2">
                                        <span className="text-base font-bold text-gray-900 dark:text-white">Amount Due</span>
                                        <span className="text-base font-bold text-gray-900 dark:text-white">${invoice.amountDue.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="p-8">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Thank you for your business! Please make checks payable to Breez Inc. Payment is expected within 30 days of invoice issuance. Please include the invoice number with your payment.
                            </p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-400">
                        Powered by BILLENTY
                    </div>
                </div>
            </div>
        </div>
    );
};
