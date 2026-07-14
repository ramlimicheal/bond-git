import React, { useState, useMemo } from 'react';
import { useProducts } from '../dataStore';
import type { Product } from '../types';
import { Icons } from './Icon';
import { toast } from './Toast';
import { useConfirmDialog } from './ConfirmDialog';

const CATEGORIES: Product['category'][] = ['Design', 'Development', 'Consulting', 'Support', 'Other'];
const empty: Omit<Product, 'id' | 'createdAt'> = { name: '', description: '', category: 'Design', price: 0, taxRate: 18, unit: 'project' };

const ProductsPage: React.FC = () => {
    const { items, create, update, remove } = useProducts();
    const { confirm, DialogComponent } = useConfirmDialog();
    const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(empty);

    const filtered = useMemo(() =>
        items.filter(p =>
            (filter === 'all' || p.category === filter) &&
            p.name.toLowerCase().includes(search.toLowerCase())
        ), [items, filter, search]);

    const selected = items.find(p => p.id === selectedId) || null;

    const openCreate = () => { setForm(empty); setEditingId(null); setShowForm(true); };
    const openEdit = (p: Product) => { setForm({ name: p.name, description: p.description || '', category: p.category, price: p.price, taxRate: p.taxRate, unit: p.unit }); setEditingId(p.id); setShowForm(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) { toast.error('Name required'); return; }
        if (editingId) { await update(editingId, form); toast.success('Product updated'); }
        else { const p = await create({ ...form, createdAt: new Date().toISOString() }); if (p) setSelectedId(p.id); toast.success('Product added'); }
        setShowForm(false);
    };

    const handleDelete = async (p: Product) => {
        const ok = await confirm({ title: 'Delete Product', message: `Delete ${p.name}?`, variant: 'danger', confirmLabel: 'Delete' });
        if (!ok) return;
        remove(p.id);
        if (selectedId === p.id) setSelectedId(null);
        toast.success('Product deleted');
    };

    return (
        <div className="flex gap-6 h-full">
            <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Products</h1>
                        <button onClick={openCreate} className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-md text-xs font-medium hover:opacity-90 flex items-center gap-1">
                            <Icons.Plus size={14} /> Add
                        </button>
                    </div>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 mb-2" />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 && <p className="p-4 text-sm text-gray-500">No products</p>}
                    {filtered.map(p => (
                        <button key={p.id} onClick={() => setSelectedId(p.id)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 ${selectedId === p.id ? 'bg-gray-100 dark:bg-gray-900' : ''}`}>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{p.name}</p>
                            <p className="text-xs text-gray-500">{p.category} • ₹{p.price.toLocaleString()}/{p.unit}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
                {!selected ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <Icons.Sales size={48} className="mx-auto mb-3 opacity-30" />
                            <p>Select a product or add a new one</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-xs rounded mb-2">{selected.category}</span>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                                {selected.description && <p className="text-gray-500 mt-1">{selected.description}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(selected)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-900">Edit</button>
                                <button onClick={() => handleDelete(selected)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50">Delete</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-xs uppercase text-gray-500 mb-1">Price</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{selected.price.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">per {selected.unit}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-xs uppercase text-gray-500 mb-1">Tax Rate</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selected.taxRate}%</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-xs uppercase text-gray-500 mb-1">Total w/ Tax</p>
                                <p className="text-2xl font-bold text-green-600">₹{(selected.price * (1 + selected.taxRate / 100)).toLocaleString()}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}
                        className="bg-white dark:bg-gray-950 rounded-lg max-w-xl w-full p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">Name *</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900" rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Category</label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Unit</label>
                                    <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Price (₹)</label>
                                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Tax %</label>
                                    <input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900" />
                                </div>
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

export default ProductsPage;
