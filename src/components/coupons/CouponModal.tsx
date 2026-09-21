// components/coupons/CouponModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Coupon, CouponType } from '@/lib/types';
import { Modal } from '@/components/common/Modal';
import { rupeesToPaise, paiseToRupees } from '@/lib/currency';
import { TicketPercent, Tag, Calendar, User, Hash, Save } from 'lucide-react';

interface CouponModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => Promise<void>;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  coupon,
  isOpen,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState<string>('');
  const [type, setType] = useState<CouponType>('fixed');
  const [amountRupees, setAmountRupees] = useState<string>('50');
  const [discountPercent, setDiscountPercent] = useState<string>('10');
  const [hasUsageLimit, setHasUsageLimit] = useState<boolean>(false);
  const [usageLimit, setUsageLimit] = useState<string>('100');
  const [hasExpiry, setHasExpiry] = useState<boolean>(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || '');
      setType(coupon.type || 'fixed');
      setAmountRupees(paiseToRupees(coupon.amountPaise || 0));
      setDiscountPercent((coupon.discountPercent || 10).toString());
      setHasUsageLimit(coupon.usageLimit !== null && coupon.usageLimit !== undefined);
      setUsageLimit((coupon.usageLimit || 100).toString());
      setHasExpiry(Boolean(coupon.expiresAt));
      setExpiryDate(
        coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : ''
      );
      setCustomerName(coupon.customerName || '');
      setError(null);
    } else {
      setCode('');
      setType('fixed');
      setAmountRupees('50');
      setDiscountPercent('10');
      setHasUsageLimit(false);
      setUsageLimit('100');
      setHasExpiry(false);
      setExpiryDate('');
      setCustomerName('');
      setError(null);
    }
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Coupon code is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const amountPaise = type === 'fixed' ? rupeesToPaise(parseFloat(amountRupees) || 0) : 0;
      const pct = type === 'percent' ? parseFloat(discountPercent) || 0 : undefined;
      const limit = hasUsageLimit ? parseInt(usageLimit, 10) || 1 : null;
      const expiresAt = hasExpiry && expiryDate ? new Date(expiryDate).getTime() : undefined;

      await onSave({
        code: code.trim().toUpperCase(),
        type,
        amountPaise,
        discountPercent: pct,
        status: coupon?.status || 'active',
        usageLimit: limit,
        expiresAt,
        customerName: customerName.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coupon ? 'Edit Coupon' : 'Create New Discount Coupon'}
      subtitle="Coupons apply to customer bills on POS checkout and track usage count."
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
            Coupon Code *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME50"
              className="w-full pl-9 pr-3 py-2 text-sm font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold tracking-wider"
            />
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Discount Type Radio */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Discount Calculation Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${
                type === 'fixed'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <input
                type="radio"
                name="couponType"
                value="fixed"
                checked={type === 'fixed'}
                onChange={() => setType('fixed')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Fixed Amount (₹)</span>
            </label>

            <label
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${
                type === 'percent'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <input
                type="radio"
                name="couponType"
                value="percent"
                checked={type === 'percent'}
                onChange={() => setType('percent')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Percentage (%)</span>
            </label>
          </div>
        </div>

        {/* Discount Value */}
        {type === 'fixed' ? (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Flat Discount Amount (₹) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                placeholder="50"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
              <span className="text-sm font-bold text-slate-400 absolute left-3 top-2">₹</span>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Percentage Discount (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                required
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="10"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
              <TicketPercent className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        )}

        {/* Usage Limit & Expiry Checkboxes */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasUsageLimit}
                onChange={(e) => setHasUsageLimit(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Set Max Redemptions Limit</span>
            </label>
            {hasUsageLimit && (
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-24 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-medium"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Set Expiration Date</span>
            </label>
            {hasExpiry && (
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
              />
            )}
          </div>
        </div>

        {/* Customer Assignment */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Assigned Customer Name (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
            <span>Save Coupon</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
