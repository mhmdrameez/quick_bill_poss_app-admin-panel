// components/charts/AnalyticsBarChart.tsx
'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface Props {
  data: { label: string; value: number; color?: string }[];
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string;
  height?: number;
}

export default function AnalyticsBarChart({
  data,
  valuePrefix = '₹',
  valueSuffix = '',
  color = '#6366F1',
  height = 280,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis
          stroke="#64748B"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) =>
            `${valuePrefix}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}${valueSuffix}`
          }
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
          formatter={(val: any) => [`${valuePrefix}${Number(val).toLocaleString('en-IN')}${valueSuffix}`]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color || color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
