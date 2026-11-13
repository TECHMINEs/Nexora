'use client';

import React from 'react';
import Link from 'next/link';
import { useFacilityModel } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
import { SectionCard } from '@/components/common/SectionCard';
import { ThresholdTable } from '@/components/monitoring/ThresholdTable';
import { AdvisoryList } from '@/components/monitoring/AdvisoryList';
import { AlertQualityChecks } from '@/components/monitoring/AlertQualityChecks';
import { Disclaimer } from '@/components/common/Disclaimer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { alertQualityChecks } from '@/lib/engines/monitoring';
import type { FacilityId, ModuleId } from '@/lib/types';
import { PlayCircle } from 'lucide-react';

export default function MonitoringPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  const model = useFacilityModel(facilityId);
  const { thresholds, advisories, replayStatus, replayCase, ledger } = model;

  const modules: ModuleId[] = ['6.12'];

  // Current active step signals
  const latestSignals = replayStatus.latestStep ? replayStatus.latestStep.signals : null;

  // Compute quality checks for facility replay
  const qualityChecks = alertQualityChecks(replayCase, replayStatus.log);

  // Collect all fired advisory IDs across the current replay state log
  const firedIds = replayStatus.log.flatMap((l) => l.advisoryIds);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Monitoring & Early Warning</h1>
            <ModuleTag id="6.12" />
          </div>
          <p className="text-xs text-muted-foreground">
            Operational translation of authoritative regional signals into facility-specific readiness windows.
          </p>
        </div>
        <Button asChild size="sm" className="bg-brand-500 hover:bg-brand-500 text-black font-display font-bold uppercase tracking-wider text-xs h-8">
          <Link href="/replay" className="flex items-center gap-1.5">
            <PlayCircle className="w-4 h-4" />
            <span>Open Replay Console</span>
          </Link>
        </Button>
      </div>

      {/* Mandatory Official Notice */}
      <Disclaimer variant="official_source" />

      {/* Replay State Chip Header */}
      <div className="p-3 bg-card border border-line rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            Replay Engine State:
          </span>
          <Badge className="bg-brand-500 text-black font-mono text-xs">
            {replayStatus.state}
          </Badge>
          <span className="text-muted-foreground">
            &bull; Active Case: <span className="font-bold text-ink">{replayCase.title}</span>
          </span>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground">
          {replayStatus.active ? 'Armed & Synchronised' : 'Idle (Run Replay to advance)'}
        </div>
      </div>

      {/* Threshold Configuration vs Latest Telemetry */}
      <SectionCard
        title="Configured Facility Thresholds & Live Signal Status"
        moduleIds={modules}
        section="§46, ASM-22"
        description="Physical triggers calibrated to plant machinery elevation, storm wind speeds, and monomer stability."
      >
        <ThresholdTable thresholds={thresholds} latest={latestSignals} />
      </SectionCard>

      {/* Windowed Advisories */}
      <SectionCard
        title="Time-Phased Facility Action Advisories"
        moduleIds={['6.12']}
        section="§46"
        description="Translates 7-day to 1-hour strategic windows into specific checklist verifications and control actuations."
      >
        <AdvisoryList
          advisories={advisories}
          firedIds={firedIds}
          ledger={ledger}
        />
      </SectionCard>

      {/* Quality Checks */}
      <SectionCard
        title="Alert Quality Standards & Escalation Audit"
        moduleIds={['6.12']}
        section="§46.1"
        description="Verification of relevance, actionability, source traceability, and anti-fatigue alert suppression."
      >
        <AlertQualityChecks checks={qualityChecks} />
      </SectionCard>
    </div>
  );
}
