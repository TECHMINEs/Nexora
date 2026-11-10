import { BAND_THRESHOLDS, C_MAX, METHOD_CONFIDENCE } from '@/lib/constants';
import { track } from '@/lib/tracked';
import type {
  Asset,
  Band,
  FacilityId,
  HazardProfile,
  HazardType,
  LedgerEntry,
  MitigationFactorResult,
  RiskResult,
} from '@/lib/types';
import { computeExposure } from './exposure';
import { computeVulnerability } from './vulnerability';

export function bandFromRnorm(rnorm: number): Band {
  if (rnorm >= BAND_THRESHOLDS.high) return 'High';
  if (rnorm >= BAND_THRESHOLDS.medium) return 'Medium';
  return 'Low';
}

export function computeMitigationFactor(
  entries: readonly LedgerEntry[],
  facilityId: FacilityId,
  hazard: HazardType
): MitigationFactorResult {
  const contributing = entries.filter(
    (e) =>
      e.facilityId === facilityId &&
      e.kind === 'mitigation' &&
      e.state === 'verified' &&
      e.target === hazard
  );

  const contributingEntryIds = contributing.map((e) => e.id);

  if (contributing.length === 0) {
    const M = track(0, [], ['ASM-08'], 'ASM-08', [1]);
    return { hazard, M, contributingEntryIds };
  }

  let product = 1;
  const extraConfidences: number[] = [];

  for (const entry of contributing) {
    product *= 1 - entry.effectiveness;
    const latestEv = entry.evidence.length > 0 ? entry.evidence[entry.evidence.length - 1] : null;
    if (latestEv) {
      extraConfidences.push(METHOD_CONFIDENCE[latestEv.method]);
    }
  }

  const mValue = Math.min(0.9, 1 - product);
  const M = track(mValue, [], ['ASM-08'], 'ASM-08', extraConfidences);

  return { hazard, M, contributingEntryIds };
}

export function computeRisk(
  profile: HazardProfile,
  assets: readonly Asset[],
  entries: readonly LedgerEntry[]
): RiskResult {
  const H = track(profile.intensity, profile.sourceIds, profile.assumptionIds, profile.section);
  const C = track(profile.criticality, profile.sourceIds, profile.assumptionIds, profile.section);
  const exposure = computeExposure(assets, profile.hazard, profile.sourceIds, profile.section);
  const vulnerability = computeVulnerability(profile);
  const mitigation = computeMitigationFactor(entries, profile.facilityId, profile.hazard);

  const contributingEntries = entries.filter((e) =>
    mitigation.contributingEntryIds.includes(e.id)
  );

  const contributingEvidenceConfidences: number[] = [];
  for (const entry of contributingEntries) {
    const latestEv = entry.evidence.length > 0 ? entry.evidence[entry.evidence.length - 1] : null;
    if (latestEv) {
      contributingEvidenceConfidences.push(METHOD_CONFIDENCE[latestEv.method]);
    }
  }

  const rValue =
    H.value * exposure.E.value * vulnerability.V.value * C.value * (1 - mitigation.M.value);
  const rnormValue = rValue / C_MAX;
  const band = bandFromRnorm(rnormValue);

  const R = track(
    rValue,
    profile.sourceIds,
    profile.assumptionIds,
    profile.section,
    contributingEvidenceConfidences.length > 0 ? contributingEvidenceConfidences : undefined
  );

  const Rnorm = track(
    rnormValue,
    profile.sourceIds,
    profile.assumptionIds,
    profile.section,
    contributingEvidenceConfidences.length > 0 ? contributingEvidenceConfidences : undefined
  );

  return {
    facilityId: profile.facilityId,
    hazard: profile.hazard,
    hazardClass: profile.hazardClass,
    label: profile.label,
    H,
    E: exposure.E,
    V: vulnerability.V,
    C,
    M: mitigation.M,
    R,
    Rnorm,
    band,
    drivers: vulnerability.drivers,
    exposure,
    contributingEntryIds: mitigation.contributingEntryIds,
  };
}
