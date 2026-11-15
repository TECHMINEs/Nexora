'use client';

import React from 'react';
import { formatValue } from '@/lib/format';
import type { TrackedCellProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function TrackedCell({
  tracked,
  kind,
  align = 'left',
}: TrackedCellProps): JSX.Element {
  const formatted = typeof tracked.value === 'number'
    ? formatValue(kind, tracked.value)
    : String(tracked.value);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap',
        align === 'right' ? 'justify-end w-full' : 'justify-start'
      )}
    >
      <span className="font-medium text-ink tabular-nums">
        {formatted}{kind === 'score100' && <span className="text-muted-foreground">/100</span>}
      </span>
    </div>
  );
}
