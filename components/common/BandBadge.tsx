import React from 'react';
import type { BandBadgeProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function BandBadge({ band }: BandBadgeProps): JSX.Element {
  const colorClasses = {
    High: 'bg-red-950/40 text-band-high border-red-500/40',
    Medium: 'bg-amber-950/40 text-band-medium border-amber-500/40',
    Low: 'bg-emerald-950/40 text-band-low border-emerald-500/40',
    Unknown: 'bg-[#0a0a0a] text-band-unknown border-red-900/40',
    Good: 'bg-emerald-950/40 text-band-low border-emerald-500/40',
    Poor: 'bg-red-950/40 text-band-high border-red-500/40',
  }[band] ?? 'bg-[#0a0a0a] text-band-unknown border-red-900/40';

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
