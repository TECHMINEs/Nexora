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
    strong: 'bg-green-950/40 text-green-400 border-green-500/40 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800',
    fair: 'bg-panel-2 text-white border-stroke dark:bg-panel-2 dark:text-white dark:border-stroke',
    weak: 'bg-red-950/40 text-red-400 border-red-500/40 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
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
