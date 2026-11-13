'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfidenceChip } from '@/components/common/ConfidenceChip';
import { Badge } from '@/components/ui/badge';
import type { ResourceTableProps } from '@/lib/types';

export function ResourceTable({ stats }: ResourceTableProps): JSX.Element {
  return (
    <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">Responder Unit</TableHead>
            <TableHead className="text-xs">Type & Capabilities</TableHead>
            <TableHead className="text-xs">Distance</TableHead>
            <TableHead className="text-xs text-center">Obs Count (n)</TableHead>
            <TableHead className="text-xs">Travel P50</TableHead>
            <TableHead className="text-xs">Total P50</TableHead>
            <TableHead className="text-xs">Total P90</TableHead>
            <TableHead className="text-xs">Total P95</TableHead>
            <TableHead className="text-xs text-right">Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((st) => (
            <TableRow key={st.resource.id}>
              <TableCell className="font-semibold text-ink">
                <div>{st.resource.label}</div>
                <span className="font-mono text-[10px] text-muted-foreground">{st.resource.id}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {st.resource.capabilities.map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px] font-mono">
                      {c}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {st.resource.distanceKm.toFixed(1)} km
              </TableCell>
              <TableCell className="text-center font-mono font-medium">
                {st.n}
              </TableCell>
              <TableCell className="font-mono text-ink">
                {st.travelP50 !== null ? `${st.travelP50.toFixed(2)} min` : '—'}
              </TableCell>
              <TableCell className="font-mono font-bold text-brand-900">
                {st.totalP50 !== null ? `${st.totalP50.toFixed(2)} min` : '—'}
              </TableCell>
              <TableCell className="font-mono text-ink">
                {st.totalP90 !== null ? (
                  `${st.totalP90.toFixed(2)} min`
                ) : (
                  <span className="text-white text-[10px] italic">Insufficient (n &lt; 6)</span>
                )}
              </TableCell>
              <TableCell className="font-mono text-ink">
                {st.totalP95 !== null ? (
                  `${st.totalP95.toFixed(2)} min`
                ) : (
                  <span className="text-white text-[10px] italic">Insufficient (n &lt; 10)</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <ConfidenceChip confidence={st.confidence} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
