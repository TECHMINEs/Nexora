'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { formatOffsetHours } from '@/lib/format';
import type { SignalChartProps } from '@/lib/types';

const signalNames: Record<string, string> = {
  rain24hMm: '24-hour rainfall',
  windKmh: 'Wind speed',
  tankTempC: 'Tank temperature',
  vapourPpm: 'Vapour concentration',
};

export function SignalChart({ replayCase, thresholds, stepIndex }: SignalChartProps): JSX.Element {
  const steps = replayCase.steps;
  const signals = Array.from(new Set(steps.flatMap((step) => step.signals.map((reading) => reading.signal))));
  const currentOffset = steps[stepIndex] ? formatOffsetHours(steps[stepIndex].offsetHours) : undefined;

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Each signal has its own scale and unit. Points are replay steps; horizontal spacing does not represent elapsed time.
        The red vertical line marks the current step.
      </p>
      <div className="grid min-w-0 grid-cols-1 xl:grid-cols-2 gap-4">
        {signals.map((signal) => {
          const threshold = thresholds.find((item) => item.signal === signal);
          const unit = threshold?.unit ?? steps.flatMap((step) => step.signals).find((reading) => reading.signal === signal)?.unit ?? '';
          const data = steps.map((step) => ({
            offset: formatOffsetHours(step.offsetHours),
            value: step.signals.find((reading) => reading.signal === signal)?.value ?? null,
          }));

          return (
            <div key={signal} className="min-w-0 border border-line bg-[#080808] p-3 sm:p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{signalNames[signal] ?? signal}</h3>
                <span className="text-xs font-mono text-neutral-400">{unit}</span>
              </div>
              <div className="mt-3 h-56 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 12, right: 14, left: 0, bottom: 2 }}>
                    <XAxis dataKey="offset" tick={{ fontSize: 10, fill: '#A9A9A9' }} minTickGap={18} interval="preserveStartEnd" />
                    <YAxis width={42} tick={{ fontSize: 10, fill: '#A9A9A9' }} />
                    <Tooltip formatter={(value: unknown) => [`${value} ${unit}`, signalNames[signal] ?? signal]} />
                    {threshold && <ReferenceLine y={threshold.watchAt} stroke="#A9A9A9" strokeDasharray="4 4" />}
                    {threshold && <ReferenceLine y={threshold.alertAt} stroke="#FF2626" strokeDasharray="4 4" />}
                    {currentOffset && <ReferenceLine x={currentOffset} stroke="#FF2626" strokeDasharray="2 3" />}
                    <Line type="monotone" dataKey="value" name={signalNames[signal] ?? signal} stroke="#FFFFFF" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {threshold && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
                <span>Watch: {threshold.watchAt} {unit}</span>
                <span className="text-[#FF6B6B]">Alert: {threshold.alertAt} {unit}</span>
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
