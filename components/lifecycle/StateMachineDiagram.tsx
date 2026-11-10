'use client';

import React from 'react';
import { EVENT_STATE_ORDER, OWNER_BY_STATE } from '@/lib/constants';
import type { StateMachineDiagramProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

export function StateMachineDiagram({
  current,
  visited,
}: StateMachineDiagramProps): JSX.Element {
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between text-muted-foreground font-semibold pb-1">
        <span>Operational Event State Machine (Deck s10)</span>
        <span className="font-mono text-[10px]">7 Discrete Command Transitions</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {EVENT_STATE_ORDER.map((st, idx) => {
          const isCurrent = current === st;
          const isVisited = visited.includes(st);

          return (
            <div
              key={st}
              className={cn(
                'p-2.5 rounded-lg border flex flex-col justify-between gap-1 transition-all text-center',
                isCurrent
                  ? 'border-brand-500 bg-brand-50 shadow-md ring-2 ring-brand-500'
                  : isVisited
                  ? 'border-emerald-500/40 bg-emerald-950/40/50'
                  : 'border-line bg-card opacity-60'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">0{idx + 1}</span>
                {isVisited && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
              </div>

              <div className="font-bold text-xs font-mono text-ink tracking-tight">
                {st}
              </div>

              <div className="pt-1 border-t border-line/50 text-[10px] text-muted-foreground truncate" title={OWNER_BY_STATE[st]}>
                {OWNER_BY_STATE[st]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
