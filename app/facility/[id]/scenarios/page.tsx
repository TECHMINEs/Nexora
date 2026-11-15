'use client';

import React from 'react';
import { useFacilityModel, useDemoStore } from '@/lib/store';
import { SectionCard } from '@/components/common/SectionCard';
import { ScenarioPicker } from '@/components/scenario/ScenarioPicker';
import { LossBreakdown } from '@/components/scenario/LossBreakdown';
import { ScenarioControls } from '@/components/scenario/ScenarioControls';
import { SensitivityTornado } from '@/components/scenario/SensitivityTornado';
import { CascadeGraph } from '@/components/scenario/CascadeGraph';
import { Metric } from '@/components/common/Metric';
import { EmptyState } from '@/components/common/EmptyState';
import type { FacilityId } from '@/lib/types';
import Link from 'next/link';
import { formatINR } from '@/lib/format';

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

          </div>
          <p className="text-sm text-muted-foreground">Choose a disruption, change its inputs, and compare the estimated losses below.</p>
        </div>
      </div>

      {/* Scenario Picker */}
      <ScenarioPicker
        scenarios={scenarios.map((v) => v.scenario)}
        selectedId={selectedScenarioId}
        onSelect={(id) => selectScenario(facilityId, id)}
      />

      <ScenarioControls
        view={currentView}
        onChange={(patch) => setScenarioOverride(scenario.id, patch)}
        onReset={() => clearScenarioOverride(scenario.id)}
      />

      <section id="results" className="scroll-mt-24 border border-line bg-card p-5 sm:p-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-400">See what changes</p>
        <h2 className="mt-1 font-display text-xl font-bold text-ink">{scenario.name}: estimated loss</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{scenario.description}. Change a slider above to see these amounts recalculate. These are modelled sample losses, not a forecast.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="border border-line bg-black/40 p-4"><p className="text-xs text-muted-foreground">Without controls</p><p className="mt-1 font-display text-2xl font-bold text-ink">{formatINR(currentView.gross.total.value)}</p></div>
          <div className="border border-brand-500 bg-brand-500/10 p-4"><p className="text-xs text-muted-foreground">With verified controls</p><p className="mt-1 font-display text-2xl font-bold text-ink">{formatINR(residual.total.value)}</p></div>
          <div className="border border-line bg-black/40 p-4"><p className="text-xs text-muted-foreground">If planned actions are verified</p><p className="mt-1 font-display text-2xl font-bold text-ink">{formatINR(currentView.committed.total.value)}</p></div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">“Verified” means an action has supporting evidence. The planned figure assumes future actions work and are verified; it is not a guaranteed saving.</p>
        <Link href={`/facility/${facilityId}/mitigation`} className="mt-5 inline-flex min-h-11 items-center justify-center border border-brand-500 bg-brand-500 px-5 py-2 font-display text-sm font-bold uppercase text-black hover:bg-white">Review actions that could reduce loss →</Link>
      </section>

      <details className="border border-line bg-card p-4 sm:p-5">
        <summary className="cursor-pointer font-display text-base font-bold text-ink">Explore loss components and advanced analysis</summary>
        <div className="mt-5 space-y-6">

      {/* Active Scenario Overview & Headline Metrics */}
      <div className="p-4 bg-card border border-line rounded-lg shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-line/60">
          <div>
            <h2 className="text-base font-bold text-ink">{scenario.name}</h2>
            <p className="text-xs text-muted-foreground">{scenario.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

      {/* Loss Breakdown Columns */}
      <SectionCard
        title="Three-State Loss Decomposition"

        description="Gross vulnerability exposure vs residual (verified controls) vs fully implemented mitigation plan."
      >
        <LossBreakdown view={currentView} facilityId={facilityId} />
      </SectionCard>

      {/* Sensitivity Tornado & Cascade Pathways */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        <SectionCard
          title="Sensitivity Tornado Analysis"

          description="Driver elasticity ranking: downtime vs inventory damage vs external supplier dependencies."
        >
          <SensitivityTornado result={sensitivity} />
        </SectionCard>

        <SectionCard
          title="Dependency Cascade & SPOFs"

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
      </details>
    </div>
  );
}
