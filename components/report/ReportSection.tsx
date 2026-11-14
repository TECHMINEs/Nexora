'use client';

import React from 'react';
import type { ReportSectionProps } from '@/lib/types';

export function ReportSection({ id, title, children }: ReportSectionProps): JSX.Element {
  const sourceReference = title.match(/\(([^)]*§[^)]*)\)$/)?.[1];
  const displayTitle = sourceReference ? title.replace(/\s*\([^)]*§[^)]*\)$/, '') : title;
  return (
    <section id={id} className="space-y-3 pt-4 border-t border-line first:border-0 first:pt-0">
      <h2 className="text-base font-bold font-display text-ink flex items-center justify-between">
        <span>{displayTitle}</span>
        <a href={`#${id}`} className="text-[11px] font-mono text-muted-foreground hover:text-brand-700">
          #{id}
        </a>
      </h2>
      {sourceReference && <details className="text-xs text-muted-foreground">
        <summary className="w-fit cursor-pointer text-brand-400">Source reference</summary>
        <span className="mt-1 block font-mono">{sourceReference}</span>
      </details>}
      <div>{children}</div>
    </section>
  );
}
