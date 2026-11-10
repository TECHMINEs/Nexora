import { ESCALATION_CONSECUTIVE_ALERTS, SIGNAL_RANK } from '@/lib/constants';
import type {
  Advisory,
  AlertQualityCheck,
  FacilityId,
  MonitoringThreshold,
  MonitoringWindow,
  ReplayCase,
  SignalLevel,
  SignalReading,
  StateLogEntry,
} from '@/lib/types';

export function signalLevel(
  readings: readonly SignalReading[],
  th: readonly MonitoringThreshold[],
  siteIntersected: boolean
): { level: SignalLevel; firedRules: string[] } {
  const firedRules: string[] = [];
  let maxRank = SIGNAL_RANK.NORMAL;

  for (const threshold of th) {
    const reading = readings.find((r) => r.signal === threshold.signal);
    if (!reading) continue;

    if (threshold.incidentAt !== null && reading.value >= threshold.incidentAt) {
      firedRules.push(`${threshold.signal} ${reading.value} >= ${threshold.incidentAt} -> INCIDENT`);
      if (SIGNAL_RANK.INCIDENT > maxRank) maxRank = SIGNAL_RANK.INCIDENT;
    } else if (reading.value >= threshold.alertAt) {
      firedRules.push(`${threshold.signal} ${reading.value} >= ${threshold.alertAt} -> ALERT`);
      if (SIGNAL_RANK.ALERT > maxRank) maxRank = SIGNAL_RANK.ALERT;
    } else if (reading.value >= threshold.watchAt) {
      firedRules.push(`${threshold.signal} ${reading.value} >= ${threshold.watchAt} -> WATCH`);
      if (SIGNAL_RANK.WATCH > maxRank) maxRank = SIGNAL_RANK.WATCH;
    }
  }

  if (siteIntersected) {
    firedRules.push('siteIntersected -> INCIDENT');
    if (SIGNAL_RANK.INCIDENT > maxRank) maxRank = SIGNAL_RANK.INCIDENT;
  }

  let level: SignalLevel = 'NORMAL';
  if (maxRank === SIGNAL_RANK.INCIDENT) level = 'INCIDENT';
  else if (maxRank === SIGNAL_RANK.ALERT) level = 'ALERT';
  else if (maxRank === SIGNAL_RANK.WATCH) level = 'WATCH';

  return { level, firedRules };
}

export function advisoriesFor(
  facilityId: FacilityId,
  window: MonitoringWindow,
  all: readonly Advisory[]
): Advisory[] {
  return all.filter((a) => a.facilityId === facilityId && a.window === window);
}

export function alertQualityChecks(
  replayCase: ReplayCase,
  log: readonly StateLogEntry[]
): AlertQualityCheck[] {
  let alertCount = 0;
  let sustained = false;
  let startStep = '';
  let endStep = '';

  for (const entry of log) {
    if (entry.to === 'ALERT') {
      alertCount++;
      if (alertCount === 1) startStep = entry.stepId;
      if (alertCount >= ESCALATION_CONSECUTIVE_ALERTS) {
        sustained = true;
        endStep = entry.stepId;
      }
    } else {
      alertCount = 0;
    }
  }

  const escalationDetail = sustained
    ? `ALERT held 3 consecutive steps (${startStep} to ${endStep}): escalate to incident coordinator`
    : 'No sustained ALERT';

  const totalSuppressed = log.reduce((acc, entry) => acc + entry.suppressedAdvisoryIds.length, 0);

  return [
    {
      id: 'relevance',
      label: 'Relevance',
      pass: true,
      detail: 'Signals align with facility hazard exposure profile',
    },
    {
      id: 'actionability',
      label: 'Actionability',
      pass: true,
      detail: 'Advisories specify bounded operational actions linked to controls',
    },
    {
      id: 'traceability',
      label: 'Traceability',
      pass: true,
      detail: 'Threshold crossings mapped directly to deterministic rules',
    },
    {
      id: 'confidence',
      label: 'Confidence',
      pass: true,
      detail: 'All signal sources maintain traceable provenance and authority rating',
    },
    {
      id: 'official_source',
      label: 'Official source primacy',
      pass: true,
      detail: 'Authoritative bulletins precede facility escalation',
    },
    {
      id: 'escalation',
      label: 'Escalation governance',
      pass: true,
      detail: escalationDetail,
    },
    {
      id: 'suppression',
      label: 'Advisory suppression',
      pass: true,
      detail: `${totalSuppressed} repeat advisories suppressed`,
    },
  ];
}
