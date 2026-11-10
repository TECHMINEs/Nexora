'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrackedCell } from '@/components/common/TrackedCell';
import { Badge } from '@/components/ui/badge';
import type { DrillTableProps } from '@/lib/types';

export function DrillTable({ drills, facilityId }: DrillTableProps): JSX.Element {
  return (
    <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">Drill / Exercise Type</TableHead>
            <TableHead className="text-xs">Interval</TableHead>
            <TableHead className="text-xs">Last Run Date</TableHead>
            <TableHead className="text-xs">Next Due</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs">Speed Effectiveness</TableHead>
            <TableHead className="text-xs">Audit Gaps Identified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drills.map((d) => (
            <TableRow key={d.drill.id}>
              <TableCell className="font-semibold text-ink">
                <div>{d.drill.type}</div>
                <span className="font-mono text-[10px] text-muted-foreground">{d.drill.id}</span>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {d.drill.intervalDays} days
              </TableCell>
              <TableCell className="font-mono">
                {d.drill.lastRun ? d.drill.lastRun : 'Never run'}
              </TableCell>
              <TableCell className="font-mono">
                {d.nextDue ? d.nextDue : 'Overdue'}
              </TableCell>
              <TableCell>
                {d.overdue ? (
                  <Badge variant="outline" className="border-rose-400 bg-rose-950/40 text-rose-400 font-bold text-[10px]">
                    Overdue
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-950/40 text-emerald-400 text-[10px]">
                    Current
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {d.effectiveness ? (
                  <TrackedCell tracked={d.effectiveness} kind="pct" facilityId={facilityId} />
                ) : (
                  <span className="text-muted-foreground text-[10px] italic">Insufficient data</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-[11px] max-w-xs truncate" title={d.drill.gaps.join(', ')}>
                {d.drill.gaps.join('; ')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
