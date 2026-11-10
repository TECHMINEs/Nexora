'use client';

import React from 'react';
import { confidenceTier, formatConfidence } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface ConfidenceChipProps {
  confidence: number;
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceChip({
  confidence,
  showLabel = false,
  className,
}: ConfidenceChipProps): JSX.Element {
  const tier = confidenceTier(confidence);
  const formatted = formatConfidence(confidence);

  const tierClasses = {
    strong: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    fair: 'bg-amber-950/40 text-amber-400 border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    weak: 'bg-rose-950/40 text-rose-400 border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  }[tier];

  return (
    <span
      title={`Data confidence: ${formatted} (${tier})`}
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium leading-none select-none',
        tierClasses,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      <span>{formatted}</span>
      {showLabel && (
        <span className="text-[10px] uppercase tracking-wider opacity-80">
          {tier}
        </span>
      )}
    </span>
  );
}
