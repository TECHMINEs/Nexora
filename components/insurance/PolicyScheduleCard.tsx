'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatINR, coverageClassLabel } from '@/lib/format';
import type { PolicyScheduleCardProps } from '@/lib/types';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export function PolicyScheduleCard({ policy }: PolicyScheduleCardProps): JSX.Element {
  return (
    <Card className="bg-card border-line shadow-sm text-xs space-y-3">
      <CardHeader className="pb-3 border-b border-line/60">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-700" />
              <CardTitle className="text-sm font-bold text-ink">{policy.policyType}</CardTitle>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Insurer: {policy.insurerLabel} &bull; Renewal: {policy.renewalDate}
            </p>
          </div>
          <Badge variant="outline" className="border-stroke text-white bg-panel-2 font-semibold text-[10px]">
            Requires Adviser Review
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Sections Summary */}
        <div className="space-y-1.5">
          <span className="font-semibold text-ink block">Extracted Policy Schedule</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {policy.sections.map((sec) => (
              <div key={sec.coverageClass} className="p-2 rounded border bg-canvas text-[11px]">
                <div className="font-medium text-muted-foreground">{coverageClassLabel(sec.coverageClass)}</div>
                <div className="font-bold text-ink font-mono">
                  {sec.covered ? formatINR(sec.sumInsured) : 'Not Covered'}
                </div>
                {sec.deductible > 0 && (
                  <div className="text-[10px] text-muted-foreground">
                    Ded: {formatINR(sec.deductible)}
                  </div>
                )}
                {sec.biTimeExcessDays && (
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Excess: {sec.biTimeExcessDays} days
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Exclusions */}
        <div className="space-y-1.5 pt-2 border-t border-line/60">
          <span className="font-semibold text-ink flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Key Clauses & Exclusions Extracted
          </span>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
            {policy.exclusions.map((ex, idx) => (
              <li key={idx}>{ex}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
