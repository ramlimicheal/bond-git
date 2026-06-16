import React from 'react';
import { Invoice } from '../types';
import { Icons } from './Icon';

interface InvoiceCardProps {
  invoice: Invoice;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  viewMode,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete
}) => {
  const isPaid = invoice.status === 'Paid';
  const isPending = invoice.status === 'Pending';

  const statusColors = isPaid
    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
    : isPending
      ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';

  const StatusIcon = isPaid ? Icons.CheckCircle : Icons.Pending;

  // --- LIST VIEW ---
  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onView(invoice)}
        className={`
        group relative border rounded-lg p-4 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center gap-4 cursor-pointer
        ${isSelected
            ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/10 dark:border-primary-800'
            : 'bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
      `}>

        {/* Selection Checkbox */}
        <div
          onClick={(e) => { e.stopPropagation(); onSelect(invoice.id); }}
          className="cursor-pointer text-gray-400 hover:text-gray-900 dark:hover:text-gray-600 transition-colors"
        >
          {isSelected ? (
            <Icons.CheckSquare className="text-gray-900 dark:text-gray-800" size={20} />
          ) : (
            <Icons.Square size={20} />
          )}
        </div>

        {/* ID & Client */}
        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <Icons.Business size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{invoice.number}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.clientName}</div>
          </div>
        </div>

        {/* Dates */}
        <div className="w-full md:w-48 text-sm">
          <div className="flex justify-between md:block">
            <span className="md:hidden text-gray-500">Due:</span>
            <div className="text-gray-900 dark:text-gray-200">{invoice.dueDate}</div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">Issued: {invoice.issuedDate}</div>
        </div>

        {/* Amount */}
        <div className="w-full md:w-32 text-sm">
          <div className="flex justify-between md:block">
            <span className="md:hidden text-gray-500">Amount:</span>
            <div className="font-semibold text-gray-900 dark:text-white">${invoice.amountDue.toFixed(2)}</div>
          </div>
        </div>

        {/* Status */}
        <div className="w-full md:w-32 flex">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors}`}>
            <StatusIcon size={12} />
            {invoice.status}
          </span>
        </div>

        {/* Actions */}
        <div className="w-full md:w-auto flex items-center gap-2 justify-end mt-2 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onView(invoice); }}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-600 transition-colors"
            title="View Details"
          >
            <Icons.View size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(invoice); }}
            className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            title="Edit Invoice"
          >
            <Icons.Edit size={18} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
            title="Download PDF"
          >
            <Icons.Download size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(invoice.id); }}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            title="Delete Invoice"
          >
            <Icons.Trash size={18} />
          </button>
        </div>
      </div>
    );
  }

  // --- GRID VIEW ---
  return (
    <div
      onClick={() => onView(invoice)}
      className={`
      relative border rounded-xl shadow-sm p-6 flex flex-col h-full transition-all duration-200 group cursor-pointer
      ${isSelected
          ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/10 dark:border-primary-800 ring-1 ring-primary-500/20'
          : 'bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-750 hover:border-gray-300 dark:hover:border-gray-600'}
    `}>

      {/* Absolute Selection Checkbox */}
      <div
        onClick={(e) => { e.stopPropagation(); onSelect(invoice.id); }}
        className="absolute top-4 left-4 cursor-pointer text-gray-400 hover:text-gray-900 dark:hover:text-gray-600 transition-colors z-10"
      >
        {isSelected ? (
          <Icons.CheckSquare className="text-gray-900 dark:text-gray-800" size={20} />
        ) : (
          <Icons.Square size={20} />
        )}
      </div>

      {/* Absolute delete button for grid */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(invoice.id); }}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <Icons.Trash size={16} />
      </button>

      <div className="flex justify-end items-start mb-4 pl-8">
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Invoice #</div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{invoice.number}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${statusColors}`}>
          <StatusIcon size={14} />
          {invoice.status}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <Icons.Business size={20} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{invoice.clientName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.clientType}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 mb-6 text-sm flex-1">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Issued Date</p>
          <p className="font-medium text-gray-700 dark:text-gray-200">{invoice.issuedDate}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Due Date</p>
          <p className="font-medium text-gray-700 dark:text-gray-200">{invoice.dueDate}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Amount Paid</p>
          <p className="font-medium text-gray-700 dark:text-gray-200">${invoice.amountPaid.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Amount Due</p>
          <p className="font-semibold text-gray-900 dark:text-gray-800">${invoice.amountDue.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={(e) => { e.stopPropagation(); onView(invoice); }}
          className="flex-1 py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <Icons.View size={14} /> View
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(invoice); }}
          className="flex-1 py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <Icons.Edit size={14} /> Edit
        </button>
      </div>
    </div>
  );
};

// Memoize to prevent re-renders when parent updates but props don't change
export const MemoizedInvoiceCard = React.memo(InvoiceCard);