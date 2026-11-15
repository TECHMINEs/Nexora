'use client';

import React from 'react';
import { useFacilityModel, useDemoStore } from '@/lib/store';
import { SectionCard } from '@/components/common/SectionCard';
import { BasisSelector } from '@/components/insurance/BasisSelector';
import { GapBars } from '@/components/insurance/GapBars';
import { GapTable } from '@/components/insurance/GapTable';
import { PolicyScheduleCard } from '@/components/insurance/PolicyScheduleCard';
import { Disclaimer } from '@/components/common/Disclaimer';
import { Metric } from '@/components/common/Metric';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { FacilityId } from '@/lib/types';
import { perilLabel } from '@/lib/format';

export default function InsuranceAdequacyPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  const model = useFacilityModel(facilityId);
  const { insurance, scenarios } = model;
  const { setInsuranceBasis } = useDemoStore();

  const { active, policy } = insurance;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Insurance Adequacy</h1>

          </div>
          <p className="text-xs text-muted-foreground">
            Comparison of pre-disaster gross & residual asset exposures against extracted commercial policy schedules.
          </p>
        </div>
      </div>

      {/* Basis Selector */}
      <BasisSelector
        scenarios={scenarios.map((v) => v.scenario)}
        basis={active.basis}
        onChange={(basis) => setInsuranceBasis(facilityId, basis)}
      />

      {/* Uninsured Peril Alert */}
      {!active.perilCovered && (
        <Alert className="border-red-500/40 bg-red-950/40 py-2 text-xs text-red-100">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertTitle className="font-bold">This scenario may be uninsured</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">
            {active.peril ? perilLabel(active.peril) : 'This hazard'} is not covered by the illustrative policy schedule. The full scenario loss is shown as a potential protection gap; review it with an adviser.
          </AlertDescription>
        </Alert>
      )}

      {/* Headline Metric Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Metric
          label="Total Assessed Exposure"
          tracked={active.totals.exposure}
          kind="inr"
          size="md"
          facilityId={facilityId}
          caption="Gross unhedged scenario basis"
        />
        <Metric
          label="Usable Insurance Protection"
          tracked={active.totals.protection}
          kind="inr"
          size="md"
          facilityId={facilityId}
          caption="Subject to limits, excess and deductibles"
        />
        <Metric
          label="Potential Protection Gap"
          tracked={active.totals.gap}
          kind="inr"
          size="md"
          facilityId={facilityId}
          caption="Requires adviser review"
        />
      </div>

      {/* Visual Gap Bars (Deck s11 Style) */}
      <SectionCard
        title="Exposure vs Usable Insurance Coverage"

        description="Teal indicates usable recovery within policy limits; red highlights the unhedged potential protection gap."
      >
        <GapBars gap={active} />
      </SectionCard>

      {/* Detailed Coverage Class Gap Table */}
      <SectionCard
        title="Protection Gap by Coverage Class"

        description="Detailed deduction breakdown accounting for sublimits, STFI limits, and BI time excess."
      >
        <GapTable gap={active} facilityId={facilityId} />
      </SectionCard>

      {/* Extracted Policy Schedule */}
      <SectionCard
        title="Extracted Policy Terms & Inclusions"

        description="Machine-extracted limits, deductibles, and indemnity periods subject to adviser verification."
      >
        <PolicyScheduleCard policy={policy} />
      </SectionCard>

      {/* Mandatory Insurance Disclaimer */}
      <div className="pt-2">
        <Disclaimer variant="insurance" />
      </div>
    </div>
  );
}
