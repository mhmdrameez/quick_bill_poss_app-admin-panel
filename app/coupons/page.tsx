// app/coupons/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CouponModal } from '@/components/coupons/CouponModal';
import { CouponRedemptionsModal } from '@/components/coupons/CouponRedemptionsModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useCoupons } from '@/hooks/useCoupons';
import { Coupon } from '@/lib/types';
import { formatDate } from '@/lib/dates';
import {
  Plus,
  TicketPercent,
  Search,
  Tag,
  History,
  Edit,
  Ban,
  Percent,
} from 'lucide-react';

export default function CouponsPage() {
  const { coupons, loading, addCoupon, editCoupon, deactivateCoupon, getCouponRedemptions } = useCoupons();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [redemptionsCoupon, setRedemptionsCoupon] = useState<Coupon | null>(null);
  const [deactivatingCoupon, setDeactivatingCoupon] = useState<Coupon | null>(null);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coup) => {
      if (statusFilter !== 'all' && coup.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = coup.code.toLowerCase().includes(q);
        const matchCust = (coup.customerName || '').toLowerCase().includes(q);
        if (!matchCode && !matchCust) return false;
      }

      return true;
    });
  }, [coupons, statusFilter, searchQuery]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (data: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => {
    if (editingCoupon) {
      await editCoupon(editingCoupon.id, data);
    } else {
      await addCoupon(data);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (deactivatingCoupon) {
      await deactivateCoupon(deactivatingCoupon.id);
      setDeactivatingCoupon(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Promotions & Coupons"
        subtitle="Create discount campaigns, percentage codes, and track redemption quotas"
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        }
      />

      <div className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Search & Filter */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupon code, customer..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-850 dark:bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-850 dark:bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="used">Used / Expired</option>
              <option value="cancelled">Deactivated</option>
            </select>

            <div className="text-xs text-slate-400 font-medium">
              Total: <strong className="text-white">{filteredCoupons.length}</strong>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Discount Value</th>
                  <th className="py-3.5 px-4">Usage (Used / Limit)</th>
                  <th className="py-3.5 px-4">Target Customer</th>
                  <th className="py-3.5 px-4">Expires</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Loading coupons...
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No discount coupons found. Click "Create Coupon" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-indigo-400" />
                        <span className="tracking-wider">{coupon.code}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium capitalize">
                          {coupon.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {coupon.type === 'fixed' ? (
                          <CurrencyDisplay paise={coupon.amountPaise} size="sm" weight="bold" />
                        ) : (
                          <span>{coupon.discountPercent}% OFF</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span>{coupon.usageCount || 0}</span>
                        <span className="text-slate-500">
                          {coupon.usageLimit ? ` / ${coupon.usageLimit} used` : ' (Unlimited)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {coupon.customerName || <span className="text-slate-500">All Customers</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={coupon.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setRedemptionsCoupon(coupon)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Redemption History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-lg transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {coupon.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => setDeactivatingCoupon(coupon)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Deactivate Coupon"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
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
      </div>

      {/* Create / Edit Coupon Modal */}
      <CouponModal
        coupon={editingCoupon}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCoupon(null);
        }}
        onSave={handleSaveCoupon}
      />

      {/* Redemptions History Modal */}
      <CouponRedemptionsModal
        coupon={redemptionsCoupon}
        isOpen={Boolean(redemptionsCoupon)}
        onClose={() => setRedemptionsCoupon(null)}
        loadRedemptions={getCouponRedemptions}
      />

      {/* Deactivation Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deactivatingCoupon)}
        onClose={() => setDeactivatingCoupon(null)}
        onConfirm={handleDeactivateConfirm}
        title="Deactivate Coupon"
        message={`Are you sure you want to deactivate code "${deactivatingCoupon?.code}"? It will no longer be accepted at checkout.`}
        confirmText="Deactivate"
        isDanger
      />
    </div>
  );
}
