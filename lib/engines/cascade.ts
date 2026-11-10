import { COMPOUND_MIN_NODES, SPOF_THRESHOLD } from '@/lib/constants';
import type { Chain, DependencyEdge, DependencyNode, NodeType, SpofResult } from '@/lib/types';

export function enumerateChains(
  nodes: readonly DependencyNode[],
  edges: readonly DependencyEdge[]
): Chain[] {
  const nodeMap = new Map<string, DependencyNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  const adj = new Map<string, { to: string; weight: number }[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push({ to: e.to, weight: e.weight });
  }

  const chains: Chain[] = [];

  function dfs(
    currentId: string,
    currentPath: string[],
    currentWeight: number,
    visited: Set<string>
  ) {
    const currentNode = nodeMap.get(currentId);
    if (!currentNode) return;

    if (currentNode.type === 'financial' || currentNode.type === 'people') {
      const hasUtility = currentPath.some((id) => nodeMap.get(id)?.type === 'utility');
      const compound = hasUtility && currentPath.length >= COMPOUND_MIN_NODES;
      chains.push({
        id: currentPath.join('>'),
        nodeIds: [...currentPath],
        score: currentWeight,
        compound,
        targetType: currentNode.type as 'financial' | 'people',
      });
      return;
    }

    const nextEdges = adj.get(currentId) || [];
    for (const edge of nextEdges) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        currentPath.push(edge.to);
        dfs(edge.to, currentPath, currentWeight * edge.weight, visited);
        currentPath.pop();
        visited.delete(edge.to);
      }
    }
  }

  const hazardNodes = nodes.filter((n) => n.type === 'hazard');
  for (const hn of hazardNodes) {
    const visited = new Set<string>([hn.id]);
    dfs(hn.id, [hn.id], 1.0, visited);
  }

  // Sort chains:
  // score desc (within 1e-9 equal), then fewer nodes (length asc), then id asc
  chains.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 1e-9) {
      return b.score - a.score;
    }
    if (a.nodeIds.length !== b.nodeIds.length) {
      return a.nodeIds.length - b.nodeIds.length;
    }
    return a.id.localeCompare(b.id);
  });

  return chains;
}

export function singlePointsOfFailure(
  chains: readonly Chain[],
  nodes: readonly DependencyNode[],
  threshold = SPOF_THRESHOLD
): SpofResult[] {
  if (chains.length === 0) return [];

  const eligibleTypes: NodeType[] = [
    'asset',
    'utility',
    'process',
    'infrastructure',
    'supply',
  ];

  const nodeMap = new Map<string, DependencyNode>();
  for (const n of nodes) {
    if (eligibleTypes.includes(n.type)) {
      nodeMap.set(n.id, n);
    }
  }

  const results: SpofResult[] = [];

  for (const [nodeId, node] of nodeMap.entries()) {
    let count = 0;
    for (const chain of chains) {
      if (chain.nodeIds.includes(nodeId)) {
        count++;
      }
    }
    const share = count / chains.length;
    if (share >= threshold) {
      results.push({
        nodeId,
        label: node.label,
        type: node.type,
        share,
        chainCount: count,
      });
    }
  }

  results.sort((a, b) => {
    if (Math.abs(b.share - a.share) > 1e-9) {
      return b.share - a.share;
    }
    return a.nodeId.localeCompare(b.nodeId);
  });

  return results;
}
