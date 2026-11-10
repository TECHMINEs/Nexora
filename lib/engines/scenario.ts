import { SENSITIVITY_BANDS } from '@/lib/constants';
import { track } from '@/lib/tracked';
import type {
  Asset,
  CoverageClass,
  DamageRatio,
  EffectiveScenario,
  Facility,
  LedgerEntry,
  LossComponents,
  Rupees,
  Scenario,
  ScenarioMode,
  ScenarioOverride,
  SensitivityBand,
  SensitivityDriver,
  SensitivityResult,
  ScenarioLossResult,
  Tracked,
} from '@/lib/types';
import { isCommitted } from './ledger';

export function contributionPerDay(f: Facility): Tracked<number> {
  const val = f.revenuePerDay * f.contributionMargin;
  return track(val, f.sourceIds, f.assumptionIds, f.section);
}

export function effectiveScenario(
  s: Scenario,
  f: Facility,
  entries: readonly LedgerEntry[],
  mode: ScenarioMode,
  override: ScenarioOverride | null
): EffectiveScenario {
  let downtimeDays = s.downtimeDays;
  let inventoryLossFraction = s.inventory.lossFraction;
  let supplierInterruptionDays = s.supplierInterruptionDays;
  let supplierDependencyShare = f.criticalSupplier.dependencyShare;
  const extraExpense = s.extraExpense;
  const recovery = s.recovery;

  // Clone damage ratios
  const damageRatios: DamageRatio[] = s.damageRatios.map((dr) => ({ ...dr }));

  let includedEntries: LedgerEntry[] = [];
  if (mode === 'residual') {
    includedEntries = entries.filter((e) => e.facilityId === f.id && e.state === 'verified');
  } else if (mode === 'committed') {
    includedEntries = entries.filter((e) => e.facilityId === f.id && isCommitted(e));
  }

  // Sort ascending by ID
  includedEntries.sort((a, b) => a.id.localeCompare(b.id));

  const appliedEntryIds: string[] = [];

  for (const entry of includedEntries) {
    let entryHadEffect = false;
    for (const effect of entry.scenarioEffects) {
      if (effect.scenarioId === s.id || effect.scenarioId === '*') {
        entryHadEffect = true;
        if (effect.field === 'damageRatio') {
          const idx = damageRatios.findIndex((dr) => dr.assetId === effect.assetId);
          if (idx >= 0) {
            if (effect.op === 'set') damageRatios[idx].ratio = effect.value;
            else if (effect.op === 'add') damageRatios[idx].ratio += effect.value;
            else if (effect.op === 'mul') damageRatios[idx].ratio *= effect.value;
          } else if (effect.assetId) {
            let initialRatio = 0;
            if (effect.op === 'set') initialRatio = effect.value;
            else if (effect.op === 'add') initialRatio += effect.value;
            damageRatios.push({ assetId: effect.assetId, ratio: initialRatio });
          }
        } else if (effect.field === 'inventoryLossFraction') {
          if (effect.op === 'set') inventoryLossFraction = effect.value;
          else if (effect.op === 'add') inventoryLossFraction += effect.value;
          else if (effect.op === 'mul') inventoryLossFraction *= effect.value;
        } else if (effect.field === 'downtimeDays') {
          if (effect.op === 'set') downtimeDays = effect.value;
          else if (effect.op === 'add') downtimeDays += effect.value;
          else if (effect.op === 'mul') downtimeDays *= effect.value;
        } else if (effect.field === 'supplierDependencyShare') {
          if (effect.op === 'set') supplierDependencyShare = effect.value;
          else if (effect.op === 'add') supplierDependencyShare += effect.value;
          else if (effect.op === 'mul') supplierDependencyShare *= effect.value;
        }
      }
    }
    if (entryHadEffect) {
      appliedEntryIds.push(entry.id);
    }
  }

  // Clamping
  downtimeDays = Math.max(0, downtimeDays);
  supplierInterruptionDays = Math.max(0, supplierInterruptionDays);
  supplierDependencyShare = Math.max(0, Math.min(1, supplierDependencyShare));
  inventoryLossFraction = Math.max(0, Math.min(1, inventoryLossFraction));
  for (const dr of damageRatios) {
    dr.ratio = Math.max(0, Math.min(1, dr.ratio));
  }

  let overridesApplied = false;
  if (override !== null && (mode === 'residual' || mode === 'committed')) {
    if (override.downtimeDays !== undefined) {
      downtimeDays = Math.max(0, override.downtimeDays);
      overridesApplied = true;
    }
    if (override.inventoryLossFraction !== undefined) {
      inventoryLossFraction = Math.max(0, Math.min(1, override.inventoryLossFraction));
      overridesApplied = true;
    }
    if (override.supplierInterruptionDays !== undefined) {
      supplierInterruptionDays = Math.max(0, override.supplierInterruptionDays);
      overridesApplied = true;
    }
  }

  return {
    base: {
      ...s,
      extraExpense,
      recovery,
    },
    mode,
    appliedEntryIds,
    downtimeDays,
    inventoryLossFraction,
    damageRatios,
    supplierInterruptionDays,
    supplierDependencyShare,
    overridesApplied,
  };
}

export function computeScenarioLoss(
  f: Facility,
  assets: readonly Asset[],
  eff: EffectiveScenario
): ScenarioLossResult {
  const contrib = contributionPerDay(f);
  const contribRate = contrib.value;

  // 1. Physical loss
  let physicalVal = 0;
  const physicalByClass: Record<CoverageClass, number> = {
    building: 0,
    machinery: 0,
    stock: 0,
    bi: 0,
    extra_expense: 0,
    contingent_bi: 0,
  };

  for (const dr of eff.damageRatios) {
    const a = assets.find((x) => x.id === dr.assetId);
    if (a) {
      const assetLoss = Math.round(a.valueRupees * dr.ratio);
      physicalVal += assetLoss;
      if (a.coverageClass) {
        physicalByClass[a.coverageClass] += assetLoss;
      }
    }
  }

  // 2. Inventory loss
  const invAssetIds = eff.base.inventory.assetIds;
  const invAssetsTotal = assets
    .filter((a) => invAssetIds.includes(a.id))
    .reduce((sum, a) => sum + a.valueRupees, 0);
  const inventoryVal = Math.round(invAssetsTotal * eff.inventoryLossFraction);

  // 3. Business Interruption
  const dailyRate = eff.base.biBasis === 'revenue' ? f.revenuePerDay : contribRate;
  const biVal = Math.round(dailyRate * eff.downtimeDays);

  // 4. Extra Expense
  const extraExpenseVal = eff.base.extraExpense;

  // 5. Recovery
  const recoveryVal = eff.base.recovery;

  // 6. Supply Chain (contingent BI)
  const effectiveBuffer = Math.max(f.criticalSupplier.bufferDays, eff.downtimeDays);
  const netSupplierDays = Math.max(0, eff.supplierInterruptionDays - effectiveBuffer);
  const supplyChainVal = Math.round(
    netSupplierDays * contribRate * eff.supplierDependencyShare
  );

  const totalVal =
    physicalVal + inventoryVal + biVal + extraExpenseVal + recoveryVal + supplyChainVal;

  const trackComp = (val: number) =>
    track(val, eff.base.sourceIds, eff.base.assumptionIds, eff.base.section);

  const components: LossComponents<Tracked<number>> = {
    physical: trackComp(physicalVal),
    inventory: trackComp(inventoryVal),
    bi: trackComp(biVal),
    extraExpense: trackComp(extraExpenseVal),
    recovery: trackComp(recoveryVal),
    supplyChain: trackComp(supplyChainVal),
  };

  const total = trackComp(totalVal);

  const byCoverageClass: Record<CoverageClass, Rupees> = {
    building: physicalByClass.building,
    machinery: physicalByClass.machinery,
    stock: physicalByClass.stock + inventoryVal,
    bi: biVal,
    extra_expense: extraExpenseVal + recoveryVal,
    contingent_bi: supplyChainVal,
  };

  return {
    scenarioId: eff.base.id,
    mode: eff.mode,
    components,
    total,
    byCoverageClass,
    effective: eff,
  };
}

export function computeSensitivity(
  f: Facility,
  assets: readonly Asset[],
  eff: EffectiveScenario
): SensitivityResult {
  const drivers: SensitivityDriver[] = [
    'downtimeDays',
    'inventoryLossFraction',
    'supplierInterruptionDays',
  ];

  const bands: SensitivityBand[] = [];
  const allTotals: number[] = [];

  for (const driver of drivers) {
    const bandValues = SENSITIVITY_BANDS[driver];
    const baseInput =
      driver === 'downtimeDays'
        ? eff.downtimeDays
        : driver === 'inventoryLossFraction'
        ? eff.inventoryLossFraction
        : eff.supplierInterruptionDays;

    const baseOutsideBand = baseInput < bandValues[0] || baseInput > bandValues[bandValues.length - 1];

    const points: { input: number; total: Rupees }[] = [];

    for (const val of bandValues) {
      const clonedEff: EffectiveScenario = {
        ...eff,
        downtimeDays: driver === 'downtimeDays' ? val : eff.downtimeDays,
        inventoryLossFraction: driver === 'inventoryLossFraction' ? val : eff.inventoryLossFraction,
        supplierInterruptionDays:
          driver === 'supplierInterruptionDays' ? val : eff.supplierInterruptionDays,
      };
      const res = computeScenarioLoss(f, assets, clonedEff);
      points.push({ input: val, total: res.total.value });
      allTotals.push(res.total.value);
    }

    const pointTotals = points.map((p) => p.total);
    const swing = Math.max(...pointTotals) - Math.min(...pointTotals);

    bands.push({
      driver,
      points,
      swing,
      baseInput,
      baseOutsideBand,
    });
  }

  // Ranking by swing descending
  const ranking = [...bands]
    .sort((a, b) => b.swing - a.swing)
    .map((b) => b.driver);

  const envelope = {
    min: Math.min(...allTotals),
    max: Math.max(...allTotals),
  };

  const baseResult = computeScenarioLoss(f, assets, eff);

  return {
    scenarioId: eff.base.id,
    base: baseResult.total,
    bands,
    envelope,
    ranking,
  };
}

export function avoidedLossIfVerified(
  entry: LedgerEntry,
  f: Facility,
  assets: readonly Asset[],
  facilityScenarios: readonly Scenario[],
  entries: readonly LedgerEntry[]
): Tracked<number> {
  const updatedEntries = entries.map((e) =>
    e.id === entry.id ? { ...e, state: 'verified' as const } : e
  );

  let totalAvoided = 0;

  for (const s of facilityScenarios) {
    const effOrig = effectiveScenario(s, f, entries, 'residual', null);
    const lossOrig = computeScenarioLoss(f, assets, effOrig);

    const effNew = effectiveScenario(s, f, updatedEntries, 'residual', null);
    const lossNew = computeScenarioLoss(f, assets, effNew);

    const avoided = lossOrig.total.value - lossNew.total.value;
    totalAvoided += avoided;
  }

  return track(Math.max(0, totalAvoided), ['S-ASSUMPTION'], ['ASM-09'], 'KD §6.7');
}
