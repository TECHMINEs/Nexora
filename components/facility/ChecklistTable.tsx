'use client';

import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrackedCell } from '@/components/common/TrackedCell';
import type { ChecklistTableProps } from '@/lib/types';

export function ChecklistTable({
  items,
  completeness,
  facilityId,
}: ChecklistTableProps): JSX.Element {
  // Routes to resolve incomplete items per spec
  const getDomainLink = (domain: string): string | null => {
    switch (domain) {
      case 'Insurance':
        return `/facility/${facilityId}/insurance`;
      case 'Accessibility':
        return `/facility/${facilityId}/accessibility`;
      case 'Verification':
      case 'Mitigation':
        return `/facility/${facilityId}/ledger`;
      case 'People':
      case 'Operations':
        return `/lifecycle`;
      case 'Hazards':
      case 'Vulnerability':
        return `/facility/${facilityId}/risk`;
      case 'Scenarios':
        return `/facility/${facilityId}/scenarios`;
      case 'Monitoring':
        return `/facility/${facilityId}/monitoring`;
      case 'Report':
        return `/facility/${facilityId}/report`;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium pb-2 border-b border-line">
        <span className="text-muted-foreground">Appendix A Data Completeness:</span>
        <TrackedCell tracked={completeness} kind="pct" facilityId={facilityId} />
      </div>

      <div className="max-h-80 overflow-y-auto border border-line rounded-md">
        <Table>
          <TableHeader className="bg-canvas sticky top-0 z-10">
            <TableRow>
              <TableHead className="text-xs">Domain</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Audit Note</TableHead>
              <TableHead className="text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const link = getDomainLink(item.domain);
              const statusBadge = {
                pass: <Badge className="bg-emerald-950/40 text-emerald-400 border-emerald-500/40">Pass</Badge>,
                partial: <Badge className="bg-amber-950/40 text-amber-400 border-amber-500/40">Partial</Badge>,
                fail: <Badge className="bg-rose-950/40 text-rose-400 border-rose-500/40">Fail</Badge>,
              }[item.status];

              return (
                <TableRow key={item.domain} className="text-xs">
                  <TableCell className="font-semibold text-ink">{item.domain}</TableCell>
                  <TableCell>{statusBadge}</TableCell>
                  <TableCell className="text-muted-foreground">{item.note}</TableCell>
                  <TableCell className="text-right">
                    {link ? (
                      <Link
                        href={link}
                        className="text-brand-700 hover:text-brand-900 font-medium hover:underline text-[11px]"
                      >
                        Inspect
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">—</span>
                    )}
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
