import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { INSURANCE_DISCLAIMER, OFFICIAL_SOURCE_NOTICE, BANNER_TEXT } from '@/lib/constants';
import type { DisclaimerProps } from '@/lib/types';
import { ShieldAlert, AlertCircle, Info } from 'lucide-react';

export function Disclaimer({ variant }: DisclaimerProps): JSX.Element {
  if (variant === 'insurance') {
    return (
      <Alert className="bg-muted/40 border-line text-xs py-2">
        <ShieldAlert className="w-4 h-4 text-brand-700" />
        <AlertDescription className="text-muted-foreground leading-relaxed">
          {INSURANCE_DISCLAIMER}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'official_source') {
    return (
      <Alert className="bg-amber-950/40/70 border-amber-500/40 text-xs py-2 text-amber-950">
        <AlertCircle className="w-4 h-4 text-amber-400" />
        <AlertDescription className="leading-relaxed font-medium">
          {OFFICIAL_SOURCE_NOTICE}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-canvas border-line text-xs py-2">
      <Info className="w-4 h-4 text-muted-foreground" />
      <AlertDescription className="text-muted-foreground">{BANNER_TEXT}</AlertDescription>
    </Alert>
  );
}
