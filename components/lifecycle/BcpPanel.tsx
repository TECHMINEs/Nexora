'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { BcpPanelProps } from '@/lib/types';

export function BcpPanel({ bcp }: BcpPanelProps): JSX.Element {
  return (
    <div className="space-y-6 text-xs">
      {/* Critical Processes */}
      <div className="space-y-2">
        <span className="font-semibold text-ink block">Critical Business Processes</span>
        <div className="border border-line rounded-md overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-canvas">
              <TableRow>
                <TableHead className="text-xs">Process Name</TableHead>
                <TableHead className="text-xs">RTO (Target)</TableHead>
                <TableHead className="text-xs">MTPD (Maximum)</TableHead>
                <TableHead className="text-xs">Alternate Operational Workaround</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bcp.criticalProcesses.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-ink">{p.name}</TableCell>
                  <TableCell className="font-mono">{p.rtoDays} days</TableCell>
                  <TableCell className="font-mono font-bold text-band-high">
                    {p.mtpdDays} days
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.alternate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Emergency Role Coverage */}
      <div className="space-y-2">
        <span className="font-semibold text-ink block">Shift Emergency Role Coverage (§40)</span>
        <div className="border border-line rounded-md overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-canvas">
              <TableRow>
                <TableHead className="text-xs">Designated Role</TableHead>
                <TableHead className="text-xs">Shift</TableHead>
                <TableHead className="text-xs text-center">Assigned</TableHead>
                <TableHead className="text-xs text-center">Trained</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bcp.roles.map((r, idx) => (
                <TableRow
                  key={idx}
                  className={!r.assigned ? 'bg-rose-950/40/70 font-medium' : undefined}
                >
                  <TableCell className="font-medium text-ink">{r.role}</TableCell>
                  <TableCell className="text-muted-foreground">{r.shift}</TableCell>
                  <TableCell className="text-center">
                    {r.assigned ? (
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/40 text-[10px]">
                        Assigned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-rose-400 text-rose-400 bg-rose-950/40 font-bold text-[10px]">
                        Unassigned (Gap)
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.trained ? (
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/40 text-[10px]">
                        Trained
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-950/40 text-[10px]">
                        Pending Training
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Contact Tree & Alternate Site */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-canvas border rounded-lg">
        <div>
          <span className="text-muted-foreground block text-[11px]">Contact Tree Architecture</span>
          <span className="font-semibold text-ink">{bcp.contactTreeLevels} Escalation Levels Declared</span>
          <p className="text-muted-foreground text-[11px] mt-0.5">{bcp.communicationPlan}</p>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">Designated Alternate Facility</span>
          <span className="font-semibold text-ink">{bcp.alternateSite}</span>
          <p className="text-muted-foreground text-[11px] mt-0.5">Last formal review: {bcp.lastReviewed}</p>
        </div>
      </div>
    </div>
  );
}
