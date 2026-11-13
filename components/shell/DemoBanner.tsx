'use client';

import React from 'react';
import { BANNER_TEXT } from '@/lib/constants';

export function DemoBanner(): JSX.Element {
  return (
    <aside
      aria-label="Demo notice"
      className="demo-banner w-full bg-white text-black font-bold font-mono px-4 py-1 text-center text-xs tracking-wider uppercase select-none border-b border-stroke print:bg-transparent print:text-black print:border-b print:border-black print:py-0.5 print:text-[10px]"
    >
      {BANNER_TEXT}
    </aside>
  );
}
