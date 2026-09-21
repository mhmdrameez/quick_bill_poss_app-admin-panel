// components/common/SkeletonCard.tsx
'use client';

import React from 'react';

/** Shimmer base — uses only Tailwind's animate-pulse, no custom CSS needed */
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-800/60 ${className}`} />
);

/** KPI stat card skeleton (6-up grid on dashboard) */
export const KpiCardSkeleton: React.FC = () => (
  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between gap-3">
    <div className="flex justify-between items-start">
      <Shimmer className="h-3 w-16" />
      <Shimmer className="h-7 w-7 rounded-lg" />
    </div>
    <div className="space-y-1.5">
      <Shimmer className="h-6 w-24" />
      <Shimmer className="h-2.5 w-12" />
    </div>
  </div>
);

/** Full chart area skeleton */
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-56 sm:h-72' }) => (
  <div className={`${height} w-full flex flex-col gap-2 justify-end`}>
    <div className="flex items-end gap-1 h-full px-2">
      {[40, 65, 35, 80, 55, 90, 45, 70, 30, 85, 60, 75].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md animate-pulse bg-slate-800/60"
          style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
    <div className="flex gap-1 px-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Shimmer key={i} className="flex-1 h-2" />
      ))}
    </div>
  </div>
);

/** Table row skeleton */
export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60">
    {Array.from({ length: cols }).map((_, i) => (
      <Shimmer
        key={i}
        className={`h-4 rounded ${
          i === 0 ? 'w-24 shrink-0' : i === cols - 1 ? 'w-16 shrink-0 ml-auto' : 'flex-1'
        }`}
      />
    ))}
  </div>
);

/** Generic list-page skeleton: header + table rows */
export const PageSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 8,
  cols = 5,
}) => (
  <div className="flex-1 flex flex-col w-full">
    {/* Header skeleton */}
    <div className="h-16 px-4 sm:px-8 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
      <Shimmer className="h-5 w-40" />
      <div className="flex gap-2">
        <Shimmer className="h-8 w-24 rounded-xl" />
        <Shimmer className="h-8 w-8 rounded-xl" />
      </div>
    </div>
    {/* Table area */}
    <div className="flex-1 p-4 sm:p-6 space-y-3">
      {/* Toolbar */}
      <div className="flex gap-2 mb-4">
        <Shimmer className="h-9 w-60 rounded-xl" />
        <Shimmer className="h-9 w-32 rounded-xl" />
        <Shimmer className="h-9 w-32 rounded-xl ml-auto" />
      </div>
      {/* Rows */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </div>
    </div>
  </div>
);

/** Dashboard-specific skeleton: 6 KPI cards + chart + 3 panels */
export const DashboardSkeleton: React.FC = () => (
  <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
    {/* KPI row */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
    {/* Chart panel */}
    <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <Shimmer className="h-5 w-36" />
          <Shimmer className="h-3 w-52" />
        </div>
        <div className="flex gap-1">
          <Shimmer className="h-7 w-12 rounded-lg" />
          <Shimmer className="h-7 w-16 rounded-lg" />
          <Shimmer className="h-7 w-12 rounded-lg" />
          <Shimmer className="h-7 w-16 rounded-lg" />
        </div>
      </div>
      <ChartSkeleton />
    </div>
    {/* Bottom 3-col grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
        >
          <div className="space-y-1.5">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-3 w-44" />
          </div>
          <Shimmer className="h-44 rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <Shimmer key={j} className="h-8 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
