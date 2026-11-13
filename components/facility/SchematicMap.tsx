'use client';

import React from 'react';
import type { SchematicMapProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SchematicMap({
  layout,
  highlightHazard,
  showResponders,
  selectedResourceId,
  caption,
}: SchematicMapProps): JSX.Element {
  const [vbW, vbH] = layout.viewBox;

  // Hazard styling
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
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative w-full aspect-[5/3] bg-card border border-line rounded-lg overflow-hidden shadow-inner flex items-center justify-center p-2">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
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
                <polygon
                  points={pts}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth="0.75"
                  strokeDasharray={zone.hazard === 'cyclone' ? '2,2' : undefined}
                />
                {zone.points[0] && (
                  <text
                    x={zone.points[0][0] + 1}
                    y={zone.points[0][1] + 3}
                    fontSize="2.5"
                    fill={style.stroke}
                    className="font-mono font-semibold"
                  >
                    {zone.label}
                  </text>
                )}
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
            fill="#FFFFFF"
            className="font-bold font-sans"
          >
            FACILITY
          </text>

          {/* POIs / Responders */}
          {layout.pois.map((poi) => {
            const isSelected = selectedResourceId !== null && poi.resourceId === selectedResourceId;
            if (!showResponders && poi.resourceId) return null;

            return (
              <g
                key={poi.id}
                className={cn('transition-all', isSelected && 'scale-125 origin-center')}
              >
                <circle
                  cx={poi.at[0]}
                  cy={poi.at[1]}
                  r={isSelected ? 3.5 : 2.5}
                  fill={isSelected ? '#FF2626' : '#4D4D4D'}
                  stroke="#FFFFFF"
                  strokeWidth="0.75"
                />
                <text
                  x={poi.at[0]}
                  y={poi.at[1] - 3.5}
                  textAnchor="middle"
                  fontSize="2.2"
                  fill="#FFFFFF"
                  className={cn('font-medium', isSelected && 'font-bold fill-accent-700')}
                >
                  {poi.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
        <span>{caption}</span>
        <span className="font-mono text-[10px] bg-canvas px-1.5 py-0.5 rounded border">
          {layout.note}
        </span>
      </div>
    </div>
  );
}
