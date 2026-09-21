// components/products/BulkImportModal.tsx
'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { Modal } from '@/components/common/Modal';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { rupeesToPaise } from '@/lib/currency';
import { Upload, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<number>;
}

interface ParsedRow {
  name: string;
  priceRupees: number;
  pricePaise: number;
  barcode: string;
  category: string;
  stock: number;
  isValid: boolean;
  error?: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const sampleCsvContent = `name,price,barcode,category,stock
Cafe Latte (Large),210.00,8901112223334,Beverages,35
Blueberry Muffin,140.00,8901112223335,Bakery,20
Grilled Cheese Sandwich,180.00,8901112223336,Food,15`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quickbill_products_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setError('CSV file contains no data rows.');
        return;
      }

      // Check header
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const nameIdx = headers.indexOf('name');
      const priceIdx = headers.indexOf('price');
      const barcodeIdx = headers.indexOf('barcode');
      const categoryIdx = headers.indexOf('category');
      const stockIdx = headers.indexOf('stock');

      if (nameIdx === -1 || priceIdx === -1) {
        setError('CSV must contain at least "name" and "price" columns.');
        return;
      }

      const parsed: ParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        const name = cols[nameIdx] || '';
        const rawPrice = parseFloat(cols[priceIdx] || '0');
        const barcode = barcodeIdx !== -1 ? cols[barcodeIdx] || '' : '';
        const category = categoryIdx !== -1 ? cols[categoryIdx] || 'General' : 'General';
        const stock = stockIdx !== -1 ? parseInt(cols[stockIdx] || '0', 10) : 0;

        const isValid = Boolean(name && !isNaN(rawPrice) && rawPrice > 0);
        parsed.push({
          name,
          priceRupees: rawPrice,
          pricePaise: isValid ? rupeesToPaise(rawPrice) : 0,
          barcode,
          category,
          stock: isNaN(stock) ? 0 : Math.max(0, stock),
          isValid,
          error: !isValid ? 'Invalid name or price' : undefined,
        });
      }

      setRows(parsed);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    const validRows = rows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setError('No valid rows found to import.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const count = await onImport(
        validRows.map((r) => ({
          name: r.name,
          pricePaise: r.pricePaise,
          barcode: r.barcode,
          category: r.category,
          stock: r.stock,
        }))
      );
      setSuccessCount(count);
      setTimeout(() => {
        onClose();
        setRows([]);
        setFileName('');
        setSuccessCount(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Products (CSV)"
      subtitle="Upload a CSV spreadsheet with products to add them directly into the catalog."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Sample Template & Upload Area */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
          <div className="text-indigo-800 dark:text-indigo-300">
            Need the correct column format? Download our starter CSV template.
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Sample CSV
          </button>
        </div>

        {/* Upload Box */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            id="csv-file-upload"
            className="hidden"
          />
          <label htmlFor="csv-file-upload" className="cursor-pointer space-y-2 block">
            <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {fileName ? fileName : 'Click to select CSV file or drag here'}
            </div>
            <p className="text-xs text-slate-500">Supported columns: name, price, barcode, category, stock</p>
          </label>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successCount !== null && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Successfully imported {successCount} products! Syncing to POS...</span>
          </div>
        )}

        {/* Preview Table */}
        {rows.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>
                Found <strong>{rows.length}</strong> items ({rows.filter((r) => r.isValid).length} valid)
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Price</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Stock</th>
                    <th className="p-2.5">Barcode</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        row.isValid
                          ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                          : 'bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                      }
                    >
                      <td className="p-2.5 font-medium">{row.name || '—'}</td>
                      <td className="p-2.5 font-semibold">
                        {row.isValid ? <CurrencyDisplay paise={row.pricePaise} size="sm" /> : 'Invalid'}
                      </td>
                      <td className="p-2.5">{row.category}</td>
                      <td className="p-2.5">{row.stock}</td>
                      <td className="p-2.5 font-mono">{row.barcode || '—'}</td>
                      <td className="p-2.5">
                        {row.isValid ? (
                          <span className="text-emerald-600 font-semibold">Valid</span>
                        ) : (
                          <span className="text-rose-600 font-semibold">{row.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
            type="button"
            onClick={handleConfirmImport}
            disabled={loading || rows.filter((r) => r.isValid).length === 0}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Import {rows.filter((r) => r.isValid).length} Products</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
