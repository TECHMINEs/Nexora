import { track } from '@/lib/tracked';
import type { Asset, ExposureResult, HazardType } from '@/lib/types';

export function computeExposure(
  assets: readonly Asset[],
  hazard: HazardType,
  sourceIds: readonly string[],
  section: string
): ExposureResult {
  const exposedAssets = assets.filter((a) => a.exposedTo.includes(hazard));
  const exposedAssetIds = exposedAssets.map((a) => a.id);
  const exposedValue = exposedAssets.reduce((sum, a) => sum + a.valueRupees, 0);
  const totalValue = assets.reduce((sum, a) => sum + a.valueRupees, 0);
  const ratio = totalValue === 0 ? 0 : exposedValue / totalValue;

  const E = track(ratio, sourceIds, [], section);

  return {
    hazard,
    E,
    exposedAssetIds,
    exposedValue,
    totalValue,
  };
}
