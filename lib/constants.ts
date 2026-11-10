import type { AccessFactor, Band, ChecklistStatus, EventState, LedgerState, SourceAuthority, VerificationMethod, WeightLabel } from './types';

export const DEMO_NOW = '2026-10-07T12:00:00+05:30';
export const DEMO_DATE = '2026-10-07';
export const MODEL_VERSION = 'risk-v0.3.1';                 // §28
export const C_MAX = 5;                                       // §9 criticality scale 1..5
export const BAND_THRESHOLDS = { high: 0.35, medium: 0.10 } as const;   // ASM-07, on Rnorm
export const WEIGHT_VALUE: Record<WeightLabel, number> = { High: 1, 'Medium/High': 0.75, Medium: 0.5 }; // ASM-06
export const PROVENANCE_WEIGHTS = { freshness: 0.25, completeness: 0.25, spatialAccuracy: 0.20, temporalAccuracy: 0.15, consistency: 0.15 } as const; // ASM-27
export const AUTHORITY_FACTOR: Record<SourceAuthority, number> = { official: 1, partner: 0.9, open: 0.85, customer: 0.8, estimated: 0.6 }; // ASM-27
export const METHOD_CONFIDENCE: Record<VerificationMethod, number> = {
  self_attested: 0.40, document: 0.60, photo_geo: 0.60, remote_expert: 0.80, physical_inspection: 0.95, outcome: 0.98,
}; // §44.1 → ASM-14
export const PREPAREDNESS_FACTOR: Record<LedgerState, number> = {
  verified: 1, implemented: 0.6, drift_detected: 0.4, recommended: 0, accepted: 0, in_procurement: 0, retired: 0,
}; // ASM-15
export const CHECKLIST_FACTOR: Record<ChecklistStatus, number> = { pass: 1, partial: 0.5, fail: 0 }; // ASM-25
export const ACCESS_WEIGHTS: Record<AccessFactor, number> = { coverage: 0.20, reliability: 0.25, speed: 0.25, redundancy: 0.15, capabilityMatch: 0.10 }; // §45.1
export const ACCESS_SPEED_BOUNDS = { best: 8, worst: 30 } as const;      // minutes, ASM-11
export const ACCESS_COVERAGE_MAX_P50 = 20;                               // minutes, ASM-11
export const ACCESS_BANDS = { good: 75, medium: 50 } as const;           // score100
export const PERCENTILE_MIN_N = { P50: 3, P90: 6, P95: 10 } as const;    // ASM-12
export const SAMPLE_K = 5;                                               // sample factor n/(n+K), ASM-12
export const SENSITIVITY_BANDS = {
  downtimeDays: [3, 7, 30], inventoryLossFraction: [0.1, 0.3, 0.6], supplierInterruptionDays: [3, 14, 30],
} as const;                                                              // §42.1
export const LIKELIHOOD_BY_BAND: Record<Band, 1 | 3 | 5> = { High: 5, Medium: 3, Low: 1, Unknown: 3 }; // ASM-13
export const PRIORITY_MAX = 625;
export const PRIORITY_CRITICAL = 0.40;                                   // score (0..1) at or above = critical
export const SPOF_THRESHOLD = 0.6;                                       // share of chains
export const COMPOUND_MIN_NODES = 5;
export const CONFIDENCE_TIERS = { strong: 0.75, fair: 0.5 } as const;
export const SIGNAL_RANK: Record<'NORMAL' | 'WATCH' | 'ALERT' | 'INCIDENT', number> = { NORMAL: 0, WATCH: 1, ALERT: 2, INCIDENT: 3 };
export const EVENT_STATE_ORDER: EventState[] = ['NORMAL', 'WATCH', 'ALERT', 'INCIDENT', 'STABILISE', 'RECOVER', 'POST_MORTEM'];
export const OWNER_BY_STATE: Record<EventState, string> = {
  NORMAL: 'Organisation', WATCH: 'Ops lead', ALERT: 'Incident coordinator', INCIDENT: 'Coordinator + volunteers',
  STABILISE: 'Coordinator', RECOVER: 'Management', POST_MORTEM: 'Management + ResilienceOS',
}; // Deck s10
export const ESCALATION_CONSECUTIVE_ALERTS = 3;
export const BANNER_TEXT = 'Illustrative demo data — not a real facility';
export const INSURANCE_DISCLAIMER =
  'Potential protection gap for discussion with a licensed adviser. We estimate exposure; we do not act as an insurer, intermediary or adviser and we do not assess whether cover is sufficient.';
export const OFFICIAL_SOURCE_NOTICE =
  'Official warnings and emergency instructions always override platform advisories. This prototype replays illustrative values and does not issue warnings.';
export const ROUTES = {
  portfolio: '/', replay: '/replay', lifecycle: '/lifecycle',
  facility: (id: string) => `/facility/${id}`,
  sub: (id: string, s: 'risk' | 'scenarios' | 'mitigation' | 'ledger' | 'insurance' | 'accessibility' | 'monitoring' | 'report') => `/facility/${id}/${s}`,
} as const;
