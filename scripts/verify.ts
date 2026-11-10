import {
  FACILITY_IDS,
  byFacility,
  dependencyEdges,
  dependencyNodes,
  drills,
  getFacility,
  getPolicy,
  getReplayCase,
  getSource,
  hazardProfiles,
  ledgerSeed,
  observations,
  responders,
  scenarios as allScenarios,
  sources,
  thresholds,
  assets as allAssets,
} from '../data';
import { computeAccessibility, resourceStats } from '../lib/engines/accessibility';
import { enumerateChains, singlePointsOfFailure } from '../lib/engines/cascade';
import { dataCompleteness } from '../lib/engines/completeness';
import { computeExposure } from '../lib/engines/exposure';
import { maxExposureGap, scenarioGap } from '../lib/engines/insurance';
import { applyTransition, canTransition, hasEvidence, isCommitted } from '../lib/engines/ledger';
import { alertQualityChecks, signalLevel } from '../lib/engines/monitoring';
import { computeOutcome } from '../lib/engines/outcome';
import { buildPortfolio } from '../lib/engines/portfolio';
import { drillResult, preparednessScore } from '../lib/engines/preparedness';
import { computePriority, rankActions } from '../lib/engines/priority';
import { provenanceScore } from '../lib/engines/provenance';
import { computeMitigationFactor, computeRisk } from '../lib/engines/risk';
import {
  avoidedLossIfVerified,
  computeScenarioLoss,
  computeSensitivity,
  contributionPerDay,
  effectiveScenario,
} from '../lib/engines/scenario';
import { foldReplay, modeForState } from '../lib/engines/stateMachine';
import { computeVulnerability } from '../lib/engines/vulnerability';
import { formatINR } from '../lib/format';
import { buildFacilityModel } from '../lib/model';
import { initialDemoState } from '../lib/store';
import type { DemoState, FacilityModel } from '../lib/types';

let passed = 0;
let failed = 0;

function assert(
  id: string,
  condition: boolean,
  actual?: unknown,
  expected?: unknown
) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`FAILED: ${id}`);
    if (actual !== undefined && expected !== undefined) {
      console.error(`  Actual:   ${JSON.stringify(actual)}`);
      console.error(`  Expected: ${JSON.stringify(expected)}`);
    }
  }
}

function approx(
  id: string,
  actual: number,
  expected: number,
  tol = 0.0006
) {
  const diff = Math.abs(actual - expected);
  assert(
    id,
    diff <= tol,
    `${actual} (diff ${diff})`,
    `${expected} ± ${tol}`
  );
}

function approxRupees(id: string, actual: number, expected: number, tol = 100) {
  const diff = Math.abs(actual - expected);
  assert(
    id,
    diff <= tol,
    `${actual} (diff ${diff})`,
    `${expected} ± ${tol}`
  );
}

console.log('Running Nexora Resilience Verification...\n');

// ----------------------------------------------------
// F-1 Provenance score (E-PV-1 .. E-PV-15)
// ----------------------------------------------------
const epvExpected: Record<string, { raw: number; factor: number; score: number }> = {
  'S-IMD-RAIN': { raw: 0.845, factor: 1, score: 0.845 },
  'S-CWC-FLOOD': { raw: 0.755, factor: 1, score: 0.755 },
  'S-IMD-CYCLONE': { raw: 0.835, factor: 1, score: 0.835 },
  'S-SDMA-INDUSTRIAL': { raw: 0.680, factor: 1, score: 0.680 },
  'S-OSM-ROADS': { raw: 0.7825, factor: 0.85, score: 0.665125 },
  'S-TRAFFIC-COMM': { raw: 0.920, factor: 0.9, score: 0 },
  'S-PARTNER-EMS-HWH': { raw: 0.675, factor: 0.9, score: 0.6075 },
  'S-PARTNER-EMS-VZG': { raw: 0.8875, factor: 0.9, score: 0.79875 },
  'S-CUST-ASSET-A': { raw: 0.855, factor: 0.8, score: 0.684 },
  'S-CUST-ASSET-B': { raw: 0.855, factor: 0.8, score: 0.684 },
  'S-CUST-FIN-A': { raw: 0.900, factor: 0.8, score: 0.720 },
  'S-CUST-FIN-B': { raw: 0.900, factor: 0.8, score: 0.720 },
  'S-CUST-POLICY-A': { raw: 0.960, factor: 0.8, score: 0.768 },
  'S-CUST-POLICY-B': { raw: 0.960, factor: 0.8, score: 0.768 },
  'S-CUST-SCADA-B': { raw: 0.925, factor: 0.8, score: 0.740 },
  'S-ASSUMPTION': { raw: 0.925, factor: 0.6, score: 0.555 },
  'S-REPLAY-META': { raw: 0.795, factor: 1, score: 0.795 },
};

let epvIdx = 1;
for (const [sid, exp] of Object.entries(epvExpected)) {
  const src = getSource(sid);
  const res = provenanceScore(src);
  approx(`E-PV-${epvIdx}-raw-${sid}`, res.raw, exp.raw);
  approx(`E-PV-${epvIdx}-factor-${sid}`, res.authorityFactor, exp.factor);
  approx(`E-PV-${epvIdx}-score-${sid}`, res.score, exp.score);
  epvIdx++;
}

const rainSrc = getSource('S-IMD-RAIN');
const rainRes = provenanceScore(rainSrc);
approx('E-PV-15-dataAgeHours', rainRes.dataAgeHours, 3.5, 0.01);

// ----------------------------------------------------
// F-3 / F-4 / F-6 Risk (E-RK-1 .. E-RK-6)
// ----------------------------------------------------
const demoState = initialDemoState();
const modelA = buildFacilityModel('fac-wb-metal', demoState);
const modelB = buildFacilityModel('fac-vz-polymer', demoState);

// E-RK-1: A flood (H=0.70, E=0.95, V=0.771429, C=5, M=0, R=2.565, Rnorm=0.513, High, Conf=0.684)
const rkAFlood = modelA.risks.find((r) => r.hazard === 'flood')!;
approx('E-RK-1-H', rkAFlood.H.value, 0.70);
approx('E-RK-1-E', rkAFlood.E.value, 0.95);
approx('E-RK-1-V', rkAFlood.V.value, 0.771429);
assert('E-RK-1-C', rkAFlood.C.value === 5, rkAFlood.C.value, 5);
approx('E-RK-1-M', rkAFlood.M.value, 0);
approx('E-RK-1-R', rkAFlood.R.value, 2.565);
approx('E-RK-1-Rnorm', rkAFlood.Rnorm.value, 0.513);
assert('E-RK-1-Band', rkAFlood.band === 'High', rkAFlood.band, 'High');
approx('E-RK-1-Conf', rkAFlood.R.confidence, 0.684);

// E checks
assert('E-checks-A-flood', rkAFlood.exposure.exposedValue === 15_20_00_000);
assert('E-checks-A-flood-total', rkAFlood.exposure.totalValue === 16_00_00_000);
const topDriverAFlood = [...rkAFlood.drivers].sort((a, b) => b.share - a.share)[0];
approx('E-checks-top-driver-A-flood', topDriverAFlood.share, 0.370370);

// E-RK-2: A cyclone (H=0.60, E=0.625, V=0.566667, C=4, M=0.30, R=0.595, Rnorm=0.119, Medium, Conf=0.600)
const rkACyclone = modelA.risks.find((r) => r.hazard === 'cyclone')!;
approx('E-RK-2-H', rkACyclone.H.value, 0.60);
approx('E-RK-2-E', rkACyclone.E.value, 0.625);
approx('E-RK-2-V', rkACyclone.V.value, 0.566667);
assert('E-RK-2-C', rkACyclone.C.value === 4, rkACyclone.C.value, 4);
approx('E-RK-2-M', rkACyclone.M.value, 0.30);
approx('E-RK-2-R', rkACyclone.R.value, 0.595);
approx('E-RK-2-Rnorm', rkACyclone.Rnorm.value, 0.119);
assert('E-RK-2-Band', rkACyclone.band === 'Medium', rkACyclone.band, 'Medium');
approx('E-RK-2-Conf', rkACyclone.R.confidence, 0.600);

// E-RK-3: A power (H=0.50, E=0.375, V=0.75, C=5, M=0, R=0.703125, Rnorm=0.140625, Medium, Conf=0.555)
const rkAPower = modelA.risks.find((r) => r.hazard === 'power')!;
approx('E-RK-3-H', rkAPower.H.value, 0.50);
approx('E-RK-3-E', rkAPower.E.value, 0.375);
approx('E-RK-3-V', rkAPower.V.value, 0.75);
assert('E-RK-3-C', rkAPower.C.value === 5, rkAPower.C.value, 5);
approx('E-RK-3-M', rkAPower.M.value, 0);
approx('E-RK-3-R', rkAPower.R.value, 0.703125);
approx('E-RK-3-Rnorm', rkAPower.Rnorm.value, 0.140625);
assert('E-RK-3-Band', rkAPower.band === 'Medium', rkAPower.band, 'Medium');
approx('E-RK-3-Conf', rkAPower.R.confidence, 0.555);

// E-RK-4: B toxic_release (H=0.80, E=0.942857, V=0.60, C=5, M=0, R=2.262857, Rnorm=0.452571, High, Conf=0.680)
const rkBToxic = modelB.risks.find((r) => r.hazard === 'toxic_release')!;
approx('E-RK-4-H', rkBToxic.H.value, 0.80);
approx('E-RK-4-E', rkBToxic.E.value, 0.942857);
approx('E-RK-4-V', rkBToxic.V.value, 0.60);
assert('E-RK-4-C', rkBToxic.C.value === 5, rkBToxic.C.value, 5);
approx('E-RK-4-M', rkBToxic.M.value, 0);
approx('E-RK-4-R', rkBToxic.R.value, 2.262857);
approx('E-RK-4-Rnorm', rkBToxic.Rnorm.value, 0.452571);
assert('E-RK-4-Band', rkBToxic.band === 'High', rkBToxic.band, 'High');
approx('E-RK-4-Conf', rkBToxic.R.confidence, 0.680);
assert('E-checks-B-toxic', rkBToxic.exposure.exposedValue === 19_80_00_000);
assert('E-checks-B-toxic-total', rkBToxic.exposure.totalValue === 21_00_00_000);
const topDriverBToxic = [...rkBToxic.drivers].sort((a, b) => b.share - a.share)[0];
approx('E-checks-top-driver-B-toxic', topDriverBToxic.share, 0.476190);

// E-RK-5: B fire (H=0.60, E=0.919048, V=0.236364, C=5, M=0.20, R=0.521351, Rnorm=0.104270, Medium, Conf=0.600)
const rkBFire = modelB.risks.find((r) => r.hazard === 'fire')!;
approx('E-RK-5-H', rkBFire.H.value, 0.60);
approx('E-RK-5-E', rkBFire.E.value, 0.919048);
approx('E-RK-5-V', rkBFire.V.value, 0.236364);
assert('E-RK-5-C', rkBFire.C.value === 5, rkBFire.C.value, 5);
approx('E-RK-5-M', rkBFire.M.value, 0.20);
approx('E-RK-5-R', rkBFire.R.value, 0.521351);
approx('E-RK-5-Rnorm', rkBFire.Rnorm.value, 0.104270);
assert('E-RK-5-Band', rkBFire.band === 'Medium', rkBFire.band, 'Medium');
approx('E-RK-5-Conf', rkBFire.R.confidence, 0.600);

// E-RK-6: B cyclone (H=0.55, E=0.485714, V=0.466667, C=3, M=0, R=0.374, Rnorm=0.0748, Low, Conf=0.684)
const rkBCyclone = modelB.risks.find((r) => r.hazard === 'cyclone')!;
approx('E-RK-6-H', rkBCyclone.H.value, 0.55);
approx('E-RK-6-E', rkBCyclone.E.value, 0.485714);
approx('E-RK-6-V', rkBCyclone.V.value, 0.466667);
assert('E-RK-6-C', rkBCyclone.C.value === 3, rkBCyclone.C.value, 3);
approx('E-RK-6-M', rkBCyclone.M.value, 0);
approx('E-RK-6-R', rkBCyclone.R.value, 0.374);
approx('E-RK-6-Rnorm', rkBCyclone.Rnorm.value, 0.0748);
assert('E-RK-6-Band', rkBCyclone.band === 'Low', rkBCyclone.band, 'Low');
approx('E-RK-6-Conf', rkBCyclone.R.confidence, 0.684);

// ----------------------------------------------------
// F-8 Scenario loss (E-SC-1 .. E-SC-15)
// ----------------------------------------------------
const sa1 = modelA.scenarios.find((s) => s.scenario.id === 'sa1-rainfall')!;
const sa2 = modelA.scenarios.find((s) => s.scenario.id === 'sa2-cyclone')!;
const sa3 = modelA.scenarios.find((s) => s.scenario.id === 'sa3-grid-supplier')!;
const sb1 = modelB.scenarios.find((s) => s.scenario.id === 'sb1-release')!;
const sb2 = modelB.scenarios.find((s) => s.scenario.id === 'sb2-cyclone-power')!;
const sb3 = modelB.scenarios.find((s) => s.scenario.id === 'sb3-process-fire')!;

approxRupees('E-SC-1-sa1-gross-total', sa1.gross.total.value, 77_00_000);
assert('E-SC-1-sa1-gross-display', formatINR(sa1.gross.total.value) === '₹0.77 Cr');
approxRupees('E-SC-2-sa1-res-total', sa1.residual.total.value, 77_00_000);
approxRupees('E-SC-3-sa1-comm-total', sa1.committed.total.value, 37_00_000);

approxRupees('E-SC-4-sa2-gross-total', sa2.gross.total.value, 1_06_60_000);
approxRupees('E-SC-5-sa2-res-total', sa2.residual.total.value, 82_60_000);
approxRupees('E-SC-6-sa2-comm-total', sa2.committed.total.value, 82_60_000);

approxRupees('E-SC-7-sa3-gross-total', sa3.gross.total.value, 25_70_000);
approxRupees('E-SC-8-sa3-res-total', sa3.residual.total.value, 25_70_000);
approxRupees('E-SC-9-sa3-comm-total', sa3.committed.total.value, 21_20_000);

approxRupees('E-SC-10-sb1-gross-total', sb1.gross.total.value, 4_55_00_000);
approxRupees('E-SC-11-sb1-res-total', sb1.residual.total.value, 4_55_00_000);
approxRupees('E-SC-12-sb1-comm-total', sb1.committed.total.value, 2_20_50_000);

approxRupees('E-SC-13-sb2-gross-total', sb2.gross.total.value, 76_75_000);
approxRupees('E-SC-13-sb2-res-total', sb2.residual.total.value, 76_75_000);
approxRupees('E-SC-13-sb2-comm-total', sb2.committed.total.value, 76_75_000);

approxRupees('E-SC-14-sb3-gross-total', sb3.gross.total.value, 3_49_75_000);
approxRupees('E-SC-15-sb3-res-total', sb3.residual.total.value, 3_38_50_000);
approxRupees('E-SC-15-sb3-comm-total', sb3.committed.total.value, 3_38_50_000);

// ----------------------------------------------------
// F-9 Sensitivity (E-SN-1 .. E-SN-8)
// ----------------------------------------------------
const sa1Sens = sa1.sensitivity;
const sa1Dt = sa1Sens.bands.find((b) => b.driver === 'downtimeDays')!;
approxRupees('E-SN-1-swing', sa1Dt.swing, 2_70_00_000);
assert('E-SN-1-outside', sa1Dt.baseOutsideBand === false);

const sa1Inv = sa1Sens.bands.find((b) => b.driver === 'inventoryLossFraction')!;
approxRupees('E-SN-2-swing', sa1Inv.swing, 1_00_00_000);
assert('E-SN-2-outside', sa1Inv.baseOutsideBand === false);

const sa1Sup = sa1Sens.bands.find((b) => b.driver === 'supplierInterruptionDays')!;
approxRupees('E-SN-3-swing', sa1Sup.swing, 45_00_000);
assert('E-SN-3-outside', sa1Sup.baseOutsideBand === true);

assert('E-SN-4-env-min', sa1Sens.envelope.min === 57_00_000);
assert('E-SN-4-env-max', sa1Sens.envelope.max === 3_47_00_000);
assert(
  'E-SN-4-ranking',
  JSON.stringify(sa1Sens.ranking) ===
    JSON.stringify(['downtimeDays', 'inventoryLossFraction', 'supplierInterruptionDays'])
);

const sb1Sens = sb1.sensitivity;
const sb1Dt = sb1Sens.bands.find((b) => b.driver === 'downtimeDays')!;
approxRupees('E-SN-5-swing', sb1Dt.swing, 1_01_25_000);
assert('E-SN-5-outside', sb1Dt.baseOutsideBand === true);

const sb1Inv = sb1Sens.bands.find((b) => b.driver === 'inventoryLossFraction')!;
approxRupees('E-SN-6-swing', sb1Inv.swing, 90_00_000);
assert('E-SN-6-outside', sb1Inv.baseOutsideBand === false);

const sb1Sup = sb1Sens.bands.find((b) => b.driver === 'supplierInterruptionDays')!;
approxRupees('E-SN-7-swing', sb1Sup.swing, 0);
assert('E-SN-7-outside', sb1Sup.baseOutsideBand === true);

assert('E-SN-8-env-min', sb1Sens.envelope.min === 2_41_25_000);
assert('E-SN-8-env-max', sb1Sens.envelope.max === 4_73_00_000);
assert(
  'E-SN-8-ranking',
  JSON.stringify(sb1Sens.ranking) ===
    JSON.stringify(['downtimeDays', 'inventoryLossFraction', 'supplierInterruptionDays'])
);

// ----------------------------------------------------
// F-10 Avoided loss if verified (E-AV-1 .. E-AV-8)
// ----------------------------------------------------
const av = (id: string) => {
  const pA = modelA.priorities.find((p) => p.entryId === id);
  if (pA) return pA.avoidedLoss.value;
  const pB = modelB.priorities.find((p) => p.entryId === id);
  if (pB) return pB.avoidedLoss.value;
  return 0;
};

approxRupees('E-AV-1-m-a-01', av('m-a-01'), 10_00_000);
approxRupees('E-AV-2-m-a-02', av('m-a-02'), 30_00_000);
approxRupees('E-AV-3-m-a-03', av('m-a-03'), 19_20_000);
approxRupees('E-AV-4-m-a-04', av('m-a-04'), 4_50_000);
approxRupees('E-AV-5-m-a-05', av('m-a-05'), 0);
approxRupees('E-AV-6-m-b-01', av('m-b-01'), 2_16_50_000);
approxRupees('E-AV-7-m-b-02', av('m-b-02'), 45_00_000);
approxRupees('E-AV-8-m-b-05', av('m-b-05'), 24_00_000);

// ----------------------------------------------------
// F-11 Insurance adequacy (E-IN-1 .. E-IN-8)
// ----------------------------------------------------
// E-IN-1: A max-exposure
const inA = modelA.insurance.maxExposure;
approxRupees('E-IN-1-L', inA.totals.exposure.value, 19_20_00_000);
approxRupees('E-IN-1-I', inA.totals.protection.value, 11_35_00_000);
approxRupees('E-IN-1-G', inA.totals.gap.value, 7_85_00_000);
approx('E-IN-1-conf', inA.totals.gap.confidence, 0.555);

// E-IN-2: A sa1
const inASa1 = modelA.insurance.byScenario['sa1-rainfall'];
approxRupees('E-IN-2-L', inASa1.totals.exposure.value, 77_00_000);
approxRupees('E-IN-2-I', inASa1.totals.protection.value, 45_00_000);
approxRupees('E-IN-2-G', inASa1.totals.gap.value, 32_00_000);

// E-IN-3: A sa2
const inASa2 = modelA.insurance.byScenario['sa2-cyclone'];
approxRupees('E-IN-3-L', inASa2.totals.exposure.value, 82_60_000);
approxRupees('E-IN-3-I', inASa2.totals.protection.value, 51_00_000);
approxRupees('E-IN-3-G', inASa2.totals.gap.value, 31_60_000);

// E-IN-4: A sa3
const inASa3 = modelA.insurance.byScenario['sa3-grid-supplier'];
approxRupees('E-IN-4-L', inASa3.totals.exposure.value, 25_70_000);
approxRupees('E-IN-4-I', inASa3.totals.protection.value, 0);
approxRupees('E-IN-4-G', inASa3.totals.gap.value, 25_70_000);

// E-IN-5: B max-exposure
const inB = modelB.insurance.maxExposure;
approxRupees('E-IN-5-L', inB.totals.exposure.value, 24_87_50_000);
approxRupees('E-IN-5-I', inB.totals.protection.value, 18_25_00_000);
approxRupees('E-IN-5-G', inB.totals.gap.value, 6_62_50_000);

// E-IN-6: B sb1
const inBSb1 = modelB.insurance.byScenario['sb1-release'];
approxRupees('E-IN-6-L', inBSb1.totals.exposure.value, 4_55_00_000);
approxRupees('E-IN-6-I', inBSb1.totals.protection.value, 0);
approxRupees('E-IN-6-G', inBSb1.totals.gap.value, 4_55_00_000);

// E-IN-7: B sb2
const inBSb2 = modelB.insurance.byScenario['sb2-cyclone-power'];
approxRupees('E-IN-7-L', inBSb2.totals.exposure.value, 76_75_000);
approxRupees('E-IN-7-I', inBSb2.totals.protection.value, 43_00_000);
approxRupees('E-IN-7-G', inBSb2.totals.gap.value, 33_75_000);

// E-IN-8: B sb3
const inBSb3 = modelB.insurance.byScenario['sb3-process-fire'];
approxRupees('E-IN-8-L', inBSb3.totals.exposure.value, 3_38_50_000);
approxRupees('E-IN-8-I', inBSb3.totals.protection.value, 2_72_25_000);
approxRupees('E-IN-8-G', inBSb3.totals.gap.value, 66_25_000);

// ----------------------------------------------------
// F-12 Priority (E-PQ-1 .. E-PQ-11)
// ----------------------------------------------------
const pA = modelA.priorities;
assert('E-PQ-1-id', pA[0].entryId === 'm-a-02');
approx('E-PQ-1-score', pA[0].score.value, 0.80);
assert('E-PQ-2-id', pA[1].entryId === 'm-a-01');
approx('E-PQ-2-score', pA[1].score.value, 0.64);
assert('E-PQ-3-id', pA[2].entryId === 'm-a-04');
approx('E-PQ-3-score', pA[2].score.value, 0.288);
assert('E-PQ-4-id', pA[3].entryId === 'm-a-05');
approx('E-PQ-4-score', pA[3].score.value, 0.1728);
assert('E-PQ-5-id', pA[4].entryId === 'm-a-03');
approx('E-PQ-5-score', pA[4].score.value, 0.144);

const pB = modelB.priorities;
assert('E-PQ-6-id', pB[0].entryId === 'm-b-02');
approx('E-PQ-6-score', pB[0].score.value, 0.80);
assert('E-PQ-7-id', pB[1].entryId === 'm-b-01');
approx('E-PQ-7-score', pB[1].score.value, 0.48);
assert('E-PQ-8-id', pB[2].entryId === 'm-b-03');
approx('E-PQ-8-score', pB[2].score.value, 0.288);
assert('E-PQ-9-id', pB[3].entryId === 'm-b-07');
approx('E-PQ-9-score', pB[3].score.value, 0.288);
assert('E-PQ-10-id', pB[4].entryId === 'm-b-05');
approx('E-PQ-10-score', pB[4].score.value, 0.0768);
assert('E-PQ-11-id', pB[5].entryId === 'm-b-06');
approx('E-PQ-11-score', pB[5].score.value, 0.0576);

// ----------------------------------------------------
// F-13 Response times & F-14 Accessibility (E-AC-1 .. E-AC-14)
// ----------------------------------------------------
const rStatsA = modelA.accessibility.resources;
const rStatsB = modelB.accessibility.resources;

const rAA = rStatsA.find((r) => r.resource.id === 'r-a-als')!;
assert('E-AC-1-n', rAA.n === 4);
approx('E-AC-1-travelP50', rAA.travelP50!, 10.85, 0.01);
approx('E-AC-1-totalP50', rAA.totalP50!, 14.35, 0.01);
approx('E-AC-1-conf', rAA.confidence, 0.270);

const rAFire = rStatsA.find((r) => r.resource.id === 'r-a-fire')!;
assert('E-AC-2-n', rAFire.n === 3);
approx('E-AC-2-travelP50', rAFire.travelP50!, 16.50, 0.01);
approx('E-AC-2-totalP50', rAFire.totalP50!, 19.50, 0.01);
approx('E-AC-2-conf', rAFire.confidence, 0.228);

const rBA = rStatsB.find((r) => r.resource.id === 'r-b-a')!;
assert('E-AC-3-n', rBA.n === 6);
approx('E-AC-3-totalP50', rBA.totalP50!, 10.95, 0.01);
approx('E-AC-3-P90', rBA.totalP90!, 12.60, 0.01);
approx('E-AC-3-conf', rBA.confidence, 0.436);

const rBB = rStatsB.find((r) => r.resource.id === 'r-b-b')!;
assert('E-AC-4-n', rBB.n === 10);
approx('E-AC-4-travelP50', rBB.travelP50!, 7.90, 0.01);
approx('E-AC-4-totalP50', rBB.totalP50!, 10.50, 0.01);
approx('E-AC-4-P90', rBB.totalP90!, 12.68, 0.01);
approx('E-AC-4-P95', rBB.totalP95!, 13.94, 0.01);
approx('E-AC-4-conf', rBB.confidence, 0.5325);

const rBC = rStatsB.find((r) => r.resource.id === 'r-b-c')!;
assert('E-AC-5-n', rBC.n === 10);
approx('E-AC-5-travelP50', rBC.travelP50!, 10.70, 0.01);
approx('E-AC-5-totalP50', rBC.totalP50!, 13.20, 0.01);
approx('E-AC-5-P90', rBC.totalP90!, 16.44, 0.01);
approx('E-AC-5-P95', rBC.totalP95!, 17.97, 0.01);
approx('E-AC-5-conf', rBC.confidence, 0.5325);

approx('E-AC-6-decomp-disp', rBB.meanDecomposition.dispatch, 1.61, 0.01);
approx('E-AC-6-decomp-mob', rBB.meanDecomposition.mobilise, 1.08, 0.01);
approx('E-AC-6-decomp-trav', rBB.meanDecomposition.travel, 8.23, 0.01);

// E-AC-7: Facility A score
approx('E-AC-7-score', modelA.accessibility.score.value, 0.747971);
assert('E-AC-7-band', modelA.accessibility.band === 'Medium');
assert('E-AC-7-partial', modelA.accessibility.partial === true);
approx('E-AC-7-conf', modelA.accessibility.score.confidence, 0.228);

// E-AC-8: Facility B score
approx('E-AC-8-score', modelB.accessibility.score.value, 0.676764);
assert('E-AC-8-band', modelB.accessibility.band === 'Medium');
assert('E-AC-8-partial', modelB.accessibility.partial === false);
approx('E-AC-8-conf', modelB.accessibility.score.confidence, 0.5325);

// E-AC-9 .. E-AC-14: selections
const selAMed = modelA.accessibility.selections.medical;
assert('E-AC-9-sel', selAMed.selectedResourceId === 'r-a-als');
assert('E-AC-9-near', selAMed.nearestResourceId === 'r-a-als');
approx('E-AC-9-conf', selAMed.confidence, 0.270);

const selAFire = modelA.accessibility.selections.fire;
assert('E-AC-10-sel', selAFire.selectedResourceId === 'r-a-fire');
assert('E-AC-10-near', selAFire.nearestResourceId === 'r-a-als');
approx('E-AC-10-conf', selAFire.confidence, 0.228);

const selAHaz = modelA.accessibility.selections.hazmat;
assert('E-AC-11-sel', selAHaz.selectedResourceId === null);
assert('E-AC-11-near', selAHaz.nearestResourceId === 'r-a-als');

const selBMed = modelB.accessibility.selections.medical;
assert('E-AC-12-sel', selBMed.selectedResourceId === 'r-b-b');
assert('E-AC-12-near', selBMed.nearestResourceId === 'r-b-a');
approx('E-AC-12-conf', selBMed.confidence, 0.5325);

const selBHaz = modelB.accessibility.selections.hazmat;
assert('E-AC-13-sel', selBHaz.selectedResourceId === 'r-b-c');
assert('E-AC-13-near', selBHaz.nearestResourceId === 'r-b-a');

const selBFire = modelB.accessibility.selections.fire;
assert('E-AC-14-sel', selBFire.selectedResourceId === 'r-b-c');
assert('E-AC-14-near', selBFire.nearestResourceId === 'r-b-a');

// ----------------------------------------------------
// F-16 Ledger (E-LG-1 .. E-LG-6)
// ----------------------------------------------------
const lA = modelA.ledger;
const lB = modelB.ledger;

const aControls = lA.filter((e) => e.kind === 'control');
const aMitigations = lA.filter((e) => e.kind === 'mitigation');
assert('E-LG-1-ctrl-v', aControls.filter((c) => c.state === 'verified').length === 6);
assert('E-LG-1-ctrl-d', aControls.filter((c) => c.state === 'drift_detected').length === 2);
assert('E-LG-1-ctrl-r', aControls.filter((c) => c.state === 'recommended').length === 2);
assert('E-LG-1-mit-acc', aMitigations.filter((m) => m.state === 'accepted').length === 1);
assert('E-LG-1-mit-proc', aMitigations.filter((m) => m.state === 'in_procurement').length === 1);
assert('E-LG-1-mit-impl', aMitigations.filter((m) => m.state === 'implemented').length === 1);
assert('E-LG-1-mit-ver', aMitigations.filter((m) => m.state === 'verified').length === 1);
assert('E-LG-1-mit-rec', aMitigations.filter((m) => m.state === 'recommended').length === 2);

const ma04 = lA.find((e) => e.id === 'm-a-04')!;
const c3 = canTransition(ma04, 'verified', {
  actor: 'Engineer',
  note: 'test',
  evidence: { method: 'self_attested', description: 'test', verifier: null },
});
assert('E-LG-3-can-trans-false', c3.ok === false);
assert(
  'E-LG-3-reason',
  c3.reason ===
    'Verification requires one of: Document evidence, Physical inspection; self-attested evidence cannot verify',
  c3.reason
);

const c4 = canTransition(ma04, 'verified', {
  actor: 'Engineer',
  note: 'test',
  evidence: { method: 'document', description: 'test', verifier: 'Electrical engineer' },
});
assert('E-LG-4-can-trans-true', c4.ok === true, c4.ok, true);

const ma03 = lA.find((e) => e.id === 'm-a-03')!;
const c5 = canTransition(ma03, 'verified', {
  actor: 'Engineer',
  note: 'test',
});
assert('E-LG-5-can-trans-false', c5.ok === false);
assert('E-LG-5-reason', c5.reason === 'Transition from Recommended to Verified is not allowed', c5.reason);

// E-LG-6: isCommitted / hasEvidence
const aComm = aMitigations.filter(isCommitted);
const aEv = aComm.filter(hasEvidence);
assert('E-LG-6-a-comm', aComm.length === 4, aComm.length, 4);
assert('E-LG-6-a-ev', aEv.length === 2, aEv.length, 2);

const bMitigations = lB.filter((e) => e.kind === 'mitigation');
const bComm = bMitigations.filter(isCommitted);
const bEv = bComm.filter(hasEvidence);
assert('E-LG-6-b-comm', bComm.length === 3, bComm.length, 3);
assert('E-LG-6-b-ev', bEv.length === 2, bEv.length, 2);

// ----------------------------------------------------
// F-17 Preparedness & drills (E-PR-1, E-PR-2, E-DR-1 .. E-DR-4)
// ----------------------------------------------------
approx('E-PR-1-prep', modelA.preparedness.value, 0.68);
approx('E-PR-1-conf', modelA.preparedness.confidence, 0.6875);

approx('E-PR-2-prep', modelB.preparedness.value, 0.66);
approx('E-PR-2-conf', modelB.preparedness.confidence, 0.6375);

const drA1 = modelA.drills.find((d) => d.drill.id === 'd-a-01')!;
approx('E-DR-1-eff', drA1.effectiveness!.value, 0.615385);
assert('E-DR-1-nextDue', drA1.nextDue === '2026-09-10');
assert('E-DR-1-overdue', drA1.overdue === true);

const drA2 = modelA.drills.find((d) => d.drill.id === 'd-a-02')!;
assert('E-DR-2-eff', drA2.effectiveness === null);
assert('E-DR-2-overdue', drA2.overdue === true);

const drB1 = modelB.drills.find((d) => d.drill.id === 'd-b-01')!;
approx('E-DR-3-eff', drB1.effectiveness!.value, 0.80);
assert('E-DR-3-nextDue', drB1.nextDue === '2027-02-16');
assert('E-DR-3-overdue', drB1.overdue === false);

const drB2 = modelB.drills.find((d) => d.drill.id === 'd-b-02')!;
assert('E-DR-4-eff', drB2.effectiveness === null);
assert('E-DR-4-overdue', drB2.overdue === true);

// ----------------------------------------------------
// F-18 Cascade (E-CA-1 .. E-CA-6)
// ----------------------------------------------------
const casA = modelA.cascade;
assert('E-CA-1-chain-count', casA.chains.length === 8, casA.chains.length, 8);
assert('E-CA-1-chain-top', casA.chains[0].id === 'h-rain>a-mcc-wet>p-cnc>f-revenue');
approx('E-CA-1-chain-top-score', casA.chains[0].score, 0.54);
assert('E-CA-2-compound', casA.chains.every((c) => !c.compound));
assert('E-CA-3-spof', casA.spof.length === 1 && casA.spof[0].nodeId === 'p-cnc' && casA.spof[0].share === 1.0);

const casB = modelB.cascade;
assert('E-CA-4-chain-count', casB.chains.length === 8, casB.chains.length, 8);
assert('E-CA-4-chain-top', casB.chains[0].id === 'h-fire>p-plant>f-revenue-b');
approx('E-CA-4-chain-top-score', casB.chains[0].score, 0.70);
const bCompoundChains = casB.chains.filter((c) => c.compound);
assert('E-CA-5-compound', bCompoundChains.length === 2);
assert('E-CA-6-spof-nodes', casB.spof.map((s) => s.nodeId).sort().join(',') === 'a-tank,p-plant,p-release');

// ----------------------------------------------------
// F-19 Monitoring & state machine (E-RP-1 .. E-RP-5, E-MN-1, E-MN-2)
// ----------------------------------------------------
const amphanCase = getReplayCase('amphan-2020');
const { eventState: amState, log: amLog } = foldReplay(amphanCase, 7);
const expectedAmStates = [
  'WATCH',
  'ALERT',
  'ALERT',
  'ALERT',
  'INCIDENT',
  'STABILISE',
  'RECOVER',
  'POST_MORTEM',
];
assert(
  'E-RP-1-amphan-states',
  JSON.stringify(amLog.map((e) => e.to)) === JSON.stringify(expectedAmStates)
);

const expectedAmAdv = [
  'ADV-A-7d',
  'ADV-A-72h',
  'ADV-A-24h',
  'ADV-A-6h',
  'ADV-A-1h',
  'ADV-A-post',
];
assert(
  'E-RP-2-amphan-adv',
  JSON.stringify(amLog.slice(0, 6).flatMap((l) => l.advisoryIds)) === JSON.stringify(expectedAmAdv)
);
assert('E-RP-2-suppressed-7', amLog[6].suppressedAdvisoryIds.includes('ADV-A-post'));
assert('E-RP-2-suppressed-8', amLog[7].suppressedAdvisoryIds.includes('ADV-A-post'));

const vizagCase = getReplayCase('vizag-release-2020');
const { log: vzLog } = foldReplay(vizagCase, 7);
const expectedVzStates = [
  'WATCH',
  'WATCH',
  'ALERT',
  'ALERT',
  'INCIDENT',
  'STABILISE',
  'RECOVER',
  'POST_MORTEM',
];
assert(
  'E-RP-4-vizag-states',
  JSON.stringify(vzLog.map((e) => e.to)) === JSON.stringify(expectedVzStates)
);

// E-RP-5: alert quality checks
const qAm = alertQualityChecks(amphanCase, amLog);
assert('E-RP-5-am-all-pass', qAm.every((q) => q.pass));
const escAm = qAm.find((q) => q.id === 'escalation')!;
assert('E-RP-5-am-esc-detail', escAm.detail.includes('ALERT held 3 consecutive steps (am-2 to am-4)'));

const qVz = alertQualityChecks(vizagCase, vzLog);
assert('E-RP-5-vz-all-pass', qVz.every((q) => q.pass));
const escVz = qVz.find((q) => q.id === 'escalation')!;
assert('E-RP-5-vz-esc-detail', escVz.detail === 'No sustained ALERT');

// E-MN-1: fold replay step back
const { eventState: stepBackState, log: stepBackLog } = foldReplay(amphanCase, 3);
assert('E-MN-1-step-back-state', stepBackState === 'ALERT');
assert('E-MN-1-step-back-len', stepBackLog.length === 4);

// E-MN-2: modeForState
assert('E-MN-2-normal', JSON.stringify(modeForState('NORMAL')) === JSON.stringify(['prepare', 'prevent']));
assert('E-MN-2-alert', JSON.stringify(modeForState('ALERT')) === JSON.stringify(['respond']));
assert('E-MN-2-recover', JSON.stringify(modeForState('RECOVER')) === JSON.stringify(['recover']));

// ----------------------------------------------------
// F-20 Completeness (E-CP-1, E-CP-2)
// ----------------------------------------------------
approx('E-CP-1-A', modelA.completeness.value, 0.911765);
approx('E-CP-2-B', modelB.completeness.value, 0.882353);

// ----------------------------------------------------
// F-21 Outcome learning (E-RP-6a, E-RP-6b)
// ----------------------------------------------------
approxRupees('E-RP-6a-pred', modelA.outcome.predicted.value, 82_60_000);
approxRupees('E-RP-6a-obs', modelA.outcome.observed.value, 95_00_000);
approx('E-RP-6a-err', modelA.outcome.error, -0.130526);
approxRupees('E-RP-6a-recal', modelA.outcome.recalibrated.value, 92_20_000);
approx('E-RP-6a-recalErr', modelA.outcome.recalibratedError, -0.029474);

approxRupees('E-RP-6b-pred', modelB.outcome.predicted.value, 4_55_00_000);
approxRupees('E-RP-6b-obs', modelB.outcome.observed.value, 5_10_00_000);
approx('E-RP-6b-err', modelB.outcome.error, -0.107843);
approxRupees('E-RP-6b-recal', modelB.outcome.recalibrated.value, 5_11_25_000);
approx('E-RP-6b-recalErr', modelB.outcome.recalibratedError, 0.002451);

// ----------------------------------------------------
// F-22 Portfolio (E-PF-1 .. E-PF-7)
// ----------------------------------------------------
const portfolio = buildPortfolio([modelA, modelB]);
const rowA = portfolio.rows.find((r) => r.facilityId === 'fac-wb-metal')!;
const rowB = portfolio.rows.find((r) => r.facilityId === 'fac-vz-polymer')!;

assert('E-PF-1-top', rowA.topRisk.hazard === 'flood');
approx('E-PF-1-top-rnorm', rowA.topRisk.Rnorm.value, 0.513);
approx('E-PF-1-prep', rowA.preparedness.value, 0.68);
approx('E-PF-1-comp', rowA.completeness.value, 0.911765);
approx('E-PF-1-acc', rowA.accessibility.value, 0.747971);
assert('E-PF-1-partial', rowA.accessPartial === true);
approxRupees('E-PF-1-gap', rowA.maxExposureGap.value, 7_85_00_000);
assert('E-PF-1-critical', rowA.openCritical === 2);
assert('E-PF-1-res-id', rowA.largestResidual.scenarioId === 'sa2-cyclone');
approxRupees('E-PF-1-res-val', rowA.largestResidual.loss.value, 82_60_000);

assert('E-PF-2-top', rowB.topRisk.hazard === 'toxic_release');
approx('E-PF-2-top-rnorm', rowB.topRisk.Rnorm.value, 0.452571);
approx('E-PF-2-prep', rowB.preparedness.value, 0.66);
approx('E-PF-2-comp', rowB.completeness.value, 0.882353);
approx('E-PF-2-acc', rowB.accessibility.value, 0.676764);
assert('E-PF-2-partial', rowB.accessPartial === false);
approxRupees('E-PF-2-gap', rowB.maxExposureGap.value, 6_62_50_000);
assert('E-PF-2-critical', rowB.openCritical === 2);
assert('E-PF-2-res-id', rowB.largestResidual.scenarioId === 'sb1-release');
approxRupees('E-PF-2-res-val', rowB.largestResidual.loss.value, 4_55_00_000);

approxRupees('E-PF-3-totalGap', portfolio.totalGap.value, 14_47_50_000);
assert('E-PF-3-display', formatINR(portfolio.totalGap.value) === '₹14.48 Cr');
approx('E-PF-3-conf', portfolio.totalGap.confidence, 0.555);

assert('E-PF-4-openCritical', portfolio.openCritical === 4);
approx('E-PF-5-evidenceRate', portfolio.evidenceBackedRate.value, 0.571429);
approx('E-PF-6-actionConv', portfolio.actionConversion.value, 0.538462);
approx('E-PF-7-meanPrep', portfolio.meanPreparedness.value, 0.67);
approx('E-PF-7-meanPrepConf', portfolio.meanPreparedness.confidence, 0.6375);

// ----------------------------------------------------
// Interaction expectations (E-IX-1 .. E-IX-6)
// ----------------------------------------------------
// E-IX-1: m-a-04 implemented -> verified (document, verifier set)
let state1 = structuredClone(demoState);
const entryMa04 = state1.ledger.find((e) => e.id === 'm-a-04')!;
state1.ledger = state1.ledger.map((e) =>
  e.id === 'm-a-04'
    ? applyTransition(
        entryMa04,
        'verified',
        {
          actor: 'Engineer',
          note: 'Verified DG test record',
          evidence: {
            method: 'document',
            description: 'DG test report signed',
            verifier: 'Electrical engineer',
          },
        },
        '2026-10-07T12:00:00+05:30'
      )
    : e
);
const modelA_ix1 = buildFacilityModel('fac-wb-metal', state1);
const rkPower_ix1 = modelA_ix1.risks.find((r) => r.hazard === 'power')!;
approx('E-IX-1-M', rkPower_ix1.M.value, 0.20);
approx('E-IX-1-R', rkPower_ix1.R.value, 0.5625);
approx('E-IX-1-Rnorm', rkPower_ix1.Rnorm.value, 0.1125);
assert('E-IX-1-Band', rkPower_ix1.band === 'Medium');
approx('E-IX-1-conf', rkPower_ix1.R.confidence, 0.555);
const sa3_ix1 = modelA_ix1.scenarios.find((s) => s.scenario.id === 'sa3-grid-supplier')!;
approxRupees('E-IX-1-sa3-res', sa3_ix1.residual.total.value, 21_20_000);
const gapSa3_ix1 = modelA_ix1.insurance.byScenario['sa3-grid-supplier'];
approxRupees('E-IX-1-sa3-gap', gapSa3_ix1.totals.gap.value, 21_20_000);
assert('E-IX-1-leaves-queue', !modelA_ix1.priorities.some((p) => p.entryId === 'm-a-04'));

// E-IX-2: m-a-01 accepted -> implemented -> verified
let state2 = structuredClone(demoState);
let e01 = state2.ledger.find((e) => e.id === 'm-a-01')!;
e01 = applyTransition(
  e01,
  'implemented',
  {
    actor: 'Lead',
    note: 'Barrier built',
    evidence: {
      method: 'photo_geo',
      description: 'Barrier photo',
      verifier: null,
    },
  },
  '2026-10-07T12:00:00+05:30'
);
e01 = applyTransition(
  e01,
  'verified',
  {
    actor: 'Lead',
    note: 'Site inspection',
    evidence: {
      method: 'physical_inspection',
      description: 'Physical inspection completed',
      verifier: 'EHS inspector',
    },
  },
  '2026-10-07T12:00:00+05:30'
);
state2.ledger = state2.ledger.map((e) => (e.id === 'm-a-01' ? e01 : e));
const modelA_ix2 = buildFacilityModel('fac-wb-metal', state2);
const modelB_ix2 = buildFacilityModel('fac-vz-polymer', state2);
const rkFlood_ix2 = modelA_ix2.risks.find((r) => r.hazard === 'flood')!;
approx('E-IX-2-M', rkFlood_ix2.M.value, 0.35);
approx('E-IX-2-R', rkFlood_ix2.R.value, 1.66725);
approx('E-IX-2-Rnorm', rkFlood_ix2.Rnorm.value, 0.33345);
assert('E-IX-2-Band', rkFlood_ix2.band === 'Medium');
approx('E-IX-2-conf', rkFlood_ix2.R.confidence, 0.684);
const sa1_ix2 = modelA_ix2.scenarios.find((s) => s.scenario.id === 'sa1-rainfall')!;
approxRupees('E-IX-2-sa1-res', sa1_ix2.residual.total.value, 67_00_000);
const gapSa1_ix2 = modelA_ix2.insurance.byScenario['sa1-rainfall'];
approxRupees('E-IX-2-sa1-gap', gapSa1_ix2.totals.gap.value, 22_00_000);
const pMa02_ix2 = modelA_ix2.priorities.find((p) => p.entryId === 'm-a-02')!;
assert('E-IX-2-ma02-likelihood', pMa02_ix2.likelihood === 3);
assert('E-IX-2-ma02-product', pMa02_ix2.product === 300);
approx('E-IX-2-ma02-score', pMa02_ix2.score.value, 0.48);
const port_ix2 = buildPortfolio([modelA_ix2, modelB_ix2]);
assert('E-IX-2-openCritical', port_ix2.openCritical === 3, port_ix2.openCritical, 3);

// E-IX-3: m-a-04 -> verified with self_attested blocked
const check_ix3 = canTransition(entryMa04, 'verified', {
  actor: 'Engineer',
  note: 'Self-certify',
  evidence: {
    method: 'self_attested',
    description: 'Done',
    verifier: null,
  },
});
assert('E-IX-3-blocked', check_ix3.ok === false);

// E-IX-4: c-a-07 drift_detected -> verified (document)
let state4 = structuredClone(demoState);
let ca07 = state4.ledger.find((e) => e.id === 'c-a-07')!;
ca07 = applyTransition(
  ca07,
  'verified',
  {
    actor: 'Safety',
    note: 'Drill completed',
    evidence: {
      method: 'document',
      description: 'Drill attendance log',
      verifier: 'Safety officer',
    },
  },
  '2026-10-07T12:00:00+05:30'
);
state4.ledger = state4.ledger.map((e) => (e.id === 'c-a-07' ? ca07 : e));
const modelA_ix4 = buildFacilityModel('fac-wb-metal', state4);
approx('E-IX-4-prep', modelA_ix4.preparedness.value, 0.74);
approx('E-IX-4-conf', modelA_ix4.preparedness.confidence, 0.6875);

// E-IX-5: sa1 override downtime 7
let state5 = structuredClone(demoState);
state5.scenarioOverrides['sa1-rainfall'] = { downtimeDays: 7 };
const modelA_ix5 = buildFacilityModel('fac-wb-metal', state5);
const sa1_ix5 = modelA_ix5.scenarios.find((s) => s.scenario.id === 'sa1-rainfall')!;
approxRupees('E-IX-5-res', sa1_ix5.residual.total.value, 1_17_00_000);
approxRupees('E-IX-5-gross', sa1_ix5.gross.total.value, 77_00_000);

// E-IX-6: m-b-01 accepted -> implemented -> verified (physical_inspection)
let state6 = structuredClone(demoState);
let mb01 = state6.ledger.find((e) => e.id === 'm-b-01')!;
mb01 = applyTransition(
  mb01,
  'implemented',
  {
    actor: 'Plant mgr',
    note: 'Chiller cooling repaired',
    evidence: { method: 'photo_geo', description: 'Photo of cooling unit', verifier: null },
  },
  '2026-10-07T12:00:00+05:30'
);
mb01 = applyTransition(
  mb01,
  'verified',
  {
    actor: 'Plant mgr',
    note: 'Physical inspection of chiller',
    evidence: {
      method: 'physical_inspection',
      description: 'Inspector log',
      verifier: 'Refrigeration engineer',
    },
  },
  '2026-10-07T12:00:00+05:30'
);
state6.ledger = state6.ledger.map((e) => (e.id === 'm-b-01' ? mb01 : e));
const modelB_ix6 = buildFacilityModel('fac-vz-polymer', state6);
const rkToxic_ix6 = modelB_ix6.risks.find((r) => r.hazard === 'toxic_release')!;
approx('E-IX-6-M', rkToxic_ix6.M.value, 0.40);
approx('E-IX-6-Rnorm', rkToxic_ix6.Rnorm.value, 0.271543);
assert('E-IX-6-Band', rkToxic_ix6.band === 'Medium');
const sb1_ix6 = modelB_ix6.scenarios.find((s) => s.scenario.id === 'sb1-release')!;
approxRupees('E-IX-6-res', sb1_ix6.residual.total.value, 2_38_50_000);

console.log(`\nVerification Complete! Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed perfectly! 100% golden test compliance.');
}
