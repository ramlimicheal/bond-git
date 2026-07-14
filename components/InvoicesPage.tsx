import React, { useState, useMemo } from 'react';
import { Icons } from './Icon';
import { StatCard } from './StatCard';
import { InvoiceCard } from './InvoiceCard';
import { toast } from './Toast';
import { Tab, Invoice, Page } from '../types';
import { STATS_DATA } from '../constants';
import { useInvoices } from '../dataStore';
import { useConfirmDialog } from './ConfirmDialog';

interface InvoicesPageProps {
  searchQuery: string;
  onNavigate: (page: Page, id?: string) => void;
}

type SortKey = 'date' | 'amount';
type SortDirection = 'asc' | 'desc';

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ searchQuery, onNavigate }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.INVOICE);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { items: invoices, loading: isLoading, remove } = useInvoices();
  const { confirm } = useConfirmDialog();
  const error: string | null = null;

  // Advanced State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'date', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string[]>([]); // 'Paid', 'Pending'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- HANDLERS ---

  const handleEditInvoice = (invoice: Invoice) => {
    onNavigate(Page.INVOICE_DETAILS, invoice.id);
  };

  const handleDeleteInvoice = async (id: string) => {
    const ok = await confirm({
      title: 'Delete invoice',
      message: 'This invoice will be permanently removed. This cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    await remove(id);
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    toast.success('Invoice deleted');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    onNavigate(Page.INVOICE_DETAILS, invoice.id);
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selectedIds.size} invoices`,
      message: 'These invoices will be permanently removed. This cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete all',
    });
    if (!ok) return;
    const ids = Array.from(selectedIds);
    for (const id of ids) await remove(id);
    setSelectedIds(new Set());
    toast.success(`${ids.length} invoice(s) deleted`);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedInvoices.length && paginatedInvoices.length > 0) {
      setSelectedIds(new Set());
    } else {
      const newIds = new Set(selectedIds);
      paginatedInvoices.forEach(inv => newIds.add(inv.id));
      setSelectedIds(newIds);
    }
  };

  const toggleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const toggleFilterStatus = (status: string) => {
    setFilterStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  // --- DATA PROCESSING ---

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // 1. Text Search
      const matchesSearch =
        invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.number.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Tab Filter
      const matchesTab = activeTab === Tab.INVOICE || (activeTab === Tab.PAID && invoice.status === 'Paid');

      // 3. Advanced Status Filter
      const matchesStatusFilter = filterStatus.length === 0 || filterStatus.includes(invoice.status);

      return matchesSearch && matchesTab && matchesStatusFilter;
    });
  }, [invoices, searchQuery, activeTab, filterStatus]);

  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((a, b) => {
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? a.amountDue - b.amountDue : b.amountDue - a.amountDue;
      } else {
        // Mock Date sorting (string comparison works for ISO-like, but these are "2 Jan 2022")
        // For production, use real Date objects. Here we just reverse for desc.
        return sortConfig.direction === 'asc'
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
    });
  }, [filteredInvoices, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats Logic (Dynamic based on current data)
  const stats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'Paid').length;
    const pending = invoices.filter(i => i.status === 'Pending').length;
    // Overriding constant stats with dynamic calculation for demo
    return [
      { label: 'Total Invoices', value: invoices.length, trend: 12, trendDirection: 'up' as const },
      { label: 'Paid', value: paid, trend: 5, trendDirection: 'up' as const },
      { label: 'Pending', value: pending, trend: 2, trendDirection: 'down' as const },
      { label: 'Total Due', value: invoices.reduce((acc, curr) => acc + curr.amountDue, 0), trend: 8, trendDirection: 'up' as const, countLabel: 'Volume ($)' },
    ];
  }, [invoices]);


  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Overview</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="bg-white dark:bg-gray-850 p-1 border border-gray-200 dark:border-gray-700 rounded-md flex items-center shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              title="Grid View"
            >
              <Icons.Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              title="List View"
            >
              <Icons.List size={18} />
            </button>
          </div>

          {/* Filter Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${showFilters
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Icons.Filter size={18} />
              Filter
              {filterStatus.length > 0 && (
                <span className="ml-1 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">
                  {filterStatus.length}
                </span>
              )}
            </button>

            {/* Filter Dropdown Panel */}
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">Filter by Status</span>
                  {filterStatus.length > 0 && (
                    <button onClick={() => setFilterStatus([])} className="text-xs text-gray-900 hover:underline">Clear</button>
                  )}
                </div>
                <div className="space-y-2">
                  {['Paid', 'Pending', 'Overdue'].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <input
                        type="checkbox"
                        checked={filterStatus.includes(status)}
                        onChange={() => toggleFilterStatus(status)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate(Page.CREATE_INVOICE)}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-sm font-medium flex items-center gap-2 shadow-lg shadow-gray-500/10 transition-all"
          >
            <Icons.Plus size={18} />
            New Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-800 mb-8 transition-colors duration-200 overflow-x-auto">
        {Object.values(Tab).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`pb-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
              ? 'border-gray-500 text-gray-900 dark:text-gray-800'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === Tab.REPEATING ? (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Icons.Calendar size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No recurring invoices</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set up a repeating invoice to see it here.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          {activeTab === Tab.INVOICE && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {stats.map((stat, index) => (
                <StatCard key={index} stat={stat} />
              ))}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Select All */}
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {selectedIds.size > 0 && selectedIds.size === paginatedInvoices.length ? <Icons.CheckSquare size={14} className="text-gray-900" /> : <Icons.Square size={14} />}
                Select All
              </button>

              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-600">{selectedIds.size} selected</span>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Icons.Trash size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => toggleSort('date')}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs font-medium transition-colors ${sortConfig.key === 'date'
                  ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
              >
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <Icons.ArrowUp size={12} /> : <Icons.ArrowDown size={12} />)}
              </button>
              <button
                onClick={() => toggleSort('amount')}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs font-medium transition-colors ${sortConfig.key === 'amount'
                  ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
              >
                Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <Icons.ArrowUp size={12} /> : <Icons.ArrowDown size={12} />)}
              </button>
            </div>
          </div>

          {/* Loading / Error / Empty States */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Icons.Pending size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Loading invoices...</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs text-center">Fetching your latest billing data.</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-500">
                <Icons.Clear size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Unable to load invoices</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs text-center">{error}</p>
            </div>
          ) : sortedInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Icons.Search size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No invoices found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs text-center">We couldn't find any invoices matching your search filters.</p>
              <button
                onClick={() => { setActiveTab(Tab.INVOICE); setFilterStatus([]); }}
                className="mt-4 text-gray-900 hover:text-primary-700 font-medium text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Invoices List/Grid */}
              <div className={`
                gap-4 mb-8
                ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'flex flex-col'}
              `}>
                {paginatedInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    viewMode={viewMode}
                    isSelected={selectedIds.has(invoice.id)}
                    onSelect={handleToggleSelect}
                    onView={handleViewInvoice}
                    onEdit={handleEditInvoice}
                    onDelete={handleDeleteInvoice}
                  />
                ))}
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6 mt-auto gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedInvoices.length)}</span> of <span className="font-medium">{sortedInvoices.length}</span> results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icons.ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === page
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icons.ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};