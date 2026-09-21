// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PaymentBadge } from '@/components/common/PaymentBadge';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useCoupons } from '@/hooks/useCoupons';
import { useSavedOrders } from '@/hooks/useSavedOrders';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { TimeRange } from '@/lib/types';
import { formatTime, formatRelativeTime } from '@/lib/dates';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Package,
  ClipboardList,
  TicketPercent,
  Percent,
  Activity,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('today');
  const { sales, loading: loadingSales } = useSales();
  const { products, loading: loadingProducts } = useProducts();
  const { coupons, loading: loadingCoupons } = useCoupons();
  const { savedOrders, loading: loadingOrders } = useSavedOrders();

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
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Store Command Center"
        subtitle="Real-time business performance across all POS registers"
      />

      <div className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Today Revenue */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Today's Revenue
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <CurrencyDisplay paise={stats.kpis.todayRevenuePaise} size="xl" />
              <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>Live computed</span>
              </div>
            </div>
          </div>

          {/* Today Sales Count */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Today's Sales
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-white tabular-nums">
                {stats.kpis.todaySalesCount}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Completed bills</div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Average Order
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <CurrencyDisplay paise={stats.kpis.todayAverageOrderPaise} size="xl" />
              <div className="mt-1 text-[11px] text-slate-400">Per transaction</div>
            </div>
          </div>

          {/* Active Products */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Catalog
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-white tabular-nums">
                {stats.kpis.activeProductsCount}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Products in sync</div>
            </div>
          </div>

          {/* Held / Pending Orders */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Held Orders
              </span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-white tabular-nums">
                {stats.kpis.pendingOrdersCount}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Parked at POS</div>
            </div>
          </div>

          {/* Cancellation Rate */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cancel Rate
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-white tabular-nums">
                {stats.kpis.cancellationRatePercent}%
              </div>
              <div className="mt-1 text-[11px] text-slate-400">All-time ratio</div>
            </div>
          </div>
        </div>

        {/* Revenue Timeline Section */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Revenue Trajectory
              </h2>
              <p className="text-xs text-slate-400">
                Real-time income trends from all register terminals
              </p>
            </div>

            {/* Range Toggle Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
              {rangeButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedRange(btn.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

          {/* Area Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analytics Breakdown Grid: Payment Donut + Top Products + Hourly Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Method Breakdown Donut */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Payment Breakdown
              </h3>
              <p className="text-xs text-slate-400">Share of revenue by tender method</p>
            </div>

            <div className="h-48 my-4 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.paymentBreakdownData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.paymentBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`₹${val}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {stats.paymentBreakdownData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">₹{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Products by Revenue */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Top Products by Revenue
              </h3>
              <p className="text-xs text-slate-400">Best performers across all registers</p>
            </div>

            <div className="space-y-3 my-4">
              {stats.topProducts.map((prod, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200 truncate max-w-[160px]">
                      {idx + 1}. {prod.name}
                    </span>
                    <span className="text-indigo-400">₹{prod.revenueRupees}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (prod.revenueRupees / (stats.topProducts[0]?.revenueRupees || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 text-right">
              Based on completed line items
            </div>
          </div>

          {/* Live Recent Activity Feed */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Activity Feed
                </h3>
                <p className="text-xs text-slate-400">Live mutations & sale events</p>
              </div>
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>

            <div className="divide-y divide-slate-800 my-4 max-h-64 overflow-y-auto pr-1">
              {stats.recentActivity.slice(0, 5).map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>{act.invoiceNumber}</span>
                      <StatusBadge status={act.status} size="sm" />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {act.customerName} • {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                  <CurrencyDisplay paise={act.grandTotalPaise} weight="bold" />
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
    </div>
  );
}
