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
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold font-display text-ink">{facility.name}</h1>
          <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 bg-canvas rounded border">
            {facility.section}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {facility.archetype} &bull; {facility.district}, {facility.state}
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
