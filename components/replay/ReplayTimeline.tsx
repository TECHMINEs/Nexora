'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatOffsetHours } from '@/lib/format';
import type { ReplayTimelineProps } from '@/lib/types';
import { SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReplayTimeline({
  replayCase,
  stepIndex,
  log,
  onStep,
  onReset,
}: ReplayTimelineProps): JSX.Element {
  const steps = replayCase.steps;

  return (
    <div className="space-y-4 p-4 bg-card border border-line rounded-lg text-xs shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">Replay Timeline Controls</span>
            <Badge variant="outline" className="font-mono text-[10px]">
              Step {stepIndex + 1} of {steps.length}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Deterministic state-machine playback: step forward, backward, or reset to baseline T&minus;7d.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStep(-1)}
            disabled={stepIndex < 0}
            className="h-8 text-xs flex items-center gap-1"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span>Step Back</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onStep(1)}
            disabled={stepIndex >= steps.length - 1}
            className="bg-brand-500 hover:bg-brand-700 text-white h-8 text-xs flex items-center gap-1"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step Forward</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 text-xs text-muted-foreground hover:text-ink flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Step Progress Circles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-1">
        {steps.map((st, idx) => {
          const isPassed = idx <= stepIndex;
          const isCurrent = idx === stepIndex;
          const logEntry = log[idx];

          return (
            <div
              key={st.id}
              className={cn(
                'p-2 rounded border transition-all text-center space-y-1',
                isCurrent
                  ? 'border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500'
                  : isPassed
                  ? 'border-emerald-500/40 bg-emerald-950/40/40'
                  : 'border-line/70 bg-canvas opacity-70'
              )}
            >
              <div className="font-mono font-bold text-[11px] text-ink">
                {formatOffsetHours(st.offsetHours)}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground block truncate">
                {st.window}
              </div>
              {logEntry ? (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[9px] px-1 py-0 font-mono font-semibold',
                    logEntry.to === 'INCIDENT'
                      ? 'border-rose-400 bg-rose-950/40 text-rose-400'
                      : logEntry.to === 'ALERT'
                      ? 'border-orange-400 bg-orange-950/40 text-orange-400'
                      : 'border-line text-ink'
                  )}
                >
                  {logEntry.to}
                </Badge>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Note */}
      {stepIndex >= 0 && steps[stepIndex] && (
        <div className="p-3 bg-canvas rounded border border-line space-y-1 text-xs">
          <div className="flex items-center justify-between font-medium">
            <span className="font-bold text-ink">
              {formatOffsetHours(steps[stepIndex].offsetHours)}: {steps[stepIndex].label}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Official: {steps[stepIndex].officialSource}
            </span>
          </div>
          <p className="text-muted-foreground text-[11px]">{steps[stepIndex].note}</p>
        </div>
      )}
    </div>
  );
}
