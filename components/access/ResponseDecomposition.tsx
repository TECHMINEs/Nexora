'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { ResponseDecompositionProps } from '@/lib/types';

export function ResponseDecomposition({ stats }: ResponseDecompositionProps): JSX.Element {
  const chartData = stats.map((st) => ({
    name: st.resource.label.split(':')[0] ?? st.resource.id,
    dispatch: Number(st.meanDecomposition.dispatch.toFixed(2)),
    mobilise: Number(st.meanDecomposition.mobilise.toFixed(2)),
    travel: Number(st.meanDecomposition.travel.toFixed(2)),
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1">
        <span>Mean Response Time Decomposition (§45)</span>
        <span className="font-mono text-[10px]">Dispatch + Mobilisation + Transit</span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis
              type="number"
              unit=" min"
              tick={{ fontSize: 10, fill: '#A3A3A3' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#FFFFFF' }}
              width={90}
            />
            <Tooltip
              formatter={(val: unknown) => [
                `${typeof val === 'number' ? val.toFixed(2) : val} min`,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
            <Bar dataKey="dispatch" name="Dispatch Triage" fill="#A9A9A9" stackId="a" />
            <Bar dataKey="mobilise" name="Crew Mobilisation" fill="#FFFFFF" stackId="a" />
            <Bar dataKey="travel" name="Road Transit" fill="#FF2626" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
