'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssumptionDrawer } from './AssumptionDrawer';
import type { AssumptionLinkProps } from '@/lib/types';
import { Info } from 'lucide-react';

export function AssumptionLink({
  assumptionIds,
  sourceIds,
  section,
  facilityId,
}: AssumptionLinkProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 px-1 text-[11px] text-muted-foreground hover:text-brand-700 font-mono inline-flex items-center gap-0.5"
        onClick={() => setOpen(true)}
        title="Inspect assumptions & provenance sources"
      >
        <Info className="w-3 h-3 text-muted-foreground" />
        <span>Assumptions</span>
      </Button>

      <AssumptionDrawer
        open={open}
        onOpenChange={setOpen}
        assumptionIds={assumptionIds}
        sourceIds={sourceIds}
        section={section}
        facilityId={facilityId}
      />
    </>
  );
}
