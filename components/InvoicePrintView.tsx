import React from 'react';
import { Invoice } from '../types';

interface InvoicePrintViewProps {
    invoice: Invoice;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice }) => {
    return (
        <div className="p-8 bg-white text-gray-900 font-sans print:p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">BILLENTY</h1>
                    <p className="text-sm text-gray-500 mt-1">Professional Invoice</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">INVOICE</p>
                    <p className="text-lg text-gray-600">{invoice.number}</p>
                </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</h3>
                    <p className="text-lg font-semibold text-gray-900">{invoice.clientName}</p>
                    <p className="text-sm text-gray-600">{invoice.clientType}</p>
                </div>
                <div className="text-right">
                    <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Issued Date</h3>
                        <p className="text-sm text-gray-900">{invoice.issuedDate}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Due Date</h3>
                        <p className="text-sm text-gray-900">{invoice.dueDate}</p>
                    </div>
                </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${invoice.status === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : invoice.status === 'Pending'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                    {invoice.status}
                </span>
            </div>

            {/* Line Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                        <th className="text-center py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Qty</th>
                        <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Price</th>
                        <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 text-sm text-gray-900">{item.description}</td>
                            <td className="py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                            <td className="py-3 text-sm text-gray-600 text-right">${item.price.toFixed(2)}</td>
                            <td className="py-3 text-sm text-gray-900 font-medium text-right">${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Total Section */}
            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Subtotal</span>
                        <span className="text-sm font-medium text-gray-900">${(invoice.amountDue + invoice.amountPaid).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Amount Paid</span>
                        <span className="text-sm font-medium text-green-600">-${invoice.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                        <span className="text-lg font-semibold text-gray-900">Amount Due</span>
                        <span className="text-xl font-bold text-gray-900">${invoice.amountDue.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">Thank you for your business!</p>
                <p className="text-xs text-gray-400 mt-1">Generated by BILLENTY</p>
            </div>
        </div>
    );
};

// Function to trigger PDF download
export const downloadInvoicePDF = (invoice: Invoice): void => {
    // Create a new window with print styles
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('Please allow popups to download the PDF');
        return;
    }

    const itemsHtml = invoice.items.map(item => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 12px 0; font-size: 14px; color: #111827;">${item.description}</td>
      <td style="padding: 12px 0; font-size: 14px; color: #4b5563; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; font-size: 14px; color: #4b5563; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

    const statusColor = invoice.status === 'Paid'
        ? 'background: #d1fae5; color: #047857;'
        : invoice.status === 'Pending'
            ? 'background: #ffedd5; color: #ea580c;'
            : 'background: #f3f4f6; color: #374151;';

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; color: #111827; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div style="max-width: 800px; margin: 0 auto; padding: 40px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 24px;">
          <div>
            <h1 style="font-size: 30px; font-weight: bold; color: #2563eb;">BILLENTY</h1>
            <p style="font-size: 14px; color: #6b7280; margin-top: 4px;">Professional Invoice</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 24px; font-weight: bold; color: #111827;">INVOICE</p>
            <p style="font-size: 18px; color: #4b5563;">${invoice.number}</p>
          </div>
        </div>

        <!-- Invoice Meta -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
          <div>
            <h3 style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Bill To</h3>
            <p style="font-size: 18px; font-weight: 600; color: #111827;">${invoice.clientName}</p>
            <p style="font-size: 14px; color: #4b5563;">${invoice.clientType}</p>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Issued Date</h3>
              <p style="font-size: 14px; color: #111827;">${invoice.issuedDate}</p>
            </div>
            <div>
              <h3 style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Due Date</h3>
              <p style="font-size: 14px; color: #111827;">${invoice.dueDate}</p>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div style="margin-bottom: 24px;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500; ${statusColor}">${invoice.status}</span>
        </div>

        <!-- Line Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <thead>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <th style="text-align: left; padding: 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Description</th>
              <th style="text-align: center; padding: 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; width: 80px;">Qty</th>
              <th style="text-align: right; padding: 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; width: 100px;">Price</th>
              <th style="text-align: right; padding: 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; width: 100px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Total Section -->
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 256px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="font-size: 14px; color: #4b5563;">Subtotal</span>
              <span style="font-size: 14px; font-weight: 500; color: #111827;">$${(invoice.amountDue + invoice.amountPaid).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="font-size: 14px; color: #4b5563;">Amount Paid</span>
              <span style="font-size: 14px; font-weight: 500; color: #059669;">-$${invoice.amountPaid.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0;">
              <span style="font-size: 18px; font-weight: 600; color: #111827;">Amount Due</span>
              <span style="font-size: 20px; font-weight: bold; color: #2563eb;">$${invoice.amountDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 14px; color: #6b7280;">Thank you for your business!</p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Generated by BILLENTY</p>
        </div>
      </div>
    </body>
    </html>
  `);

    printWindow.document.close();

    // Wait for content to load then trigger print
    setTimeout(() => {
        printWindow.print();
    }, 250);
};
