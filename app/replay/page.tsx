'use client';

import React from 'react';
import { useDemoStore, useFacilityModel } from '@/lib/store';
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
import type { EventState } from '@/lib/types';

export default function ReplayConsolePage(): JSX.Element {
  const { state, selectReplayCase, stepReplay, resetReplay } = useDemoStore();
  const replayState = state.replay;
  const currentCase = getReplayCase(replayState.caseId);

  const model = useFacilityModel(currentCase.facilityId);
  const { thresholds, advisories, ledger, outcome } = model;

  const visitedStates: EventState[] = ['NORMAL'];
  replayState.log.forEach((l) => {
    if (!visitedStates.includes(l.to)) visitedStates.push(l.to);
  });

  const qualityChecks = alertQualityChecks(replayState.log);
  const firedIds = replayState.log.flatMap((l) => l.advisoryIds);
  const isPostMortemReached = replayState.eventState === 'POST_MORTEM';
  const eventTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(currentCase.t0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Replay a disruption, step by step</h1>

          </div>
          <p className="text-xs text-muted-foreground">
            Choose an illustrative event, step through changing signals and responses, then compare the outcome.
          </p>
        </div>
      </div>

      {/* Case Toggle Switcher */}
      <CaseToggle value={replayState.caseId} onChange={selectReplayCase} />

      {/* Mandatory Official Notice */}
      <div className="max-w-4xl"><Disclaimer variant="official_source" /></div>

      {/* Case Evidence Summary Header */}
      <div className="p-4 sm:p-5 bg-card border border-line shadow-sm space-y-3 text-sm">
        <div className="flex flex-col gap-1 border-b border-line/60 pb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <span className="font-bold text-ink">{currentCase.title}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            Reference time: {eventTime} IST
          </span>
        </div>
        <p className="text-brand-900 bg-brand-50 p-3 border border-brand-200 leading-relaxed" title={currentCase.evidenceSummary}>
          <span className="font-semibold">Recorded context: </span>
          {currentCase.evidenceSummary.replace(/\s*\([^)]*§[^)]*\)/g, '')}
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

        description="Telemetry signals during the event window. Signal values are illustrative, not historical readings."
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

        description="Escalation sustained alert checks and suppression auditing."
      >
        <AlertQualityChecks checks={qualityChecks} />
      </SectionCard>
    </div>
  );
}
