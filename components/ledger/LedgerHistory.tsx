'use client';

import React from 'react';
import type { LedgerHistoryProps } from '@/lib/types';
import { formatDateIST } from '@/lib/format';

export function LedgerHistory({ entry }: LedgerHistoryProps): JSX.Element {
  return (
    <div className="space-y-2 text-xs">
      <span className="font-semibold text-ink block">State Transition History</span>
      <div className="border border-line rounded-md overflow-hidden bg-card p-3 space-y-2 max-h-48 overflow-y-auto">
        {entry.history.map((ev, idx) => (
          <div key={idx} className="pb-2 border-b border-line/50 last:border-0 last:pb-0 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-brand-900">
                {ev.from ? `${ev.from} -> ${ev.to}` : `Initial: ${ev.to}`}
              </span>
              <span className="text-[10px] text-muted-foreground">{formatDateIST(ev.at)}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              <span className="font-medium text-ink">{ev.actor}: </span>
              {ev.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
