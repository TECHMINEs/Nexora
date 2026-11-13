'use client';

import React from 'react';
import { getSource } from '@/data';
import { cn } from '@/lib/utils';

export interface SourceBadgeProps {
  sourceId: string;
  className?: string;
}

export function SourceBadge({ sourceId, className }: SourceBadgeProps): JSX.Element {
  let source;
  try {
    source = getSource(sourceId);
  } catch {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded border border-muted bg-muted/50 px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground',
          className
        )}
      >
        {sourceId}
      </span>
    );
  }

  const authorityColor = {
    official: 'border-stroke bg-panel-2 text-white dark:bg-panel-2 dark:text-white dark:border-stroke',
    partner: 'border-stroke bg-panel-2 text-white dark:bg-panel-2 dark:text-white dark:border-stroke',
    customer: 'border-line bg-[#0a0a0a] text-neutral-200 dark:bg-[#050505] dark:text-neutral-300 dark:border-line',
    open: 'border-stroke bg-panel-2 text-white dark:bg-panel-2 dark:text-white dark:border-stroke',
    estimated: 'border-stroke bg-panel-2 text-white dark:bg-panel-2 dark:text-white dark:border-stroke',
  }[source.authority];

  return (
    <span
      title={`${source.name} (${source.authority}, ${source.licence})`}
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none',
        authorityColor,
        className
      )}
    >
      <span className="font-mono text-[10px] font-semibold">{source.id}</span>
      {source.licence === 'uncertain' && (
        <span className="rounded bg-red-950/40 px-1 text-[9px] font-bold text-red-400 uppercase dark:bg-red-900/60 dark:text-red-300">
          Gated
        </span>
      )}
    </span>
  );
}
