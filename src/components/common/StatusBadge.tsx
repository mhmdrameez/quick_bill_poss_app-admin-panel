// components/common/StatusBadge.tsx
import React from 'react';
import { SaleStatus, CouponStatus, RegisterLeaseStatus } from '@/lib/types';
import { CheckCircle2, XCircle, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: SaleStatus | CouponStatus | RegisterLeaseStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const normalized = (status || '').toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let Icon = Clock;
  let label = status;

  switch (normalized) {
    case 'completed':
    case 'active':
      colorClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800';
      Icon = CheckCircle2;
      label = normalized === 'completed' ? 'Completed' : 'Active';
      break;

    case 'cancelled':
    case 'retired':
      colorClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/80 dark:border-rose-800';
      Icon = XCircle;
      label = normalized === 'cancelled' ? 'Cancelled' : 'Retired';
      break;

    case 'draft':
    case 'released':
      colorClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/80 dark:border-amber-800';
      Icon = Clock;
      label = normalized === 'draft' ? 'Held / Draft' : 'Released';
      break;

    case 'used':
      colorClasses = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800';
      Icon = Sparkles;
      label = 'Used';
      break;

    case 'expired':
      colorClasses = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700';
      Icon = AlertCircle;
      label = 'Expired';
      break;
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClass} ${colorClasses} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  );
};
