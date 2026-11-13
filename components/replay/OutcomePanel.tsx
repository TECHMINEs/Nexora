'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrackedCell } from '@/components/common/TrackedCell';
import { Badge } from '@/components/ui/badge';
import type { OutcomePanelProps } from '@/lib/types';

export function OutcomePanel({
  outcome,
  replayCase,
  reached,
}: OutcomePanelProps): JSX.Element {
  return (
    <Card className="bg-card border-line shadow-sm text-xs">
      <CardHeader className="pb-3 border-b border-line/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-ink">
            Outcome Learning & Recalibration (§6.15)
          </CardTitle>
          <Badge
            variant="outline"
            className={
              reached
                ? 'border-green-400 bg-green-950/40 text-green-400'
                : 'border-line text-muted-foreground'
            }
          >
            {reached ? 'Post-Mortem Completed' : 'Pending Replay Post-Mortem'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-3">
        {reached ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-canvas rounded-lg border border-line">
              <div>
                <span className="text-muted-foreground text-[11px] block">Modelled Predicted</span>
                <TrackedCell tracked={outcome.predicted} kind="inr" facilityId={replayCase.facilityId} />
              </div>
              <div>
                <span className="text-muted-foreground text-[11px] block">Observed Field Loss</span>
                <TrackedCell tracked={outcome.observed} kind="inr" facilityId={replayCase.facilityId} />
              </div>
              <div>
                <span className="text-muted-foreground text-[11px] block">Initial Error</span>
                <span className="font-mono font-bold text-band-high">
                  {(outcome.error * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px] block">Post-Event Recalibrated</span>
                <div className="flex items-center gap-1">
                  <TrackedCell tracked={outcome.recalibrated} kind="inr" facilityId={replayCase.facilityId} />
                  <span className="font-mono text-[10px] text-green-400">
                    ({(outcome.recalibratedError * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Unmodelled Consequence Observations */}
            <div className="space-y-1.5">
              <span className="font-semibold text-ink block">Unmodelled Secondary Losses Discovered:</span>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                {outcome.unmodelled.map((un, idx) => (
                  <li key={idx}>{un}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground italic text-xs bg-canvas rounded border border-dashed">
            Outcome comparison recorded after reaching the final T+ post-mortem step.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
