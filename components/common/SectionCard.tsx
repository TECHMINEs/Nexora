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
    <Card className="bg-card shadow-sm border border-line">
      <CardHeader className="pb-3 border-b border-line/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-bold text-ink">{title}</CardTitle>
              {moduleIds.map((mid) => (
                <ModuleTag key={mid} id={mid} />
              ))}
              <span className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-canvas border">
                {section}
              </span>
            </div>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
          {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
