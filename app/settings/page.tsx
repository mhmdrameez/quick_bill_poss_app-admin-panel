// app/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { ReceiptPreview } from '@/components/settings/ReceiptPreview';
import { useSettings } from '@/hooks/useSettings';
import { StoreSettings } from '@/lib/types';
import { Store, Percent, FileText, CheckCircle2, Save, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const { settings, loading, saving, updateSettings } = useSettings();
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Store & Thermal Receipt Settings"
        subtitle="Manage business credentials, GSTIN, tax rates, and live receipt template"
      />

      <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* General Business Information */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <Store className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Business Information
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Store / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName || ''}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Store Address
                </label>
                <textarea
                  rows={2}
                  value={formData.businessAddress || ''}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                  placeholder="Plot / Street, City, State, PIN"
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.businessPhone || ''}
                    onChange={(e) => handleChange('businessPhone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    GSTIN / Tax Registration
                  </label>
                  <input
                    type="text"
                    value={formData.gstin || ''}
                    onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                    placeholder="06AAAAA0000A1Z5"
                    className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Tax Configuration */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <Percent className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tax Calculation Configuration
                </h3>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-white">Enable GST / Tax Calculation</div>
                  <div className="text-xs text-slate-400">
                    When enabled, tax is calculated automatically on cart subtotal at checkout.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.taxEnabled}
                  onChange={(e) => handleChange('taxEnabled', e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded"
                />
              </div>

              {formData.taxEnabled && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.taxRatePercent ?? 5}
                    onChange={(e) => handleChange('taxRatePercent', parseFloat(e.target.value) || 0)}
                    className="w-40 px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Receipt Template Customizer */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Thermal Receipt Layout & Visibility
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Receipt Header Note
                </label>
                <textarea
                  rows={2}
                  value={formData.receiptHeader || ''}
                  onChange={(e) => handleChange('receiptHeader', e.target.value)}
                  placeholder="Welcome message or slogan..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Receipt Footer Note
                </label>
                <textarea
                  rows={2}
                  value={formData.receiptFooter || ''}
                  onChange={(e) => handleChange('receiptFooter', e.target.value)}
                  placeholder="Return policy or visit again note..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs font-medium cursor-pointer">
                  <span>Show Shop Name on Receipt</span>
                  <input
                    type="checkbox"
                    checked={formData.showShopName ?? true}
                    onChange={(e) => handleChange('showShopName', e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs font-medium cursor-pointer">
                  <span>Show Shop Address on Receipt</span>
                  <input
                    type="checkbox"
                    checked={formData.showShopAddress ?? true}
                    onChange={(e) => handleChange('showShopAddress', e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs font-medium cursor-pointer">
                  <span>Show Phone Number on Receipt</span>
                  <input
                    type="checkbox"
                    checked={formData.showShopPhone ?? true}
                    onChange={(e) => handleChange('showShopPhone', e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs font-medium cursor-pointer">
                  <span>Show GSTIN on Receipt</span>
                  <input
                    type="checkbox"
                    checked={formData.showShopGstin ?? true}
                    onChange={(e) => handleChange('showShopGstin', e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs font-medium cursor-pointer">
                  <span>Show "Thank You" Greeting</span>
                  <input
                    type="checkbox"
                    checked={formData.showThankYouMessage ?? true}
                    onChange={(e) => handleChange('showThankYouMessage', e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {savedSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings saved & synced to all POS registers!</span>
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Store Settings</span>
              </button>
            </div>
          </div>

          {/* Right Column: Thermal Receipt Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-24">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Live Thermal Receipt Preview
                </span>
                <span className="text-[11px] text-indigo-400">58mm / 80mm ESC/POS</span>
              </div>
              <ReceiptPreview settings={formData} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
