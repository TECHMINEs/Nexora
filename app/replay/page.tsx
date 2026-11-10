'use client';

import React from 'react';
import { useDemoStore, useFacilityModel } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
import { SectionCard } from '@/components/common/SectionCard';
import { CaseToggle } from '@/components/replay/CaseToggle';
import { ReplayTimeline } from '@/components/replay/ReplayTimeline';
import { SignalChart } from '@/components/replay/SignalChart';
import { OutcomePanel } from '@/components/replay/OutcomePanel';
import { StateMachineDiagram } from '@/components/lifecycle/StateMachineDiagram';
import { AdvisoryList } from '@/components/monitoring/AdvisoryList';
import { AlertQualityChecks } from '@/components/monitoring/AlertQualityChecks';
import { Disclaimer } from '@/components/common/Disclaimer';
import { alertQualityChecks } from '@/lib/engines/monitoring';
import { getReplayCase } from '@/data';
import type { ModuleId, EventState } from '@/lib/types';

export default function ReplayConsolePage(): JSX.Element {
  const { state, selectReplayCase, stepReplay, resetReplay } = useDemoStore();
  const replayState = state.replay;
  const currentCase = getReplayCase(replayState.caseId);

  // Model of the facility referenced by the active replay case
  const model = useFacilityModel(currentCase.facilityId);
  const { thresholds, advisories, ledger, outcome } = model;

  const modules: ModuleId[] = ['6.12', '6.15'];

  // Visited states list
  const visitedStates: EventState[] = ['NORMAL'];
  replayState.log.forEach((l) => {
    if (!visitedStates.includes(l.to)) visitedStates.push(l.to);
  });

  const qualityChecks = alertQualityChecks(currentCase, replayState.log);
  const firedIds = replayState.log.flatMap((l) => l.advisoryIds);
  const isPostMortemReached = replayState.eventState === 'POST_MORTEM';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Historical Event Replay</h1>
            <ModuleTag id="6.12" />
            <ModuleTag id="6.15" />
          </div>
          <p className="text-xs text-muted-foreground">
            Step-by-step playback testing early-warning rules, operational state transitions, and post-disaster model recalibration.
          </p>
        </div>
      </div>

      {/* Case Toggle Switcher */}
      <CaseToggle value={replayState.caseId} onChange={selectReplayCase} />

      {/* Mandatory Official Notice */}
      <Disclaimer variant="official_source" />

      {/* Case Evidence Summary Header */}
      <div className="p-4 bg-card border border-line rounded-lg shadow-sm space-y-2 text-xs">
        <div className="flex items-center justify-between pb-1 border-b border-line/60">
          <span className="font-bold text-ink">{currentCase.title}</span>
          <span className="font-mono text-[11px] text-muted-foreground">
            T0 Landfall: {currentCase.eventDate} ({currentCase.t0})
          </span>
        </div>
        <p className="text-muted-foreground leading-relaxed">{currentCase.whyChosen}</p>
        <p className="text-[11px] text-brand-900 bg-brand-50 p-2 rounded border border-brand-200">
          <span className="font-semibold">Empirical Field Validation: </span>
          {currentCase.evidenceSummary}
        </p>
      </div>

      {/* Replay Stepper Timeline */}
      <ReplayTimeline
        replayCase={currentCase}
        stepIndex={replayState.stepIndex}
        log={replayState.log}
        onStep={stepReplay}
        onReset={resetReplay}
      />

      {/* State Machine Transition Diagram */}
      <SectionCard
        title="Event State Machine Propagation"
        moduleIds={['6.12']}
        section="Deck s10"
        description="Tracks escalation from normal baseline through watch, alert, incident, stabilisation, and post-mortem review."
      >
        <StateMachineDiagram
          current={replayState.eventState}
          visited={visitedStates}
        />
      </SectionCard>

      {/* Telemetry Signals Chart */}
      <SectionCard
        title="Regional Signals vs Facility Thresholds"
        moduleIds={modules}
        section="§46, §70"
        description="Telemetry signals during the event window. Signal values are illustrative, not historical readings (ASM-24)."
      >
        <SignalChart
          replayCase={currentCase}
          thresholds={thresholds}
          stepIndex={replayState.stepIndex}
        />
      </SectionCard>

      {/* Triggered Advisories & Actions */}
      <SectionCard
        title="Time-Phased Triggered Advisories"
        moduleIds={['6.12']}
        section="§46"
        description="Window-specific instructions released to plant operations as signal thresholds were breached."
      >
        <AdvisoryList
          advisories={advisories}
          firedIds={firedIds}
          ledger={ledger}
        />
      </SectionCard>

      {/* Outcome Recalibration Panel */}
      <OutcomePanel
        outcome={outcome}
        replayCase={currentCase}
        reached={isPostMortemReached}
      />

      {/* Quality Checks */}
      <SectionCard
        title="Alert Quality Standards & Rule Audit"
        moduleIds={['6.12']}
        section="§46.1"
        description="Escalation sustained alert checks and suppression auditing."
      >
        <AlertQualityChecks checks={qualityChecks} />
      </SectionCard>
    </div>
  );
}
