// components/common/PaymentBadge.tsx
import React from 'react';
import { PaymentMethod } from '@/lib/types';
import { Banknote, QrCode, CreditCard, Split } from 'lucide-react';

interface PaymentBadgeProps {
  method: PaymentMethod | string;
  className?: string;
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({ method, className = '' }) => {
  const normalized = (method || '').toLowerCase();

  switch (normalized) {
    case 'upi':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 ${className}`}
        >
          <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          UPI
        </span>
      );

    case 'cash':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}
        >
          <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Cash
        </span>
      );

    case 'card':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Card
        </span>
      );

    case 'split':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 ${className}`}
        >
          <Split className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          Split
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
        >
          {method || 'Unknown'}
        </span>
      );
  }
};
