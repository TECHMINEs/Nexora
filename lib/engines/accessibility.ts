import {
  ACCESS_BANDS,
  ACCESS_WEIGHTS,
  PERCENTILE_MIN_N,
  SAMPLE_K,
} from '@/lib/constants';
import { sourceScore, track } from '@/lib/tracked';
import type {
  AccessBand,
  AccessibilityResult,
  AccessibilitySubscore,
  Capability,
  Facility,
  IncidentType,
  PercentileKey,
  ResponderResource,
  ResponseObservation,
  ResourceStats,
  SelectionCandidate,
  SelectionResult,
} from '@/lib/types';

export function percentile(sortedAsc: readonly number[], p: number): number {
  const n = sortedAsc.length;
  if (n === 0) return 0;
  if (n === 1) return sortedAsc[0];
  const h = (n - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  return sortedAsc[lo] + (h - lo) * (sortedAsc[hi] - sortedAsc[lo]);
}

export function percentileGated(
  values: readonly number[],
  p: number,
  minN: number
): number | null {
  if (values.length < minN) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return percentile(sorted, p);
}

export function resourceStats(
  resource: ResponderResource,
  obs: readonly ResponseObservation[]
): ResourceStats {
  const matching = obs.filter((o) => o.resourceId === resource.id);
  const n = matching.length;

  const travels = matching.map((o) => o.travelMin);
  const totals = matching.map((o) => o.dispatchMin + o.mobiliseMin + o.travelMin);

  const travelP50 = percentileGated(travels, 0.5, PERCENTILE_MIN_N.P50);
  const totalP50 = percentileGated(totals, 0.5, PERCENTILE_MIN_N.P50);
  const totalP90 = percentileGated(totals, 0.9, PERCENTILE_MIN_N.P90);
  const totalP95 = percentileGated(totals, 0.95, PERCENTILE_MIN_N.P95);

  const insufficient: PercentileKey[] = [];
  if (n < PERCENTILE_MIN_N.P50) insufficient.push('P50');
  if (n < PERCENTILE_MIN_N.P90) insufficient.push('P90');
  if (n < PERCENTILE_MIN_N.P95) insufficient.push('P95');

  const meanDecomposition =
    n === 0
      ? { dispatch: 0, mobilise: 0, travel: 0 }
      : {
          dispatch: matching.reduce((sum, o) => sum + o.dispatchMin, 0) / n,
          mobilise: matching.reduce((sum, o) => sum + o.mobiliseMin, 0) / n,
          travel: matching.reduce((sum, o) => sum + o.travelMin, 0) / n,
        };

  const baseScore = sourceScore(resource.sourceId);
  const confidence = (baseScore * n) / (n + SAMPLE_K);

  return {
    resource,
    n,
    travelP50,
    totalP50,
    totalP90,
    totalP95,
    meanDecomposition,
    confidence,
    insufficient,
  };
}

export function isCapable(resource: ResponderResource, incident: IncidentType): boolean {
  switch (incident) {
    case 'medical':
      return resource.capabilities.includes('BLS') || resource.capabilities.includes('ALS');
    case 'fire':
      return resource.capabilities.includes('fire');
    case 'hazmat':
      return resource.capabilities.includes('hazmat');
  }
}

export function selectFastestCapable(
  resources: readonly ResponderResource[],
  stats: readonly ResourceStats[],
  incident: IncidentType
): SelectionResult {
  const candidates: SelectionCandidate[] = resources.map((r) => ({
    resourceId: r.id,
    capable: isCapable(r, incident),
    distanceKm: r.distanceKm,
    currentTravelEstimateMin: r.currentTravelEstimateMin,
  }));

  // Nearest overall
  const sortedByDist = [...resources].sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    if (a.currentTravelEstimateMin !== b.currentTravelEstimateMin) {
      return a.currentTravelEstimateMin - b.currentTravelEstimateMin;
    }
    return a.id.localeCompare(b.id);
  });
  const nearestResourceId = sortedByDist[0]?.id ?? '';

  const capableResources = resources.filter((r) => isCapable(r, incident));

  if (capableResources.length === 0) {
    return {
      incident,
      selectedResourceId: null,
      nearestResourceId,
      candidates,
      confidence: 0,
      reason: 'No capable resource in register',
    };
  }

  // Sort capable resources by fastest travel estimate
  const sortedCapable = [...capableResources].sort((a, b) => {
    if (a.currentTravelEstimateMin !== b.currentTravelEstimateMin) {
      return a.currentTravelEstimateMin - b.currentTravelEstimateMin;
    }
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return a.id.localeCompare(b.id);
  });

  const selected = sortedCapable[0];
  const nearest = sortedByDist[0];

  let reason = '';
  if (selected.id === nearest.id) {
    reason = 'Nearest capable resource is also fastest';
  } else {
    if (capableResources.length === 1) {
      reason = 'Only capable resource';
    } else if (selected.distanceKm > nearest.distanceKm) {
      reason = 'Farther but faster on current estimate';
    } else {
      reason = 'Fastest capable resource';
    }
  }

  const stat = stats.find((s) => s.resource.id === selected.id);
  const resourceConfidence = stat ? stat.confidence : 0;
  const estimateSourceScore = sourceScore(selected.currentEstimateSourceId);
  const confidence = Math.min(resourceConfidence, estimateSourceScore);

  return {
    incident,
    selectedResourceId: selected.id,
    nearestResourceId,
    candidates,
    confidence,
    reason,
  };
}

export function computeAccessibility(
  f: Facility,
  resources: readonly ResponderResource[],
  obs: readonly ResponseObservation[]
): AccessibilityResult {
  const facilityResources = resources.filter((r) => r.facilityId === f.id);
  const resourceStatsList = facilityResources.map((r) => resourceStats(r, obs));

  // Incidents
  const selections: Record<IncidentType, SelectionResult> = {
    medical: selectFastestCapable(facilityResources, resourceStatsList, 'medical'),
    fire: selectFastestCapable(facilityResources, resourceStatsList, 'fire'),
    hazmat: selectFastestCapable(facilityResources, resourceStatsList, 'hazmat'),
  };

  // Capabilities required by facility
  const reqCaps = f.requiredCapabilities;

  // Best resource per capability
  const bestPerCap: Record<Capability, ResourceStats | null> = {
    BLS: null,
    ALS: null,
    fire: null,
    hazmat: null,
  };

  for (const cap of reqCaps) {
    const capableStats = resourceStatsList.filter(
      (s) => s.resource.capabilities.includes(cap) && s.totalP50 !== null
    );
    if (capableStats.length > 0) {
      capableStats.sort((a, b) => a.totalP50! - b.totalP50!);
      bestPerCap[cap] = capableStats[0];
    }
  }

  // 1. Coverage
  let coveredCount = 0;
  for (const cap of reqCaps) {
    const best = bestPerCap[cap];
    if (best && best.totalP50 !== null && best.totalP50 <= 20) {
      coveredCount++;
    }
  }
  const coverageVal = reqCaps.length === 0 ? 0 : coveredCount / reqCaps.length;

  // 2. Speed
  let speedSum = 0;
  for (const cap of reqCaps) {
    const best = bestPerCap[cap];
    const p50 = best?.totalP50 ?? 30;
    const clamped = Math.max(0, Math.min(1, (30 - p50) / 22));
    speedSum += clamped;
  }
  const speedVal = reqCaps.length === 0 ? 0 : speedSum / reqCaps.length;

  // 3. Reliability
  const relScores: number[] = [];
  for (const cap of reqCaps) {
    const best = bestPerCap[cap];
    if (best && best.totalP50 !== null && best.totalP90 !== null) {
      const rel = Math.max(0, Math.min(1, 1 - (best.totalP90 - best.totalP50) / best.totalP50));
      relScores.push(rel);
    }
  }
  const reliabilityVal = relScores.length === 0 ? null : relScores.reduce((a, b) => a + b, 0) / relScores.length;

  // 4. Redundancy
  const redundancyVal = Math.max(0, Math.min(1, (f.accessRoutes - 1) / 2));

  // 5. Capability Match
  const sortedOverall = [...facilityResources].sort((a, b) => {
    if (a.currentTravelEstimateMin !== b.currentTravelEstimateMin) {
      return a.currentTravelEstimateMin - b.currentTravelEstimateMin;
    }
    return a.distanceKm - b.distanceKm;
  });
  const fastestOverall = sortedOverall[0];

  let capabilityMatchVal = 0;
  if (fastestOverall && isCapable(fastestOverall, f.primaryIncident)) {
    capabilityMatchVal = 1.0;
  } else if (facilityResources.some((r) => isCapable(r, f.primaryIncident))) {
    capabilityMatchVal = 0.5;
  }

  const subscores: AccessibilitySubscore[] = [
    { factor: 'coverage', weight: ACCESS_WEIGHTS.coverage, value: coverageVal, note: 'Share with total P50 <= 20 min' },
    { factor: 'reliability', weight: ACCESS_WEIGHTS.reliability, value: reliabilityVal, note: 'P90-to-P50 tail spread' },
    { factor: 'speed', weight: ACCESS_WEIGHTS.speed, value: speedVal, note: 'Mean speed score against 8-30 min scale' },
    { factor: 'redundancy', weight: ACCESS_WEIGHTS.redundancy, value: redundancyVal, note: 'Independent access routes' },
    { factor: 'capabilityMatch', weight: ACCESS_WEIGHTS.capabilityMatch, value: capabilityMatchVal, note: 'Capability alignment for primary incident' },
  ];

  let weightSum = 0;
  let weightedProductSum = 0;
  let partial = false;

  for (const sub of subscores) {
    if (sub.value === null) {
      partial = true;
    } else {
      weightSum += sub.weight;
      weightedProductSum += sub.weight * sub.value;
    }
  }

  const overallRatio = weightSum === 0 ? 0 : weightedProductSum / weightSum;
  const score100 = overallRatio * 100;

  let band: AccessBand = 'Poor';
  if (score100 >= ACCESS_BANDS.good) {
    band = 'Good';
  } else if (score100 >= ACCESS_BANDS.medium) {
    band = 'Medium';
  }

  // Confidence = min confidence of best resources used
  const bestConfs: number[] = [];
  for (const cap of reqCaps) {
    const best = bestPerCap[cap];
    if (best) {
      bestConfs.push(best.confidence);
    }
  }
  const minConf = bestConfs.length === 0 ? 0 : Math.min(...bestConfs);
  const scoreTracked = track(overallRatio, f.sourceIds, ['ASM-10', 'ASM-11', 'ASM-12'], '§45.1', [minConf]);

  return {
    facilityId: f.id,
    score: scoreTracked,
    band,
    partial,
    subscores,
    resources: resourceStatsList,
    selections,
  };
}
