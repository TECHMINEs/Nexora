import { track } from '@/lib/tracked';
import type {
  Asset,
  CoverageClass,
  Facility,
  GapResult,
  GapRow,
  InsuranceBasis,
  Peril,
  PolicySchedule,
  PolicySection,
  Rupees,
  ScenarioLossResult,
} from '@/lib/types';

export function maxExposureByClass(
  f: Facility,
  assets: readonly Asset[]
): Record<CoverageClass, Rupees> {
  const building = assets
    .filter((a) => a.category === 'building')
    .reduce((sum, a) => sum + a.valueRupees, 0);

  const machinery = assets
    .filter((a) => a.category === 'machinery')
    .reduce((sum, a) => sum + a.valueRupees, 0);

  const stock = assets
    .filter((a) => a.category === 'inventory')
    .reduce((sum, a) => sum + a.valueRupees, 0);

  const bi = Math.round(f.revenuePerDay * f.contributionMargin * f.maxExposureBiDays);
  const extra_expense = f.maxExposureExtraExpense;
  const contingent_bi = 0;

  return {
    building,
    machinery,
    stock,
    bi,
    extra_expense,
    contingent_bi,
  };
}

export function usableProtection(
  section: PolicySection | undefined,
  loss: Rupees,
  peril: Peril | null,
  perilCovered: boolean,
  downtimeDays: number
): Rupees {
  if (!section || !section.covered || !perilCovered || loss <= 0) {
    return 0;
  }

  if (section.coverageClass === 'bi') {
    const timeExcess = section.biTimeExcessDays ?? 0;
    const basisPerDay = section.biBasisPerDay ?? 0;
    const payableDays = Math.max(0, downtimeDays - timeExcess);
    const calculated = payableDays * basisPerDay;
    return Math.min(calculated, section.sumInsured, loss);
  }

  // Non-BI
  const deductible = section.deductible ?? 0;
  const netLoss = Math.max(0, loss - deductible);
  let effectiveLimit = section.sumInsured;

  if (peril && section.perilSublimits && section.perilSublimits.length > 0) {
    const sub = section.perilSublimits.find((ps) => ps.peril === peril);
    if (sub) {
      effectiveLimit = Math.min(effectiveLimit, sub.limit);
    }
  }

  return Math.min(netLoss, effectiveLimit);
}

export function computeProtectionGap(
  policy: PolicySchedule,
  input: {
    basis: InsuranceBasis;
    peril: Peril | null;
    lossByClass: Record<CoverageClass, Rupees>;
    downtimeDays: number;
    confidenceByClass: Record<CoverageClass, number>;
    sourceIds: string[];
    assumptionIds: string[];
  }
): GapResult {
  const perilCovered = input.peril === null || policy.perilsCovered.includes(input.peril);
  const classes: CoverageClass[] = [
    'building',
    'machinery',
    'stock',
    'bi',
    'extra_expense',
    'contingent_bi',
  ];

  const rows: GapRow[] = [];
  let totalExposure = 0;
  let totalProtection = 0;
  let totalGap = 0;

  for (const c of classes) {
    const loss = input.lossByClass[c];
    if (loss <= 0) continue;

    const section = policy.sections.find((s) => s.coverageClass === c);
    const covered = perilCovered && (section ? section.covered : false);
    const usable = usableProtection(section, loss, input.peril, perilCovered, input.downtimeDays);
    const gap = Math.max(0, loss - usable);

    totalExposure += loss;
    totalProtection += usable;
    totalGap += gap;

    let note = '';
    if (!perilCovered) {
      note = 'Peril not covered';
    } else if (!section || !section.covered) {
      note = 'Class not covered';
    } else if (c === 'bi' && section.biTimeExcessDays && input.downtimeDays <= section.biTimeExcessDays) {
      note = `${section.biTimeExcessDays}-day time excess applied`;
    } else if (input.peril && section.perilSublimits.some((ps) => ps.peril === input.peril)) {
      note = 'Peril sublimit applies';
    }

    const conf = input.confidenceByClass[c] ?? 0.555;
    rows.push({
      coverageClass: c,
      exposure: track(loss, input.sourceIds, input.assumptionIds, policy.section, [conf]),
      usableProtection: track(usable, input.sourceIds, input.assumptionIds, policy.section, [conf]),
      gap: track(gap, input.sourceIds, input.assumptionIds, policy.section, [conf]),
      covered,
      note,
    });
  }

  const totals = {
    exposure: track(totalExposure, input.sourceIds, input.assumptionIds, policy.section, [0.555]),
    protection: track(totalProtection, input.sourceIds, input.assumptionIds, policy.section, [0.555]),
    gap: track(totalGap, input.sourceIds, input.assumptionIds, policy.section, [0.555]),
  };

  return {
    basis: input.basis,
    peril: input.peril,
    perilCovered,
    rows,
    totals,
    requiresAdviserReview: true,
    extractionConfidence: policy.extractionConfidence,
  };
}

export function maxExposureGap(
  f: Facility,
  assets: readonly Asset[],
  policy: PolicySchedule
): GapResult {
  const lossByClass = maxExposureByClass(f, assets);
  const confidenceByClass: Record<CoverageClass, number> = {
    building: 0.684,
    machinery: 0.684,
    stock: 0.684,
    bi: 0.555,
    extra_expense: 0.555,
    contingent_bi: 0.555,
  };

  return computeProtectionGap(policy, {
    basis: { kind: 'max_exposure' },
    peril: null,
    lossByClass,
    downtimeDays: f.maxExposureBiDays,
    confidenceByClass,
    sourceIds: [policy.sourceId, ...f.sourceIds],
    assumptionIds: [...policy.assumptionIds, ...f.assumptionIds],
  });
}

export function scenarioGap(policy: PolicySchedule, loss: ScenarioLossResult): GapResult {
  const confidenceByClass: Record<CoverageClass, number> = {
    building: 0.555,
    machinery: 0.555,
    stock: 0.555,
    bi: 0.555,
    extra_expense: 0.555,
    contingent_bi: 0.555,
  };

  return computeProtectionGap(policy, {
    basis: { kind: 'scenario', scenarioId: loss.scenarioId },
    peril: loss.effective.base.peril,
    lossByClass: loss.byCoverageClass,
    downtimeDays: loss.effective.downtimeDays,
    confidenceByClass,
    sourceIds: [policy.sourceId, ...loss.effective.base.sourceIds],
    assumptionIds: [...policy.assumptionIds, ...loss.effective.base.assumptionIds],
  });
}
