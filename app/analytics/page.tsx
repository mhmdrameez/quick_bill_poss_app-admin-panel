// app/analytics/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { PageSkeleton } from '@/components/common/SkeletonCard';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { useCoupons } from '@/hooks/useCoupons';
import {
  TrendingUp,
  Users,
  Tag,
  Package,
} from 'lucide-react';

// ── Dynamic recharts imports (NOT in initial bundle) ──────────────────────────
const AnalyticsBarChart = dynamic(() => import('@/components/charts/AnalyticsBarChart'), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse bg-slate-800/50 rounded-xl" />,
});
const AnalyticsPieChart = dynamic(() => import('@/components/charts/PaymentPieChart'), {
  ssr: false,
  loading: () => <div className="h-44 animate-pulse bg-slate-800/50 rounded-xl" />,
});
// ─────────────────────────────────────────────────────────────────────────────


export default function AnalyticsPage() {
  const { sales, loading: loadingSales } = useSales();
  const { products, loading: loadingProducts } = useProducts();
  const { coupons } = useCoupons();

  const [activeTab, setActiveTab] = useState<'revenue' | 'products' | 'customers' | 'payments' | 'coupons'>('revenue');

  // Customer insights computation
  const customerAnalytics = useMemo(() => {
    const customerMap: Record<
      string,
      { name: string; phone: string; totalSpentPaise: number; orderCount: number; lastOrder: number }
    > = {};

    const validSales = sales.filter((s) => s.status === 'completed');

    validSales.forEach((s) => {
      const phone = s.customer?.phone?.trim();
      const name = s.customer?.name?.trim() || 'Walk-in Customer';
      const key = phone || `walkin_${s.id}`;

      if (!customerMap[key]) {
        customerMap[key] = {
          name,
          phone: phone || 'No phone registered',
          totalSpentPaise: 0,
          orderCount: 0,
          lastOrder: s.completedAt,
        };
      }

      customerMap[key].totalSpentPaise += s.grandTotalPaise;
      customerMap[key].orderCount += 1;
      if (s.completedAt > customerMap[key].lastOrder) {
        customerMap[key].lastOrder = s.completedAt;
      }
    });

    const customersList = Object.values(customerMap);
    const repeatCustomers = customersList.filter((c) => c.orderCount > 1);
    const totalCustomers = customersList.length;
    const totalSalesPaise = validSales.reduce((sum, s) => sum + s.grandTotalPaise, 0);
    const avgSpendPaise = totalCustomers > 0 ? Math.round(totalSalesPaise / totalCustomers) : 0;

    return {
      customersList: customersList.sort((a, b) => b.totalSpentPaise - a.totalSpentPaise),
      repeatCount: repeatCustomers.length,
      totalCustomers,
      avgSpendPaise,
    };
  }, [sales]);

  // Product sales performance
  const productAnalytics = useMemo(() => {
    const validSales = sales.filter((s) => s.status === 'completed');
    const itemMap: Record<string, { name: string; quantity: number; revenuePaise: number; category: string }> = {};

    validSales.forEach((s) => {
      (s.items || []).forEach((item) => {
        const key = item.id || item.name;
        if (!itemMap[key]) {
          itemMap[key] = {
            name: item.name,
            quantity: 0,
            revenuePaise: 0,
            category: item.category || 'General',
          };
        }
        itemMap[key].quantity += item.quantity || 1;
        itemMap[key].revenuePaise += (item.unitPricePaise || 0) * (item.quantity || 1);
      });
    });

    const topSellers = Object.values(itemMap)
      .sort((a, b) => b.revenuePaise - a.revenuePaise)
      .map((item) => ({
        ...item,
        revenueRupees: Math.round(item.revenuePaise / 100),
      }));

    // Find products in catalog with 0 sales
    const activeSoldIds = new Set(Object.keys(itemMap));
    const slowMovers = products
      .filter((p) => !p.isDeleted && !activeSoldIds.has(p.id))
      .slice(0, 5);

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    topSellers.forEach((item) => {
      const cat = item.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + item.revenueRupees;
    });

    const categoryData = Object.entries(categoryMap).map(([name, value], i) => ({
      name,
      value,
      color: ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'][i % 5],
    }));

    return { topSellers, slowMovers, categoryData };
  }, [sales, products]);

  // Coupon performance
  const couponAnalytics = useMemo(() => {
    const validSales = sales.filter((s) => s.status === 'completed');
    const totalDiscountPaise = validSales.reduce((sum, s) => sum + (s.discountPaise || 0), 0);
    const couponSalesCount = validSales.filter((s) => Boolean(s.appliedCouponCode)).length;

    return {
      totalDiscountPaise,
      couponSalesCount,
    };
  }, [sales]);

  const isLoading = loadingSales || loadingProducts;

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Deep Analytics & Insights"
        subtitle="Revenue trajectories, customer loyalty, category mix, and payment intelligence"
      />

      {isLoading ? (
        <PageSkeleton rows={8} cols={4} />
      ) : (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* Analytics Tabs - Responsive Horizontal Scroll on mobile */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'revenue'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Revenue Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Performance</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'customers'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer Intelligence</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'coupons'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Promotions & Coupons</span>
          </button>
        </div>

        {/* Tab 1: Revenue Reports */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white">Top Products by Revenue</h3>
              <p className="text-xs text-slate-400">Revenue breakdown for best-performing catalog items</p>
              <AnalyticsBarChart
                data={productAnalytics.topSellers.slice(0, 7).map((s) => ({ label: s.name.split(' ').slice(0, 2).join(' '), value: s.revenueRupees }))}
                valuePrefix="₹"
                height={280}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Product Performance */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white">Top Sellers by Quantity & Revenue</h3>
              <div className="divide-y divide-slate-800">
                {productAnalytics.topSellers.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-indigo-400 text-sm">#{idx + 1}</span>
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-slate-500">{item.category} • {item.quantity} units sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">₹{item.revenueRupees}</div>
                      <div className="text-[10px] text-emerald-400">High velocity</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {/* Category Breakdown Donut */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Revenue by Category</h3>
                <AnalyticsPieChart data={productAnalytics.categoryData.map((c) => ({ ...c, count: 1 }))} />
                <div className="space-y-1.5 text-xs">
                  {productAnalytics.categoryData.map((cat) => (
                    <div key={cat.name} className="flex justify-between items-center text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-semibold text-white">₹{cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slow Movers Alert */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-amber-400">Zero-Sale Catalog Items</h3>
                <div className="space-y-2 text-xs">
                  {productAnalytics.slowMovers.length === 0 ? (
                    <p className="text-slate-500">All catalog items have recorded sales!</p>
                  ) : (
                    productAnalytics.slowMovers.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-xl bg-slate-850 dark:bg-slate-800/40 border border-slate-800 flex justify-between"
                      >
                        <span className="text-slate-300 truncate max-w-[160px]">{p.name}</span>
                        <CurrencyDisplay paise={p.pricePaise} size="sm" weight="normal" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Intelligence */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Unique Customers
                </span>
                <div className="text-2xl font-bold text-white mt-2 tabular-nums">
                  {customerAnalytics.totalCustomers}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Repeat Customers
                </span>
                <div className="text-2xl font-bold text-indigo-400 mt-2 tabular-nums">
                  {customerAnalytics.repeatCount}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Average Lifetime Spend
                </span>
                <div className="mt-2">
                  <CurrencyDisplay paise={customerAnalytics.avgSpendPaise} size="xl" />
                </div>
              </div>
            </div>

            {/* Customer Directory Table */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Customer Directory</h3>
                <p className="text-xs text-slate-400">Extracted from counter POS transactions</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {customerAnalytics.customersList.map((cust, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span>{cust.name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">{cust.phone}</td>
                        <td className="py-3 px-4 text-slate-300">{cust.orderCount} bill(s)</td>
                        <td className="py-3 px-4 font-bold text-indigo-400">
                          <CurrencyDisplay paise={cust.totalSpentPaise} size="sm" weight="bold" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Promotions & Coupon Impact */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white">Discount Impact</h3>
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 space-y-1">
                <span className="text-xs text-indigo-300">Total Discount Granted to Date</span>
                <div>
                  <CurrencyDisplay paise={couponAnalytics.totalDiscountPaise} size="xl" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Transactions with Applied Coupon</span>
                <div className="text-xl font-bold text-white">
                  {couponAnalytics.couponSalesCount} orders
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white">Active Promo Codes</h3>
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-850 dark:bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-white">{c.code}</span>
                      <span className="text-slate-400 ml-2">
                        {c.type === 'fixed' ? `₹${c.amountPaise / 100} off` : `${c.discountPercent}% off`}
                      </span>
                    </div>
                    <span className="text-slate-300">{c.usageCount || 0} redeemed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
