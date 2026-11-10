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

  // Sorted by swing desc
  chartData.sort((a, b) => b.swing - a.swing);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1">
        <span>§42.1 Sensitivity Bands (Loss Swing Ranking)</span>
        <span className="font-mono text-[11px] text-ink">
          Loss Envelope: {formatINR(result.envelope.min)} &minus; {formatINR(result.envelope.max)}
        </span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
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
              width={130}
            />
            <Tooltip
              formatter={(val: unknown) => [
                formatINR(typeof val === 'number' ? val : Number(val) || 0),
                'Loss Swing Range',
              ]}
            />
            <Bar dataKey="swing" fill="#00FFFF" radius={0}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.outside ? '#FF5F1F' : '#00FFFF'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1 text-[11px] text-muted-foreground bg-canvas p-2 rounded border border-line">
        <div className="font-semibold text-ink">Driver Dominance Hierarchy:</div>
        <div className="font-mono text-[10px]">
          {result.ranking.map((r, i) => `${i + 1}. ${driverLabels[r]}`).join(' > ')}
        </div>
        {chartData.some((d) => d.outside) && (
          <p className="text-amber-400 text-[10px] pt-1">
            Highlighted drivers contain baseline scenario values outside standard §42.1 test bounds.
          </p>
        )}
      </div>
    </div>
  );
}
