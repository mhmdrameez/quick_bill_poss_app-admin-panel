// app/orders/page.tsx
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useSavedOrders } from '@/hooks/useSavedOrders';
import { SavedOrder } from '@/lib/types';
import { formatDateTime, formatRelativeTime } from '@/lib/dates';
import { ClipboardList, Eye, Trash2, Clock, User, Phone } from 'lucide-react';

export default function HeldOrdersPage() {
  const { savedOrders, loading, deleteSavedOrder } = useSavedOrders();
  const [selectedOrder, setSelectedOrder] = useState<SavedOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<SavedOrder | null>(null);

  const handleDeleteConfirm = async () => {
    if (deletingOrder) {
      await deleteSavedOrder(deletingOrder.id);
      setDeletingOrder(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Held / Parked Orders"
        subtitle="Manage in-progress orders parked on counter POS terminals"
      />

      <div className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">
            Currently Held Orders: <strong className="text-white">{savedOrders.length}</strong>
          </div>
        </div>

        {/* Grid of held orders */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading parked orders...
          </div>
        ) : savedOrders.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No Held Orders Active</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When cashiers park a cart on their POS device, it will immediately appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          {order.orderNumber}
                        </span>
                        <StatusBadge status="draft" size="sm" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Parked {formatRelativeTime(order.createdAt)}</span>
                      </div>
                    </div>
                    <CurrencyDisplay paise={order.grandTotalPaise} size="lg" />
                  </div>

                  {/* Customer pill */}
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customer?.name || 'Walk-in Customer'}</span>
                    </div>
                    {order.customer?.phone && (
                      <span className="text-slate-400">{order.customer.phone}</span>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Cart Items ({order.items?.length || 0})
                    </div>
                    <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-850 dark:bg-slate-800/40 p-2 text-xs border border-slate-800">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between text-slate-300">
                          <span className="truncate max-w-[170px]">
                            {item.quantity}× {item.name}
                          </span>
                          <CurrencyDisplay
                            paise={item.unitPricePaise * item.quantity}
                            size="sm"
                            weight="normal"
                          />
                        </div>
                      ))}
                      {(order.items?.length || 0) > 3 && (
                        <div className="pt-1.5 text-[11px] text-slate-500 text-center">
                          + {(order.items?.length || 0) - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingOrder(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Held Order Detail Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Held Cart — ${selectedOrder?.orderNumber}`}
        subtitle={`Created at ${formatDateTime(selectedOrder?.createdAt)}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          {selectedOrder?.customer && (
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
              <div className="font-semibold text-white">
                Customer: {selectedOrder.customer.name || 'Walk-in'}
              </div>
              {selectedOrder.customer.phone && (
                <div className="text-slate-400">Phone: {selectedOrder.customer.phone}</div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Cart Contents
            </div>
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
              {selectedOrder?.items?.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-slate-500">
                      <CurrencyDisplay paise={item.unitPricePaise} size="sm" weight="normal" /> ×{' '}
                      {item.quantity}
                    </div>
                  </div>
                  <CurrencyDisplay paise={item.unitPricePaise * item.quantity} weight="bold" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <CurrencyDisplay paise={selectedOrder?.subtotalPaise} weight="normal" />
            </div>
            {selectedOrder && selectedOrder.taxPaise > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Tax</span>
                <CurrencyDisplay paise={selectedOrder.taxPaise} weight="normal" />
              </div>
            )}
            <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-sm text-white">
              <span>Grand Total</span>
              <CurrencyDisplay paise={selectedOrder?.grandTotalPaise} size="lg" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Discard Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleDeleteConfirm}
        title="Discard Held Order"
        message={`Are you sure you want to discard order ${deletingOrder?.orderNumber}? Cashiers on POS devices will no longer see this held order.`}
        confirmText="Discard Cart"
        isDanger
      />
    </div>
  );
}
