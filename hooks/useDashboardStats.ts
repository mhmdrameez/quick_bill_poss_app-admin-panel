// hooks/useDashboardStats.ts
'use client';

import { useMemo } from 'react';
import { CompletedSale, Product, Coupon, SavedOrder, TimeRange } from '@/lib/types';
import { getStartOfDay, getEndOfDay } from '@/lib/dates';

interface DashboardStatsProps {
  sales: CompletedSale[];
  products: Product[];
  coupons: Coupon[];
  savedOrders: SavedOrder[];
  selectedRange?: TimeRange;
}

export function useDashboardStats({
  sales,
  products,
  coupons,
  savedOrders,
  selectedRange = 'today',
}: DashboardStatsProps) {
  return useMemo(() => {
    const now = Date.now();
    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);

    // Filter sales for today
    const todaySales = sales.filter(
      (s) => s.completedAt >= todayStart && s.completedAt <= todayEnd
    );
    const todayValidSales = todaySales.filter((s) => s.status === 'completed');
    const todayCancelledSales = todaySales.filter((s) => s.status === 'cancelled');

    const todayRevenuePaise = todayValidSales.reduce((sum, s) => sum + (s.grandTotalPaise || 0), 0);
    const todaySalesCount = todayValidSales.length;
    const todayAverageOrderPaise = todaySalesCount > 0 ? Math.round(todayRevenuePaise / todaySalesCount) : 0;

    const activeProductsCount = products.filter((p) => !p.isDeleted).length;
    const pendingOrdersCount = savedOrders.filter((o) => o.status === 'draft').length;
    const activeCouponsCount = coupons.filter((c) => c.status === 'active').length;

    const totalSalesAllTime = sales.length;
    const totalCancelledAllTime = sales.filter((s) => s.status === 'cancelled').length;
    const cancellationRatePercent = totalSalesAllTime > 0
      ? Number(((totalCancelledAllTime / totalSalesAllTime) * 100).toFixed(1))
      : 0;

    // Payment method breakdown for selected range
    const rangeValidSales = sales.filter((s) => s.status === 'completed');
    const paymentMap: Record<string, { count: number; totalPaise: number }> = {
      cash: { count: 0, totalPaise: 0 },
      upi: { count: 0, totalPaise: 0 },
      card: { count: 0, totalPaise: 0 },
      split: { count: 0, totalPaise: 0 },
    };

    rangeValidSales.forEach((sale) => {
      const pm = (sale.paymentMethod || 'cash').toLowerCase();
      if (!paymentMap[pm]) {
        paymentMap[pm] = { count: 0, totalPaise: 0 };
      }
      paymentMap[pm].count += 1;
      paymentMap[pm].totalPaise += sale.grandTotalPaise || 0;
    });

    const paymentBreakdownData = [
      { name: 'UPI', value: paymentMap.upi.totalPaise / 100, count: paymentMap.upi.count, color: '#6366F1' },
      { name: 'Cash', value: paymentMap.cash.totalPaise / 100, count: paymentMap.cash.count, color: '#10B981' },
      { name: 'Card', value: paymentMap.card.totalPaise / 100, count: paymentMap.card.count, color: '#F59E0B' },
      { name: 'Split', value: paymentMap.split.totalPaise / 100, count: paymentMap.split.count, color: '#EC4899' },
    ].filter((p) => p.count > 0 || p.value > 0);

    // Hourly distribution for today (24 hours)
    const hourlyDistribution: Array<{ hour: string; salesCount: number; revenueRupees: number }> = [];
    for (let h = 0; h < 24; h++) {
      const hourLabel = `${h.toString().padStart(2, '0')}:00`;
      hourlyDistribution.push({
        hour: hourLabel,
        salesCount: 0,
        revenueRupees: 0,
      });
    }

    todayValidSales.forEach((sale) => {
      const saleDate = new Date(sale.completedAt);
      const hour = saleDate.getHours();
      if (hourlyDistribution[hour]) {
        hourlyDistribution[hour].salesCount += 1;
        hourlyDistribution[hour].revenueRupees += Math.round((sale.grandTotalPaise || 0) / 100);
      }
    });

    // Top 5 Products by Revenue
    const productRevenueMap: Record<string, { name: string; quantity: number; revenuePaise: number }> = {};
    rangeValidSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const key = item.id || item.name;
        if (!productRevenueMap[key]) {
          productRevenueMap[key] = {
            name: item.name,
            quantity: 0,
            revenuePaise: 0,
          };
        }
        productRevenueMap[key].quantity += item.quantity || 1;
        productRevenueMap[key].revenuePaise += Math.round((item.unitPricePaise || 0) * (item.quantity || 1));
      });
    });

    const topProducts = Object.values(productRevenueMap)
      .sort((a, b) => b.revenuePaise - a.revenuePaise)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        quantity: p.quantity,
        revenueRupees: Math.round(p.revenuePaise / 100),
      }));

    // Timeline chart data based on selected range
    const timelineData: Array<{ label: string; revenue: number; orders: number }> = [];
    if (selectedRange === 'today' || selectedRange === 'yesterday') {
      const targetDateStart = selectedRange === 'today' ? todayStart : getStartOfDay(now - 86400000);
      const targetDateEnd = selectedRange === 'today' ? todayEnd : getEndOfDay(now - 86400000);

      const targetSales = sales.filter(
        (s) => s.completedAt >= targetDateStart && s.completedAt <= targetDateEnd && s.status === 'completed'
      );

      for (let h = 8; h <= 22; h += 2) {
        const startH = targetDateStart + h * 3600000;
        const endH = startH + 2 * 3600000;
        const periodSales = targetSales.filter((s) => s.completedAt >= startH && s.completedAt < endH);
        const sumPaise = periodSales.reduce((sum, s) => sum + s.grandTotalPaise, 0);

        timelineData.push({
          label: `${h}:00`,
          revenue: Math.round(sumPaise / 100),
          orders: periodSales.length,
        });
      }
    } else {
      // 7 days or 30 days
      const daysCount = selectedRange === '30d' ? 30 : 7;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const dStart = getStartOfDay(d);
        const dEnd = getEndOfDay(d);
        const daySales = sales.filter(
          (s) => s.completedAt >= dStart && s.completedAt <= dEnd && s.status === 'completed'
        );
        const dayRevPaise = daySales.reduce((sum, s) => sum + s.grandTotalPaise, 0);

        timelineData.push({
          label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          revenue: Math.round(dayRevPaise / 100),
          orders: daySales.length,
        });
      }
    }

    // Recent Activity Feed (last 10 events)
    const recentActivity = sales
      .slice(0, 10)
      .map((sale) => ({
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        grandTotalPaise: sale.grandTotalPaise,
        status: sale.status,
        timestamp: sale.editedAt || sale.cancelledAt || sale.completedAt,
        type: sale.status === 'cancelled' ? 'CANCELLED' : sale.editedAt ? 'EDITED' : 'CREATED',
        customerName: sale.customer?.name || 'Walk-in Customer',
        registerCode: sale.registerCode || 'REG-A',
        paymentMethod: sale.paymentMethod,
      }));

    return {
      kpis: {
        todayRevenuePaise,
        todaySalesCount,
        todayAverageOrderPaise,
        activeProductsCount,
        pendingOrdersCount,
        activeCouponsCount,
        cancellationRatePercent,
      },
      paymentBreakdownData,
      hourlyDistribution,
      topProducts,
      timelineData,
      recentActivity,
    };
  }, [sales, products, coupons, savedOrders, selectedRange]);
}
