'use client';

import React from 'react';
import { BandBadge } from '@/components/common/BandBadge';
import { Badge } from '@/components/ui/badge';
import type { StatusListProps, Band } from '@/lib/types';

export function StatusList({ model }: StatusListProps): JSX.Element {
  // Vulnerability level: max V >= 0.6 High, >= 0.35 Medium, else Low
  const maxV = Math.max(...model.risks.map((r) => r.V.value));
  const vulnBand: Band = maxV >= 0.6 ? 'High' : maxV >= 0.35 ? 'Medium' : 'Low';

  // Operational resilience: preparedness >= 75 High, >= 50 Medium, else Low
  const prepVal = model.preparedness.value * 100;
  const opBand: Band = prepVal >= 75 ? 'High' : prepVal >= 50 ? 'Medium' : 'Low';

  // Insurance adequacy: Potential gap when insurance.maxExposure.totals.gap.value > 0
  const hasGap = model.insurance.maxExposure.totals.gap.value > 0;

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1 border-b border-line">
        Resilience Status Snapshot (Deck style)
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Per-Hazard Bands */}
        <div className="p-3 bg-card border rounded-lg space-y-2">
          <span className="font-semibold text-ink block">Modelled Hazard Risk</span>
          <div className="space-y-1.5">
            {model.risks.map((r) => (
              <div key={r.hazard} className="flex items-center justify-between">
                <span className="text-muted-foreground capitalize">{r.label}</span>
                <BandBadge band={r.band} />
              </div>
            ))}
          </div>
        </div>

        {/* Operational & Engineering Status */}
        <div className="p-3 bg-card border rounded-lg space-y-2">
          <span className="font-semibold text-ink block">Operational Resilience</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Asset Vulnerability</span>
              <BandBadge band={vulnBand} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Controls Preparedness</span>
              <BandBadge band={opBand} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Emergency Accessibility</span>
              <BandBadge band={model.accessibility.band} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Insurance Protection</span>
              {hasGap ? (
                <Badge variant="outline" className="border-band-high text-band-high bg-red-950/40 text-[11px]">
                  Potential Gap
                </Badge>
              ) : (
                <Badge variant="outline" className="border-band-low text-band-low bg-green-950/40 text-[11px]">
                  Adequate
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
