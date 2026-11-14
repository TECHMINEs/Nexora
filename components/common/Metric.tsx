'use client';

import React from 'react';
import { formatValue } from '@/lib/format';
import { AssumptionLink } from './AssumptionLink';
import { BandBadge } from './BandBadge';
import type { MetricProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function Metric({
  label,
  tracked,
  kind,
  band,
  size = 'md',
  caption,
  facilityId,
}: MetricProps): JSX.Element {
  const formatted = typeof tracked.value === 'number'
    ? formatValue(kind, tracked.value)
    : String(tracked.value);

  const valueSizeClass = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold font-display',
    lg: 'text-3xl font-extrabold font-display',
  }[size];

  return (
    <div className="flex min-w-0 flex-col gap-2 p-4 bg-card border border-line shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-snug">
          {label}
        </span>
        {band && <BandBadge band={band} />}
      </div>

      <div className="my-1 min-w-0" title={`Data confidence: ${Math.round(tracked.confidence * 100)}%. Open sources and assumptions for details.`}>
        <span className={cn('text-ink tracking-tight tabular-nums break-words', valueSizeClass)}>
          {formatted}{kind === 'score100' && <span className="ml-1 text-sm font-medium text-muted-foreground">/100</span>}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-line/60">
        <span className="min-w-0 text-xs text-muted-foreground leading-snug" title={caption || tracked.section}>
          {caption || 'Review the source and assumptions'}
        </span>
        <AssumptionLink
          assumptionIds={tracked.assumptionIds}
          sourceIds={tracked.sourceIds}
          section={tracked.section}
          facilityId={facilityId}
        />
      </div>
    </div>
  );
}
