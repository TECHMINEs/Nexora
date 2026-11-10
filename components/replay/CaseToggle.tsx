'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { CaseToggleProps } from '@/lib/types';

export function CaseToggle({ value, onChange }: CaseToggleProps): JSX.Element {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg border border-line">
      <Button
        variant={value === 'amphan-2020' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('amphan-2020')}
        className={`text-xs h-7 px-3 font-semibold ${
          value === 'amphan-2020' ? 'bg-brand-500 text-white shadow-sm' : 'text-muted-foreground'
        }`}
      >
        Cyclone Amphan (2020) &bull; West Bengal
      </Button>

      <Button
        variant={value === 'vizag-release-2020' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('vizag-release-2020')}
        className={`text-xs h-7 px-3 font-semibold ${
          value === 'vizag-release-2020' ? 'bg-brand-500 text-white shadow-sm' : 'text-muted-foreground'
        }`}
      >
        Monomer Vapour Release (2020) &bull; Visakhapatnam
      </Button>
    </div>
  );
}
