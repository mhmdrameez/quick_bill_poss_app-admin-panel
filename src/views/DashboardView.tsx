// src/views/DashboardView.tsx
import React, { useState, Suspense, lazy } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DashboardSkeleton, ChartSkeleton } from '@/components/common/SkeletonCard';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useCoupons } from '@/hooks/useCoupons';
import { useSavedOrders } from '@/hooks/useSavedOrders';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import type { TimeRange } from '@/lib/types';
import { formatRelativeTime } from '@/lib/dates';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Package,
  ClipboardList,
  Percent,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

const RevenueChart = lazy(() => import('@/components/charts/RevenueAreaChart'));
const PaymentPieChart = lazy(() => import('@/components/charts/PaymentPieChart'));

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  subtext: string;
  icon: React.ReactNode;
  accentClass: string;
  iconBgClass: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, subtext, icon, accentClass, iconBgClass }) => (
  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between gap-2 hover:border-slate-700 transition-colors duration-150">
    <div className="flex justify-between items-start">
      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className={`p-1.5 rounded-lg ${iconBgClass}`}>{icon}</div>
    </div>
    <div>
      <div className="text-base sm:text-xl font-bold tracking-tight text-white tabular-nums">{value}</div>
      <div className={`mt-0.5 flex items-center gap-1 text-[10px] font-medium ${accentClass}`}>{subtext}</div>
    </div>
  </div>
);

export const DashboardContent: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('today');

  const { sales, loading: loadingSales } = useSales();
  const { products, loading: loadingProducts } = useProducts();
  const { coupons, loading: loadingCoupons } = useCoupons();
  const { savedOrders, loading: loadingOrders } = useSavedOrders();

  const isLoading = loadingSales || loadingProducts || loadingCoupons || loadingOrders;

  const stats = useDashboardStats({
    sales,
    products,
    coupons,
    savedOrders,
    selectedRange,
  });

  const rangeButtons: Array<{ id: TimeRange; label: string }> = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KpiCard
          label="Revenue"
          value={<CurrencyDisplay paise={stats.kpis.todayRevenuePaise} size="lg" className="text-base sm:text-xl font-bold" />}
          subtext="Today"
          icon={<IndianRupee className="w-3.5 h-3.5 text-indigo-400" />}
          accentClass="text-emerald-400"
          iconBgClass="bg-indigo-500/10 border border-indigo-500/20"
        />
        <KpiCard
          label="Sales"
          value={stats.kpis.todaySalesCount}
          subtext="Bills completed"
          icon={<ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />}
          accentClass="text-slate-400"
          iconBgClass="bg-emerald-500/10 border border-emerald-500/20"
        />
        <KpiCard
          label="Avg Order"
          value={<CurrencyDisplay paise={stats.kpis.todayAverageOrderPaise} size="lg" className="text-base sm:text-xl font-bold" />}
          subtext="Per bill"
          icon={<TrendingUp className="w-3.5 h-3.5 text-amber-400" />}
          accentClass="text-slate-400"
          iconBgClass="bg-amber-500/10 border border-amber-500/20"
        />
        <KpiCard
          label="Catalog"
          value={stats.kpis.activeProductsCount}
          subtext="Products live"
          icon={<Package className="w-3.5 h-3.5 text-purple-400" />}
          accentClass="text-slate-400"
          iconBgClass="bg-purple-500/10 border border-purple-500/20"
        />
        <KpiCard
          label="Held Carts"
          value={stats.kpis.pendingOrdersCount}
          subtext="Parked on POS"
          icon={<ClipboardList className="w-3.5 h-3.5 text-sky-400" />}
          accentClass="text-slate-400"
          iconBgClass="bg-sky-500/10 border border-sky-500/20"
        />
        <KpiCard
          label="Cancels"
          value={`${stats.kpis.cancellationRatePercent}%`}
          subtext="Total ratio"
          icon={<Percent className="w-3.5 h-3.5 text-rose-400" />}
          accentClass="text-slate-400"
          iconBgClass="bg-rose-500/10 border border-rose-500/20"
        />
      </div>

      {/* ── Revenue Timeline ────────────────────────────────────── */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Revenue Trajectory
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Income timeline from all register terminals
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full">
            {rangeButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedRange(btn.id)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRange === btn.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lazy-loaded chart */}
        <Suspense fallback={<ChartSkeleton height="h-56 sm:h-72" />}>
          <RevenueChart data={stats.timelineData} />
        </Suspense>
      </div>

      {/* ── Analytics Breakdown Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Payment Method Breakdown Donut */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Payment Breakdown
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Share of revenue by tender</p>
          </div>

          <Suspense fallback={<div className="h-44 animate-pulse bg-slate-800/50 rounded-xl" />}>
            <PaymentPieChart data={stats.paymentBreakdownData} />
          </Suspense>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {stats.paymentBreakdownData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-white text-[11px]">₹{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Products by Revenue */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Top Products
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Best performers by volume</p>
          </div>

          <div className="space-y-3 flex-1">
            {stats.topProducts.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">No sales data yet</p>
            ) : (
              stats.topProducts.map((prod, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200 truncate max-w-[150px]">
                      {idx + 1}. {prod.name}
                    </span>
                    <span className="text-indigo-400">₹{prod.revenueRupees}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (prod.revenueRupees / (stats.topProducts[0]?.revenueRupees || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-[10px] text-slate-500 text-right">
            Based on completed items
          </div>
        </div>

        {/* Live Recent Activity Feed */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Activity Feed
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Live POS mutations</p>
            </div>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>

          <div className="divide-y divide-slate-800 flex-1 max-h-60 overflow-y-auto pr-1">
            {stats.recentActivity.slice(0, 5).map((act) => (
              <div key={act.id} className="py-2 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                    <span>{act.invoiceNumber}</span>
                    <StatusBadge status={act.status} size="sm" />
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {act.customerName} • {formatRelativeTime(act.timestamp)}
                  </span>
                </div>
                <CurrencyDisplay paise={act.grandTotalPaise} size="sm" weight="bold" />
              </div>
            ))}
          </div>

          <a
            href="/sales"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 pt-2 border-t border-slate-800"
          >
            <span>View all transactions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  return (
    <AppShell
      title="Store Command Center"
      subtitle="Real-time business performance across all POS registers"
      currentPath="/dashboard"
    >
      <DashboardContent />
    </AppShell>
  );
};
export default DashboardView;
