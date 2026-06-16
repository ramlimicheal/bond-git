import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { Invoice, InvoiceItem } from '../types';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Omit<Invoice, 'id'>) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [clientName, setClientName] = useState('');
  const [clientType, setClientType] = useState('Service');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Paid' | 'Draft'>('Pending');
  
  // Line Items State
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: 'Service charge', quantity: 1, price: 0 }
  ]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setClientName('');
      setClientType('Service');
      setDueDate('');
      setStatus('Pending');
      setItems([{ description: 'Service charge', quantity: 1, price: 0 }]);
    }
  }, [isOpen]);

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
    const totalAmount = calculateTotal();

    // Map items to include IDs
    const finalItems: InvoiceItem[] = items.map((item, idx) => ({
      ...item,
      id: `item-${Date.now()}-${idx}`
    }));

    onSubmit({
      number: `INV-${randomNum}`,
      status: status as any,
      clientName,
      clientType,
      issuedDate: today,
      dueDate: dueDate ? new Date(dueDate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      }) : today,
      amountPaid: status === 'Paid' ? totalAmount : 0,
      amountDue: status === 'Paid' ? 0 : totalAmount,
      items: finalItems
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Invoice</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a new invoice for your customer</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <Icons.X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto">
            
            {/* Top Section: Client & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Client Name</label>
                  <div className="relative">
                    <Icons.Business className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      type="text" 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white outline-none transition-all"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Service Type</label>
                  <select 
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-white outline-none transition-all appearance-none"
                  >
                    <option>Training</option>
                    <option>Workshop</option>
                    <option>Design Service</option>
                    <option>Consulting</option>
                    <option>Development</option>
                    <option>Manual Book</option>
                    <option>Course</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date</label>
                  <div className="relative">
                    <Icons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      type="date" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Initial Status</label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {['Pending', 'Paid', 'Draft'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s as any)}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                          status === s 
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Line Items */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Icons.List size={18} className="text-gray-800" />
                  Line Items
                </h4>
                <button 
                  type="button"
                  onClick={handleAddItem}
                  className="text-sm text-gray-900 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <Icons.Plus size={16} /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start animate-fadeIn">
                    <div className="flex-1">
                      <input 
                        type="text"
                        required
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-primary-500 dark:text-white outline-none text-sm"
                      />
                    </div>
                    <div className="w-20">
                      <input 
                        type="number"
                        min="1"
                        required
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-primary-500 dark:text-white outline-none text-sm text-center"
                      />
                    </div>
                    <div className="w-28">
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input 
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full pl-6 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-1 focus:ring-primary-500 dark:text-white outline-none text-sm text-right"
                          />
                       </div>
                    </div>
                    <div className="w-8 flex items-center justify-center pt-2">
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Icons.Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section: Total */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-end">
               <div className="text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">Total Amount:</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">${calculateTotal().toFixed(2)}</span>
               </div>
            </div>

          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors font-medium shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium shadow-lg shadow-gray-500/10 flex items-center justify-center gap-2"
            >
              <Icons.Plus size={18} />
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};