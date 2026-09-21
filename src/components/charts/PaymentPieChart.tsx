// components/charts/PaymentPieChart.tsx
// Lazy-loaded — keeps recharts out of the initial bundle
'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  count: number;
  color: string;
}

interface Props {
  data: DataPoint[];
}

export default function PaymentPieChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
        No payment data yet
      </div>
    );
  }

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={45}
            outerRadius={68}
            paddingAngle={4}
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
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
            formatter={(val: any, name: any, props: any) => [
              `₹${val} (${props.payload.count} txns)`,
              props.payload.name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
