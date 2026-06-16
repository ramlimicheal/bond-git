import React from 'react';
import { Icons } from './Icon';
import { Invoice } from '../types';
import { downloadInvoicePDF } from './InvoicePrintView';

interface InvoiceDetailModalProps {
   invoice: Invoice | null;
   onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
   if (!invoice) return null;

   const isPaid = invoice.status === 'Paid';
   const totalAmount = invoice.amountDue + invoice.amountPaid;

   const handleDownloadPDF = () => {
      downloadInvoicePDF(invoice);
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
         <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm">
                     <Icons.Business size={24} className="text-gray-900 dark:text-gray-600" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{invoice.number}</h2>
                     <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        To: <span className="font-medium text-gray-700 dark:text-gray-300">{invoice.clientName}</span>
                     </p>
                  </div>
               </div>
               <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  <Icons.X size={24} />
               </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto">

               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 p-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700/50">
                  <div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Total Value</p>
                     <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</p>
                        {invoice.amountPaid > 0 && invoice.amountDue > 0 && (
                           <span className="text-sm text-gray-500 dark:text-gray-400">(${invoice.amountPaid.toFixed(2)} paid)</span>
                        )}
                     </div>
                  </div>
                  <div className={`mt-4 sm:mt-0 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border shadow-sm ${isPaid
                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                        : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
                     }`}>
                     {isPaid ? <Icons.CheckCircle size={16} /> : <Icons.Pending size={16} />}
                     {invoice.status}
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  <div className="space-y-1">
                     <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Issued Date</p>
                     <p className="font-semibold text-gray-900 dark:text-white">{invoice.issuedDate}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Due Date</p>
                     <p className="font-semibold text-gray-900 dark:text-white">{invoice.dueDate}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Service Type</p>
                     <p className="font-semibold text-gray-900 dark:text-white">{invoice.clientType}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Outstanding</p>
                     <p className="font-semibold text-gray-900 dark:text-gray-600">${invoice.amountDue.toFixed(2)}</p>
                  </div>
               </div>

               <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                     <Icons.List size={18} className="text-gray-400" />
                     Invoice Items
                  </h4>

                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                           <tr>
                              <th className="px-4 py-3">Description</th>
                              <th className="px-4 py-3 text-center">Qty</th>
                              <th className="px-4 py-3 text-right">Price</th>
                              <th className="px-4 py-3 text-right">Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                           {invoice.items && invoice.items.length > 0 ? (
                              invoice.items.map((item) => (
                                 <tr key={item.id} className="text-gray-700 dark:text-gray-300">
                                    <td className="px-4 py-3 font-medium">{item.description}</td>
                                    <td className="px-4 py-3 text-center text-gray-500">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">${item.price.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">${(item.quantity * item.price).toFixed(2)}</td>
                                 </tr>
                              ))
                           ) : (
                              // Fallback for old data without items
                              <tr>
                                 <td colSpan={4} className="px-4 py-6 text-center text-gray-500 italic">
                                    No line items details available for this invoice.
                                 </td>
                              </tr>
                           )}
                        </tbody>
                        {invoice.items && invoice.items.length > 0 && (
                           <tfoot className="bg-gray-50 dark:bg-gray-800/30 font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-800">
                              <tr>
                                 <td colSpan={3} className="px-4 py-3 text-right">Subtotal</td>
                                 <td className="px-4 py-3 text-right">${totalAmount.toFixed(2)}</td>
                              </tr>
                           </tfoot>
                        )}
                     </table>
                  </div>
               </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex gap-4">
               <button
                  onClick={handleDownloadPDF}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
               >
                  <Icons.Download size={18} /> Download PDF
               </button>
               {!isPaid && (
                  <button className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-lg shadow-gray-500/10 transition-colors font-medium flex items-center justify-center gap-2">
                     <Icons.Send size={18} /> Send Reminder
                  </button>
               )}
            </div>
         </div>
      </div>
   );
};