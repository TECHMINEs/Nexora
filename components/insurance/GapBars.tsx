'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { formatINR, coverageClassLabel } from '@/lib/format';
import type { GapBarsProps } from '@/lib/types';

export function GapBars({ gap }: GapBarsProps): JSX.Element {
  const chartData = gap.rows.map((r) => ({
    name: coverageClassLabel(r.coverageClass),
    usable: r.usableProtection.value,
    gap: r.gap.value,
  }));

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-300" aria-label="Insurance chart legend">
        <span><span className="text-white">■</span> Usable protection</span>
        <span><span className="text-[#FF2626]">■</span> Potential gap</span>
        <span>Amounts in ₹ crore</span>
      </div>
      <div className="w-full overflow-x-auto" role="region" aria-label="Insurance gap chart, scroll horizontally on small screens">
      <div className="h-72 min-w-[540px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 22, left: 8, bottom: 12 }}
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
            width={150}
          />
          <Tooltip
            formatter={(val: unknown) => [
              formatINR(typeof val === 'number' ? val : Number(val) || 0),
            ]}
          />
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
      </div>
    </div>
  );
}
