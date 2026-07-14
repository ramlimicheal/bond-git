import React, { useState, useMemo } from 'react';
import { useClients, useInvoices } from '../dataStore';
import type { Client } from '../types';
import { Icons } from './Icon';
import { toast } from './Toast';
import { useConfirmDialog } from './ConfirmDialog';

const emptyClient: Omit<Client, 'id' | 'createdAt'> = {
    name: '', company: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', gstin: '', pan: '', notes: '',
};

const ClientsPage: React.FC = () => {
    const { items, create, update, remove } = useClients();
    const { items: invoices } = useInvoices();
    const { confirm, DialogComponent } = useConfirmDialog();
    const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Omit<Client, 'id' | 'createdAt'>>(emptyClient);

    const filtered = useMemo(() =>
        items.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
        ), [items, search]);

    const selected = items.find(c => c.id === selectedId) || null;
    const clientInvoices = selected ? invoices.filter(i => i.clientName === selected.name) : [];
    const totalRevenue = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);

    const openCreate = () => { setForm(emptyClient); setEditingId(null); setShowForm(true); };
    const openEdit = (c: Client) => { setForm({ ...c }); setEditingId(c.id); setShowForm(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email) { toast.error('Name and email required'); return; }
        if (editingId) { await update(editingId, form); toast.success('Client updated'); }
        else { const c = await create({ ...form, createdAt: new Date().toISOString() }); if (c) setSelectedId(c.id); toast.success('Client added'); }
        setShowForm(false);
    };

    const handleDelete = async (c: Client) => {
        const ok = await confirm({ title: 'Delete Client', message: `Delete ${c.name}?`, variant: 'danger', confirmLabel: 'Delete' });
        if (!ok) return;
        remove(c.id);
        if (selectedId === c.id) setSelectedId(null);
        toast.success('Client deleted');
    };

    return (
        <div className="flex gap-6 h-full">
            {/* Left: List */}
            <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Clients</h1>
                        <button onClick={openCreate} className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-md text-xs font-medium hover:opacity-90 flex items-center gap-1">
                            <Icons.Plus size={14} /> Add
                        </button>
                    </div>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 && <p className="p-4 text-sm text-gray-500">No clients</p>}
                    {filtered.map(c => (
                        <button key={c.id} onClick={() => setSelectedId(c.id)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 ${selectedId === c.id ? 'bg-gray-100 dark:bg-gray-900' : ''}`}>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{c.name}</p>
                            <p className="text-xs text-gray-500 truncate">{c.company || c.email}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Detail */}
            <div className="flex-1 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
                {!selected ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <Icons.User size={48} className="mx-auto mb-3 opacity-30" />
                            <p>Select a client or add a new one</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                                {selected.company && <p className="text-gray-500">{selected.company}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(selected)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-900">Edit</button>
                                <button onClick={() => handleDelete(selected)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50">Delete</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-xs uppercase text-gray-500 mb-1">Invoices</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{clientInvoices.length}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-xs uppercase text-gray-500 mb-1">Revenue</p>
                                <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-xs uppercase text-gray-500 mb-1">Outstanding</p>
                                <p className="text-2xl font-bold text-amber-600">₹{clientInvoices.reduce((s, i) => s + i.amountDue, 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Contact</h3>
                                <p className="text-sm mb-2"><span className="text-gray-500">Email:</span> {selected.email}</p>
                                {selected.phone && <p className="text-sm mb-2"><span className="text-gray-500">Phone:</span> {selected.phone}</p>}
                            </div>
                            <div>
                                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Address</h3>
                                {selected.address && <p className="text-sm">{selected.address}</p>}
                                <p className="text-sm">{[selected.city, selected.state, selected.pincode].filter(Boolean).join(', ')}</p>
                            </div>
                            {(selected.gstin || selected.pan) && (
                                <div className="col-span-2">
                                    <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Tax Info</h3>
                                    {selected.gstin && <p className="text-sm font-mono mb-1">GSTIN: {selected.gstin}</p>}
                                    {selected.pan && <p className="text-sm font-mono">PAN: {selected.pan}</p>}
                                </div>
                            )}
                            {selected.notes && (
                                <div className="col-span-2">
                                    <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Notes</h3>
                                    <p className="text-sm whitespace-pre-wrap">{selected.notes}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}
                        className="bg-white dark:bg-gray-950 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{editingId ? 'Edit Client' : 'Add Client'}</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ['name', 'Name *'], ['company', 'Company'], ['email', 'Email *'], ['phone', 'Phone'],
                                ['address', 'Address'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode'],
                                ['gstin', 'GSTIN'], ['pan', 'PAN'],
                            ].map(([k, label]) => (
                                <div key={k}>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">{label}</label>
                                    <input value={(form as any)[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900" />
                                </div>
                            ))}
                            <div className="col-span-2">
                                <label className="block text-xs uppercase text-gray-500 mb-1">Notes</label>
                                <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900" rows={3} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-md text-sm font-medium">{editingId ? 'Update' : 'Create'}</button>
                        </div>
                    </form>
                </div>
            )}
            {DialogComponent}
        </div>
    );
};

export default ClientsPage;
