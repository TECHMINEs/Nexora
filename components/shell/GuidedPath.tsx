'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FacilityId } from '@/lib/types';

export function GuidedPath({ facilityId }: { facilityId: FacilityId }): JSX.Element {
  const pathname = usePathname();
  const base = `/facility/${facilityId}`;
  const steps = [
    { label: 'Choose a facility', href: '/', note: 'Start with an illustrative factory' },
    { label: 'Explore a risk', href: `${base}/risk`, note: 'Compare hazards and exposed assets' },
    { label: 'Change a scenario', href: `${base}/scenarios`, note: 'Adjust downtime, stock and supply' },
    { label: 'See what changes', href: `${base}/scenarios#results`, note: 'Compare estimated losses' },
    { label: 'Review actions', href: `${base}/mitigation`, note: 'See what could reduce loss' },
  ];
  const active = pathname === '/' || pathname === base ? 0
    : pathname.endsWith('/risk') ? 1
    : pathname.endsWith('/scenarios') ? 2
    : pathname.endsWith('/mitigation') ? 4
    : -1;
  const next = active < 0 ? steps[0] : active === 4 ? steps[1] : steps[active + 1];
  const onPortfolio = pathname === '/';

  return (
    <nav aria-label="Guided demo path" className="no-print border border-line bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-brand-400">Start here · five simple steps</p>
          <p className="mt-1 text-sm text-muted-foreground">Follow the same factory from risk through loss and possible action.</p>
        </div>
        <Link href={onPortfolio ? '#choose-facility' : next.href} className="inline-flex min-h-10 shrink-0 items-center justify-center border border-brand-500 bg-brand-500 px-4 py-2 font-display text-xs font-bold uppercase text-black hover:bg-white">
          {onPortfolio ? 'Choose a facility' : active === 4 ? 'Explore another risk' : active === 2 ? 'See what changes' : active < 0 ? 'Start walkthrough' : `Next: ${next.label}`} →
        </Link>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((step, index) => (
          <li key={step.label}>
            <Link href={step.href} className={`flex h-full gap-2 border p-2.5 text-left hover:border-brand-500 ${active === index ? 'border-brand-500 bg-brand-500/10' : 'border-line bg-black/30'}`} aria-current={active === index ? 'step' : undefined}>
              <span className="font-mono text-xs font-bold text-brand-400">{index + 1}</span>
              <span className="min-w-0"><span className="block font-display text-xs font-bold text-ink">{step.label}</span><span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{step.note}</span></span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
