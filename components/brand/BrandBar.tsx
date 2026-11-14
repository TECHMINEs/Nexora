'use client'
import React from 'react'

/**
 * TECHMINES brand bar — identical across every portfolio project and styled like the
 * header on techmines.github.io. Fixed height (h-11 / 2.75rem) so sticky headers and
 * sidebars can sit directly beneath it.
 */
export default function BrandBar({ project }: { project: string }) {
  return (
    <header className="tm-brandbar sticky top-0 z-[60] h-11 px-4 flex items-center justify-between gap-3 select-none border-b border-line bg-black/90 backdrop-blur-md">
      <a
        href="https://techmines.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 min-w-0 no-underline"
        aria-label="TECHMINES — Pranav Jangid's portfolio"
      >
        <img
          src="/Nexora/techmines-logo.jpg"
          alt="TECHMINES logo"
          width={28}
          height={28}
          className="w-7 h-7 object-cover border-2 border-[#FF2626] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
          onError={(e) => {
            if (e.currentTarget.src.includes('/Nexora/techmines-logo.jpg')) {
              e.currentTarget.src = '/techmines-logo.jpg';
            }
          }}
        />
        <span className="font-display font-bold uppercase tracking-[0.03em] text-base text-white">
          TECHMINES
        </span>
      </a>
      <span className="hidden sm:block truncate font-mono font-bold text-[11px] uppercase tracking-[0.16em] text-dim">
        {project}
      </span>
    </header>
  )
}
