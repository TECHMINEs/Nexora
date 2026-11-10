'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import type { ExportButtonsProps } from '@/lib/types';

export function ExportButtons({ model }: ExportButtonsProps): JSX.Element {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const jsonStr = JSON.stringify(model, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-dossier-${model.facility.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 no-print">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="text-xs h-8 flex items-center gap-1.5"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Print Report</span>
      </Button>
      <Button
        size="sm"
        onClick={handleDownload}
        className="bg-brand-500 hover:bg-brand-700 text-white text-xs h-8 flex items-center gap-1.5"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export JSON</span>
      </Button>
    </div>
  );
}
