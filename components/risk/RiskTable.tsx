'use client';

import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrackedCell } from '@/components/common/TrackedCell';
import { BandBadge } from '@/components/common/BandBadge';
import type { RiskTableProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function RiskTable({
  risks,
  selectedHazard,
  onSelect,
  facilityId,
}: RiskTableProps): JSX.Element {
  return (
    <div className="border border-line rounded-md overflow-hidden bg-card">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">Hazard</TableHead>
            <TableHead className="text-xs">Intensity (H)</TableHead>
            <TableHead className="text-xs">Exposure (E)</TableHead>
            <TableHead className="text-xs">Vulnerability (V)</TableHead>
            <TableHead className="text-xs">Criticality (C)</TableHead>
            <TableHead className="text-xs">Mitigation (M)</TableHead>
            <TableHead className="text-xs">Risk Index (R)</TableHead>
            <TableHead className="text-xs">Rnorm (0-100)</TableHead>
            <TableHead className="text-xs">Band</TableHead>
            <TableHead className="text-xs">Verified Controls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map((r) => {
            const isSelected = selectedHazard === r.hazard;
            return (
              <TableRow
                key={r.hazard}
                onClick={() => onSelect(r.hazard)}
                className={cn(
                  'cursor-pointer text-xs transition-colors',
                  isSelected ? 'bg-brand-50/70 font-medium' : 'hover:bg-muted/40'
                )}
              >
                <TableCell className="font-semibold text-ink capitalize">
                  {r.label}
                </TableCell>
                <TableCell>
                  <TrackedCell tracked={r.H} kind="ratio" facilityId={facilityId} />
                </TableCell>
                <TableCell>
                  <TrackedCell tracked={r.E} kind="ratio" facilityId={facilityId} />
                </TableCell>
                <TableCell>
                  <TrackedCell tracked={r.V} kind="ratio" facilityId={facilityId} />
                </TableCell>
                <TableCell>
                  <TrackedCell tracked={r.C} kind="count" facilityId={facilityId} />
                </TableCell>
                <TableCell>
                  <TrackedCell tracked={r.M} kind="ratio" facilityId={facilityId} />
                </TableCell>
                <TableCell>
                  <TrackedCell tracked={r.R} kind="index" facilityId={facilityId} />
                </TableCell>
                <TableCell className="font-bold">
                  <TrackedCell tracked={r.Rnorm} kind="score100" facilityId={facilityId} />
                </TableCell>
                <TableCell>
                  <BandBadge band={r.band} />
                </TableCell>
                <TableCell>
                  {r.contributingEntryIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {r.contributingEntryIds.map((id) => (
                        <Link
                          key={id}
                          href={`/facility/${facilityId}/ledger?entry=${id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-[10px] text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-300 rounded px-1.5 py-0.5"
                        >
                          {id}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[10px]">None</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
