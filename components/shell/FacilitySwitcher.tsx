'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { facilities, FACILITY_IDS } from '@/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FacilityId, FacilitySwitcherProps } from '@/lib/types';

export function FacilitySwitcher({ currentId }: FacilitySwitcherProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  const handleSelect = (nextId: FacilityId) => {
    if (nextId === currentId) return;
    // preserve subroute
    // pathname like /facility/fac-wb-metal/risk -> /facility/fac-vz-polymer/risk
    const parts = pathname.split('/');
    if (parts[1] === 'facility' && parts[2]) {
      parts[2] = nextId;
      router.push(parts.join('/'));
    } else {
      router.push(`/facility/${nextId}`);
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="hidden sm:inline text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Facility:
      </span>
      <Select value={currentId} onValueChange={(val) => handleSelect(val as FacilityId)}>
        <SelectTrigger className="w-full sm:w-[260px] min-w-0 max-w-[260px] h-8 text-xs bg-card border-line font-medium text-ink [&>span]:truncate" aria-label="Select facility">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FACILITY_IDS.map((fid) => {
            const fac = facilities.find((f) => f.id === fid);
            return (
              <SelectItem key={fid} value={fid} className="text-xs">
                <span className="font-semibold">{fac?.name}</span>
                <span className="text-[10px] text-muted-foreground block">{fid}</span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
