// app/products/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { ProductModal } from '@/components/products/ProductModal';
import { BulkImportModal } from '@/components/products/BulkImportModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageSkeleton } from '@/components/common/SkeletonCard';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/lib/types';
import { formatRelativeTime } from '@/lib/dates';
import {
  Plus,
  Upload,
  Search,
  Package,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function ProductsPage() {
  const { products, loading, addProduct, editProduct, deleteProduct, bulkImportProducts } = useProducts();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState<boolean>(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Categories list
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) {
        return false;
      }

      if (stockFilter === 'out' && (prod.stock ?? 0) > 0) {
        return false;
      }
      if (stockFilter === 'low' && ((prod.stock ?? 0) === 0 || (prod.stock ?? 0) >= 10)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchBarcode = (prod.barcode || '').toLowerCase().includes(q);
        const matchCategory = (prod.category || '').toLowerCase().includes(q);
        if (!matchName && !matchBarcode && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, stockFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      await editProduct(editingProduct.id, data);
    } else {
      await addProduct(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingProduct) {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full">
      {loading ? (
        <PageSkeleton rows={10} cols={5} />
      ) : (
        <>
          <Header
            title="Product Catalog"
            subtitle="Manage inventory, prices, barcodes, and real-time syncing to POS devices"
            action={
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setIsBulkOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bulk CSV</span>
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            }
          />

          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
            {/* Controls & Search */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, SKU, barcodes..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-850 dark:bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-2 text-xs bg-slate-850 dark:bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="px-2.5 py-2 text-xs bg-slate-850 dark:bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="all">Stock: All Units</option>
                  <option value="low">Low (&lt;10)</option>
                  <option value="out">Out of Stock (0)</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Product Name</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Barcode / SKU</th>
                      <th className="py-3.5 px-4">Stock Level</th>
                      <th className="py-3.5 px-4">Last Updated</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          Loading products catalog...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          No products found. Click "Add" or "Bulk CSV" to add items.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const stock = product.stock ?? 0;
                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-slate-800/40 transition-colors group"
                          >
                            <td className="py-3 px-4 font-semibold text-white flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <Package className="w-4 h-4" />
                              </div>
                              <span>{product.name}</span>
                            </td>
                            <td className="py-3 px-4">
                              <CurrencyDisplay paise={product.pricePaise} size="sm" weight="bold" />
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                                {product.category || 'General'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {product.barcode || '—'}
                            </td>
                            <td className="py-3 px-4">
                              {stock === 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-900/60">
                                  <AlertTriangle className="w-3 h-3" />
                                  Out of stock
                                </span>
                              ) : stock < 10 ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-900/60">
                                  Low: {stock} units
                                </span>
                              ) : (
                                <span className="text-slate-300 font-medium">
                                  {stock} units
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                              {formatRelativeTime(product.updatedAt || product.createdAt)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(product)}
                                  className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingProduct(product)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Product Form Modal */}
          <ProductModal
            product={editingProduct}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
            existingCategories={existingCategories}
          />

          {/* Bulk CSV Import Modal */}
          <BulkImportModal
            isOpen={isBulkOpen}
            onClose={() => setIsBulkOpen(false)}
            onImport={bulkImportProducts}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={Boolean(deletingProduct)}
            onClose={() => setDeletingProduct(null)}
            onConfirm={handleDeleteConfirm}
            title="Delete Product"
            message={`Are you sure you want to delete "${deletingProduct?.name}"? It will be removed from all POS terminals on their next sync cycle.`}
            confirmText="Delete Product"
            isDanger
          />
        </>
      )}
    </div>
  );
}
