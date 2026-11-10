'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { METHOD_CONFIDENCE } from '@/lib/constants';
import { methodLabel } from '@/lib/format';
import type { VerificationHierarchyProps, VerificationMethod } from '@/lib/types';
import { cn } from '@/lib/utils';

export function VerificationHierarchy({ highlight }: VerificationHierarchyProps): JSX.Element {
  const methods: VerificationMethod[] = [
    'self_attested',
    'document',
    'photo_geo',
    'remote_expert',
    'physical_inspection',
    'outcome',
  ];

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between text-muted-foreground font-semibold">
        <span>§44.1 Evidence Verification Hierarchy</span>
        <span className="font-mono text-[10px]">Confidence Scale</span>
      </div>

      <div className="border border-line rounded-md overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-canvas">
            <TableRow>
              <TableHead className="text-xs">Verification Tier</TableHead>
              <TableHead className="text-xs">Method</TableHead>
              <TableHead className="text-xs text-right">Confidence Factor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((m, idx) => {
              const conf = METHOD_CONFIDENCE[m];
              const isHighlighted = highlight === m;
              return (
                <TableRow
                  key={m}
                  className={cn(
                    'text-xs transition-colors',
                    isHighlighted ? 'bg-brand-50 font-semibold' : ''
                  )}
                >
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    Level {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-ink">{methodLabel(m)}</TableCell>
                  <TableCell className="text-right font-mono font-bold tabular-nums text-brand-900">
                    {conf.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
