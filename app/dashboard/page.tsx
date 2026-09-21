// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useCoupons } from '@/hooks/useCoupons';
import { useSavedOrders } from '@/hooks/useSavedOrders';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { TimeRange } from '@/lib/types';
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
} from 'recharts';

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('today');
  const { sales } = useSales();
  const { products } = useProducts();
  const { coupons } = useCoupons();
  const { savedOrders } = useSavedOrders();

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

  return (
    <div className="flex-1 flex flex-col w-full">
      <Header
        title="Store Command Center"
        subtitle="Real-time business performance across all POS registers"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* KPI Cards Grid - Responsive (2 cols mobile, 3 tablet, 6 desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Today Revenue */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                Revenue
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <CurrencyDisplay paise={stats.kpis.todayRevenuePaise} size="lg" className="text-base sm:text-xl font-bold" />
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Today Sales Count */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sales
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-white tabular-nums">
                {stats.kpis.todaySalesCount}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">Bills completed</div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                Avg Order
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <CurrencyDisplay paise={stats.kpis.todayAverageOrderPaise} size="lg" className="text-base sm:text-xl font-bold" />
              <div className="mt-0.5 text-[10px] text-slate-400">Per bill</div>
            </div>
          </div>

          {/* Active Products */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                Catalog
              </span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-white tabular-nums">
                {stats.kpis.activeProductsCount}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">Products live</div>
            </div>
          </div>

          {/* Held / Pending Orders */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                Held Carts
              </span>
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <ClipboardList className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-white tabular-nums">
                {stats.kpis.pendingOrdersCount}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">Parked on POS</div>
            </div>
          </div>

          {/* Cancellation Rate */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cancels
              </span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-white tabular-nums">
                {stats.kpis.cancellationRatePercent}%
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">Total ratio</div>
            </div>
          </div>
        </div>

        {/* Revenue Timeline Section */}
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

            {/* Range Toggle Buttons - Horizontal scrolling on mobile */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full">
              {rangeButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedRange(btn.id)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
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
          <div className="h-56 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
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
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analytics Breakdown Grid: Payment Donut + Top Products + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Payment Method Breakdown Donut */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Payment Breakdown
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Share of revenue by tender</p>
            </div>

            <div className="h-44 my-2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.paymentBreakdownData}
                    innerRadius={45}
                    outerRadius={68}
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
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-white text-[11px]">₹{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Products by Revenue */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Top Products
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Best performers by volume</p>
            </div>

            <div className="space-y-3 my-3">
              {stats.topProducts.map((prod, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200 truncate max-w-[150px]">
                      {idx + 1}. {prod.name}
                    </span>
                    <span className="text-indigo-400">₹{prod.revenueRupees}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
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

            <div className="text-[10px] text-slate-500 text-right">
              Based on completed items
            </div>
          </div>

          {/* Live Recent Activity Feed */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Activity Feed
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">Live POS mutations</p>
              </div>
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>

            <div className="divide-y divide-slate-800 my-3 max-h-60 overflow-y-auto pr-1">
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
    </div>
  );
}
