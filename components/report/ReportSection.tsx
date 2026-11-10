'use client';

import React from 'react';
import type { ReportSectionProps } from '@/lib/types';

export function ReportSection({ id, title, children }: ReportSectionProps): JSX.Element {
  return (
    <section id={id} className="space-y-3 pt-4 border-t border-line first:border-0 first:pt-0">
      <h2 className="text-base font-bold font-display text-ink flex items-center justify-between">
        <span>{title}</span>
        <a href={`#${id}`} className="text-[11px] font-mono text-muted-foreground hover:text-brand-700">
          #{id}
        </a>
      </h2>
      <div>{children}</div>
    </section>
  );
}
