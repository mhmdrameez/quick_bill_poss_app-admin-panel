// components/common/CurrencyDisplay.tsx
import React from 'react';
import { formatCurrency } from '@/lib/currency';

interface CurrencyDisplayProps {
  paise: number | undefined | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  negative?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  paise,
  className = '',
  size = 'md',
  weight = 'semibold',
  negative = false,
}) => {
  const formatted = formatCurrency(paise);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl font-bold tracking-tight',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <span
      className={`tabular-nums inline-flex items-center ${sizeClasses[size]} ${weightClasses[weight]} ${
        negative ? 'text-rose-600 dark:text-rose-400' : ''
      } ${className}`}
    >
      {negative ? `-${formatted}` : formatted}
    </span>
  );
};
