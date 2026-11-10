'use client';

import React from 'react';
import { useFacilityModel } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
import { ReportSection } from '@/components/report/ReportSection';
import { AssumptionRegister } from '@/components/report/AssumptionRegister';
import { SourceRegister } from '@/components/report/SourceRegister';
import { ExportButtons } from '@/components/report/ExportButtons';
import { RiskTable } from '@/components/risk/RiskTable';
import { GapTable } from '@/components/insurance/GapTable';
import { ResourceTable } from '@/components/access/ResourceTable';
import { TrackedCell } from '@/components/common/TrackedCell';
import { Disclaimer } from '@/components/common/Disclaimer';
import { Badge } from '@/components/ui/badge';
import { MODEL_VERSION, DEMO_NOW } from '@/lib/constants';
import { formatDateIST } from '@/lib/format';
import type { FacilityId } from '@/lib/types';

export default function EvidenceReportPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  const model = useFacilityModel(facilityId);
  const {
    facility,
    risks,
    scenarios,
    selectedScenarioId,
    insurance,
    accessibility,
    preparedness,
    outcome,
    replayStatus,
    provenance,
    assumptions,
    ledger,
  } = model;

  const currentScenario = scenarios.find((s) => s.scenario.id === selectedScenarioId) ?? scenarios[0];
  const verifiedControls = ledger.filter((e) => e.state === 'verified' || e.state === 'implemented');
  const isPostMortem = replayStatus.state === 'POST_MORTEM';

  return (
    <div className="space-y-8 bg-card p-6 md:p-8 rounded-xl border border-line shadow-sm">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-line">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">
              Facility Resilience Dossier & Audit Report
            </h1>
            <ModuleTag id="6.15" />
            <Badge variant="outline" className="font-mono text-xs">
              {facility.id}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {facility.name} &bull; {facility.district}, {facility.state} &bull; Built {facility.yearBuilt}
          </p>
          <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-muted-foreground">
            <span>Model Engine: {MODEL_VERSION}</span>
            <span>&bull;</span>
            <span>Frozen Clock: {formatDateIST(DEMO_NOW)}</span>
          </div>
        </div>

        <ExportButtons model={model} />
      </div>

      {/* Mandatory Disclaimers */}
      <div className="space-y-2">
        <Disclaimer variant="demo" />
        <Disclaimer variant="insurance" />
      </div>

      {/* Section 1: Executive Posture */}
      <ReportSection id="executive-summary" title="1. Executive Resilience Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-canvas rounded-lg border border-line text-xs">
          <div>
            <span className="text-muted-foreground text-[11px] block">Preparedness Score</span>
            <TrackedCell tracked={preparedness} kind="score100" facilityId={facilityId} />
          </div>
          <div>
            <span className="text-muted-foreground text-[11px] block">Max-Exposure Gap</span>
            <TrackedCell tracked={insurance.maxExposure.totals.gap} kind="inr" facilityId={facilityId} />
          </div>
          <div>
            <span className="text-muted-foreground text-[11px] block">Accessibility Score</span>
            <TrackedCell tracked={accessibility.score} kind="score100" facilityId={facilityId} />
          </div>
          <div>
            <span className="text-muted-foreground text-[11px] block">Selected Scenario Loss</span>
            <TrackedCell tracked={currentScenario.residual.total} kind="inr" facilityId={facilityId} />
          </div>
        </div>
      </ReportSection>

      {/* Section 2: Hazard Decomposition */}
      <ReportSection id="hazard-risk" title="2. Modelled Per-Hazard Decomposition (§9, §74)">
        <RiskTable
          risks={risks}
          selectedHazard={risks[0]?.hazard ?? 'flood'}
          onSelect={() => {}}
          facilityId={facilityId}
        />
      </ReportSection>

      {/* Section 3: Scenario Stress Testing */}
      <ReportSection id="scenario-loss" title="3. Scenario Stress Testing Loss Decomposition (§42)">
        <div className="space-y-2 text-xs">
          <div className="font-semibold text-ink">
            Active Scenario: {currentScenario.scenario.name} ({currentScenario.scenario.peril})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-canvas rounded-lg border border-line">
            <div>
              <span className="text-muted-foreground block text-[11px]">Gross Exposure:</span>
              <TrackedCell tracked={currentScenario.gross.total} kind="inr" facilityId={facilityId} />
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Residual Loss (Verified):</span>
              <TrackedCell tracked={currentScenario.residual.total} kind="inr" facilityId={facilityId} />
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">If Committed Verified:</span>
              <TrackedCell tracked={currentScenario.committed.total} kind="inr" facilityId={facilityId} />
            </div>
          </div>
        </div>
      </ReportSection>

      {/* Section 4: Insurance Adequacy */}
      <ReportSection id="insurance-adequacy" title="4. Insurance Adequacy & Protection Gap (§73)">
        <GapTable gap={insurance.maxExposure} facilityId={facilityId} />
      </ReportSection>

      {/* Section 5: Verified Controls & Evidence */}
      <ReportSection id="ledger-evidence" title="5. Verified Physical Controls & Evidence Register (§44)">
        <div className="space-y-2 text-xs">
          <div className="border border-line rounded-md overflow-hidden bg-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-line">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Control Action</th>
                  <th className="p-2.5">State</th>
                  <th className="p-2.5">Evidence Method</th>
                  <th className="p-2.5">Verifier</th>
                  <th className="p-2.5">Audit Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {verifiedControls.map((c) => (
                  <tr key={c.id}>
                    <td className="p-2.5 font-mono font-bold text-brand-900">{c.id}</td>
                    <td className="p-2.5 font-medium text-ink">{c.title}</td>
                    <td className="p-2.5 capitalize">{c.state.replace('_', ' ')}</td>
                    <td className="p-2.5 font-mono text-[11px]">
                      {c.evidence[0]?.method.replace('_', ' ') ?? 'None'}
                    </td>
                    <td className="p-2.5 text-muted-foreground">{c.evidence[0]?.verifier ?? 'Self'}</td>
                    <td className="p-2.5 text-muted-foreground text-[11px]">{c.evidence[0]?.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ReportSection>

      {/* Section 6: Emergency Accessibility */}
      <ReportSection id="accessibility-telemetry" title="6. Emergency Accessibility & Dispatch Telemetry (§45)">
        <ResourceTable stats={accessibility.resources} facilityId={facilityId} />
      </ReportSection>

      {/* Section 7: Historical Outcome Recalibration */}
      <ReportSection id="outcome-learning" title="7. Historical Outcome Learning & Recalibration (§6.15)">
        <div className="p-4 bg-canvas rounded-lg border border-line space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-line/60">
            <span className="font-semibold text-ink">
              Replay Benchmark: {model.replayCase.title}
            </span>
            <Badge
              variant="outline"
              className={isPostMortem ? 'border-emerald-500/40 text-emerald-400' : 'text-muted-foreground'}
            >
              {isPostMortem ? 'Post-Mortem Validated' : 'Pending Replay Post-Mortem'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <span className="text-muted-foreground text-[11px] block">Model Predicted</span>
              <TrackedCell tracked={outcome.predicted} kind="inr" facilityId={facilityId} />
            </div>
            <div>
              <span className="text-muted-foreground text-[11px] block">Observed Loss</span>
              <TrackedCell tracked={outcome.observed} kind="inr" facilityId={facilityId} />
            </div>
            <div>
              <span className="text-muted-foreground text-[11px] block">Model Variance</span>
              <span className="font-mono font-bold text-band-high">
                {(outcome.error * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground text-[11px] block">Post-Disaster Recalibrated</span>
              <div className="flex items-center gap-1">
                <TrackedCell tracked={outcome.recalibrated} kind="inr" facilityId={facilityId} />
                <span className="font-mono text-[10px] text-emerald-400">
                  ({(outcome.recalibratedError * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </ReportSection>

      {/* Section 8: Assumption Register (Anchors #ASM-xx) */}
      <ReportSection id="assumption-register" title="8. Technical Assumption Register (ASM-01 to ASM-27)">
        <AssumptionRegister assumptions={assumptions} />
      </ReportSection>

      {/* Section 9: Source Register (§72.1) */}
      <ReportSection id="source-register" title="9. Data Provenance & Source Licensing Breakdown (§72.1)">
        <SourceRegister rows={provenance} />
      </ReportSection>
    </div>
  );
}
