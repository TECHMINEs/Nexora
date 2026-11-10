'use client';

import React from 'react';
import { formatValue } from '@/lib/format';
import { ConfidenceChip } from './ConfidenceChip';
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
    <div className="flex flex-col gap-1 p-3 bg-card border rounded-lg shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {band && <BandBadge band={band} />}
      </div>

      <div className="flex items-baseline justify-between gap-2 my-0.5">
        <span className={cn('text-ink tracking-tight', valueSizeClass)}>
          {formatted}
        </span>
        <ConfidenceChip confidence={tracked.confidence} />
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-line/60">
        <span className="text-[11px] text-muted-foreground truncate" title={caption || tracked.section}>
          {caption || tracked.section}
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
