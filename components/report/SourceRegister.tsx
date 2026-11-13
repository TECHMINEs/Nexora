'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { SourceRegisterProps } from '@/lib/types';

export function SourceRegister({ rows }: SourceRegisterProps): JSX.Element {
  return (
    <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">Source Identifier</TableHead>
            <TableHead className="text-xs">Source Title & Scope</TableHead>
            <TableHead className="text-xs">Authority</TableHead>
            <TableHead className="text-xs">Licence Status</TableHead>
            <TableHead className="text-xs">Data Age</TableHead>
            <TableHead className="text-xs text-right">Provenance Score (§72.1)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ source, result }) => (
            <TableRow key={source.id} className={result.gated ? 'bg-red-950/40/60' : undefined}>
              <TableCell className="font-mono font-bold text-brand-900">
                {source.id}
              </TableCell>
              <TableCell className="font-medium text-ink">
                <div>{source.name}</div>
                {source.knownLimitations && (
                  <span className="text-[10px] text-muted-foreground block truncate max-w-sm">
                    {source.knownLimitations}
                  </span>
                )}
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">{source.authority}</TableCell>
              <TableCell>
                {result.gated ? (
                  <Badge variant="outline" className="border-red-400 bg-red-950/40 text-red-400 font-bold text-[10px]">
                    Licence uncertain: not production-ready
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-green-500/40 bg-green-950/40 text-green-400 text-[10px]">
                    Established
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {result.dataAgeHours.toFixed(1)} h
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-brand-900">
                {result.score.toFixed(3)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
