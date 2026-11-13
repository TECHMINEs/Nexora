'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';
import type { ScenarioControlsProps } from '@/lib/types';

export function ScenarioControls({
  view,
  onChange,
  onReset,
}: ScenarioControlsProps): JSX.Element {
  const { residual, override } = view;
  const effective = residual.effective;

  return (
    <div className="p-4 bg-card border border-line rounded-lg space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Stress Testing Sliders</span>
          {override && (
            <Badge variant="outline" className="border-accent-500 text-accent-700 bg-panel-2 font-mono text-[10px]">
              Override Active
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={!override}
          className="h-7 text-xs text-muted-foreground hover:text-ink flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Sliders</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
        {/* Downtime Slider */}
        <div className="space-y-2">
          <div className="flex justify-between font-mono">
            <span className="text-muted-foreground">Downtime</span>
            <span className="font-bold text-ink">{effective.downtimeDays} days</span>
          </div>
          <Slider
            value={[effective.downtimeDays]}
            min={0}
            max={90}
            step={0.5}
            onValueChange={(val) => onChange({ downtimeDays: val[0] })}
            className="w-full"
          />
          <span className="text-[10px] text-muted-foreground block text-right">0 - 90 days</span>
        </div>

        {/* Inventory Loss Slider */}
        <div className="space-y-2">
          <div className="flex justify-between font-mono">
            <span className="text-muted-foreground">Inventory Loss</span>
            <span className="font-bold text-ink">{(effective.inventoryLossFraction * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[effective.inventoryLossFraction * 100]}
            min={0}
            max={100}
            step={5}
            onValueChange={(val) => onChange({ inventoryLossFraction: val[0] / 100 })}
            className="w-full"
          />
          <span className="text-[10px] text-muted-foreground block text-right">0% - 100%</span>
        </div>

        {/* Supplier Interruption Slider */}
        <div className="space-y-2">
          <div className="flex justify-between font-mono">
            <span className="text-muted-foreground">Supplier Interruption</span>
            <span className="font-bold text-ink">{effective.supplierInterruptionDays} days</span>
          </div>
          <Slider
            value={[effective.supplierInterruptionDays]}
            min={0}
            max={60}
            step={1}
            onValueChange={(val) => onChange({ supplierInterruptionDays: val[0] })}
            className="w-full"
          />
          <span className="text-[10px] text-muted-foreground block text-right">0 - 60 days</span>
        </div>
      </div>
    </div>
  );
}
