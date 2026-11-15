'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BandBadge } from '@/components/common/BandBadge';
import { Badge } from '@/components/ui/badge';
import type { AccessibilityScoreCardProps } from '@/lib/types';

export function AccessibilityScoreCard({
  result,
}: AccessibilityScoreCardProps): JSX.Element {
  const factorNames: Record<string, string> = {
    coverage: 'Response coverage',
    reliability: 'Response reliability',
    speed: 'Average response speed',
    redundancy: 'Alternative access routes',
    capabilityMatch: 'Right responder capability',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-canvas border rounded-lg">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Overall Accessibility Score
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-bold font-display text-ink">
              {(result.score.value * 100).toFixed(2)}
            </span>
            <BandBadge band={result.band} />
            {result.partial && (
              <Badge variant="outline" className="border-stroke text-white bg-panel-2 text-[10px]">
                Partial: reliability excluded
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          A comparative score out of 100 for how quickly and reliably responders could reach the sample site. Small samples may make it partial.
        </p>
      </div>

      <div className="border border-line rounded-md overflow-x-auto bg-card text-xs" role="region" aria-label="Accessibility factors, scroll horizontally on small screens">
        <Table className="min-w-[580px]">
          <TableHeader className="bg-canvas">
            <TableRow>
              <TableHead className="text-xs">Subscore Factor</TableHead>
              <TableHead className="text-xs text-center">Weight</TableHead>
              <TableHead className="text-xs text-right">Factor Value</TableHead>
              <TableHead className="text-xs">Audit Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.subscores.map((sub) => (
              <TableRow key={sub.factor}>
                <TableCell className="font-semibold text-ink">
                  {factorNames[sub.factor] ?? sub.factor}
                </TableCell>
                <TableCell className="text-center font-mono text-muted-foreground">
                  {(sub.weight * 100).toFixed(0)}%
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-brand-900">
                  {sub.value !== null ? sub.value.toFixed(3) : 'Insufficient data'}
                </TableCell>
                <TableCell className="text-muted-foreground text-[11px]">{sub.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
