'use client';

import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrackedCell } from '@/components/common/TrackedCell';
import { formatINR } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import type { PriorityQueueProps } from '@/lib/types';

export function PriorityQueue({
  items,
  facilityId,
}: PriorityQueueProps): JSX.Element {
  return (
    <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">Rank</TableHead>
            <TableHead className="text-xs">Mitigation Action</TableHead>
            <TableHead className="text-xs">Target</TableHead>
            <TableHead className="text-xs">State</TableHead>
            <TableHead className="text-xs text-center">I</TableHead>
            <TableHead className="text-xs text-center">L</TableHead>
            <TableHead className="text-xs text-center">U (days)</TableHead>
            <TableHead className="text-xs text-center">F</TableHead>
            <TableHead className="text-xs text-center">Product</TableHead>
            <TableHead className="text-xs">Score</TableHead>
            <TableHead className="text-xs">Avoided Loss</TableHead>
            <TableHead className="text-xs">Estimated Cost</TableHead>
            <TableHead className="text-xs text-right">Ledger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const costText =
              item.costMin === null
                ? 'Cost depends on policy terms'
                : item.costMin === item.costMax
                ? formatINR(item.costMin)
                : `${formatINR(item.costMin)} - ${formatINR(item.costMax!)}`;

            return (
              <TableRow key={item.entryId} className="hover:bg-muted/40 transition-colors">
                <TableCell className="font-bold text-ink font-mono text-center">
                  #{item.rank}
                </TableCell>
                <TableCell className="font-semibold text-ink">
                  <div>{item.title}</div>
                  <span className="font-mono text-[10px] text-muted-foreground">{item.entryId}</span>
                </TableCell>
                <TableCell className="capitalize font-medium text-muted-foreground">
                  {item.target}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] capitalize font-mono">
                    {item.state.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-mono">{item.impact}</TableCell>
                <TableCell className="text-center font-mono">{item.likelihood}</TableCell>
                <TableCell className="text-center font-mono">
                  {item.urgency} ({item.daysUntilDue}d)
                </TableCell>
                <TableCell className="text-center font-mono">{item.feasibility}</TableCell>
                <TableCell className="text-center font-mono font-semibold">{item.product}</TableCell>
                <TableCell className="font-bold">
                  <TrackedCell tracked={item.score} kind="score100" facilityId={facilityId} />
                </TableCell>
                <TableCell>
                  {item.avoidedLoss.value > 0 ? (
                    <TrackedCell tracked={item.avoidedLoss} kind="inr" facilityId={facilityId} />
                  ) : (
                    <span className="text-muted-foreground text-[11px] italic">
                      Benefit not monetised in current scenarios
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {costText}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/facility/${facilityId}/ledger?entry=${item.entryId}`}
                    className="text-brand-700 hover:text-brand-900 font-medium hover:underline text-[11px]"
                  >
                    Open
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
