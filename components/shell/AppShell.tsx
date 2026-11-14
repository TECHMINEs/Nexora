'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { DemoBanner } from './DemoBanner';
import { SideNav } from './SideNav';
import { FacilitySwitcher } from './FacilitySwitcher';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col text-white">
      <DemoBanner />

      {/* Top bar on small screens */}
      <header className="lg:hidden flex items-center justify-between gap-2 p-3 bg-black border-b border-line no-print">
        <div className="flex items-center gap-2 shrink-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-black border-r border-line">
              <SideNav activeFacilityId={activeFacilityId} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <img
              src="/Nexora/logo-mark.svg"
              alt="Nexora logo"
              width={28}
              height={28}
              className="w-7 h-7"
              onError={(e) => {
                if (e.currentTarget.src.includes('/Nexora/logo-mark.svg')) {
                  e.currentTarget.src = '/logo-mark.svg';
                }
              }}
            />
            <span className="font-display font-bold text-base tracking-[0.03em] uppercase text-white">
              NEX<span className="text-[#FF2626]">ORA</span>
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1 flex justify-end">
          <FacilitySwitcher currentId={activeFacilityId} />
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Keep the navigation drawer on medium screens so analysis panels have room. */}
        <aside className="hidden lg:flex flex-col sticky top-11 h-[calc(100dvh-2.75rem)] w-[260px] shrink-0 bg-black/80 backdrop-blur-xl border-r border-line no-print">
          <div className="p-4 border-b border-line flex items-center gap-3">
            <img
              src="/Nexora/logo-mark.svg"
              alt="Nexora logo"
              width={40}
              height={40}
              className="w-10 h-10 flex-shrink-0"
              onError={(e) => {
                if (e.currentTarget.src.includes('/Nexora/logo-mark.svg')) {
                  e.currentTarget.src = '/logo-mark.svg';
                }
              }}
            />
            <div className="grid leading-none">
              <span className="font-display font-bold text-xl tracking-[0.03em] text-white uppercase">
                Nex<span className="text-[#FF2626]">ora</span>
              </span>
              <span className="mt-1 text-[10px] font-mono font-bold tracking-[0.22em] text-[#FF2626] uppercase">
                By TECHMINES
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SideNav activeFacilityId={activeFacilityId} />
          </div>

          <div className="p-2 border-t border-neutral-900 text-[10px] text-neutral-500 font-mono flex justify-between bg-black">
            <span>Synthetic facilities</span>
            <span className="text-white">risk-v0.3.1</span>
          </div>
        </aside>

        {/* Analysis canvas */}
        <main className="flex-1 min-w-0">
          <div className="max-w-[1500px] mx-auto p-4 sm:p-6 xl:p-8 space-y-7">
            {children}
          </div>
        </main>
      </div>
      <BrandFooter className="no-print" />
    </div>
  );
}
