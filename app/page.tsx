'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio, useDemoStore } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
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
import type { ModuleId } from '@/lib/types';

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

  const modules: ModuleId[] = ['6.14'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Portfolio Intelligence</h1>
            <ModuleTag id="6.14" />
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
        moduleIds={modules}
        section="§6.14"
        description="Click a row to navigate directly to the facility dossier."
      >
        <div className="rounded-md border border-line overflow-hidden">
          <Table>
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
                        <span className="text-[10px] text-amber-400 font-medium">
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
        moduleIds={modules}
        section="§6.14, Deck s11"
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
                    `${formatINR(num)} (conf: ${conf.toFixed(2)})`,
                    'Potential Protection Gap',
                  ];
                }}
              />
              <Bar dataKey="gapRupees" fill="#FF0000" radius={0}>
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill="#FF0000" stroke="#FF5F1F" strokeWidth={1} />
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
  );
}
