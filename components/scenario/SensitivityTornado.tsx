'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { formatINR } from '@/lib/format';
import type { SensitivityTornadoProps } from '@/lib/types';

export function SensitivityTornado({ result }: SensitivityTornadoProps): JSX.Element {
  const driverLabels: Record<string, string> = {
    downtimeDays: 'Facility Downtime (days)',
    inventoryLossFraction: 'Inventory Loss Share',
    supplierInterruptionDays: 'Supplier Interruption (days)',
  };

  const chartData = result.bands.map((b) => ({
    driverKey: b.driver,
    name: driverLabels[b.driver] ?? b.driver,
    swing: b.swing,
    minTotal: Math.min(...b.points.map((p) => p.total)),
    maxTotal: Math.max(...b.points.map((p) => p.total)),
    outside: b.baseOutsideBand,
  }));

  chartData.sort((a, b) => b.swing - a.swing);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted-foreground pb-1">
        <span>Loss swing by input driver</span>
        <span className="font-mono text-[11px] text-ink">
          Loss Envelope: {formatINR(result.envelope.min)} &minus; {formatINR(result.envelope.max)}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">Bars show the range in modelled loss when each input changes. Red marks a baseline outside the tested range.</p>
      <div className="w-full overflow-x-auto" role="region" aria-label="Sensitivity chart, scroll horizontally on small screens">
      <div className="h-56 min-w-[540px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 24, left: 8, bottom: 10 }}
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
              width={160}
            />
            <Tooltip
              formatter={(val: unknown) => [
                formatINR(typeof val === 'number' ? val : Number(val) || 0),
                'Loss Swing Range',
              ]}
            />
            <Bar dataKey="swing" fill="#FFFFFF" radius={0}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.outside ? '#FF2626' : '#FFFFFF'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      </div>

      <div className="space-y-1 text-[11px] text-muted-foreground bg-canvas p-2 rounded border border-line">
        <div className="font-semibold text-ink">Driver Dominance Hierarchy:</div>
        <div className="font-mono text-[10px]">
          {result.ranking.map((r, i) => `${i + 1}. ${driverLabels[r]}`).join(' > ')}
        </div>
        {chartData.some((d) => d.outside) && (
          <p className="text-white text-[10px] pt-1">
            Red drivers contain baseline scenario values outside the standard sensitivity test bounds.
          </p>
        )}
      </div>
    </div>
  );
}
