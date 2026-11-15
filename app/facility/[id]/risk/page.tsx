'use client';

import React, { useState } from 'react';
import { useFacilityModel } from '@/lib/store';
import { SectionCard } from '@/components/common/SectionCard';
import { RiskTable } from '@/components/risk/RiskTable';
import { DriverList } from '@/components/risk/DriverList';
import { ExposedAssets } from '@/components/risk/ExposedAssets';
import { SchematicMap } from '@/components/facility/SchematicMap';
import { TrackedCell } from '@/components/common/TrackedCell';
import { EmptyState } from '@/components/common/EmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import type { FacilityId, HazardType } from '@/lib/types';
import Link from 'next/link';
import { formatScore100 } from '@/lib/format';

export default function RiskExplorerPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  const model = useFacilityModel(facilityId);
  const { facility, risks, assets } = model;

  const [selectedHazard, setSelectedHazard] = useState<HazardType>(risks[0]?.hazard ?? 'flood');

  const selectedRisk = risks.find((r) => r.hazard === selectedHazard) ?? risks[0];

  // Check if selected risk has low confidence
  const isLowConfidence = selectedRisk && selectedRisk.R.confidence < 0.5;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Risk Explorer</h1>

          </div>
          <p className="text-sm text-muted-foreground">Choose a hazard to see its comparative risk and what lies in its footprint.</p>
        </div>
      </div>

      <Tabs value={selectedHazard} onValueChange={(val) => setSelectedHazard(val as HazardType)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
          {risks.map((risk) => <TabsTrigger key={risk.hazard} value={risk.hazard} className="text-sm">{risk.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <section className="border border-line bg-card p-5 sm:p-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-400">Selected hazard</p>
        <h2 className="mt-1 font-display text-xl font-bold text-ink">{selectedRisk.label}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Comparative risk: <strong className="text-ink">{formatScore100(selectedRisk.Rnorm.value, 0)} / 100</strong> · <strong className="text-ink">{selectedRisk.band}</strong>. This score compares sample hazards after verified controls; it is not an event probability.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{selectedRisk.exposure.exposedAssetIds.length} asset(s) appear in this modelled hazard footprint.</p>
        {isLowConfidence && <p className="mt-2 text-sm text-white">This result has limited supporting data. Treat the ranking as exploratory.</p>}
        <Link href={`/facility/${facilityId}/scenarios`} className="mt-5 inline-flex min-h-11 items-center justify-center border border-brand-500 bg-brand-500 px-5 py-2 font-display text-sm font-bold uppercase text-black hover:bg-white">Change a loss scenario →</Link>
      </section>

      <details className="border border-line bg-card p-4 sm:p-5">
        <summary className="cursor-pointer font-display text-base font-bold text-ink">Explore risk calculations and exposed assets</summary>
        <div className="mt-5 space-y-6">

      {/* Formula Strip Card */}
      <div className="p-3.5 bg-card border border-line rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Hazard Formulation ({selectedRisk.label})
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="font-bold text-ink">R = H</span>
            <span className="text-muted-foreground">(&times;</span>
            <TrackedCell tracked={selectedRisk.H} kind="ratio" facilityId={facilityId} />
            <span className="text-muted-foreground">) &times; E (</span>
            <TrackedCell tracked={selectedRisk.E} kind="ratio" facilityId={facilityId} />
            <span className="text-muted-foreground">) &times; V (</span>
            <TrackedCell tracked={selectedRisk.V} kind="ratio" facilityId={facilityId} />
            <span className="text-muted-foreground">) &times; C (</span>
            <TrackedCell tracked={selectedRisk.C} kind="count" facilityId={facilityId} />
            <span className="text-muted-foreground">) &times; (1 &minus; M (</span>
            <TrackedCell tracked={selectedRisk.M} kind="ratio" facilityId={facilityId} />
            <span className="text-muted-foreground">)) = </span>
            <TrackedCell tracked={selectedRisk.R} kind="index" facilityId={facilityId} />
          </div>
        </div>

        <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-line/60 pt-2 md:pt-0 md:pl-4">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Normalised (R &divide; 5)
            </span>
            <TrackedCell tracked={selectedRisk.Rnorm} kind="score100" facilityId={facilityId} />
          </div>
        </div>
      </div>

      {isLowConfidence && (
        <Alert className="bg-panel-2 border-stroke text-white text-xs">
          <AlertTriangle className="w-4 h-4 text-white" />
          <AlertTitle className="font-semibold">Low confidence risk assessment</AlertTitle>
          <AlertDescription>
            The confidence for {selectedRisk.label} is below 0.50. Review the optional model guide for limitations.
          </AlertDescription>
        </Alert>
      )}

      {/* Multi-hazard Comparison Table */}
      <SectionCard
        title="Modelled Per-Hazard Decomposition"

        description="Click a row to select and filter spatial footprint and driver contributions."
      >
        <RiskTable
          risks={risks}
          selectedHazard={selectedHazard}
          onSelect={setSelectedHazard}
          facilityId={facilityId}
        />
      </SectionCard>

      {/* Hazard Specific Details */}
      <div className="space-y-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            title={`Hazard Footprint: ${selectedRisk.label}`}

            description="Active spatial zone overlay with respect to plant boundary."
          >
            <SchematicMap
              layout={facility.schematic}
              highlightHazard={selectedHazard}
              showResponders={false}
              selectedResourceId={null}
              caption={`Footprint basis: ${selectedRisk.label}`}
            />
          </SectionCard>

          <SectionCard
            title={`Vulnerability Drivers: ${selectedRisk.label}`}

            description="Adaptive conditions weighting the overall vulnerability index V."
          >
            <DriverList risk={selectedRisk} facilityId={facilityId} />
          </SectionCard>
        </div>

        <SectionCard
          title={`Assets in ${selectedRisk.label} Footprint`}

          description="Physical assets exposed to this specific hazard peril."
        >
          {selectedRisk.exposure.exposedAssetIds.length > 0 ? (
            <ExposedAssets
              exposure={selectedRisk.exposure}
              assets={assets}
              facilityId={facilityId}
            />
          ) : (
            <EmptyState
              title="No assets in this hazard footprint"
              reason="No critical machinery, building structures, or inventory are located in the designated zone."
              nextStep="Verify asset elevation and coordinates in the asset register"
            />
          )}
        </SectionCard>
      </div>
        </div>
      </details>
    </div>
  );
}
