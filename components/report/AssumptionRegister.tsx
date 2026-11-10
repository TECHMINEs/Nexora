'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SourceBadge } from '@/components/common/SourceBadge';
import type { AssumptionRegisterProps } from '@/lib/types';

export function AssumptionRegister({ assumptions }: AssumptionRegisterProps): JSX.Element {
  return (
    <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">ID Anchor</TableHead>
            <TableHead className="text-xs">Parameter Label</TableHead>
            <TableHead className="text-xs">Assumed Value</TableHead>
            <TableHead className="text-xs">Rationale & Technical Anchor</TableHead>
            <TableHead className="text-xs">Dossier Section</TableHead>
            <TableHead className="text-xs">Contributing Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assumptions.map((asm) => (
            <TableRow key={asm.id} id={asm.id} className="scroll-mt-16 target:bg-amber-950/40">
              <TableCell className="font-mono font-bold text-brand-900">
                <a href={`#${asm.id}`} className="hover:underline">
                  {asm.id}
                </a>
              </TableCell>
              <TableCell className="font-semibold text-ink">{asm.label}</TableCell>
              <TableCell className="font-mono text-[11px] text-ink">{asm.value}</TableCell>
              <TableCell className="text-muted-foreground text-[11px] leading-relaxed">
                {asm.rationale}
              </TableCell>
              <TableCell className="font-mono text-[10px] text-muted-foreground">
                {asm.section}
              </TableCell>
              <TableCell>
                <SourceBadge sourceId={asm.sourceId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
