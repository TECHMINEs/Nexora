import React from 'react';
import type { InsufficientDataProps } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

export function InsufficientData({ metric, required, available }: InsufficientDataProps): JSX.Element {
  return (
    <div className="p-4 border rounded-md bg-amber-950/40/50 border-amber-500/40 text-amber-400 flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
      <div className="space-y-1 text-xs">
        <div className="font-semibold">{metric}: Insufficient Sample</div>
        <p className="text-muted-foreground">
          Sample requirements not met. Required: <span className="font-mono font-medium">{required}</span> | Available:{' '}
          <span className="font-mono font-medium">{available}</span>.
        </p>
      </div>
    </div>
  );
}
