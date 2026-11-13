'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { AlertQualityChecksProps } from '@/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';

export function AlertQualityChecks({ checks }: AlertQualityChecksProps): JSX.Element {
  return (
    <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">Quality Criterion (§46.1)</TableHead>
            <TableHead className="text-xs text-center">Result</TableHead>
            <TableHead className="text-xs">Verification Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checks.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-semibold text-ink">{c.label}</TableCell>
              <TableCell className="text-center">
                {c.pass ? (
                  <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-950/40 text-[10px] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span>Pass</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-500/40 text-red-400 bg-red-950/40 text-[10px] inline-flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <span>Fail</span>
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-[11px]">{c.detail}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
