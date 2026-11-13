'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrackedCell } from '@/components/common/TrackedCell';
import { Badge } from '@/components/ui/badge';
import { coverageClassLabel } from '@/lib/format';
import type { GapTableProps } from '@/lib/types';

export function GapTable({ gap, facilityId }: GapTableProps): JSX.Element {
  return (
    <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">Coverage Class</TableHead>
            <TableHead className="text-xs">Exposure (L)</TableHead>
            <TableHead className="text-xs">Usable Protection (I)</TableHead>
            <TableHead className="text-xs">Potential Gap (G)</TableHead>
            <TableHead className="text-xs">Policy Status</TableHead>
            <TableHead className="text-xs">Terms & Excess Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gap.rows.map((row) => (
            <TableRow key={row.coverageClass}>
              <TableCell className="font-semibold text-ink">
                {coverageClassLabel(row.coverageClass)}
              </TableCell>
              <TableCell>
                <TrackedCell tracked={row.exposure} kind="inr" facilityId={facilityId} />
              </TableCell>
              <TableCell>
                <TrackedCell tracked={row.usableProtection} kind="inr" facilityId={facilityId} />
              </TableCell>
              <TableCell className="font-bold text-band-high">
                <TrackedCell tracked={row.gap} kind="inr" facilityId={facilityId} />
              </TableCell>
              <TableCell>
                {row.covered ? (
                  <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-950/40 text-[10px]">
                    Covered
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-500/40 text-red-400 bg-red-950/40 text-[10px]">
                    Not Covered
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-[11px] max-w-xs truncate" title={row.note}>
                {row.note}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-canvas font-bold border-t-2">
            <TableCell className="text-ink">Total Exposure & Gap</TableCell>
            <TableCell>
              <TrackedCell tracked={gap.totals.exposure} kind="inr" facilityId={facilityId} />
            </TableCell>
            <TableCell>
              <TrackedCell tracked={gap.totals.protection} kind="inr" facilityId={facilityId} />
            </TableCell>
            <TableCell className="font-bold text-band-high">
              <TrackedCell tracked={gap.totals.gap} kind="inr" facilityId={facilityId} />
            </TableCell>
            <TableCell colSpan={2} className="text-muted-foreground font-normal text-[11px]">
              Adviser review required
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
