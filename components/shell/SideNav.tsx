'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SideNavProps } from '@/lib/types';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  PlaySquare,
  ShieldCheck,
  FileCheck2,
  Umbrella,
  Ambulance,
  Radio,
  FileText,
  RotateCw,
  GitFork,
} from 'lucide-react';

export function SideNav({ activeFacilityId }: SideNavProps): JSX.Element {
  const pathname = usePathname();

  const facilityLinks = [
    { label: 'Overview', href: `/facility/${activeFacilityId}`, icon: Building2 },
    { label: 'Risk Explorer', href: `/facility/${activeFacilityId}/risk`, icon: AlertTriangle },
    { label: 'Scenario Studio', href: `/facility/${activeFacilityId}/scenarios`, icon: PlaySquare },
    { label: 'Mitigation Plan', href: `/facility/${activeFacilityId}/mitigation`, icon: ShieldCheck },
    { label: 'Resilience Ledger', href: `/facility/${activeFacilityId}/ledger`, icon: FileCheck2 },
    { label: 'Insurance Adequacy', href: `/facility/${activeFacilityId}/insurance`, icon: Umbrella },
    { label: 'Accessibility', href: `/facility/${activeFacilityId}/accessibility`, icon: Ambulance },
    { label: 'Monitoring', href: `/facility/${activeFacilityId}/monitoring`, icon: Radio },
    { label: 'Evidence & Report', href: `/facility/${activeFacilityId}/report`, icon: FileText },
  ];

  const globalLinks = [
    { label: 'Portfolio', href: '/', icon: LayoutDashboard },
    { label: 'Replay Console', href: '/replay', icon: RotateCw },
    { label: 'Lifecycle & BCP', href: '/lifecycle', icon: GitFork },
  ];

  return (
    <nav className="w-full flex flex-col gap-6 p-4">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
          Global
        </span>
        <div className="flex flex-col gap-0.5">
          {globalLinks.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  active
                    ? 'bg-brand-500 text-white font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-ink hover:bg-canvas'
                )}
              >
                <Icon className={cn('w-4 h-4', active ? 'text-white' : 'text-muted-foreground')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
          Facility Dossier
        </span>
        <div className="flex flex-col gap-0.5">
          {facilityLinks.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  active
                    ? 'bg-brand-500 text-white font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-ink hover:bg-canvas'
                )}
              >
                <Icon className={cn('w-4 h-4', active ? 'text-white' : 'text-muted-foreground')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
