'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ThresholdTableProps, SignalReading } from '@/lib/types';

export function ThresholdTable({
  thresholds,
  latest,
}: ThresholdTableProps): JSX.Element {
  const latestMap = new Map<string, SignalReading>();
  if (latest) {
    latest.forEach((s) => latestMap.set(s.signal, s));
  }

  return (
    <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
      <Table>
        <TableHeader className="bg-canvas">
          <TableRow>
            <TableHead className="text-xs">Monitored Telemetry Signal</TableHead>
            <TableHead className="text-xs">Source Unit</TableHead>
            <TableHead className="text-xs">Watch Threshold</TableHead>
            <TableHead className="text-xs">Alert Threshold</TableHead>
            <TableHead className="text-xs">Incident Threshold</TableHead>
            <TableHead className="text-xs text-right">Latest Reading</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {thresholds.map((th) => {
            const reading = latestMap.get(th.signal);
            const isAlert = reading && reading.value >= th.alertAt;
            const isIncident = th.incidentAt && reading && reading.value >= th.incidentAt;

            return (
              <TableRow key={th.signal}>
                <TableCell className="font-semibold text-ink font-mono">
                  {th.signal}
                </TableCell>
                <TableCell className="text-muted-foreground">{th.unit}</TableCell>
                <TableCell className="font-mono text-white bg-panel-2/40">
                  &ge; {th.watchAt} {th.unit}
                </TableCell>
                <TableCell className="font-mono text-white bg-panel-2/40">
                  &ge; {th.alertAt} {th.unit}
                </TableCell>
                <TableCell className="font-mono text-red-400 bg-red-950/40/40">
                  {th.incidentAt !== null ? `≥ ${th.incidentAt} ${th.unit}` : 'Site Intersection'}
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {reading ? (
                    <Badge
                      variant="outline"
                      className={
                        isIncident
                          ? 'border-red-400 bg-red-950/40 text-red-400 font-bold'
                          : isAlert
                          ? 'border-stroke bg-panel-2 text-white font-bold'
                          : 'border-line text-ink'
                      }
                    >
                      {reading.value} {reading.unit}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-[10px] font-normal italic">
                      Armed (No reading)
                    </span>
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
