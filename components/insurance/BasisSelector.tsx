'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BasisSelectorProps } from '@/lib/types';

export function BasisSelector({
  scenarios,
  basis,
  onChange,
}: BasisSelectorProps): JSX.Element {
  const isMaxExposure = basis.kind === 'max_exposure';
  const selectedScenarioId = basis.kind === 'scenario' ? basis.scenarioId : scenarios[0]?.id ?? '';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-card border border-line rounded-lg text-xs">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-ink">Assessment Basis:</span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="basis_kind"
              checked={isMaxExposure}
              onChange={() => onChange({ kind: 'max_exposure' })}
              className="text-brand-500 focus:ring-brand-500"
            />
            <span className="font-medium text-ink">Max-Exposure Horizon (90d)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="basis_kind"
              checked={!isMaxExposure}
              onChange={() => onChange({ kind: 'scenario', scenarioId: selectedScenarioId })}
              className="text-brand-500 focus:ring-brand-500"
            />
            <span className="font-medium text-ink">Scenario Loss Basis</span>
          </label>
        </div>
      </div>

      {!isMaxExposure && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Select Scenario:</span>
          <Select
            value={selectedScenarioId}
            onValueChange={(val) => onChange({ kind: 'scenario', scenarioId: val })}
          >
            <SelectTrigger className="w-[200px] h-8 text-xs bg-canvas font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.name} ({s.peril})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
