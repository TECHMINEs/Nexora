'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFacilityModel, useDemoStore } from '@/lib/store';
import { ModuleTag } from '@/components/common/ModuleTag';
import { SectionCard } from '@/components/common/SectionCard';
import { LedgerTable } from '@/components/ledger/LedgerTable';
import { LedgerTransitionDialog } from '@/components/ledger/LedgerTransitionDialog';
import { LedgerHistory } from '@/components/ledger/LedgerHistory';
import { VerificationHierarchy } from '@/components/ledger/VerificationHierarchy';
import { Metric } from '@/components/common/Metric';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateIST } from '@/lib/format';
import type { FacilityId, LedgerKind, ModuleId } from '@/lib/types';

function LedgerContent({ facilityId }: { facilityId: FacilityId }): JSX.Element {
  const model = useFacilityModel(facilityId);
  const { ledger, preparedness } = model;
  const { transitionLedger } = useDemoStore();

  const searchParams = useSearchParams();
  const entryQuery = searchParams.get('entry');

  const [selectedId, setSelectedId] = useState<string | null>(entryQuery ?? ledger[0]?.id ?? null);
  const [kindFilter, setKindFilter] = useState<LedgerKind | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedEntry = ledger.find((e) => e.id === selectedId) ?? ledger[0];
  const modules: ModuleId[] = ['6.8'];

  // Latest evidence method if available
  const latestMethod = selectedEntry?.evidence[selectedEntry.evidence.length - 1]?.method ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-ink">Resilience Ledger</h1>
            <ModuleTag id="6.8" />
          </div>
          <p className="text-xs text-muted-foreground">
            Auditable lifecycle state machine for physical controls and capital mitigations with cryptographic-grade evidence verification.
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          label="Preparedness Score"
          tracked={preparedness}
          kind="score100"
          size="md"
          facilityId={facilityId}
          caption="Weighted active verified controls"
        />
        <Metric
          label="Total Registered Controls"
          tracked={{
            value: ledger.filter((e) => e.kind === 'control').length,
            confidence: 0.684,
            sourceIds: ['S-CUST-ASSET-A'],
            assumptionIds: ['ASM-15'],
            section: '§44',
          }}
          kind="count"
          size="md"
          facilityId={facilityId}
          caption="Baseline asset controls"
        />
        <Metric
          label="Active Mitigations"
          tracked={{
            value: ledger.filter((e) => e.kind === 'mitigation' && e.state !== 'retired').length,
            confidence: 0.684,
            sourceIds: ['S-CUST-ASSET-A'],
            assumptionIds: ['ASM-15'],
            section: '§44',
          }}
          kind="count"
          size="md"
          facilityId={facilityId}
          caption="Open & verified mitigations"
        />
        <Metric
          label="Drift Detected Items"
          tracked={{
            value: ledger.filter((e) => e.state === 'drift_detected').length,
            confidence: 0.684,
            sourceIds: ['S-CUST-ASSET-A'],
            assumptionIds: ['ASM-15'],
            section: '§44',
          }}
          kind="count"
          size="md"
          facilityId={facilityId}
          caption="Overdue or expired controls"
        />
      </div>

      {/* Main Ledger Table */}
      <SectionCard
        title="Control & Mitigation Registry"
        moduleIds={modules}
        section="§44, §44.1"
        description="Filter and click an action to inspect evidence hierarchy and execute state transitions."
        actions={
          <div className="flex items-center gap-1.5">
            <Button
              variant={kindFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKindFilter('all')}
              className="text-xs h-7 px-2.5"
            >
              All
            </Button>
            <Button
              variant={kindFilter === 'control' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKindFilter('control')}
              className="text-xs h-7 px-2.5"
            >
              Controls
            </Button>
            <Button
              variant={kindFilter === 'mitigation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKindFilter('mitigation')}
              className="text-xs h-7 px-2.5"
            >
              Mitigations
            </Button>
          </div>
        }
      >
        <LedgerTable
          entries={ledger}
          selectedId={selectedId}
          onSelect={setSelectedId}
          kindFilter={kindFilter}
        />
      </SectionCard>

      {/* Selected Entry Detail Panel */}
      {selectedEntry && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 bg-card border border-line rounded-lg space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-900 bg-brand-50 px-2 py-0.5 rounded border border-brand-300">
                      {selectedEntry.id}
                    </span>
                    <h2 className="text-base font-bold text-ink">{selectedEntry.title}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target: <span className="capitalize font-medium text-ink">{selectedEntry.target}</span> &bull; Section: {selectedEntry.section}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  className="bg-brand-500 hover:bg-brand-700 text-white text-xs h-8 self-start sm:self-auto"
                >
                  Execute Transition
                </Button>
              </div>

              {/* Evidence Registry */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-ink block">Verified Evidence Records</span>
                {selectedEntry.evidence.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEntry.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-lg border bg-canvas text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-brand-900">{ev.id}</span>
                          <span className="text-[10px] text-muted-foreground">{formatDateIST(ev.timestamp)}</span>
                        </div>
                        <p className="text-ink font-medium">{ev.description}</p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-line/60">
                          <span>Method: <Badge variant="outline" className="text-[10px] font-mono capitalize">{ev.method.replace('_', ' ')}</Badge></span>
                          <span>Verifier: {ev.verifier ?? 'Self-declared'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-canvas rounded border text-muted-foreground italic text-xs">
                    No evidence submitted for this record.
                  </div>
                )}
              </div>

              {/* Transition History Component */}
              <LedgerHistory entry={selectedEntry} />
            </div>
          </div>

          <div className="space-y-4">
            <SectionCard
              title="Verification Standards"
              moduleIds={['6.8']}
              section="§44.1"
              description="Required evidence standards"
            >
              <VerificationHierarchy highlight={latestMethod} />
            </SectionCard>
          </div>
        </div>
      )}

      {selectedEntry && (
        <LedgerTransitionDialog
          entry={selectedEntry}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={(to, payload) => transitionLedger(selectedEntry.id, to, payload)}
        />
      )}
    </div>
  );
}

export default function ResilienceLedgerPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const facilityId = params.id as FacilityId;
  return (
    <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading Resilience Ledger...</div>}>
      <LedgerContent facilityId={facilityId} />
    </Suspense>
  );
}
