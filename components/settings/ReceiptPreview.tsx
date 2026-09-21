// components/settings/ReceiptPreview.tsx
'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';

interface ReceiptPreviewProps {
  settings: StoreSettings;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ settings }) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-amber-50/40 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-5 shadow-lg text-slate-800 dark:text-slate-200 font-mono text-xs space-y-3 relative overflow-hidden">
      {/* Thermal receipt jagged top effect */}
      <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400 dark:border-slate-600">
        {settings.showShopName && (
          <h3 className="text-sm font-bold tracking-tight uppercase text-slate-900 dark:text-white">
            {settings.businessName || 'Quick Bill POS Store'}
          </h3>
        )}
        {settings.showShopAddress && settings.businessAddress && (
          <p className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-line leading-tight">
            {settings.businessAddress}
          </p>
        )}
        {settings.showShopPhone && settings.businessPhone && (
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Tel: {settings.businessPhone}
          </p>
        )}
        {settings.showShopGstin && settings.gstin && (
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            GSTIN: {settings.gstin}
          </p>
        )}
        {settings.receiptHeader && (
          <p className="text-[11px] text-slate-500 italic whitespace-pre-line pt-1">
            {settings.receiptHeader}
          </p>
        )}
      </div>

      {/* Bill Metadata */}
      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
        <div className="flex justify-between">
          <span>INVOICE: INV-2026-0042</span>
          <span>REG: REG-A</span>
        </div>
        <div className="flex justify-between">
          <span>DATE: 21 Sep 2026</span>
          <span>10:42 AM</span>
        </div>
      </div>

      {/* Items list */}
      <div className="border-t border-b border-dashed border-slate-400 dark:border-slate-600 py-2 space-y-1.5">
        <div className="flex justify-between font-bold text-[11px]">
          <span>ITEM</span>
          <span>QTY × PRICE</span>
          <span>TOTAL</span>
        </div>

        <div className="flex justify-between text-[11px]">
          <span className="truncate max-w-[120px]">Americano (Hot)</span>
          <span>2 × 180.00</span>
          <span>₹360.00</span>
        </div>

        <div className="flex justify-between text-[11px]">
          <span className="truncate max-w-[120px]">Butter Croissant</span>
          <span>1 × 150.00</span>
          <span>₹150.00</span>
        </div>
      </div>

      {/* Total Calculations */}
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>₹510.00</span>
        </div>

        {settings.taxEnabled && (
          <div className="flex justify-between">
            <span>GST ({settings.taxRatePercent || 5}%):</span>
            <span>₹25.50</span>
          </div>
        )}

        <div className="flex justify-between text-rose-600 dark:text-rose-400">
          <span>DISCOUNT (WELCOME50):</span>
          <span>-₹50.00</span>
        </div>

        <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-300 dark:border-slate-700">
          <span>GRAND TOTAL:</span>
          <span>{settings.taxEnabled ? '₹485.50' : '₹460.00'}</span>
        </div>
      </div>

      {/* Footer / Thank you note */}
      <div className="text-center pt-3 border-t border-dashed border-slate-400 dark:border-slate-600 text-[11px] space-y-1">
        {settings.receiptFooter && (
          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
            {settings.receiptFooter}
          </p>
        )}
        {settings.showThankYouMessage && (
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            *** Thank You for Shopping! ***
          </p>
        )}
        <p className="text-[10px] text-slate-400 pt-1">
          Powered by Quick Bill POS
        </p>
      </div>
    </div>
  );
};
