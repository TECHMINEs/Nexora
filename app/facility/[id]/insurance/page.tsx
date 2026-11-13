'use client';

import React from 'react';
import { useFacilityModel, useDemoStore } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
import { SectionCard } from '@/components/common/SectionCard';
import { BasisSelector } from '@/components/insurance/BasisSelector';
import { GapBars } from '@/components/insurance/GapBars';
import { GapTable } from '@/components/insurance/GapTable';
import { PolicyScheduleCard } from '@/components/insurance/PolicyScheduleCard';
import { Disclaimer } from '@/components/common/Disclaimer';
import { Metric } from '@/components/common/Metric';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { FacilityId, ModuleId } from '@/lib/types';

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
  const modules: ModuleId[] = ['6.13', '6.6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Insurance Adequacy</h1>
            <ModuleTag id="6.6" />
            <ModuleTag id="6.13" />
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
        <Alert className="bg-red-950/40 border-red-500/40 text-red-950 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertTitle className="font-bold">Uninsured Hazard Peril Detected</AlertTitle>
          <AlertDescription>
            Scenario peril ({active.peril}) is not a covered peril in the extracted commercial schedule; the full scenario loss is shown as a potential protection gap.
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
        moduleIds={modules}
        section="§73, Deck s11"
        description="Teal indicates usable recovery within policy limits; red highlights the unhedged potential protection gap."
      >
        <GapBars gap={active} />
      </SectionCard>

      {/* Detailed Coverage Class Gap Table */}
      <SectionCard
        title="Protection Gap by Coverage Class"
        moduleIds={['6.13']}
        section="§43.1, §73.1"
        description="Detailed deduction breakdown accounting for sublimits, STFI limits, and BI time excess."
      >
        <GapTable gap={active} facilityId={facilityId} />
      </SectionCard>

      {/* Extracted Policy Schedule */}
      <SectionCard
        title="Extracted Policy Terms & Inclusions"
        moduleIds={['6.13']}
        section="§43, §43.1"
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
