'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useDemoStore } from '@/lib/store';
import { RotateCcw } from 'lucide-react';
import type { FacilityHeaderProps } from '@/lib/types';

export function FacilityHeader({ facility }: FacilityHeaderProps): JSX.Element {
  const { resetDemo } = useDemoStore();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card border-b border-line">
      <div className="space-y-0.5">
        <h1 className="text-xl sm:text-2xl font-bold font-display leading-snug text-ink" title={`Source reference: ${facility.section}`}>{facility.name}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed" title={facility.archetype}>
          {facility.archetype.replace(/\s*\([^)]*§[^)]*\)/g, '')} &bull; {facility.district}, {facility.state}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => resetDemo()}
          className="text-xs h-8 text-muted-foreground hover:text-ink flex items-center gap-1.5"
          title="Reset in-memory scenario overrides and ledger changes"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset demo</span>
        </Button>
      </div>
    </div>
  );
}
