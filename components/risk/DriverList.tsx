'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DriverListProps } from '@/lib/types';

export function DriverList({ risk }: DriverListProps): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
        <span>Vulnerability Drivers ({risk.label})</span>
        <span className="font-mono text-[10px]">Weight share</span>
      </div>

      <div className="border border-line rounded-md overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-canvas">
            <TableRow>
              <TableHead className="text-xs">Variable</TableHead>
              <TableHead className="text-xs">Failure Condition</TableHead>
              <TableHead className="text-xs">Weight</TableHead>
              <TableHead className="text-xs text-right">Score</TableHead>
              <TableHead className="text-xs text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risk.drivers.map((d) => (
              <TableRow key={d.driver.id} className="text-xs">
                <TableCell className="font-medium text-ink">{d.driver.variable}</TableCell>
                <TableCell className="text-muted-foreground">{d.driver.failureCondition}</TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {d.driver.weightLabel}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {d.driver.conditionScore.toFixed(1)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold tabular-nums text-brand-900">
                  {(d.share * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
