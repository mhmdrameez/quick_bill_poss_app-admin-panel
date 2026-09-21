// components/coupons/CouponRedemptionsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Coupon, CouponRedemption } from '@/lib/types';
import { Modal } from '@/components/common/Modal';
import { formatDateTime } from '@/lib/dates';
import { Receipt, CheckCircle, XCircle } from 'lucide-react';

interface CouponRedemptionsModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  loadRedemptions: (couponId: string, code: string) => Promise<CouponRedemption[]>;
}

export const CouponRedemptionsModal: React.FC<CouponRedemptionsModalProps> = ({
  coupon,
  isOpen,
  onClose,
  loadRedemptions,
}) => {
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && coupon) {
      setLoading(true);
      loadRedemptions(coupon.id, coupon.code)
        .then((list) => setRedemptions(list))
        .finally(() => setLoading(false));
    }
  }, [isOpen, coupon, loadRedemptions]);

  if (!isOpen || !coupon) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Redemptions History — ${coupon.code}`}
      subtitle={`Total usage count: ${coupon.usageCount || 0} ${
        coupon.usageLimit ? `/ ${coupon.usageLimit}` : '(Unlimited)'
      }`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-sm text-slate-500">
            Loading redemption logs...
          </div>
        ) : redemptions.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            No redemptions recorded for this coupon yet.
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {redemptions.map((red) => (
              <div
                key={red.id}
                className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {red.saleInvoice || 'Invoice'}
                    </span>
                    <span className="text-slate-400">{formatDateTime(red.redeemedAt)}</span>
                  </div>
                </div>

                <div>
                  {red.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                      <XCircle className="w-3.5 h-3.5" />
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
