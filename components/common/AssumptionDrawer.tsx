'use client';

import React from 'react';
import { getAssumption, getSource } from '@/data';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SourceBadge } from './SourceBadge';
import type { FacilityId } from '@/lib/types';

export interface AssumptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assumptionIds: string[];
  sourceIds: string[];
  section: string;
  facilityId?: FacilityId;
}

export function AssumptionDrawer({
  open,
  onOpenChange,
  assumptionIds,
  sourceIds,
  section,
}: AssumptionDrawerProps): JSX.Element {
  const assumptions = assumptionIds.map((id) => {
    try {
      return getAssumption(id);
    } catch {
      return null;
    }
  }).filter(Boolean);

  const sourcesList = sourceIds.map((id) => {
    try {
      return getSource(id);
    } catch {
      return null;
    }
  }).filter(Boolean);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {section}
            </Badge>
            <SheetTitle className="text-base font-semibold">
              Provenance & Methodology Assumptions
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Auditable mathematical trail, data sources, and calibrated modelling assumptions.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {/* Section 1: Assumptions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Modelling Assumptions ({assumptions.length})
            </h4>
            {assumptions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No external assumptions linked directly to this calculation.
              </p>
            ) : (
              <div className="space-y-3">
                {assumptions.map((asm) => (
                  <div
                    key={asm!.id}
                    className="rounded-lg border bg-card p-3 shadow-sm text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary">
                          {asm!.id}
                        </span>
                        <span className="font-semibold text-foreground">
                          {asm!.label}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {asm!.section}
                      </Badge>
                    </div>

                    <div className="bg-muted/40 rounded p-2 text-foreground font-mono text-[11px]">
                      {asm!.value}
                    </div>

                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      <span className="font-medium text-foreground">Rationale: </span>
                      {asm!.rationale}
                    </p>

                    <div className="pt-1 flex items-center justify-between border-t border-muted/50 text-[10px] text-muted-foreground">
                      <span>Source: <SourceBadge sourceId={asm!.sourceId} /></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Data Sources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Contributing Data Sources ({sourcesList.length})
            </h4>
            {sourcesList.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Derived directly from primary system declarations.
              </p>
            ) : (
              <div className="space-y-3">
                {sourcesList.map((src) => (
                  <div
                    key={src!.id}
                    className="rounded-lg border bg-card p-3 shadow-sm text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <SourceBadge sourceId={src!.id} />
                        <span className="font-semibold text-foreground">
                          {src!.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {src!.section}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/20 p-2 rounded">
                      <div>
                        <span className="text-muted-foreground">Authority: </span>
                        <span className="font-medium capitalize">{src!.authority}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Licence: </span>
                        <span className="font-medium capitalize">{src!.licence}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Validation: </span>
                        <span className="font-medium capitalize">{src!.validationStatus.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Spatial: </span>
                        <span className="font-medium">{src!.spatialResolution}</span>
                      </div>
                    </div>

                    {src!.knownLimitations && (
                      <p className="text-white dark:text-white bg-panel-2 dark:bg-panel-2 p-2 rounded text-[11px]">
                        <span className="font-semibold">Known limitations: </span>
                        {src!.knownLimitations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
