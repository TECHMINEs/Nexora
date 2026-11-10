import { AUTHORITY_FACTOR, DEMO_NOW, PROVENANCE_WEIGHTS } from '@/lib/constants';
import { hoursBetween } from '@/lib/dates';
import type { DataSource, IsoDateTime, ProvenanceResult, SourceDims } from '@/lib/types';

export function provenanceScore(
  source: DataSource,
  now: IsoDateTime = DEMO_NOW
): ProvenanceResult & { raw: number; factor: number } {
  const { freshness, completeness, spatialAccuracy, temporalAccuracy, consistency } = source.dims;
  const weighted: SourceDims = {
    freshness: PROVENANCE_WEIGHTS.freshness * freshness,
    completeness: PROVENANCE_WEIGHTS.completeness * completeness,
    spatialAccuracy: PROVENANCE_WEIGHTS.spatialAccuracy * spatialAccuracy,
    temporalAccuracy: PROVENANCE_WEIGHTS.temporalAccuracy * temporalAccuracy,
    consistency: PROVENANCE_WEIGHTS.consistency * consistency,
  };
  const raw =
    weighted.freshness +
    weighted.completeness +
    weighted.spatialAccuracy +
    weighted.temporalAccuracy +
    weighted.consistency;
  const gated = source.licence === 'uncertain';
  const authorityFactor = AUTHORITY_FACTOR[source.authority];
  const score = gated ? 0 : authorityFactor * raw;
  const dataAgeHours = hoursBetween(source.sourceTimestamp, now);

  return {
    sourceId: source.id,
    score,
    gated,
    authorityFactor,
    factor: authorityFactor,
    raw,
    weighted,
    dataAgeHours,
  };
}
