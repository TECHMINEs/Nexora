'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { windowLabel } from '@/lib/format';
import type { AdvisoryListProps, MonitoringWindow } from '@/lib/types';
import { BellRing, CheckCircle, Radio } from 'lucide-react';

export function AdvisoryList({
  advisories,
  firedIds,
  ledger,
}: AdvisoryListProps): JSX.Element {
  // Group by monitoring window
  const windowOrder: MonitoringWindow[] = ['7d', '72h', '24h', '6h', '1h', 'post_event'];

  const ledgerMap = new Map(ledger.map((l) => [l.id, l.title]));

  return (
    <div className="space-y-4">
      {windowOrder.map((win) => {
        const winAdvisories = advisories.filter((a) => a.window === win);
        if (winAdvisories.length === 0) return null;

        return (
          <div key={win} className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-line">
              <Radio className="w-3.5 h-3.5 text-brand-700" />
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Window: {windowLabel(win)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {winAdvisories.map((adv) => {
                const isFired = firedIds.includes(adv.id);
                return (
                  <div
                    key={adv.id}
                    className={`p-3 rounded-lg border text-xs space-y-2 transition-colors ${
                      isFired
                        ? 'bg-panel-2/60 border-stroke text-white shadow-sm'
                        : 'bg-card border-line/70 text-muted-foreground opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {isFired ? (
                          <BellRing className="w-3.5 h-3.5 text-white animate-pulse" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="font-bold">{adv.id}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-mono ${
                          isFired
                            ? 'border-stroke bg-panel-2 text-white font-bold'
                            : 'border-line text-muted-foreground'
                        }`}
                      >
                        {isFired ? 'Fired / Active' : 'Idle / Armed'}
                      </Badge>
                    </div>

                    <p className="text-ink font-medium leading-relaxed">{adv.text}</p>

                    {adv.ledgerEntryIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-line/40 text-[10px]">
                        <span className="text-muted-foreground">Action Triggers:</span>
                        {adv.ledgerEntryIds.map((lid) => (
                          <span
                            key={lid}
                            className="font-mono bg-canvas px-1.5 py-0.5 rounded border text-brand-900 font-medium"
                          >
                            {lid}: {ledgerMap.get(lid) ?? 'Mitigation Action'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
