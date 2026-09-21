// components/sales/SaleDetailDrawer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { CompletedSale, AuditEvent } from '@/lib/types';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PaymentBadge } from '@/components/common/PaymentBadge';
import { formatDateTime, formatRelativeTime } from '@/lib/dates';
import { X, Edit, Ban, Printer, User, Phone, Mail, ShieldAlert, History, Smartphone, Sparkles } from 'lucide-react';

interface SaleDetailDrawerProps {
  sale: CompletedSale | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (sale: CompletedSale) => void;
  onCancel: (sale: CompletedSale) => void;
  fetchAuditEvents: (saleId: string) => Promise<AuditEvent[]>;
}

export const SaleDetailDrawer: React.FC<SaleDetailDrawerProps> = ({
  sale,
  isOpen,
  onClose,
  onEdit,
  onCancel,
  fetchAuditEvents,
}) => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && sale) {
      setLoadingAudit(true);
      fetchAuditEvents(sale.id)
        .then((events) => setAuditEvents(events))
        .finally(() => setLoadingAudit(false));
    }
  }, [isOpen, sale, fetchAuditEvents]);

  if (!isOpen || !sale) return null;

  const isEditable = sale.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-850/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {sale.invoiceNumber}
                </span>
                <StatusBadge status={sale.status} size="sm" />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Order #{sale.orderNumber} • {formatDateTime(sale.completedAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Terminal / Device Info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                <span>Register: <strong className="text-slate-900 dark:text-white">{sale.registerCode || 'REG-A'}</strong></span>
              </div>
              <div className="text-slate-500">
                Rev: <span className="font-mono font-semibold">#{sale._rev || 1}</span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Customer Details
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{sale.customer?.name || 'Walk-in Customer'}</span>
                </div>
                {sale.customer?.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{sale.customer.phone}</span>
                  </div>
                )}
                {sale.customer?.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{sale.customer.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Line Items ({sale.items?.length || 0})
                </h4>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {sale.items?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        <CurrencyDisplay paise={item.unitPricePaise} size="sm" weight="normal" /> × {item.quantity}
                      </div>
                    </div>
                    <CurrencyDisplay paise={item.unitPricePaise * item.quantity} weight="semibold" />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Bill Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <CurrencyDisplay paise={sale.subtotalPaise} weight="normal" />
              </div>

              {sale.taxPaise > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Tax</span>
                  <CurrencyDisplay paise={sale.taxPaise} weight="normal" />
                </div>
              )}

              {sale.discountPaise > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Discount ({sale.appliedCouponCode || 'Manual'})
                  </span>
                  <CurrencyDisplay paise={sale.discountPaise} negative weight="medium" />
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-base font-bold text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <CurrencyDisplay paise={sale.grandTotalPaise} size="lg" />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Payment Mode</span>
                <PaymentBadge method={sale.paymentMethod} />
              </div>

              {sale.paymentMethod === 'cash' && sale.amountPaidPaise && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Cash Paid / Change</span>
                  <span>
                    <CurrencyDisplay paise={sale.amountPaidPaise} size="sm" weight="normal" /> /{' '}
                    <CurrencyDisplay paise={sale.changePaise || 0} size="sm" weight="normal" />
                  </span>
                </div>
              )}
            </div>

            {/* Audit Trail History */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <History className="w-3.5 h-3.5" />
                <span>Audit Trail (Immutable)</span>
              </div>

              {loadingAudit ? (
                <p className="text-xs text-slate-500">Loading audit history...</p>
              ) : auditEvents.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-500 border border-slate-200 dark:border-slate-800">
                  Created at {formatDateTime(sale.completedAt)} via {sale.registerCode || 'POS'}
                </div>
              ) : (
                <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-4">
                  {auditEvents.map((evt) => (
                    <div key={evt.id} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{evt.operationType}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {evt.source}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {formatDateTime(evt.timestamp)} ({formatRelativeTime(evt.timestamp)})
                      </div>
                      {evt.details?.reason && (
                        <p className="mt-1 text-slate-600 dark:text-slate-400 italic">
                          "{evt.details.reason}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center gap-3">
            {isEditable ? (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(sale)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Bill
                </button>
                <button
                  type="button"
                  onClick={() => onCancel(sale)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-sm font-semibold rounded-xl transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <div className="w-full text-center py-2 text-xs font-medium text-slate-500">
                This transaction has been {sale.status} and cannot be modified.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
