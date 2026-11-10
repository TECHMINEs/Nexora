'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { formatOffsetHours } from '@/lib/format';
import type { SignalChartProps } from '@/lib/types';

export function SignalChart({
  replayCase,
  thresholds,
  stepIndex,
}: SignalChartProps): JSX.Element {
  const steps = replayCase.steps;

  // Build telemetry signals series over offset hours
  const chartData = steps.map((st, idx) => {
    const pt: Record<string, number | string | boolean> = {
      offset: formatOffsetHours(st.offsetHours),
      offsetHours: st.offsetHours,
      active: idx <= stepIndex,
    };
    st.signals.forEach((sig) => {
      pt[sig.signal] = sig.value;
    });
    return pt;
  });

  // Identify signals present
  const signals = Array.from(
    new Set(steps.flatMap((st) => st.signals.map((s) => s.signal)))
  );

  const signalColors: Record<string, string> = {
    rain24hMm: '#00FFFF',
    windKmh: '#FF5F1F',
    tankTempC: '#c2410c',
    vapourPpm: '#b91c1c',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1">
        <span>Signal Evolution vs Calibrated Operating Thresholds</span>
        <span className="font-mono text-[10px]">Dashed lines = Watch/Alert triggers</span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
            <XAxis dataKey="offset" tick={{ fontSize: 11, fill: '#FFFFFF' }} />
            <YAxis tick={{ fontSize: 10, fill: '#A3A3A3' }} />
            <Tooltip
              formatter={(val: unknown, name: unknown) => [
                `${typeof val === 'number' ? val : val}`,
                String(name),
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

            {/* Threshold Reference Lines */}
            {thresholds.map((th) => (
              <ReferenceLine
                key={`alert-${th.signal}`}
                y={th.alertAt}
                stroke="#c2410c"
                strokeDasharray="3 3"
                label={{
                  value: `${th.signal} Alert (≥${th.alertAt})`,
                  position: 'top',
                  fontSize: 9,
                  fill: '#c2410c',
                }}
              />
            ))}

            {signals.map((sig) => (
              <Line
                key={sig}
                type="monotone"
                dataKey={sig}
                stroke={signalColors[sig] ?? '#00FFFF'}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
