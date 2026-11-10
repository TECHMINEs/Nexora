import { scenarios } from '@/data';
import { track } from '@/lib/tracked';
import type { Asset, Facility, LedgerEntry, OutcomeResult, ReplayCase } from '@/lib/types';
import { computeScenarioLoss, effectiveScenario } from './scenario';

export function computeOutcome(
  replayCase: ReplayCase,
  f: Facility,
  assets: readonly Asset[],
  entries: readonly LedgerEntry[]
): OutcomeResult {
  const scenario = scenarios.find((s) => s.id === replayCase.outcome.scenarioId);
  if (!scenario) {
    throw new Error(`Scenario not found: ${replayCase.outcome.scenarioId}`);
  }

  // Predicted residual loss
  const eff = effectiveScenario(scenario, f, entries, 'residual', null);
  const predLoss = computeScenarioLoss(f, assets, eff);
  const predicted = predLoss.total;

  const observedVal = replayCase.outcome.reportedLoss;
  const observed = track(
    observedVal,
    replayCase.outcome.sourceIds,
    replayCase.outcome.assumptionIds,
    replayCase.outcome.section
  );

  const error = (predicted.value - observedVal) / observedVal;

  // Recalibrated residual loss
  const effRecal = effectiveScenario(scenario, f, entries, 'residual', {
    downtimeDays: replayCase.outcome.observedDowntimeDays,
    supplierInterruptionDays: replayCase.outcome.observedSupplierInterruptionDays,
  });
  const recalLoss = computeScenarioLoss(f, assets, effRecal);
  const recalibrated = recalLoss.total;
  const recalibratedError = (recalibrated.value - observedVal) / observedVal;

  return {
    scenarioId: scenario.id,
    predicted,
    observed,
    error,
    recalibrated,
    recalibratedError,
    unmodelled: replayCase.outcome.unmodelled,
  };
}
