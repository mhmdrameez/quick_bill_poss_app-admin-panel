// components/products/ProductModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Modal } from '@/components/common/Modal';
import { rupeesToPaise, paiseToRupees } from '@/lib/currency';
import { Package, Barcode, Folder, Layers, DollarSign, Save } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  existingCategories: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  existingCategories,
}) => {
  const [name, setName] = useState<string>('');
  const [priceRupees, setPriceRupees] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [stock, setStock] = useState<string>('50');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPriceRupees(paiseToRupees(product.pricePaise || 0));
      setBarcode(product.barcode || '');
      setCategory(product.category || 'General');
      setStock((product.stock ?? 0).toString());
      setError(null);
    } else {
      setName('');
      setPriceRupees('');
      setBarcode('');
      setCategory('Beverages');
      setCustomCategory('');
      setStock('50');
      setError(null);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }

    const priceNum = parseFloat(priceRupees);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price greater than ₹0.00.');
      return;
    }

    const finalCategory = category === 'CUSTOM' ? customCategory.trim() || 'General' : category;

    setLoading(true);
    setError(null);
    try {
      const pricePaise = rupeesToPaise(priceNum);
      const stockNum = parseInt(stock) || 0;

      await onSave({
        name: name.trim(),
        pricePaise,
        barcode: barcode.trim(),
        category: finalCategory,
        stock: Math.max(0, stockNum),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(
    new Set(['Beverages', 'Bakery', 'Food', 'Snacks', 'Desserts', ...existingCategories])
  ).filter(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      subtitle="Catalog updates sync instantly to all connected POS terminal devices."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Product Name *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Espresso Americano"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Package className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Price (₹) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                placeholder="150.00"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <span className="text-sm font-semibold text-slate-400 absolute left-3 top-2">₹</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Stock Units
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="CUSTOM">+ New Category...</option>
            </select>
            <Folder className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          {category === 'CUSTOM' && (
            <input
              type="text"
              required
              placeholder="Enter category name"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="mt-2 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Barcode / SKU (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="8901234567890"
              className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Product</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
