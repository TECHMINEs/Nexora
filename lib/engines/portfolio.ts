import { hasEvidence, isCommitted } from '@/lib/engines/ledger';
import { track } from '@/lib/tracked';
import type { FacilityModel, PortfolioRow, PortfolioSummary, Tracked } from '@/lib/types';

export function buildPortfolio(models: readonly FacilityModel[]): PortfolioSummary {
  const rows: PortfolioRow[] = models.map((m) => {
    // Top risk is already computed
    const topRisk = m.topRisk;

    // Open critical: open mitigations with priority score >= 0.40
    const openCritical = m.priorities.filter((p) => p.score.value >= 0.4).length;

    // Largest residual loss scenario
    let largestScenario = m.scenarios[0];
    for (const s of m.scenarios) {
      if (s.residual.total.value > (largestScenario?.residual.total.value ?? 0)) {
        largestScenario = s;
      }
    }

    return {
      facilityId: m.facility.id,
      name: m.facility.name,
      topRisk,
      preparedness: m.preparedness,
      completeness: m.completeness,
      accessibility: m.accessibility.score,
      accessBand: m.accessibility.band,
      accessPartial: m.accessibility.partial,
      maxExposureGap: m.insurance.maxExposure.totals.gap,
      openCritical,
      largestResidual: {
        scenarioId: largestScenario.scenario.id,
        loss: largestScenario.residual.total,
      },
    };
  });

  // Total max-exposure gap across facilities
  const totalGapValue = rows.reduce((acc, r) => acc + r.maxExposureGap.value, 0);
  const totalGapConf =
    rows.length > 0 ? Math.min(...rows.map((r) => r.maxExposureGap.confidence)) : 0.555;
  const gapSources = Array.from(new Set(rows.flatMap((r) => r.maxExposureGap.sourceIds)));
  const gapAssumptions = Array.from(new Set(rows.flatMap((r) => r.maxExposureGap.assumptionIds)));

  const totalGap: Tracked<number> = {
    value: totalGapValue,
    confidence: totalGapConf,
    sourceIds: gapSources,
    assumptionIds: gapAssumptions,
    section: '§6.14, §43.1',
  };

  const totalOpenCritical = rows.reduce((acc, r) => acc + r.openCritical, 0);

  // All mitigations across facilities
  const allMitigations = models.flatMap((m) => m.ledger).filter((e) => e.kind === 'mitigation');
  const nonRetiredMitigations = allMitigations.filter((e) => e.state !== 'retired');
  const committedMitigations = allMitigations.filter((e) => isCommitted(e));
  const evidenceBackedMitigations = committedMitigations.filter((e) => hasEvidence(e));

  const evidenceBackedVal =
    committedMitigations.length > 0
      ? evidenceBackedMitigations.length / committedMitigations.length
      : 0;

  const evidenceBackedRate = track(
    evidenceBackedVal,
    [],
    ['ASM-14'],
    '§6.14, §44.1, ASM-14',
    models.map((m) => m.preparedness.confidence)
  );

  const actionConversionVal =
    nonRetiredMitigations.length > 0
      ? committedMitigations.length / nonRetiredMitigations.length
      : 0;

  const actionConversion = track(
    actionConversionVal,
    [],
    ['ASM-15'],
    '§6.14, ASM-15',
    models.map((m) => m.preparedness.confidence)
  );

  // Mean preparedness across facilities
  const meanPrepVal =
    models.length > 0
      ? models.reduce((acc, m) => acc + m.preparedness.value, 0) / models.length
      : 0;
  const meanPrepConf =
    models.length > 0
      ? Math.min(...models.map((m) => m.preparedness.confidence))
      : 0;

  const meanPreparedness: Tracked<number> = {
    value: meanPrepVal,
    confidence: meanPrepConf,
    sourceIds: Array.from(new Set(models.flatMap((m) => m.preparedness.sourceIds))),
    assumptionIds: ['ASM-15'],
    section: '§6.14, §26',
  };

  return {
    rows,
    totalGap,
    openCritical: totalOpenCritical,
    evidenceBackedRate,
    actionConversion,
    meanPreparedness,
  };
}
