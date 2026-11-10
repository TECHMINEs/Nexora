'use client';

import React from 'react';
import { formatValue } from '@/lib/format';
import { ConfidenceChip } from './ConfidenceChip';
import { AssumptionLink } from './AssumptionLink';
import type { TrackedCellProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function TrackedCell({
  tracked,
  kind,
  facilityId,
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
      <span className="font-medium text-ink tabular-nums">{formatted}</span>
      <ConfidenceChip confidence={tracked.confidence} />
      <AssumptionLink
        assumptionIds={tracked.assumptionIds}
        sourceIds={tracked.sourceIds}
        section={tracked.section}
        facilityId={facilityId}
      />
    </div>
  );
}
