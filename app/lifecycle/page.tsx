'use client';

import React, { useState } from 'react';
import { useDemoStore, useFacilityModel } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
import { SectionCard } from '@/components/common/SectionCard';
import { StateMachineDiagram } from '@/components/lifecycle/StateMachineDiagram';
import { ModeCards } from '@/components/lifecycle/ModeCards';
import { BcpPanel } from '@/components/lifecycle/BcpPanel';
import { DrillTable } from '@/components/lifecycle/DrillTable';
import { Metric } from '@/components/common/Metric';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FACILITY_IDS, getFacility } from '@/data';
import type { FacilityId, ModuleId, EventState } from '@/lib/types';

export default function LifecyclePage(): JSX.Element {
  const { state } = useDemoStore();
  const [selectedFacilityId, setSelectedFacilityId] = useState<FacilityId>('fac-wb-metal');

  const model = useFacilityModel(selectedFacilityId);
  const { preparedness, bcp, drills } = model;

  const currentReplayState = state.replay.eventState;
  const visitedStates: EventState[] = ['NORMAL'];
  state.replay.log.forEach((l) => {
    if (!visitedStates.includes(l.to)) visitedStates.push(l.to);
  });

  const modules: ModuleId[] = ['6.9', '6.10'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Lifecycle & Event State Machine</h1>
            <ModuleTag id="6.9" />
            <ModuleTag id="6.10" />
          </div>
          <p className="text-xs text-muted-foreground">
            The four operating modes (Deck s7) and the seven-state emergency escalation protocol with assigned role owners (Deck s10).
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Active Facility:</span>
          <Select
            value={selectedFacilityId}
            onValueChange={(val) => setSelectedFacilityId(val as FacilityId)}
          >
            <SelectTrigger className="w-[240px] h-8 text-xs bg-card font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FACILITY_IDS.map((fid) => {
                const f = getFacility(fid);
                return (
                  <SelectItem key={fid} value={fid} className="text-xs">
                    {f.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          label="Preparedness Index"
          tracked={preparedness}
          kind="score100"
          size="md"
          facilityId={selectedFacilityId}
          caption="Weighted active controls"
        />
        <Metric
          label="Critical Processes"
          tracked={{
            value: bcp.criticalProcesses.length,
            confidence: 0.8,
            sourceIds: [bcp.sourceId],
            assumptionIds: ['ASM-15'],
            section: '§6.9',
          }}
          kind="count"
          size="md"
          facilityId={selectedFacilityId}
          caption="Protected RTO/MTPD operations"
        />
        <Metric
          label="Overdue Drills"
          tracked={{
            value: drills.filter((d) => d.overdue).length,
            confidence: 0.8,
            sourceIds: [bcp.sourceId],
            assumptionIds: ['ASM-15'],
            section: '§6.10',
          }}
          kind="count"
          size="md"
          facilityId={selectedFacilityId}
          caption="Action required"
        />
        <Metric
          label="Unassigned Roles"
          tracked={{
            value: bcp.roles.filter((r) => !r.assigned).length,
            confidence: 0.8,
            sourceIds: [bcp.sourceId],
            assumptionIds: ['ASM-15'],
            section: '§40',
          }}
          kind="count"
          size="md"
          facilityId={selectedFacilityId}
          caption="Shift coverage vulnerability"
        />
      </div>

      {/* State Machine Transition Diagram */}
      <SectionCard
        title="Command Event State Machine (Deck s10)"
        moduleIds={['6.9']}
        section="Deck s10"
        description="The seven sequential event states and designated role owners. Current state reflects active replay position."
      >
        <StateMachineDiagram
          current={currentReplayState}
          visited={visitedStates}
        />
      </SectionCard>

      {/* Four Operating Modes */}
      <SectionCard
        title="Continuous Operational Modes (Deck s7)"
        moduleIds={['6.9']}
        section="Deck s7"
        description="Four operating phases across pre-disaster planning, active hazard mitigation, emergency response, and recovery learning."
      >
        <ModeCards facilityId={selectedFacilityId} current={currentReplayState} />
      </SectionCard>

      {/* BCP Processes & Roles */}
      <SectionCard
        title="Business Continuity Plan (BCP) & Shift Roles"
        moduleIds={modules}
        section="§6.9, §40"
        description="Recovery Time Objectives (RTO), Maximum Tolerable Period of Disruption (MTPD), and designated emergency role holders."
      >
        <BcpPanel bcp={bcp} />
      </SectionCard>

      {/* Testing & Drills Registry */}
      <SectionCard
        title="Testing & Emergency Evacuation Drills"
        moduleIds={['6.10']}
        section="§6.10, §26"
        description="Empirical drill timing, participant compliance, and speed effectiveness audits."
      >
        <DrillTable drills={drills} facilityId={selectedFacilityId} />
      </SectionCard>
    </div>
  );
}
