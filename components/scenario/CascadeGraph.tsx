'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { CascadeGraphProps } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

export function CascadeGraph({ cascade }: CascadeGraphProps): JSX.Element {
  const { chains, spof, nodes } = cascade;

  const nodeMap = new Map(nodes.map((n) => [n.id, n.label]));

  // Display top 5 chains
  const topChains = chains.slice(0, 5);
  const compoundChains = chains.filter((c) => c.compound);

  return (
    <div className="space-y-4">
      {/* SPOF Alert Strip */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Single Points of Failure (SPOF &ge; 60% of Propagation Paths)
        </span>
        <div className="flex flex-wrap gap-2">
          {spof.map((s) => (
            <div
              key={s.nodeId}
              className="flex items-center gap-2 p-2 rounded-md border border-red-500/40 bg-red-950/40 text-red-950 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <span className="font-bold">{s.label}</span>
                <span className="font-mono text-[10px] text-red-400 ml-1">
                  ({(s.share * 100).toFixed(1)}% chains, {s.chainCount} paths)
                </span>
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
          Top Cascade Failure Pathways (Ranked by Cumulative Likelihood)
        </span>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {topChains.map((c, idx) => (
            <div
              key={c.id}
              className="p-2.5 rounded-lg border bg-card text-xs space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Pathway #{idx + 1}</span>
                <div className="flex items-center gap-1.5 font-mono">
                  {c.compound && (
                    <Badge variant="outline" className="border-stroke text-white bg-panel-2 text-[10px]">
                      Compound Cyclone-Grid
                    </Badge>
                  )}
                  <span className="font-bold text-brand-900 bg-canvas px-1.5 py-0.5 rounded border text-[11px]">
                    Score: {c.score.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Node Sequence */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                {c.nodeIds.map((nid, nidx) => (
                  <React.Fragment key={nid}>
                    <span className="px-1.5 py-0.5 bg-muted/40 rounded text-foreground font-medium">
                      {nodeMap.get(nid) ?? nid}
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
