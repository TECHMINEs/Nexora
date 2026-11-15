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
              className="min-h-11 text-sm data-[state=active]:bg-card data-[state=active]:font-semibold"
            >
              <span className="text-left">{s.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
