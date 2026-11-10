'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrackedCell } from '@/components/common/TrackedCell';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatINR } from '@/lib/format';
import type { LossBreakdownProps } from '@/lib/types';

export function LossBreakdown({ view, facilityId }: LossBreakdownProps): JSX.Element {
  const { gross, residual, committed } = view;

  const chartData = [
    {
      name: 'Gross Loss',
      physical: gross.components.physical.value,
      inventory: gross.components.inventory.value,
      bi: gross.components.bi.value,
      extra: gross.components.extraExpense.value + gross.components.recovery.value,
      supply: gross.components.supplyChain.value,
    },
    {
      name: 'Residual (Verified)',
      physical: residual.components.physical.value,
      inventory: residual.components.inventory.value,
      bi: residual.components.bi.value,
      extra: residual.components.extraExpense.value + residual.components.recovery.value,
      supply: residual.components.supplyChain.value,
    },
    {
      name: 'If Committed Verified',
      physical: committed.components.physical.value,
      inventory: committed.components.inventory.value,
      bi: committed.components.bi.value,
      extra: committed.components.extraExpense.value + committed.components.recovery.value,
      supply: committed.components.supplyChain.value,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-60 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#FFFFFF' }} />
            <YAxis
              tickFormatter={(v) => formatINR(v, { unit: 'cr', digits: 1 })}
              tick={{ fontSize: 11, fill: '#A3A3A3' }}
            />
            <Tooltip
              formatter={(val: unknown) => [
                formatINR(typeof val === 'number' ? val : Number(val) || 0),
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="physical" name="Physical Damage" fill="#DC2626" stackId="a" />
            <Bar dataKey="inventory" name="Inventory Loss" fill="#00FFFF" stackId="a" />
            <Bar dataKey="bi" name="Business Interruption" fill="#39FF14" stackId="a" />
            <Bar dataKey="extra" name="Extra Expense & Cleanup" fill="#FF5F1F" stackId="a" />
            <Bar dataKey="supply" name="Supply-Chain Loss" fill="#E5E5E5" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table Comparison */}
      <div className="border border-line rounded-md overflow-hidden bg-card text-xs">
        <Table>
          <TableHeader className="bg-canvas">
            <TableRow>
              <TableHead className="text-xs">Component</TableHead>
              <TableHead className="text-xs">Gross Exposure</TableHead>
              <TableHead className="text-xs">Residual (Verified)</TableHead>
              <TableHead className="text-xs">If Committed Verified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-ink">Physical Damage</TableCell>
              <TableCell><TrackedCell tracked={gross.components.physical} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={residual.components.physical} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={committed.components.physical} kind="inr" facilityId={facilityId} /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-ink">Inventory Loss</TableCell>
              <TableCell><TrackedCell tracked={gross.components.inventory} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={residual.components.inventory} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={committed.components.inventory} kind="inr" facilityId={facilityId} /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-ink">Business Interruption</TableCell>
              <TableCell><TrackedCell tracked={gross.components.bi} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={residual.components.bi} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={committed.components.bi} kind="inr" facilityId={facilityId} /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-ink">Extra Expense</TableCell>
              <TableCell><TrackedCell tracked={gross.components.extraExpense} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={residual.components.extraExpense} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={committed.components.extraExpense} kind="inr" facilityId={facilityId} /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-ink">Cleanup / Recovery</TableCell>
              <TableCell><TrackedCell tracked={gross.components.recovery} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={residual.components.recovery} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={committed.components.recovery} kind="inr" facilityId={facilityId} /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-ink">Supply-Chain Loss</TableCell>
              <TableCell><TrackedCell tracked={gross.components.supplyChain} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={residual.components.supplyChain} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={committed.components.supplyChain} kind="inr" facilityId={facilityId} /></TableCell>
            </TableRow>
            <TableRow className="bg-canvas font-bold border-t-2">
              <TableCell className="text-ink">Total Loss</TableCell>
              <TableCell><TrackedCell tracked={gross.total} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={residual.total} kind="inr" facilityId={facilityId} /></TableCell>
              <TableCell><TrackedCell tracked={committed.total} kind="inr" facilityId={facilityId} /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
