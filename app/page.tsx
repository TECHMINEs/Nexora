'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio, useDemoStore } from '@/lib/store';
import { SectionCard } from '@/components/common/SectionCard';
import { Metric } from '@/components/common/Metric';
import { TrackedCell } from '@/components/common/TrackedCell';
import { BandBadge } from '@/components/common/BandBadge';
import { Disclaimer } from '@/components/common/Disclaimer';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { formatINR } from '@/lib/format';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage(): JSX.Element {
  const router = useRouter();
  const summary = usePortfolio();
  const { resetDemo } = useDemoStore();

  const chartData = summary.rows.map((r) => ({
    name: r.facilityId === 'fac-wb-metal' ? 'Metal (WB)' : 'Polymer (VZ)',
    facilityId: r.facilityId,
    gapRupees: r.maxExposureGap.value,
    confidence: r.maxExposureGap.confidence,
  }));

  return (
    <div className="space-y-6">
      <section className="border border-line bg-card p-5 sm:p-7">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-400">Illustrative factory walkthrough</p>
        <h1 className="mt-2 max-w-3xl font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">Explore disaster risks, likely losses, and actions that could reduce them.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Choose one of two fictional factories. Nexora calculates how hazards could affect its assets and operations, lets you change a loss scenario, and shows which controls or actions may help. Values are planning illustrations, not predictions for a real site.
        </p>
      </section>

      <section aria-labelledby="choose-facility" className="space-y-3">
        <div><h2 id="choose-facility" className="font-display text-xl font-bold text-ink">Choose a facility</h2><p className="text-sm text-muted-foreground">Start with either sample factory. You can switch later.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          {summary.rows.map((row) => (
            <div key={row.facilityId} className="flex min-w-0 flex-col border border-line bg-card p-5">
              <h3 className="font-display text-lg font-bold text-ink">{row.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Leading modelled hazard: <strong className="text-ink">{row.topRisk.label}</strong></p>
              <p className="mt-1 text-sm text-muted-foreground">Potential protection gap: <strong className="text-ink">{formatINR(row.maxExposureGap.value)}</strong></p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">A protection gap compares estimated exposure with policy terms. It is not an insurance advice or coverage decision.</p>
              <Link href={`/facility/${row.facilityId}`} className="mt-5 inline-flex min-h-11 items-center justify-center border border-brand-500 bg-brand-500 px-4 py-2 font-display text-sm font-bold uppercase text-black hover:bg-white">Explore this facility →</Link>
            </div>
          ))}
        </div>
      </section>

      <details className="border border-line bg-card p-4 sm:p-5">
        <summary className="cursor-pointer font-display text-base font-bold text-ink">Explore portfolio totals and comparisons</summary>
        <div className="mt-5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold font-display text-ink">Portfolio totals</h2>

          </div>
          <p className="text-xs text-muted-foreground">
            Multi-facility pre-disaster exposure roll-up, action conversion and protection analysis.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => resetDemo()}
          className="text-xs h-8 text-muted-foreground hover:text-ink flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset demo</span>
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <Metric
          label="Total Potential Gap"
          tracked={summary.totalGap}
          kind="inr"
          size="md"
          caption="Aggregate across both facilities"
        />
        <Metric
          label="Open Critical Actions"
          tracked={{
            value: summary.openCritical,
            confidence: 0.555,
            sourceIds: ['S-ASSUMPTION'],
            assumptionIds: ['ASM-13'],
            section: '§74',
          }}
          kind="count"
          size="md"
          caption="Score >= 0.40"
        />
        <Metric
          label="Evidence-backed Rate"
          tracked={summary.evidenceBackedRate}
          kind="pct"
          size="md"
          caption="Verified/implemented with evidence"
        />
        <Metric
          label="Action Conversion"
          tracked={summary.actionConversion}
          kind="pct"
          size="md"
          caption="Committed vs open backlog"
        />
        <Metric
          label="Mean Preparedness"
          tracked={summary.meanPreparedness}
          kind="score100"
          size="md"
          caption="Weighted control average"
        />
      </div>

      {/* Facilities Table */}
      <SectionCard
        title="Facility Resilience Posture"

        description="Click a row to navigate directly to the facility dossier."
      >
        <div className="border border-line overflow-x-auto" role="region" aria-label="Facility resilience table, scroll horizontally on small screens">
          <Table className="min-w-[980px]">
            <TableHeader className="bg-canvas">
              <TableRow>
                <TableHead className="text-xs font-semibold">Facility</TableHead>
                <TableHead className="text-xs font-semibold">Top Risk</TableHead>
                <TableHead className="text-xs font-semibold">Preparedness</TableHead>
                <TableHead className="text-xs font-semibold">Completeness</TableHead>
                <TableHead className="text-xs font-semibold">Accessibility</TableHead>
                <TableHead className="text-xs font-semibold">Max-Exposure Gap</TableHead>
                <TableHead className="text-xs font-semibold text-center">Open Critical</TableHead>
                <TableHead className="text-xs font-semibold">Largest Residual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.rows.map((row) => (
                <TableRow
                  key={row.facilityId}
                  onClick={() => router.push(`/facility/${row.facilityId}`)}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="font-semibold text-xs text-brand-900">
                    <div>{row.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{row.facilityId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium">{row.topRisk.label}</span>
                      <BandBadge band={row.topRisk.band} />
                      <TrackedCell tracked={row.topRisk.Rnorm} kind="score100" facilityId={row.facilityId} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <TrackedCell tracked={row.preparedness} kind="score100" facilityId={row.facilityId} />
                  </TableCell>
                  <TableCell>
                    <TrackedCell tracked={row.completeness} kind="pct" facilityId={row.facilityId} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <BandBadge band={row.accessBand} />
                        <TrackedCell tracked={row.accessibility} kind="score100" facilityId={row.facilityId} />
                      </div>
                      {row.accessPartial && (
                        <span className="text-[10px] text-white font-medium">
                          Partial: reliability needs n ≥ 6
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TrackedCell tracked={row.maxExposureGap} kind="inr" facilityId={row.facilityId} />
                  </TableCell>
                  <TableCell className="text-center font-bold text-xs">
                    {row.openCritical}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <span className="font-mono text-[10px] text-muted-foreground block">
                        {row.largestResidual.scenarioId}
                      </span>
                      <TrackedCell tracked={row.largestResidual.loss} kind="inr" facilityId={row.facilityId} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {summary.openCritical === 0 && (
          <div className="mt-4">
            <EmptyState
              title="No open critical actions"
              reason="All critical mitigation items have been verified or retired across the portfolio."
              nextStep="Review the ledger for drift"
            />
          </div>
        )}
      </SectionCard>

      {/* Gap Chart */}
      <SectionCard
        title="Potential Protection Gap by Facility"

        description="Unhedged pre-disaster exposure across building, machinery, stock, and business interruption."
      >
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#FFFFFF' }} />
              <YAxis
                tickFormatter={(v) => formatINR(v, { unit: 'cr', digits: 1 })}
                tick={{ fontSize: 11, fill: '#A3A3A3' }}
              />
              <Tooltip
                formatter={(value: unknown, _name: unknown, entry: unknown) => {
                  const num = typeof value === 'number' ? value : Number(value) || 0;
                  const item = entry as { payload?: { confidence?: number } };
                  const conf = item?.payload?.confidence ?? 0.555;
                  return [
                    `${formatINR(num)} (data confidence: ${Math.round(conf * 100)}%)`,
                    'Potential Protection Gap',
                  ];
                }}
              />
              <Bar dataKey="gapRupees" fill="#FF2626" radius={0}>
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill="#FF2626" stroke="#A9A9A9" strokeWidth={1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3">
          <Disclaimer variant="insurance" />
        </div>
      </SectionCard>
        </div>
      </details>
    </div>
  );
}
