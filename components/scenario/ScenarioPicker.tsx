'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ScenarioPickerProps } from '@/lib/types';

export function ScenarioPicker({
  scenarios,
  selectedId,
  onSelect,
}: ScenarioPickerProps): JSX.Element {
  return (
    <div className="w-full">
      <Tabs value={selectedId} onValueChange={onSelect} className="w-full">
        <TabsList className="bg-muted/50 p-1 flex flex-wrap h-auto gap-1">
          {scenarios.map((s) => (
            <TabsTrigger
              key={s.id}
              value={s.id}
              className="text-xs data-[state=active]:bg-card data-[state=active]:font-semibold"
            >
              <div className="flex flex-col items-start text-left">
                <span>{s.name}</span>
                <span className="font-mono text-[9px] text-muted-foreground uppercase">
                  {s.id} &bull; {s.peril}
                </span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
