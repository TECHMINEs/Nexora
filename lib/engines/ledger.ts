import { METHOD_CONFIDENCE } from '@/lib/constants';
import { ledgerStateLabel, methodLabel } from '@/lib/format';
import type {
  Evidence,
  IsoDateTime,
  LedgerEntry,
  LedgerState,
  TransitionCheck,
  TransitionPayload,
  VerificationMethod,
} from '@/lib/types';

export const ALLOWED_TRANSITIONS: Record<LedgerState, LedgerState[]> = {
  recommended: ['accepted', 'retired'],
  accepted: ['in_procurement', 'implemented', 'retired'],
  in_procurement: ['implemented', 'retired'],
  implemented: ['verified', 'retired'],
  verified: ['drift_detected', 'retired'],
  drift_detected: ['verified', 'retired'],
  retired: [],
};

export function methodConfidence(m: VerificationMethod): number {
  return METHOD_CONFIDENCE[m];
}

export function latestEvidence(entry: LedgerEntry): Evidence | null {
  return entry.evidence.length > 0 ? entry.evidence[entry.evidence.length - 1] : null;
}

export function isCommitted(entry: LedgerEntry): boolean {
  return (
    entry.state === 'accepted' ||
    entry.state === 'in_procurement' ||
    entry.state === 'implemented' ||
    entry.state === 'verified' ||
    entry.state === 'drift_detected'
  );
}

export function hasEvidence(entry: LedgerEntry): boolean {
  return (
    (entry.state === 'implemented' ||
      entry.state === 'verified' ||
      entry.state === 'drift_detected') &&
    entry.evidence.length > 0
  );
}

export function canTransition(
  entry: LedgerEntry,
  to: LedgerState,
  payload: TransitionPayload
): TransitionCheck {
  const allowed = ALLOWED_TRANSITIONS[entry.state];
  if (!allowed.includes(to)) {
    return {
      ok: false,
      reason: `Transition from ${ledgerStateLabel(entry.state)} to ${ledgerStateLabel(
        to
      )} is not allowed`,
    };
  }

  if (to === 'accepted') {
    if (!payload.ownerName?.trim() || !payload.dueDate?.trim()) {
      return { ok: false, reason: 'Owner and due date are required' };
    }
  } else if (to === 'in_procurement') {
    if (!payload.poRef?.trim()) {
      return { ok: false, reason: 'Purchase order reference is required' };
    }
  } else if (to === 'implemented') {
    if (!payload.evidence?.description?.trim()) {
      return { ok: false, reason: 'Evidence description is required' };
    }
  } else if (to === 'verified') {
    const requiredLabels = entry.verificationRequired.map(methodLabel).join(', ');
    if (
      !payload.evidence ||
      !entry.verificationRequired.includes(payload.evidence.method) ||
      payload.evidence.method === 'self_attested'
    ) {
      return {
        ok: false,
        reason: `Verification requires one of: ${requiredLabels}; self-attested evidence cannot verify`,
      };
    }
    if (!payload.evidence.verifier?.trim()) {
      return { ok: false, reason: 'Verifier name is required' };
    }
  } else if (to === 'drift_detected') {
    if (!payload.note?.trim()) {
      return { ok: false, reason: 'A note describing the drift is required' };
    }
  } else if (to === 'retired') {
    if (!payload.retireReason?.trim() && !payload.note?.trim()) {
      return { ok: false, reason: 'A retirement reason is required' };
    }
  }

  return { ok: true, reason: null };
}

export function applyTransition(
  entry: LedgerEntry,
  to: LedgerState,
  payload: TransitionPayload,
  at: IsoDateTime
): LedgerEntry {
  const cloned = structuredClone(entry);
  if (payload.evidence) {
    const newEv: Evidence = {
      id: `ev-${entry.id}-${entry.evidence.length + 1}`,
      method: payload.evidence.method,
      description: payload.evidence.description,
      verifier: payload.evidence.verifier ?? null,
      timestamp: at,
    };
    cloned.evidence.push(newEv);
  }

  cloned.state = to;
  cloned.stateSince = at;
  if (payload.ownerName) cloned.owner = payload.ownerName;
  if (payload.dueDate) cloned.dueDate = payload.dueDate;
  if (payload.poRef) cloned.poRef = payload.poRef;

  const eventNote =
    to === 'retired' && payload.retireReason ? payload.retireReason : payload.note || 'State transition';

  cloned.history.push({
    from: entry.state,
    to,
    at,
    actor: payload.actor || 'User',
    note: eventNote,
  });

  return cloned;
}
