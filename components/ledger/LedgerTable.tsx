'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LedgerTableProps, LedgerState } from '@/lib/types';

export function LedgerTable({
  entries,
  selectedId,
  onSelect,
  kindFilter,
}: LedgerTableProps): JSX.Element {
  const filtered = entries.filter((e) => {
    if (kindFilter === 'all') return true;
    return e.kind === kindFilter;
  });

  const stateColors: Record<LedgerState, string> = {
    recommended: 'bg-[#0a0a0a] text-neutral-200 border-red-900/40',
    accepted: 'bg-cyan-950/40 text-cyan-400 border-cyan-500/40',
    in_procurement: 'bg-orange-950/40 text-orange-400 border-orange-500/40',
    implemented: 'bg-amber-950/40 text-amber-400 border-amber-500/40',
    verified: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40',
    drift_detected: 'bg-rose-950/40 text-rose-400 border-rose-500/40',
    retired: 'bg-[#0a0a0a] text-neutral-400 border-red-900/40 line-through',
  };

  return (
    <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">ID</TableHead>
            <TableHead className="text-xs">Kind</TableHead>
            <TableHead className="text-xs">Title</TableHead>
            <TableHead className="text-xs">Target</TableHead>
            <TableHead className="text-xs">Current State</TableHead>
            <TableHead className="text-xs">Owner</TableHead>
            <TableHead className="text-xs">Due Date</TableHead>
            <TableHead className="text-xs text-center">Evidence Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((e) => {
            const isSelected = selectedId === e.id;
            return (
              <TableRow
                key={e.id}
                onClick={() => onSelect(e.id)}
                className={cn(
                  'cursor-pointer transition-colors',
                  isSelected ? 'bg-brand-50/80 font-medium' : 'hover:bg-muted/40'
                )}
              >
                <TableCell className="font-mono text-[11px] font-semibold text-brand-900">
                  {e.id}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {e.kind}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-ink">{e.title}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{e.target}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border capitalize',
                      stateColors[e.state]
                    )}
                  >
                    {e.state.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{e.owner}</TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {e.dueDate}
                </TableCell>
                <TableCell className="text-center font-mono font-medium">
                  {e.evidence.length}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
