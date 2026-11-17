'use client';

import React from 'react';
import { useFacilityModel } from '@/lib/store';
import { SectionCard } from '@/components/common/SectionCard';
import { Metric } from '@/components/common/Metric';
import { SchematicMap } from '@/components/facility/SchematicMap';
import { ChecklistTable } from '@/components/facility/ChecklistTable';
import { StatusList } from '@/components/facility/StatusList';
import { DriverList } from '@/components/risk/DriverList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FacilityId } from '@/lib/types';
import { Users, Zap, Truck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { formatINR, formatScore100 } from '@/lib/format';

export default function FacilityOverviewPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  const model = useFacilityModel(facilityId);
  const { facility, completeness, preparedness, topRisk, contributionPerDay } = model;

  // Top 3 drivers for top risk
  const topDrivers = {
    ...topRisk,
    drivers: [...topRisk.drivers].sort((a, b) => b.share - a.share).slice(0, 3),
  };

  return (
    <div className="space-y-6">
      <section className="border border-line bg-card p-5 sm:p-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-400">Facility selected</p>
        <h2 className="mt-2 font-display text-xl font-bold text-ink">What could disrupt this factory?</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The leading modelled hazard is <strong className="text-ink">{topRisk.label}</strong>. Its comparative risk score is <strong className="text-ink">{formatScore100(topRisk.Rnorm.value, 0)} / 100</strong>. This score ranks sample hazards; it is not the chance of a disaster.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">The factory contributes about <strong className="text-ink">{formatINR(contributionPerDay.value)} per day</strong>, which helps explain why downtime matters in the next steps.</p>
        <Link href={`/facility/${facilityId}/risk`} className="mt-5 inline-flex min-h-11 items-center justify-center border border-brand-500 bg-brand-500 px-5 py-2 font-display text-sm font-bold uppercase text-black hover:bg-white">Explore this facility&apos;s risks →</Link>
      </section>
      <details className="border border-line bg-card p-4 sm:p-5">
        <summary className="cursor-pointer font-display text-base font-bold text-ink">Explore facility data and layout</summary>
        <div className="mt-5 space-y-6">

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric
          label="Data Completeness"
          tracked={completeness}
          kind="pct"
          size="md"
          facilityId={facilityId}
          caption="17 Appendix A domains"
        />
        <Metric
          label="Controls Preparedness"
          tracked={preparedness}
          kind="score100"
          size="md"
          facilityId={facilityId}
          caption="Weighted active controls"
        />
        <Metric
          label="Contribution Per Day"
          tracked={contributionPerDay}
          kind="inr"
          size="md"
          facilityId={facilityId}
          caption={`${(facility.contributionMargin * 100).toFixed(0)}% contribution margin`}
        />
        <Metric
          label="Top Risk Norm"
          tracked={topRisk.Rnorm}
          kind="score100"
          band={topRisk.band}
          size="md"
          facilityId={facilityId}
          caption={`${topRisk.label} · comparative score, not event probability`}
        />
      </div>

      {/* Identity & Operations Summary */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <div className="2xl:col-span-2 min-w-0 space-y-6">
          <SectionCard
            title="Facility Layout & Hazard Zones"

            description="Geocoded spatial boundary with hazard footprints and access points."
          >
            <SchematicMap
              layout={facility.schematic}
              highlightHazard={topRisk.hazard}
              showResponders={false}
              selectedResourceId={null}
              caption={`${facility.name} — ${facility.builtUpAreaSqft.toLocaleString('en-IN')} sq ft footprint`}
            />
          </SectionCard>

          <SectionCard
            title="Appendix A Onboarding Checklist"

            description="Operational data readiness across physical, operational and financial domains."
          >
            <ChecklistTable
              items={facility.checklist}
              completeness={completeness}
              facilityId={facilityId}
            />
          </SectionCard>
        </div>

        <div className="min-w-0 space-y-6">
          {/* Status snapshot */}
          <SectionCard
            title="Resilience Snapshot"

            description="Pre-disaster posture summary"
          >
            <StatusList model={model} />
          </SectionCard>

          {/* Top Risk Drivers */}
          <SectionCard
            title={`Top Risk: ${topRisk.label}`}

            description="Primary vulnerability drivers contributing to exposure."
          >
            <DriverList risk={topDrivers} facilityId={facilityId} />
          </SectionCard>

          {/* Infrastructure & Operations Card */}
          <Card className="bg-card border-line shadow-sm">
            <CardHeader className="pb-3 border-b border-line/60">
              <CardTitle className="text-sm font-bold text-ink">Operational Identity</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2.5 text-xs">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-3">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  Headcount
                </span>
                <span className="font-semibold text-ink text-right break-words">
                  {facility.headcountTotal} total ({facility.headcountPeakShift} peak shift)
                </span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-3">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                  Grid Power & DG
                </span>
                <span className="font-semibold text-ink text-right break-words">
                  {facility.power.generatorKva} kVA ({facility.power.fuelAutonomyHours} h autonomy)
                </span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-3">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                  Critical Supplier
                </span>
                <span className="font-semibold text-ink text-right break-words" title={facility.criticalSupplier.name}>
                  {facility.criticalSupplier.name} ({facility.criticalSupplier.leadTimeDays}d lead, {facility.criticalSupplier.bufferDays}d buffer)
                </span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-3">
                <span className="text-muted-foreground">MTPD / RTO</span>
                <span className="font-semibold text-ink text-right break-words">
                  {facility.mtpdDays} day(s) / {facility.rtoDays} day(s)
                </span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-3">
                <span className="text-muted-foreground">Access Routes</span>
                <span className="font-semibold text-ink text-right break-words">{facility.accessRoutes} designated route(s)</span>
              </div>
            </CardContent>
          </Card>

          {/* People Exposure Card (Only for facilities with hazardous inventory) */}
          {facility.hazardousInventory && (
            <Card className="bg-card border-line shadow-sm border-stroke bg-panel-2/20">
              <CardHeader className="pb-3 border-b border-stroke/60">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <CardTitle className="text-sm font-bold text-white">People & Community Exposure</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hazardous Material:</span>
                  <span className="font-semibold text-ink">{facility.hazardousInventory.material}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Storage Mass:</span>
                  <span className="font-semibold text-ink">{facility.hazardousInventory.quantityTonnes.toLocaleString('en-IN')} tonnes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Exclusion Radius:</span>
                  <Badge variant="outline" className="border-stroke text-white font-mono">
                    {facility.hazardousInventory.exclusionRadiusKm} km
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-stroke/50">
                  <span className="text-muted-foreground">Community Population in Zone:</span>
                  <span className="font-bold text-band-high font-mono">
                    {facility.hazardousInventory.communityPopulationInZone.toLocaleString('en-IN')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
        </div>
      </details>
    </div>
  );
}
