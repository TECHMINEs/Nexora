'use client';

import React, { useState } from 'react';
import { useFacilityModel } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
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
import type { FacilityId, HazardType, ModuleId } from '@/lib/types';

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
  const modules: ModuleId[] = ['6.2', '6.3'];

  // Check if selected risk has low confidence
  const isLowConfidence = selectedRisk && selectedRisk.R.confidence < 0.5;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Risk Explorer</h1>
            <ModuleTag id="6.2" />
            <ModuleTag id="6.3" />
          </div>
          <p className="text-xs text-muted-foreground">
            Multi-hazard decomposition: Hazard (H) &times; Exposure (E) &times; Vulnerability (V) &times; Criticality (C) &times; (1 &minus; M).
          </p>
        </div>
      </div>

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
            The confidence for {selectedRisk.label} is below 0.50. Inspect the contributing data sources in the assumption drawer to review limitations.
          </AlertDescription>
        </Alert>
      )}

      {/* Multi-hazard Comparison Table */}
      <SectionCard
        title="Modelled Per-Hazard Decomposition"
        moduleIds={modules}
        section="§9, §40, §74"
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
        <div className="flex items-center justify-between">
          <Tabs
            value={selectedHazard}
            onValueChange={(val) => setSelectedHazard(val as HazardType)}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-muted/50 p-1">
              {risks.map((r) => (
                <TabsTrigger key={r.hazard} value={r.hazard} className="text-xs capitalize">
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            title={`Hazard Footprint: ${selectedRisk.label}`}
            moduleIds={['6.2']}
            section="§6.2, §9"
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
            moduleIds={['6.3']}
            section="§6.3, §40"
            description="Adaptive conditions weighting the overall vulnerability index V."
          >
            <DriverList risk={selectedRisk} facilityId={facilityId} />
          </SectionCard>
        </div>

        <SectionCard
          title={`Assets in ${selectedRisk.label} Footprint`}
          moduleIds={['6.2']}
          section="§9"
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
  );
}
