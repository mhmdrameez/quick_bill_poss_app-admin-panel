// src/views/SalesView.tsx
import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PaymentBadge } from '@/components/common/PaymentBadge';
import { PageSkeleton } from '@/components/common/SkeletonCard';
import { SaleDetailDrawer } from '@/components/sales/SaleDetailDrawer';
import { EditSaleModal } from '@/components/sales/EditSaleModal';
import { CancelConfirmDialog } from '@/components/sales/CancelConfirmDialog';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import type { CompletedSale, TimeRange } from '@/lib/types';
import { getDateRangeTimestamps, formatDateTime } from '@/lib/dates';
import {
  Search,
  Eye,
  Edit,
  Ban,
  Download,
} from 'lucide-react';

export const SalesContent: React.FC = () => {
  const { sales, loading, getSaleAuditEvents, editSale, cancelSale } = useSales();
  const { products } = useProducts();

  // Filters State
  const [selectedRange, setSelectedRange] = useState<TimeRange>('today');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc'>('newest');

  // Modals & Drawer State
  const [selectedSale, setSelectedSale] = useState<CompletedSale | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingSale, setEditingSale] = useState<CompletedSale | null>(null);
  const [cancellingSale, setCancellingSale] = useState<CompletedSale | null>(null);

  // Filtered and Sorted Sales
  const filteredSales = useMemo(() => {
    const { startTime, endTime } = getDateRangeTimestamps(selectedRange, customStart, customEnd);

    return sales
      .filter((sale) => {
        if (sale.completedAt < startTime || sale.completedAt > endTime) return false;
        if (statusFilter !== 'all' && sale.status !== statusFilter) return false;
        if (paymentFilter !== 'all' && (sale.paymentMethod || '').toLowerCase() !== paymentFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchInvoice = sale.invoiceNumber.toLowerCase().includes(q);
          const matchOrder = (sale.orderNumber || '').toLowerCase().includes(q);
          const matchName = (sale.customer?.name || '').toLowerCase().includes(q);
          const matchPhone = (sale.customer?.phone || '').toLowerCase().includes(q);
          const matchItem = (sale.items || []).some((item) => item.name.toLowerCase().includes(q));
          if (!matchInvoice && !matchOrder && !matchName && !matchPhone && !matchItem) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.completedAt - a.completedAt;
        if (sortBy === 'oldest') return a.completedAt - b.completedAt;
        if (sortBy === 'amount_desc') return b.grandTotalPaise - a.grandTotalPaise;
        if (sortBy === 'amount_asc') return a.grandTotalPaise - b.grandTotalPaise;
        return 0;
      });
  }, [sales, selectedRange, customStart, customEnd, statusFilter, paymentFilter, searchQuery, sortBy]);

  // Aggregate stats for current view
  const viewSummary = useMemo(() => {
    const valid = filteredSales.filter((s) => s.status === 'completed');
    const totalPaise = valid.reduce((sum, s) => sum + s.grandTotalPaise, 0);
    const count = valid.length;
    return { totalPaise, count };
  }, [filteredSales]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Invoice', 'Date', 'Customer', 'Phone', 'Items Count', 'Subtotal (₹)', 'Tax (₹)', 'Discount (₹)', 'Grand Total (₹)', 'Payment', 'Status', 'Register'];
    const rows = filteredSales.map((s) => [
      s.invoiceNumber,
      formatDateTime(s.completedAt),
      s.customer?.name || 'Walk-in',
      s.customer?.phone || '',
      s.items?.length || 0,
      (s.subtotalPaise / 100).toFixed(2),
      (s.taxPaise / 100).toFixed(2),
      (s.discountPaise / 100).toFixed(2),
      (s.grandTotalPaise / 100).toFixed(2),
      s.paymentMethod,
      s.status,
      s.registerCode || 'REG-A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quickbill_sales_${selectedRange}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenDetail = (sale: CompletedSale) => {
    setSelectedSale(sale);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (sale: CompletedSale) => {
    setEditingSale(sale);
  };

  const handleOpenCancel = (sale: CompletedSale) => {
    setCancellingSale(sale);
  };

  if (loading) {
    return <PageSkeleton rows={10} cols={6} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 sm:space-y-4">
        {/* Time range buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full">
            {(['today', 'yesterday', '7d', '30d', 'custom'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRange === range
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range === 'today'
                  ? 'Today'
                  : range === 'yesterday'
                  ? 'Yesterday'
                  : range === '7d'
                  ? '7 Days'
                  : range === '30d'
                  ? '30 Days'
                  : 'Custom'}
              </button>
            ))}
          </div>

          {/* Summary Pill */}
          <div className="flex items-center justify-between sm:justify-start gap-3 text-xs font-medium px-3.5 py-1.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-slate-400">
              Count: <strong className="text-white">{viewSummary.count}</strong>
            </span>
            <span className="text-slate-400">
              Total: <CurrencyDisplay paise={viewSummary.totalPaise} weight="bold" size="sm" />
            </span>
          </div>
        </div>

        {/* Custom Date Picker row */}
        {selectedRange === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-xs"
            />
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-xs"
            />
          </div>
        )}

        {/* Search and Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 pt-1">
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice, customer, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="grid grid-cols-2 sm:contents gap-2">
            <div className="sm:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              >
                <option value="all">Status: All</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              >
                <option value="all">Payment: All</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="split">Split</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount_desc">Sort: Amount High → Low</option>
              <option value="amount_asc">Sort: Amount Low → High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Subtotal</th>
                <th className="py-3.5 px-4">Grand Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(sale)}
                  >
                    <td className="py-3 px-4 font-bold text-indigo-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {formatDateTime(sale.completedAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white truncate max-w-[120px]">
                        {sale.customer?.name || 'Walk-in'}
                      </div>
                      {sale.customer?.phone && (
                        <div className="text-[10px] text-slate-500">{sale.customer.phone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {sale.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <CurrencyDisplay paise={sale.subtotalPaise} size="sm" weight="normal" />
                    </td>
                    <td className="py-3 px-4">
                      <CurrencyDisplay paise={sale.grandTotalPaise} size="sm" weight="bold" />
                    </td>
                    <td className="py-3 px-4">
                      <PaymentBadge method={sale.paymentMethod} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={sale.status} size="sm" />
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(sale)}
                          title="View Receipt"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {sale.status === 'completed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(sale)}
                              title="Edit Bill"
                              className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenCancel(sale)}
                              title="Cancel Bill"
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Drawer */}
      <SaleDetailDrawer
        sale={selectedSale}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(s) => {
          setIsDrawerOpen(false);
          handleOpenEdit(s);
        }}
        onCancel={(s) => {
          setIsDrawerOpen(false);
          handleOpenCancel(s);
        }}
        fetchAuditEvents={getSaleAuditEvents}
      />

      {/* Edit Bill Modal */}
      <EditSaleModal
        sale={editingSale}
        isOpen={Boolean(editingSale)}
        onClose={() => setEditingSale(null)}
        onSave={async (id, data, note) => {
          await editSale(id, data, note);
        }}
        availableProducts={products}
      />

      {/* Cancel Bill Confirmation */}
      <CancelConfirmDialog
        sale={cancellingSale}
        isOpen={Boolean(cancellingSale)}
        onClose={() => setCancellingSale(null)}
        onConfirm={async (id, reason) => {
          await cancelSale(id, reason);
        }}
      />
    </div>
  );
};

export const SalesView: React.FC = () => {
  return (
    <AppShell
      title="Transaction History"
      subtitle="Search, filter, edit bills, and inspect immutable audit logs"
      currentPath="/sales"
    >
      <SalesContent />
    </AppShell>
  );
};
export default SalesView;
