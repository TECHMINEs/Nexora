import { getSource } from '@/data';
import { provenanceScore } from './engines/provenance';
import type { Tracked } from './types';

const scoreCache = new Map<string, number>();

export function sourceScore(sourceId: string): number {
  if (scoreCache.has(sourceId)) {
    return scoreCache.get(sourceId)!;
  }
  const source = getSource(sourceId);
  const result = provenanceScore(source);
  scoreCache.set(sourceId, result.score);
  return result.score;
}

export function track(
  value: number,
  sourceIds: readonly string[],
  assumptionIds: readonly string[],
  section: string,
  extraConfidences?: readonly number[]
): Tracked<number> {
  const scores: number[] = [];
  for (const s of sourceIds) {
    scores.push(sourceScore(s));
  }
  if (extraConfidences && extraConfidences.length > 0) {
    scores.push(...extraConfidences);
  }

  const confidence = scores.length === 0 ? 0 : Math.min(...scores);

  return {
    value,
    confidence,
    sourceIds: [...sourceIds],
    assumptionIds: [...assumptionIds],
    section,
  };
}

export function derive(
  value: number,
  inputs: readonly Tracked<unknown>[],
  section: string,
  extraAssumptionIds?: readonly string[],
  extraConfidences?: readonly number[]
): Tracked<number> {
  const confidences = inputs.map((i) => i.confidence);
  if (extraConfidences && extraConfidences.length > 0) {
    confidences.push(...extraConfidences);
  }
  const confidence = confidences.length === 0 ? 0 : Math.min(...confidences);

  const sourceIdsSet = new Set<string>();
  for (const input of inputs) {
    for (const sid of input.sourceIds) {
      sourceIdsSet.add(sid);
    }
  }

  const assumptionIdsSet = new Set<string>();
  for (const input of inputs) {
    for (const aid of input.assumptionIds) {
      assumptionIdsSet.add(aid);
    }
  }
  if (extraAssumptionIds) {
    for (const aid of extraAssumptionIds) {
      assumptionIdsSet.add(aid);
    }
  }

  return {
    value,
    confidence,
    sourceIds: Array.from(sourceIdsSet),
    assumptionIds: Array.from(assumptionIdsSet),
    section,
  };
}

export function withValue<T>(t: Tracked<unknown>, value: T): Tracked<T> {
  return {
    value,
    confidence: t.confidence,
    sourceIds: [...t.sourceIds],
    assumptionIds: [...t.assumptionIds],
    section: t.section,
  };
}
