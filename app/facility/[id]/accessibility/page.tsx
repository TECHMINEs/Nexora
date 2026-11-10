'use client';

import React from 'react';
import { useFacilityModel, useDemoStore } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
import { SectionCard } from '@/components/common/SectionCard';
import { SchematicMap } from '@/components/facility/SchematicMap';
import { ResourceTable } from '@/components/access/ResourceTable';
import { ResponseDecomposition } from '@/components/access/ResponseDecomposition';
import { AccessibilityScoreCard } from '@/components/access/AccessibilityScoreCard';
import { IncidentSelector } from '@/components/access/IncidentSelector';
import { Metric } from '@/components/common/Metric';
import { EmptyState } from '@/components/common/EmptyState';
import { InsufficientData } from '@/components/common/InsufficientData';
import type { FacilityId, ModuleId } from '@/lib/types';

export default function EmergencyAccessibilityPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  const model = useFacilityModel(facilityId);
  const { accessibility, facility, incidentType } = model;
  const { setIncidentType } = useDemoStore();

  const currentSelection = accessibility.selections[incidentType];
  const modules: ModuleId[] = ['6.11'];

  // Check if any resource has insufficient P90 observations
  const hasInsufficientP90 = accessibility.resources.some((r) => r.insufficient.includes('P90'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Emergency Accessibility</h1>
            <ModuleTag id="6.11" />
          </div>
          <p className="text-xs text-muted-foreground">
            Response time decomposition, percentile transit distributions, and capability-matched resource dispatch.
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          label="Accessibility Score"
          tracked={accessibility.score}
          kind="score100"
          band={accessibility.band}
          size="md"
          facilityId={facilityId}
          caption={accessibility.partial ? 'Partial: reliability excluded' : 'Multi-factor composite score'}
        />
        <Metric
          label="Designated Access Routes"
          tracked={{
            value: facility.accessRoutes,
            confidence: 0.8,
            sourceIds: ['S-OSM-ROADS'],
            assumptionIds: ['ASM-10'],
            section: '§45',
          }}
          kind="count"
          size="md"
          facilityId={facilityId}
          caption="Corridor redundancy"
        />
        <Metric
          label="Primary Capabilities"
          tracked={{
            value: facility.requiredCapabilities.length,
            confidence: 0.9,
            sourceIds: ['S-OSM-ROADS'],
            assumptionIds: ['ASM-10'],
            section: '§74.1',
          }}
          kind="count"
          size="md"
          facilityId={facilityId}
          caption={facility.primaryIncident === 'hazmat' ? 'Hazmat triage' : 'Medical triage'}
        />
        <Metric
          label="Registered Responders"
          tracked={{
            value: accessibility.resources.length,
            confidence: 0.9,
            sourceIds: ['S-OSM-ROADS'],
            assumptionIds: ['ASM-11'],
            section: '§45',
          }}
          kind="count"
          size="md"
          facilityId={facilityId}
          caption="Ambulance & fire bases"
        />
      </div>

      {hasInsufficientP90 && (
        <InsufficientData
          metric="Total P90 Percentile Transit Time"
          required="n ≥ 6 observations"
          available={`${accessibility.resources[0]?.n ?? 0} observations`}
        />
      )}

      {/* Incident Triage Simulation */}
      <IncidentSelector
        value={incidentType}
        onChange={(t) => setIncidentType(facilityId, t)}
        selection={currentSelection}
      />

      {/* Spatial Responder Overlay */}
      <SectionCard
        title="Emergency Responder Base Locations"
        moduleIds={modules}
        section="§45, §74.1"
        description="Spatial distribution of medical, municipal fire, and hazardous materials response stations."
      >
        <SchematicMap
          layout={facility.schematic}
          highlightHazard={null}
          showResponders={true}
          selectedResourceId={currentSelection.selectedResourceId}
          caption={`Selected unit: ${currentSelection.selectedResourceId ?? 'None'} — Highlighted on route network`}
        />
      </SectionCard>

      {/* Capability Matched Resource Table */}
      <SectionCard
        title="Responder Telemetry & Empirical Transit Percentiles"
        moduleIds={['6.11']}
        section="§45, §74.1, ASM-12"
        description="P50/P90/P95 response distributions calculated from partner GPS telemetry."
      >
        {currentSelection.selectedResourceId === null && incidentType === 'hazmat' ? (
          <div className="space-y-4">
            <EmptyState
              title="No hazmat-capable resource in the register"
              reason="No registered unit within regional proximity possesses certified chemical/hazmat suppression capabilities."
              nextStep="Coordinate with district disaster management authority for mutual aid protocol"
            />
            <ResourceTable stats={accessibility.resources} facilityId={facilityId} />
          </div>
        ) : (
          <ResourceTable stats={accessibility.resources} facilityId={facilityId} />
        )}
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Response Time Breakdown"
          moduleIds={['6.11']}
          section="§45"
          description="Decomposed into call dispatch, crew turnout mobilization, and physical transit time."
        >
          <ResponseDecomposition stats={accessibility.resources} />
        </SectionCard>

        <SectionCard
          title="Accessibility Subscore Synthesis"
          moduleIds={['6.11']}
          section="§45.1"
          description="Coverage, speed, reliability, route redundancy, and capability triage weighted factors."
        >
          <AccessibilityScoreCard result={accessibility} facilityId={facilityId} />
        </SectionCard>
      </div>
    </div>
  );
}
