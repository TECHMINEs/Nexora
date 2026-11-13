import React from 'react';
import type { BandBadgeProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function BandBadge({ band }: BandBadgeProps): JSX.Element {
  const colorClasses = {
    High: 'bg-red-950/40 text-band-high border-red-500/40',
    Medium: 'bg-panel-2 text-band-medium border-stroke',
    Low: 'bg-green-950/40 text-band-low border-green-500/40',
    Unknown: 'bg-[#0a0a0a] text-band-unknown border-line',
    Good: 'bg-green-950/40 text-band-low border-green-500/40',
    Poor: 'bg-red-950/40 text-band-high border-red-500/40',
  }[band] ?? 'bg-[#0a0a0a] text-band-unknown border-line';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border',
        colorClasses
      )}
    >
      {band}
    </span>
  );
}
