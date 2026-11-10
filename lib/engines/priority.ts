import { DEMO_DATE, LIKELIHOOD_BY_BAND, PRIORITY_MAX } from '@/lib/constants';
import { daysBetween } from '@/lib/dates';
import { track } from '@/lib/tracked';
import type {
  IsoDate,
  LedgerEntry,
  PriorityResult,
  RiskResult,
  Score5,
  Tracked,
} from '@/lib/types';

export function isOpenMitigation(entry: LedgerEntry): boolean {
  return entry.kind === 'mitigation' && entry.state !== 'verified' && entry.state !== 'retired';
}

export function urgencyFromDays(days: number): Score5 {
  if (days <= 0) return 5;
  if (days <= 30) return 4;
  if (days <= 90) return 3;
  if (days <= 180) return 2;
  return 1;
}

export function likelihoodFor(entry: LedgerEntry, risks: readonly RiskResult[]): 1 | 3 | 5 {
  const targetRisk = risks.find((r) => r.hazard === entry.target);
  if (targetRisk) {
    return LIKELIHOOD_BY_BAND[targetRisk.band];
  }
  return (entry.priorityInputs?.likelihoodOverride as 1 | 3 | 5) ?? 3;
}

export function computePriority(
  entry: LedgerEntry,
  risks: readonly RiskResult[],
  avoidedLoss: Tracked<number>,
  now: IsoDate = DEMO_DATE
): PriorityResult {
  const impact = (entry.priorityInputs?.impact ?? 1) as Score5;
  const feasibility = (entry.priorityInputs?.feasibility ?? 1) as Score5;
  const likelihood = likelihoodFor(entry, risks);

  const daysUntilDue = entry.dueDate ? daysBetween(now, entry.dueDate) : 999;
  const urgency = urgencyFromDays(daysUntilDue);

  const product = impact * likelihood * urgency * feasibility;
  const scoreValue = product / PRIORITY_MAX;

  const targetRisk = risks.find((r) => r.hazard === entry.target);
  const extraConfidences = targetRisk ? [targetRisk.R.confidence] : undefined;
  const score = track(scoreValue, ['S-ASSUMPTION'], ['ASM-13'], '§74, ASM-13', extraConfidences);

  return {
    entryId: entry.id,
    title: entry.title,
    target: entry.target,
    state: entry.state,
    impact,
    likelihood,
    urgency,
    feasibility,
    product,
    score,
    rank: 0,
    avoidedLoss,
    costMin: entry.costMin,
    costMax: entry.costMax,
    daysUntilDue,
  };
}

export function rankActions(results: readonly PriorityResult[]): PriorityResult[] {
  const sorted = [...results].sort((a, b) => {
    // 1. score descending
    if (b.score.value !== a.score.value) {
      return b.score.value - a.score.value;
    }
    // 2. costMin ascending (null last)
    if (a.costMin === null && b.costMin !== null) return 1;
    if (a.costMin !== null && b.costMin === null) return -1;
    if (a.costMin !== null && b.costMin !== null && a.costMin !== b.costMin) {
      return a.costMin - b.costMin;
    }
    // 3. id ascending
    return a.entryId.localeCompare(b.entryId);
  });

  return sorted.map((r, index) => ({
    ...r,
    rank: index + 1,
  }));
}
