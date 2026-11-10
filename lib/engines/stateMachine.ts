import { advisories, thresholds } from '@/data';
import { OWNER_BY_STATE, SIGNAL_RANK } from '@/lib/constants';
import type {
  EventState,
  FacilityId,
  OperationalMode,
  ReplayCase,
  ReplayPhase,
  ReplayStep,
  SignalLevel,
  StateLogEntry,
} from '@/lib/types';
import { signalLevel } from './monitoring';

export function nextEventState(
  current: EventState,
  level: SignalLevel,
  phase: ReplayPhase
): EventState {
  if (phase === 'pre' || phase === 'impact') {
    if (level === 'INCIDENT') {
      return 'INCIDENT';
    }
    const currentRank =
      current === 'NORMAL' ? 0 : current === 'WATCH' ? 1 : current === 'ALERT' ? 2 : 3;
    const signalRank = SIGNAL_RANK[level];
    if (signalRank > currentRank) {
      return level as EventState;
    }
    if (signalRank < currentRank && (current === 'WATCH' || current === 'ALERT')) {
      return current === 'ALERT' ? 'WATCH' : 'NORMAL';
    }
    return current;
  }

  if (phase === 'stabilise') {
    return current === 'INCIDENT' ? 'STABILISE' : current;
  }

  if (phase === 'recover') {
    return current === 'STABILISE' ? 'RECOVER' : current;
  }

  if (phase === 'postmortem') {
    return current === 'RECOVER' ? 'POST_MORTEM' : current;
  }

  return current;
}

export function ownerFor(s: EventState): string {
  return OWNER_BY_STATE[s];
}

export function modeForState(s: EventState): OperationalMode[] {
  if (s === 'NORMAL' || s === 'WATCH') {
    return ['prepare', 'prevent'];
  }
  if (s === 'ALERT' || s === 'INCIDENT' || s === 'STABILISE') {
    return ['respond'];
  }
  return ['recover'];
}

export function evaluateStep(
  step: ReplayStep,
  current: EventState,
  previous: StateLogEntry | null,
  facilityId: FacilityId
): StateLogEntry {
  const facilityThresholds = thresholds.filter((th) => th.facilityId === facilityId);
  const { level, firedRules } = signalLevel(step.signals, facilityThresholds, step.siteIntersected);
  const to = nextEventState(current, level, step.phase);
  const owner = ownerFor(to);

  const windowAdvisories = advisories.filter(
    (a) => a.facilityId === facilityId && a.window === step.window
  );

  const advisoryIds: string[] = [];
  const suppressedAdvisoryIds: string[] = [];

  const shouldFire =
    SIGNAL_RANK[level] >= SIGNAL_RANK.WATCH ||
    ['stabilise', 'recover', 'postmortem'].includes(step.phase);

  if (shouldFire) {
    for (const adv of windowAdvisories) {
      const wasFiredBefore =
        previous &&
        (previous.advisoryIds.includes(adv.id) ||
          previous.suppressedAdvisoryIds.includes(adv.id));

      if (wasFiredBefore) {
        suppressedAdvisoryIds.push(adv.id);
      } else {
        advisoryIds.push(adv.id);
      }
    }
  }

  return {
    stepId: step.id,
    offsetHours: step.offsetHours,
    level,
    firedRules,
    from: current,
    to,
    owner,
    advisoryIds,
    suppressedAdvisoryIds,
  };
}

export function foldReplay(
  replayCase: ReplayCase,
  uptoIndex: number
): { eventState: EventState; log: StateLogEntry[] } {
  let eventState: EventState = 'NORMAL';
  const log: StateLogEntry[] = [];

  if (uptoIndex < 0) {
    return { eventState, log };
  }

  const limit = Math.min(uptoIndex, replayCase.steps.length - 1);
  for (let i = 0; i <= limit; i++) {
    const step = replayCase.steps[i];
    const prev = log.length > 0 ? log[log.length - 1] : null;
    const entry = evaluateStep(step, eventState, prev, replayCase.facilityId);
    log.push(entry);
    eventState = entry.to;
  }

  return { eventState, log };
}
