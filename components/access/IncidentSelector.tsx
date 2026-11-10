'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { IncidentSelectorProps, IncidentType } from '@/lib/types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function IncidentSelector({
  value,
  onChange,
  selection,
}: IncidentSelectorProps): JSX.Element {
  return (
    <div className="p-3 bg-card border border-line rounded-lg space-y-3 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Simulate Emergency Incident:</span>
          <Select value={value} onValueChange={(val) => onChange(val as IncidentType)}>
            <SelectTrigger className="w-[160px] h-8 text-xs bg-canvas font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medical">Medical / Casualty</SelectItem>
              <SelectItem value="fire">Structural Fire</SelectItem>
              <SelectItem value="hazmat">Chemical / Hazmat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-[11px] text-muted-foreground">
          Capability-Matched Triage Selection (§74.1)
        </span>
      </div>

      <div className="p-2.5 bg-canvas rounded border border-line/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {selection.selectedResourceId ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <div>
            <span className="text-muted-foreground">Selected Unit: </span>
            <span className="font-bold text-ink">
              {selection.selectedResourceId ?? 'None Available'}
            </span>
            <span className="text-[11px] text-muted-foreground ml-2">
              (Nearest base: {selection.nearestResourceId})
            </span>
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] bg-card self-start sm:self-auto font-normal">
          {selection.reason}
        </Badge>
      </div>
    </div>
  );
}
