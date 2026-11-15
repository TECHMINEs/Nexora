'use client';

import React from 'react';
import { useFacilityModel } from '@/lib/store';
import { SectionCard } from '@/components/common/SectionCard';
import { PriorityQueue } from '@/components/mitigation/PriorityQueue';
import { EmptyState } from '@/components/common/EmptyState';
import type { FacilityId } from '@/lib/types';
import Link from 'next/link';
import { formatINR, formatScore100 } from '@/lib/format';

export default function MitigationPlanPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  const model = useFacilityModel(facilityId);
  const { priorities, ledger } = model;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Mitigation Plan</h1>

          </div>
          <p className="text-sm text-muted-foreground">See which proposed actions could reduce modelled loss, and what evidence is still needed.</p>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {priorities.slice(0, 3).map((item) => (
          <article key={item.entryId} className="flex min-w-0 flex-col border border-line bg-card p-5">
            <p className="font-mono text-xs font-bold uppercase text-brand-400">Priority {item.rank}</p>
            <h2 className="mt-2 font-display text-lg font-bold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Priority score: <strong className="text-ink">{formatScore100(item.score.value, 0)} / 100</strong></p>
            <p className="mt-1 text-sm text-muted-foreground">Potential avoided loss: <strong className="text-ink">{item.avoidedLoss.value > 0 ? formatINR(item.avoidedLoss.value) : 'not estimated'}</strong></p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">This benefit is conditional on implementation and verification; it is not a guaranteed saving.</p>
            <Link href={`/facility/${facilityId}/ledger?entry=${item.entryId}`} className="mt-auto pt-4 text-sm font-semibold text-brand-400 underline underline-offset-4">Review action evidence →</Link>
          </article>
        ))}
      </section>
      <details className="border border-line bg-card p-4 sm:p-5">
        <summary className="cursor-pointer font-display text-base font-bold text-ink">Explore the full action ranking and scoring</summary>
        <div className="mt-5 space-y-5">
      {/* Formula Strip Card */}
      <div className="p-3 bg-card border border-line rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
            Optimiser Formula:
          </span>
          <span className="font-mono text-ink font-semibold">
            Priority = (Impact &times; Likelihood &times; Urgency &times; Feasibility) &divide; 625
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Critical Threshold &ge; 40.0 &bull; Scale [0 - 100]
        </span>
      </div>

      {/* Main Priority Queue Table */}
      <SectionCard
        title="Ranked Mitigation Priority Queue"

        description="Active capital projects and operating mitigations awaiting procurement or verified proof."
      >
        {priorities.length > 0 ? (
          <PriorityQueue items={priorities} ledger={ledger} facilityId={facilityId} />
        ) : (
          <EmptyState
            title="All mitigations verified or retired"
            reason="There are no open or pending mitigation initiatives in the facility backlog."
            nextStep="Review the Resilience Ledger for periodic control drift"
          />
        )}
      </SectionCard>
        </div>
      </details>
    </div>
  );
}
