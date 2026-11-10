'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatINR } from '@/lib/format';
import type { ExposedAssetsProps } from '@/lib/types';

export function ExposedAssets({
  exposure,
  assets,
}: ExposedAssetsProps): JSX.Element {
  const exposedList = assets.filter((a) => exposure.exposedAssetIds.includes(a.id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1">
        <span>Exposed Physical Assets ({exposedList.length} of {assets.length})</span>
        <span className="font-mono text-[11px] text-ink">
          Exposed Value: {formatINR(exposure.exposedValue)} / {formatINR(exposure.totalValue)}
        </span>
      </div>

      <div className="border border-line rounded-md overflow-hidden bg-card max-h-64 overflow-y-auto">
        <Table>
          <TableHeader className="bg-canvas sticky top-0 z-10">
            <TableRow>
              <TableHead className="text-xs">Asset Name</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Zone</TableHead>
              <TableHead className="text-xs">Elevation</TableHead>
              <TableHead className="text-xs text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exposedList.map((asset) => (
              <TableRow key={asset.id} className="text-xs">
                <TableCell className="font-medium text-ink">
                  <div>{asset.name}</div>
                  <span className="font-mono text-[10px] text-muted-foreground">{asset.id}</span>
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">{asset.category}</TableCell>
                <TableCell className="text-muted-foreground">{asset.zone}</TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {asset.elevationM.toFixed(1)} m
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-ink tabular-nums">
                  {formatINR(asset.valueRupees)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
