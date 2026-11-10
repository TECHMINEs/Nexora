import { DEMO_DATE, METHOD_CONFIDENCE, PREPAREDNESS_FACTOR } from '@/lib/constants';
import { addDays } from '@/lib/dates';
import { track } from '@/lib/tracked';
import type {
  DrillRecord,
  DrillResult,
  FacilityId,
  IsoDate,
  LedgerEntry,
  Tracked,
} from '@/lib/types';

export function preparednessScore(
  entries: readonly LedgerEntry[],
  facilityId: FacilityId
): Tracked<number> {
  const controls = entries.filter((e) => e.facilityId === facilityId && e.kind === 'control');
  if (controls.length === 0) {
    return track(0, [], ['ASM-15'], '§6.9, §6.10, ASM-15');
  }

  let factorSum = 0;
  const evidenceConfidences: number[] = [];

  for (const c of controls) {
    factorSum += PREPAREDNESS_FACTOR[c.state];
    if (c.state === 'verified' || c.state === 'implemented' || c.state === 'drift_detected') {
      const latest = c.evidence.length > 0 ? c.evidence[c.evidence.length - 1] : null;
      if (latest) {
        evidenceConfidences.push(METHOD_CONFIDENCE[latest.method]);
      }
    }
  }

  const score = factorSum / controls.length;
  const meanConfidence =
    evidenceConfidences.length === 0
      ? 0
      : evidenceConfidences.reduce((a, b) => a + b, 0) / evidenceConfidences.length;

  return {
    value: score,
    confidence: meanConfidence,
    sourceIds: [],
    assumptionIds: ['ASM-15'],
    section: '§6.9, §6.10, ASM-15',
  };
}

export function drillResult(drill: DrillRecord, now: IsoDate = DEMO_DATE): DrillResult {
  const nextDue = drill.lastRun ? addDays(drill.lastRun, drill.intervalDays) : null;
  const overdue = drill.lastRun === null || (nextDue !== null && nextDue < now);

  let effectiveness: Tracked<number> | null = null;
  if (drill.actualMinutes !== null) {
    const effValue = Math.min(1, drill.plannedMinutes / drill.actualMinutes);
    effectiveness = track(effValue, [drill.sourceId], ['ASM-16'], drill.section);
  }

  return {
    drill,
    effectiveness,
    overdue,
    nextDue,
  };
}
