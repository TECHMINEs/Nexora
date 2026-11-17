'use client';

import React from 'react';
import type { SchematicMapProps } from '@/lib/types';
import { hazardLabel } from '@/lib/format';

export function SchematicMap({
  layout,
  highlightHazard,
  showResponders,
  selectedResourceId,
  caption,
}: SchematicMapProps): JSX.Element {
  const [vbW, vbH] = layout.viewBox;
  const visiblePois = layout.pois.filter((poi) => showResponders || !poi.resourceId);

  const hazardColor = (hazard: string) => {
    switch (hazard) {
      case 'flood':
        return { fill: 'rgba(255, 255, 255, 0.10)', stroke: '#FFFFFF' };
      case 'toxic_release':
        return { fill: 'rgba(255, 38, 38, 0.25)', stroke: '#FF2626' };
      case 'cyclone':
        return { fill: 'rgba(169, 169, 169, 0.12)', stroke: '#A9A9A9' };
      case 'fire':
        return { fill: 'rgba(255, 38, 38, 0.10)', stroke: '#F5141F' };
      case 'power':
        return { fill: 'rgba(255, 255, 255, 0.05)', stroke: '#4D4D4D' };
      default:
        return { fill: 'rgba(77, 77, 77, 0.2)', stroke: '#2E2E2E' };
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 w-full">
      <div className="relative w-full aspect-[5/3] min-h-[220px] bg-[#080808] border border-line overflow-hidden shadow-inner flex items-center justify-center p-3">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Illustrative facility schematic with hazard zones, roads, site footprint and response points"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#171717" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={vbW} height={vbH} fill="url(#grid)" />

          {/* Zones */}
          {layout.zones.map((zone, idx) => {
            const isHighlighted = highlightHazard === null || highlightHazard === zone.hazard;
            const style = hazardColor(zone.hazard);
            const pts = zone.points.map((p) => p.join(',')).join(' ');
            return (
              <g key={`zone-${idx}`} opacity={isHighlighted ? 1 : 0.25}>
                <title>{zone.label}</title>
                <polygon
                  points={pts}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth="0.75"
                  strokeDasharray={zone.hazard === 'cyclone' ? '2,2' : undefined}
                />
              </g>
            );
          })}

          {/* Roads */}
          {layout.roads.map((road) => {
            const pts = road.points.map((p) => p.join(',')).join(' ');
            return (
              <polyline
                key={road.id}
                points={pts}
                fill="none"
                stroke={road.kind === 'primary' ? '#4D4D4D' : '#2E2E2E'}
                strokeWidth={road.kind === 'primary' ? '2.5' : '1.5'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Facility Footprint */}
          <rect
            x={layout.facility.x}
            y={layout.facility.y}
            width={layout.facility.w}
            height={layout.facility.h}
            fill="#FFFFFF"
            stroke="#F5141F"
            strokeWidth="1"
            rx="1"
          />
          <text
            x={layout.facility.x + layout.facility.w / 2}
            y={layout.facility.y + layout.facility.h / 2 + 1}
            textAnchor="middle"
            fontSize="2.8"
            fill="#000000"
            className="font-bold font-sans"
          >
            SITE
          </text>

          {/* POIs / Responders */}
          {visiblePois.map((poi) => {
            const isSelected = selectedResourceId !== null && poi.resourceId === selectedResourceId;

            return (
              <g key={poi.id}>
                <title>{poi.label}</title>
                <circle
                  cx={poi.at[0]}
                  cy={poi.at[1]}
                  r={isSelected ? 3.5 : 2.5}
                  fill={isSelected ? '#FF2626' : '#4D4D4D'}
                  stroke="#FFFFFF"
                  strokeWidth="0.75"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground" aria-label="Schematic legend">
        {layout.zones.map((zone, idx) => (
          <span key={`${zone.hazard}-${idx}`} title={zone.label} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 border" style={{ borderColor: hazardColor(zone.hazard).stroke, background: hazardColor(zone.hazard).fill }} />
            {hazardLabel(zone.hazard)} zone
          </span>
        ))}
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 bg-white" />Facility footprint</span>
        {visiblePois.length > 0 && <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#FF2626]" />Response / community points</span>}
      </div>
      {visiblePois.length > 0 && <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-300">
        {visiblePois.map((poi) => <span key={poi.id} className={poi.resourceId === selectedResourceId ? 'font-semibold text-[#FF2626]' : ''}>{poi.label}</span>)}
      </div>}
      <p className="text-xs leading-relaxed text-muted-foreground" title={layout.note}>{caption}. Illustrative schematic, not a geographic map.</p>
    </div>
  );
}
