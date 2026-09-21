// components/sales/EditSaleModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CompletedSale, CartItem, Product } from '@/lib/types';
import { Modal } from '@/components/common/Modal';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { rupeesToPaise, paiseToRupees, calculateSaleTotals } from '@/lib/currency';
import { Plus, Trash2, Save, User, Phone, Mail, Sparkles } from 'lucide-react';

interface EditSaleModalProps {
  sale: CompletedSale | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleId: string, updatedSale: Partial<CompletedSale>, note: string) => Promise<void>;
  availableProducts: Product[];
}

export const EditSaleModal: React.FC<EditSaleModalProps> = ({
  sale,
  isOpen,
  onClose,
  onSave,
  availableProducts,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [discountRupees, setDiscountRupees] = useState<string>('0');
  const [note, setNote] = useState<string>('Price/Item adjustment by Store Admin');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sale) {
      setItems(sale.items ? JSON.parse(JSON.stringify(sale.items)) : []);
      setCustomerName(sale.customer?.name || '');
      setCustomerPhone(sale.customer?.phone || '');
      setCustomerEmail(sale.customer?.email || '');
      setDiscountRupees(paiseToRupees(sale.discountPaise || 0));
      setNote('Price/Item adjustment by Store Admin');
      setError(null);
    }
  }, [sale]);

  if (!isOpen || !sale) return null;

  // Calculate totals in integer paise
  const discountPaise = rupeesToPaise(parseFloat(discountRupees) || 0);
  const taxRatePercent = 5; // standard tax rate
  const { subtotalPaise, taxPaise, grandTotalPaise } = calculateSaleTotals(
    items,
    taxRatePercent,
    true,
    discountPaise
  );

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...items];
    updated[index].quantity = newQty;
    setItems(updated);
  };

  const handleUpdateItemPrice = (index: number, newPriceRupees: string) => {
    const paise = rupeesToPaise(parseFloat(newPriceRupees) || 0);
    const updated = [...items];
    updated[index].unitPricePaise = paise;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setError('A sale must have at least one line item.');
      return;
    }
    setError(null);
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddProduct = (prod: Product) => {
    setError(null);
    const existingIdx = items.findIndex((i) => i.id === prod.id);
    if (existingIdx >= 0) {
      const updated = [...items];
      updated[existingIdx].quantity += 1;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          id: prod.id,
          name: prod.name,
          unitPricePaise: prod.pricePaise,
          quantity: 1,
          category: prod.category,
        },
      ]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Cannot save a sale with zero items.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(
        sale.id,
        {
          items,
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim(),
          },
          subtotalPaise,
          taxPaise,
          discountPaise,
          grandTotalPaise,
          amountPaidPaise: grandTotalPaise,
        },
        note
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Bill — ${sale.invoiceNumber}`}
      subtitle="Modify line items, prices, or customer details. Changes will sync to POS terminals."
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Customer Fields */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Customer Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Management */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Line Items
            </h4>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  const prod = availableProducts.find((p) => p.id === e.target.value);
                  if (prod) handleAddProduct(prod);
                  e.target.value = '';
                }}
                defaultValue=""
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="" disabled>
                  + Add Product to Bill...
                </option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({paiseToRupees(p.pricePaise)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block truncate">
                    {item.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    Line Total:{' '}
                    <CurrencyDisplay
                      paise={item.unitPricePaise * item.quantity}
                      size="sm"
                    />
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Unit Price in Rupees */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={paiseToRupees(item.unitPricePaise)}
                      onChange={(e) => handleUpdateItemPrice(index, e.target.value)}
                      className="w-20 px-2 py-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-right font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(index, item.quantity - 1)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemQty(index, item.quantity + 1)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Item */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount & Audit Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Discount Amount (₹)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={discountRupees}
              onChange={(e) => setDiscountRupees(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reason / Audit Note (Logged to Audit Trail)
            </label>
            <input
              type="text"
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Corrected quantity"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Live Bill Calculation Summary */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Calculated Subtotal</span>
            <CurrencyDisplay paise={subtotalPaise} weight="normal" />
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Tax (5%)</span>
            <CurrencyDisplay paise={taxPaise} weight="normal" />
          </div>
          {discountPaise > 0 && (
            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
              <span>Discount</span>
              <CurrencyDisplay paise={discountPaise} negative weight="medium" />
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-base text-slate-900 dark:text-white">
            <span>New Grand Total</span>
            <CurrencyDisplay paise={grandTotalPaise} size="lg" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save & Sync to POS</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
