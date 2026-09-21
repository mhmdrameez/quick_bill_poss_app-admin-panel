// components/sales/CancelConfirmDialog.tsx
'use client';

import React, { useState } from 'react';
import { CompletedSale } from '@/lib/types';
import { Modal } from '@/components/common/Modal';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { AlertTriangle, Ban } from 'lucide-react';

interface CancelConfirmDialogProps {
  sale: CompletedSale | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (saleId: string, reason: string) => Promise<void>;
}

export const CancelConfirmDialog: React.FC<CancelConfirmDialogProps> = ({
  sale,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState<string>('Customer cancellation request');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !sale) return null;

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onConfirm(sale.id, reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Transaction"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">
              Are you sure you want to cancel invoice {sale.invoiceNumber}?
            </p>
            <p className="text-rose-700/80 dark:text-rose-400">
              This action creates an immutable cancellation audit record and marks the sale cancelled across all connected POS terminals.
            </p>
          </div>
        </div>

        {sale.appliedCouponCode && (
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
            Coupon <strong>{sale.appliedCouponCode}</strong> will be reversed and released for future use.
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Invoice Amount</span>
            <CurrencyDisplay paise={sale.grandTotalPaise} weight="bold" />
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Items</span>
            <span>{sale.items?.length || 0} item(s)</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Payment</span>
            <span className="capitalize">{sale.paymentMethod}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reason for Cancellation (Audit Record)
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading || !reason.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
            <span>Confirm Cancellation</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
