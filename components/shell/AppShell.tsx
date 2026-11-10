'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { DemoBanner } from './DemoBanner';
import { SideNav } from './SideNav';
import { FacilitySwitcher } from './FacilitySwitcher';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import BrandFooter from '@/components/brand/BrandFooter';
import type { AppShellProps, FacilityId } from '@/lib/types';

export function AppShell({ children }: AppShellProps): JSX.Element {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Extract active facility if on /facility/[id]
  const match = pathname.match(/^\/facility\/([^/]+)/);
  const activeFacilityId = (match && (match[1] === 'fac-wb-metal' || match[1] === 'fac-vz-polymer'))
    ? (match[1] as FacilityId)
    : 'fac-wb-metal';

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <DemoBanner />

      {/* Top bar on small screens */}
      <header className="md:hidden flex items-center justify-between gap-2 p-3 bg-black border-b border-red-900/40 no-print">
        <div className="flex items-center gap-2 shrink-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-black border-r border-red-900/50">
              <SideNav activeFacilityId={activeFacilityId} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Image src="/techmines-logo.jpg" alt="TECHMINES logo" width={24} height={24} className="w-6 h-6 object-cover" />
            <span className="font-mono font-bold text-sm tracking-tight text-white">
              NEXORA <span className="text-[#FF0000]">PLASMA</span>
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1 flex justify-end">
          <FacilitySwitcher currentId={activeFacilityId} />
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar 240px */}
        <aside className="hidden md:flex flex-col sticky top-11 h-[calc(100dvh-2.75rem)] w-[240px] shrink-0 bg-black border-r border-red-900/40 no-print">
          <div className="p-4 border-b border-red-900/40 flex items-center gap-3">
            <div className="w-10 h-10 bg-black border border-[#FF0000] p-1 flex items-center justify-center shadow-[0_0_12px_rgba(255,0,0,0.5)] flex-shrink-0">
              <Image src="/techmines-logo.jpg" alt="TECHMINES logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-base text-white tracking-wider block leading-tight">
                  NEX<span className="text-[#FF0000]">ORA</span>
                </span>
                <span className="bg-[#FF0000] text-black text-[8px] font-black px-1 uppercase font-mono">PLASMA</span>
              </div>
              <span className="text-[10px] uppercase font-mono text-[#00FFFF] tracking-wider block">
                Resilience Engine
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SideNav activeFacilityId={activeFacilityId} />
          </div>

          <div className="p-2 border-t border-neutral-900 text-[10px] text-neutral-500 font-mono flex justify-between bg-black">
            <span>Clock: Oct 7, 2026</span>
            <span className="text-[#FF5F1F]">risk-v0.3.1</span>
          </div>
        </aside>

        {/* Main Content Area: max-width 1200px */}
        <main className="flex-1 min-w-0 bg-black">
          <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
      <BrandFooter className="no-print" />
    </div>
  );
}
