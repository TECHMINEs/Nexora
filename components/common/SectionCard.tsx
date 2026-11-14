import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ModuleTag } from './ModuleTag';
import type { SectionCardProps } from '@/lib/types';

export function SectionCard({
  title,
  moduleIds,
  section,
  description,
  actions,
  children,
}: SectionCardProps): JSX.Element {
  return (
    <Card className="min-w-0 bg-card shadow-sm border border-line">
      <CardHeader className="p-4 sm:p-5 pb-4 border-b border-line/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0 space-y-2">
            <CardTitle className="text-lg font-bold leading-snug text-ink">{title}</CardTitle>
            {description && <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>}
          </div>
          {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
        </div>
        <details className="pt-1 text-xs text-muted-foreground">
          <summary className="w-fit cursor-pointer font-medium text-brand-400 hover:text-white">Method &amp; provenance</summary>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {moduleIds.map((mid) => <ModuleTag key={mid} id={mid} />)}
            <span className="font-mono">Source reference: {section}</span>
          </div>
        </details>
      </CardHeader>
      <CardContent className="min-w-0 p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}
