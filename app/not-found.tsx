import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <AlertCircle className="w-12 h-12 text-band-high" />
      <div className="space-y-1">
        <h2 className="text-2xl font-bold font-display text-ink">Facility or Route Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The requested resilience dossier does not exist or is not configured in this demonstration.
        </p>
      </div>
      <Button asChild className="bg-brand-500 hover:bg-brand-700 text-white">
        <Link href="/">Back to Portfolio Intelligence</Link>
      </Button>
    </div>
  );
}
