'use client';

import React from 'react';
import { useFacilityModel } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
import { SectionCard } from '@/components/common/SectionCard';
import { PriorityQueue } from '@/components/mitigation/PriorityQueue';
import { EmptyState } from '@/components/common/EmptyState';
import type { FacilityId, ModuleId } from '@/lib/types';

export default function MitigationPlanPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  const model = useFacilityModel(facilityId);
  const { priorities, ledger } = model;

  const modules: ModuleId[] = ['6.7'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Mitigation Plan</h1>
            <ModuleTag id="6.7" />
          </div>
          <p className="text-xs text-muted-foreground">
            Ranked open mitigation queue balancing risk reduction impact, hazard likelihood, due date urgency, and engineering feasibility.
          </p>
        </div>
      </div>

      {/* Formula Strip Card */}
      <div className="p-3 bg-card border border-line rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
            Optimiser Formula:
          </span>
          <span className="font-mono text-ink font-semibold">
            Priority = (Impact &times; Likelihood &times; Urgency &times; Feasibility) &divide; 625
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Critical Threshold &ge; 40.0 &bull; Scale [0 - 100]
        </span>
      </div>

      {/* Main Priority Queue Table */}
      <SectionCard
        title="Ranked Mitigation Priority Queue"
        moduleIds={modules}
        section="§74, §74.2"
        description="Active capital projects and operating mitigations awaiting procurement or verified proof."
      >
        {priorities.length > 0 ? (
          <PriorityQueue items={priorities} ledger={ledger} facilityId={facilityId} />
        ) : (
          <EmptyState
            title="All mitigations verified or retired"
            reason="There are no open or pending mitigation initiatives in the facility backlog."
            nextStep="Review the Resilience Ledger for periodic control drift"
          />
        )}
      </SectionCard>
    </div>
  );
}
