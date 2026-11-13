'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatINR, coverageClassLabel } from '@/lib/format';
import type { GapBarsProps } from '@/lib/types';

export function GapBars({ gap }: GapBarsProps): JSX.Element {
  const chartData = gap.rows.map((r) => ({
    name: coverageClassLabel(r.coverageClass),
    usable: r.usableProtection.value,
    gap: r.gap.value,
  }));

  return (
    <div className="h-64 w-full pt-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 120, bottom: 5 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v) => formatINR(v, { unit: 'cr', digits: 1 })}
            tick={{ fontSize: 10, fill: '#A3A3A3' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#FFFFFF' }}
            width={110}
          />
          <Tooltip
            formatter={(val: unknown) => [
              formatINR(typeof val === 'number' ? val : Number(val) || 0),
            ]}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Bar
            dataKey="usable"
            name="Usable Insurance Protection"
            fill="#FFFFFF"
            stackId="stack"
          />
          <Bar
            dataKey="gap"
            name="Potential Protection Gap"
            fill="#FF2626"
            stroke="#A9A9A9"
            strokeWidth={1}
            stackId="stack"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
