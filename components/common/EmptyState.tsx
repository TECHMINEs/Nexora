import React from 'react';
import type { EmptyStateProps } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

export function EmptyState({ title, reason, nextStep }: EmptyStateProps): JSX.Element {
  return (
    <div className="p-6 text-center border border-dashed rounded-lg bg-canvas flex flex-col items-center justify-center gap-2">
      <AlertCircle className="w-6 h-6 text-muted-foreground" />
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md">{reason}</p>
      <div className="text-xs font-medium text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-300">
        Next step: {nextStep}
      </div>
    </div>
  );
}
