'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { CascadeGraphProps } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

export function CascadeGraph({ cascade }: CascadeGraphProps): JSX.Element {
  const { chains, spof, nodes } = cascade;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Display top 5 chains
  const topChains = chains.slice(0, 5);
  const compoundChains = chains.filter((c) => c.compound);

  return (
    <div className="space-y-4">
      {/* SPOF Alert Strip */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Shared dependencies on at least 60% of modelled paths
        </span>
        <div className="flex flex-wrap gap-2">
          {spof.map((s) => (
            <div
              key={s.nodeId}
              className="flex min-w-0 items-start gap-2 p-3 border border-red-500/40 bg-red-950/40 text-red-100 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <span className="font-bold block break-words">{s.label}</span>
                <span className="font-mono text-xs text-red-300">{(s.share * 100).toFixed(1)}% of paths · {s.chainCount} paths</span>
              </div>
            </div>
          ))}
          {spof.length === 0 && (
            <span className="text-xs text-muted-foreground italic">
              No single node dominates &ge; 60% of dependency chains.
            </span>
          )}
        </div>
      </div>

      {/* Critical Cascade Pathways */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Highest-weight cascade pathways
        </span>
        <p className="text-xs text-muted-foreground">Path weight multiplies the modelled link weights; it is not an observed event probability.</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Pathway legend">
          <span><span className="text-[#FF6B6B]">■</span> Hazard</span>
          <span><span className="text-white">■</span> Dependency</span>
          <span><span className="text-[#A9A9A9]">■</span> Outcome</span>
        </div>
        <div className="space-y-3">
          {topChains.map((c, idx) => (
            <div
              key={c.id}
              className="min-w-0 p-3 sm:p-4 border border-line bg-card text-xs space-y-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-ink">Pathway #{idx + 1}</span>
                <div className="flex items-center gap-1.5 font-mono">
                  {c.compound && (
                    <Badge variant="outline" className="border-stroke text-white bg-panel-2 text-[10px]">
                      Compound utility path
                    </Badge>
                  )}
                  <span className="font-bold text-brand-900 bg-canvas px-1.5 py-0.5 rounded border text-[11px]">
                    Path weight: {c.score.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Node Sequence */}
              <div className="flex flex-wrap items-center gap-2 text-xs leading-relaxed">
                {c.nodeIds.map((nid, nidx) => (
                  <React.Fragment key={nid}>
                    <span className={`max-w-full border px-2 py-1.5 font-medium break-words ${nodeMap.get(nid)?.type === 'hazard' ? 'border-red-500/50 bg-red-950/30 text-red-100' : nodeMap.get(nid)?.type === 'financial' || nodeMap.get(nid)?.type === 'people' ? 'border-line bg-[#080808] text-neutral-300' : 'border-line bg-panel-2 text-white'}`}>
                      {nodeMap.get(nid)?.label ?? nid}
                    </span>
                    {nidx < c.nodeIds.length - 1 && (
                      <span className="text-muted-foreground">&rarr;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {compoundChains.length > 0 && (
        <div className="p-3 bg-panel-2/50 border border-stroke rounded-md text-xs text-white">
          <span className="font-semibold">Compound Pathways Identified: </span>
          {compoundChains.length} sequence(s) intersect utility dependencies spanning &ge; 5 infrastructure nodes.
        </div>
      )}
    </div>
  );
}
