import { CHECKLIST_FACTOR } from '@/lib/constants';
import { track } from '@/lib/tracked';
import type { Facility, Tracked } from '@/lib/types';

export function dataCompleteness(f: Facility): Tracked<number> {
  let factorSum = 0;
  for (const item of f.checklist) {
    factorSum += CHECKLIST_FACTOR[item.status];
  }

  const value = factorSum / 17;
  return track(value, f.sourceIds, ['ASM-25'], 'Appendix A, ASM-25');
}
