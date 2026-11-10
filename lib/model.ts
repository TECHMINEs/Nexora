import {
  advisories as advisoriesSeed,
  assets as assetsSeed,
  assumptions as assumptionsSeed,
  byFacility,
  dependencyEdges as edgesSeed,
  dependencyNodes as nodesSeed,
  drills as drillsSeed,
  getBcp,
  getFacility,
  getPolicy,
  getReplayCase,
  hazardProfiles as hazardProfilesSeed,
  observations as observationsSeed,
  responders as respondersSeed,
  scenarios as scenariosSeed,
  sources as sourcesSeed,
  thresholds as thresholdsSeed,
} from '@/data';
import { computeAccessibility } from '@/lib/engines/accessibility';
import { enumerateChains, singlePointsOfFailure } from '@/lib/engines/cascade';
import { dataCompleteness } from '@/lib/engines/completeness';
import { maxExposureGap, scenarioGap } from '@/lib/engines/insurance';
import { computeOutcome } from '@/lib/engines/outcome';
import { drillResult, preparednessScore } from '@/lib/engines/preparedness';
import { computePriority, isOpenMitigation, rankActions } from '@/lib/engines/priority';
import { provenanceScore } from '@/lib/engines/provenance';
import { computeRisk } from '@/lib/engines/risk';
import {
  avoidedLossIfVerified,
  computeScenarioLoss,
  computeSensitivity,
  contributionPerDay,
  effectiveScenario,
} from '@/lib/engines/scenario';
import type {
  DemoState,
  DrillResult,
  FacilityId,
  FacilityModel,
  GapResult,
  InsuranceView,
  PriorityResult,
  ProvenanceRow,
  ReplayStatus,
  RiskResult,
  ScenarioView,
} from '@/lib/types';

export function buildFacilityModel(id: FacilityId, state: DemoState): FacilityModel {
  // 1. Facility & assets
  const facility = getFacility(id);
  const assets = byFacility(assetsSeed, id);
  const contrib = contributionPerDay(facility);

  // 2. Data completeness
  const completeness = dataCompleteness(facility);

  // 3. Risks per hazard profile
  const facilityProfiles = byFacility(hazardProfilesSeed, id);
  const risks: RiskResult[] = facilityProfiles.map((p) =>
    computeRisk(p, assets, state.ledger)
  );

  // 4. Top risk (max Rnorm)
  let topRisk = risks[0];
  for (const r of risks) {
    if (r.Rnorm.value > (topRisk?.Rnorm.value ?? 0)) {
      topRisk = r;
    }
  }

  // 5. Cascade
  const nodes = byFacility(nodesSeed, id);
  const edges = byFacility(edgesSeed, id);
  const chains = enumerateChains(nodes, edges);
  const spof = singlePointsOfFailure(chains, nodes);
  const cascade = { nodes, edges, chains, spof };

  // 6. Scenarios
  const facilityScenarios = byFacility(scenariosSeed, id);
  const scenarios: ScenarioView[] = facilityScenarios.map((s) => {
    const override = state.scenarioOverrides[s.id] ?? null;
    const effGross = effectiveScenario(s, facility, state.ledger, 'gross', null);
    const effResidual = effectiveScenario(s, facility, state.ledger, 'residual', override);
    const effCommitted = effectiveScenario(s, facility, state.ledger, 'committed', null);

    const gross = computeScenarioLoss(facility, assets, effGross);
    const residual = computeScenarioLoss(facility, assets, effResidual);
    const committed = computeScenarioLoss(facility, assets, effCommitted);
    const sensitivity = computeSensitivity(facility, assets, effResidual);

    return {
      scenario: s,
      gross,
      residual,
      committed,
      sensitivity,
      override,
    };
  });
  const selectedScenarioId = state.selectedScenario[id] ?? scenarios[0]?.scenario.id ?? '';

  // 7 & 8. Open mitigations avoided loss & priorities
  const facilityLedger = state.ledger.filter((e) => e.facilityId === id);
  const openMitigations = facilityLedger.filter(isOpenMitigation);
  const unrankedPriorities: PriorityResult[] = openMitigations.map((m) => {
    const avoidedLoss = avoidedLossIfVerified(m, facility, assets, facilityScenarios, state.ledger);
    return computePriority(m, risks, avoidedLoss);
  });
  const priorities = rankActions(unrankedPriorities);

  // 9. Preparedness, drills, BCP
  const preparedness = preparednessScore(state.ledger, id);
  const facilityDrills = byFacility(drillsSeed, id);
  const drills: DrillResult[] = facilityDrills.map((d) => drillResult(d));
  const bcp = getBcp(id);

  // 10. Insurance
  const policy = getPolicy(id);
  const maxExposure = maxExposureGap(facility, assets, policy);
  const byScenario: Record<string, GapResult> = {};
  for (const sv of scenarios) {
    byScenario[sv.scenario.id] = scenarioGap(policy, sv.residual);
  }
  const activeBasis = state.insuranceBasis[id] ?? { kind: 'max_exposure' };
  const active =
    activeBasis.kind === 'max_exposure'
      ? maxExposure
      : (byScenario[activeBasis.scenarioId] ?? maxExposure);
  const insurance: InsuranceView = {
    policy,
    maxExposure,
    byScenario,
    active,
  };

  // 11. Accessibility
  const incidentType = state.incidentType[id] ?? facility.primaryIncident;
  const accessibility = computeAccessibility(facility, respondersSeed, observationsSeed);

  // 12. Monitoring thresholds & advisories
  const thresholds = byFacility(thresholdsSeed, id);
  const advisories = byFacility(advisoriesSeed, id);

  // 13. Replay status
  const replayCase = getReplayCase(facility.replayCaseId);
  const isReplayActive = state.replay.caseId === facility.replayCaseId;
  const currentStep =
    isReplayActive && state.replay.stepIndex >= 0
      ? replayCase.steps[state.replay.stepIndex] ?? null
      : null;
  const replayStatus: ReplayStatus = {
    active: isReplayActive,
    state: isReplayActive ? state.replay.eventState : 'NORMAL',
    log: isReplayActive ? state.replay.log : [],
    latestStep: currentStep,
  };

  // 14. Outcome
  const outcome = computeOutcome(replayCase, facility, assets, state.ledger);

  // 15. Provenance rows
  const facilitySources = sourcesSeed.filter((s) => {
    if (s.id.endsWith('-A') && id !== 'fac-wb-metal') return false;
    if (s.id.endsWith('-B') && id !== 'fac-vz-polymer') return false;
    if (s.id === 'S-PARTNER-EMS-HWH' && id !== 'fac-wb-metal') return false;
    if (s.id === 'S-PARTNER-EMS-VZG' && id !== 'fac-vz-polymer') return false;
    return true;
  });
  const provenance: ProvenanceRow[] = facilitySources.map((src) => ({
    source: src,
    result: provenanceScore(src),
  }));

  // 16. Assumptions
  const assumptions = assumptionsSeed;

  return {
    facility,
    assets,
    contributionPerDay: contrib,
    completeness,
    risks,
    topRisk,
    cascade,
    scenarios,
    selectedScenarioId,
    priorities,
    ledger: facilityLedger,
    preparedness,
    drills,
    bcp,
    insurance,
    accessibility,
    incidentType,
    thresholds,
    advisories,
    replayCase,
    replayStatus,
    outcome,
    provenance,
    assumptions,
  };
}
