'use client';

import React from 'react';
import { useFacilityModel, useDemoStore } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
import { SectionCard } from '@/components/common/SectionCard';
import { ScenarioPicker } from '@/components/scenario/ScenarioPicker';
import { LossBreakdown } from '@/components/scenario/LossBreakdown';
import { ScenarioControls } from '@/components/scenario/ScenarioControls';
import { SensitivityTornado } from '@/components/scenario/SensitivityTornado';
import { CascadeGraph } from '@/components/scenario/CascadeGraph';
import { Metric } from '@/components/common/Metric';
import { AssumptionLink } from '@/components/common/AssumptionLink';
import { EmptyState } from '@/components/common/EmptyState';
import type { FacilityId } from '@/lib/types';

export default function ScenarioStudioPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  const model = useFacilityModel(facilityId);
  const { scenarios, selectedScenarioId, cascade } = model;
  const { selectScenario, setScenarioOverride, clearScenarioOverride } = useDemoStore();

  const currentView = scenarios.find((v) => v.scenario.id === selectedScenarioId) ?? scenarios[0];
  const { scenario, residual, sensitivity } = currentView;
  const effective = residual.effective;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Scenario Studio</h1>
            <ModuleTag id="6.4" />
            <ModuleTag id="6.5" />
            <ModuleTag id="6.6" />
          </div>
          <p className="text-xs text-muted-foreground">
            Stress-testing physical, inventory, and contingent business interruption under explicit failure assumptions.
          </p>
        </div>
      </div>

      {/* Scenario Picker */}
      <ScenarioPicker
        scenarios={scenarios.map((v) => v.scenario)}
        selectedId={selectedScenarioId}
        onSelect={(id) => selectScenario(facilityId, id)}
      />

      {/* Active Scenario Overview & Headline Metrics */}
      <div className="p-4 bg-card border border-line rounded-lg shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-line/60">
          <div>
            <h2 className="text-base font-bold text-ink">{scenario.name}</h2>
            <p className="text-xs text-muted-foreground">{scenario.description}</p>
          </div>
          <AssumptionLink
            assumptionIds={scenario.assumptionIds}
            sourceIds={scenario.sourceIds}
            section={scenario.section}
            facilityId={facilityId}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric
            label="Residual Scenario Loss"
            tracked={residual.total}
            kind="inr"
            size="md"
            facilityId={facilityId}
            caption="Verified controls in place"
          />
          <Metric
            label="Modeled Downtime"
            tracked={{
              value: effective.downtimeDays,
              confidence: 0.555,
              sourceIds: scenario.sourceIds,
              assumptionIds: scenario.assumptionIds,
              section: scenario.section,
            }}
            kind="days"
            size="md"
            facilityId={facilityId}
            caption="Facility halt duration"
          />
          <Metric
            label="Inventory Loss Fraction"
            tracked={{
              value: effective.inventoryLossFraction,
              confidence: 0.555,
              sourceIds: scenario.sourceIds,
              assumptionIds: scenario.assumptionIds,
              section: scenario.section,
            }}
            kind="pct"
            size="md"
            facilityId={facilityId}
            caption="Stock write-off share"
          />
          <Metric
            label="Supplier Interruption"
            tracked={{
              value: effective.supplierInterruptionDays,
              confidence: 0.555,
              sourceIds: scenario.sourceIds,
              assumptionIds: scenario.assumptionIds,
              section: scenario.section,
            }}
            kind="days"
            size="md"
            facilityId={facilityId}
            caption="Route/supply disruption"
          />
        </div>
      </div>

      {/* Interactive Controls */}
      <ScenarioControls
        view={currentView}
        onChange={(patch) => setScenarioOverride(scenario.id, patch)}
        onReset={() => clearScenarioOverride(scenario.id)}
      />

      {/* Loss Breakdown Columns */}
      <SectionCard
        title="Three-State Loss Decomposition"
        moduleIds={['6.5', '6.6']}
        section="§42, §62"
        description="Gross vulnerability exposure vs residual (verified controls) vs fully implemented mitigation plan."
      >
        <LossBreakdown view={currentView} facilityId={facilityId} />
      </SectionCard>

      {/* Sensitivity Tornado & Cascade Pathways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Sensitivity Tornado Analysis"
          moduleIds={['6.5']}
          section="§42.1"
          description="Driver elasticity ranking: downtime vs inventory damage vs external supplier dependencies."
        >
          <SensitivityTornado result={sensitivity} />
        </SectionCard>

        <SectionCard
          title="Dependency Cascade & SPOFs"
          moduleIds={['6.4']}
          section="§41"
          description="Topological propagation from initiating hazard through utility nodes to critical financial contribution."
        >
          {cascade.chains.length > 0 ? (
            <CascadeGraph cascade={cascade} />
          ) : (
            <EmptyState
              title="No cascade chains detected"
              reason="No directed paths exist between modelled hazards and financial/people endpoints."
              nextStep="Verify dependency links in the facility cascade configuration"
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
