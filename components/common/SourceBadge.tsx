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
    official: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    partner: 'border-orange-500/40 bg-orange-950/40 text-orange-400 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    customer: 'border-red-900/40 bg-[#0a0a0a] text-neutral-200 dark:bg-[#050505] dark:text-neutral-300 dark:border-red-900/40',
    open: 'border-teal-500/40 bg-teal-950/40 text-teal-400 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    estimated: 'border-orange-500/40 bg-orange-950/40 text-orange-400 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
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
        <span className="rounded bg-rose-950/40 px-1 text-[9px] font-bold text-rose-400 uppercase dark:bg-rose-900/60 dark:text-rose-300">
          Gated
        </span>
      )}
    </span>
  );
}
