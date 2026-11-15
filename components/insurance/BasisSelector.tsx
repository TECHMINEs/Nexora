'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BasisSelectorProps } from '@/lib/types';
import { perilLabel } from '@/lib/format';

export function BasisSelector({
  scenarios,
  basis,
  onChange,
}: BasisSelectorProps): JSX.Element {
  const isMaxExposure = basis.kind === 'max_exposure';
  const selectedScenarioId = basis.kind === 'scenario' ? basis.scenarioId : scenarios[0]?.id ?? '';

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-line bg-card p-4 text-xs lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="shrink-0 font-semibold text-ink">Assessment Basis:</span>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <label className="flex min-h-9 items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="basis_kind"
              checked={isMaxExposure}
              onChange={() => onChange({ kind: 'max_exposure' })}
              className="text-brand-500 focus:ring-brand-500"
            />
            <span className="font-medium text-ink">Max-Exposure Horizon (90d)</span>
          </label>

          <label className="flex min-h-9 items-center gap-2 cursor-pointer">
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
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <span className="shrink-0 text-muted-foreground">Select Scenario:</span>
          <Select
            value={selectedScenarioId}
            onValueChange={(val) => onChange({ kind: 'scenario', scenarioId: val })}
          >
            <SelectTrigger className="w-full min-w-0 h-10 text-xs bg-canvas font-medium sm:w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.name} ({perilLabel(s.peril)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
