'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { CaseToggleProps } from '@/lib/types';

export function CaseToggle({ value, onChange }: CaseToggleProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-lg border border-line bg-muted/50 p-2 sm:grid-cols-2" role="group" aria-label="Choose a replay case">
      <Button
        variant={value === 'amphan-2020' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('amphan-2020')}
        className={`h-auto min-h-11 whitespace-normal px-3 py-2 text-center text-xs leading-snug font-semibold ${
          value === 'amphan-2020' ? 'bg-brand-500 text-black shadow-sm' : 'text-muted-foreground'
        }`}
      >
        Cyclone Amphan (2020) &bull; West Bengal
      </Button>

      <Button
        variant={value === 'vizag-release-2020' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('vizag-release-2020')}
        className={`h-auto min-h-11 whitespace-normal px-3 py-2 text-center text-xs leading-snug font-semibold ${
          value === 'vizag-release-2020' ? 'bg-brand-500 text-black shadow-sm' : 'text-muted-foreground'
        }`}
      >
        Monomer Vapour Release (2020) &bull; Visakhapatnam
      </Button>
    </div>
  );
}
