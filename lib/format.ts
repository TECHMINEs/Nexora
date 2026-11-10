import { CONFIDENCE_TIERS } from './constants';
import type {
  ConfidenceTier,
  CoverageClass,
  FormatKind,
  HazardType,
  IsoDate,
  IsoDateTime,
  LedgerState,
  MonitoringWindow,
  Rupees,
  VerificationMethod,
} from './types';

export const CRORE = 10_000_000;
export const LAKH = 100_000;

export function formatINR(
  r: Rupees,
  opts?: { unit?: 'auto' | 'cr' | 'lakh' | 'rupee'; digits?: number }
): string {
  const unit = opts?.unit ?? 'auto';
  const abs = Math.abs(r);
  const sign = r < 0 ? '-' : '';

  if (unit === 'auto') {
    if (abs >= 1_000_000) {
      const crVal = Math.round(r / 100_000) / 100;
      return `${sign}₹${Math.abs(crVal).toFixed(opts?.digits ?? 2)} Cr`;
    }
    if (abs >= LAKH) {
      const lVal = Math.round(r / 10_000) / 10;
      return `${sign}₹${Math.abs(lVal).toFixed(opts?.digits ?? 1)} L`;
    }
    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  }

  if (unit === 'cr') {
    const crVal = opts?.digits !== undefined ? r / CRORE : Math.round(r / 100_000) / 100;
    return `${sign}₹${Math.abs(crVal).toFixed(opts?.digits ?? 2)} Cr`;
  }

  if (unit === 'lakh') {
    const lVal = opts?.digits !== undefined ? r / LAKH : Math.round(r / 10_000) / 10;
    return `${sign}₹${Math.abs(lVal).toFixed(opts?.digits ?? 1)} L`;
  }

  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

export function formatPct(ratio: number, digits?: number): string {
  return `${(ratio * 100).toFixed(digits ?? 1)}%`;
}

export function formatScore100(ratio: number, digits?: number): string {
  return (ratio * 100).toFixed(digits ?? 1);
}

export function formatIndex(x: number, digits?: number): string {
  return x.toFixed(digits ?? 3);
}

export function formatRatio(x: number, digits?: number): string {
  return x.toFixed(digits ?? 2);
}

export function formatMinutes(m: number | null): string {
  if (m === null) return 'Insufficient sample';
  return `${m.toFixed(1)} min`;
}

export function formatDays(d: number): string {
  return d === 1 ? '1 day' : `${d} days`;
}

export function formatCount(n: number): string {
  return n.toLocaleString('en-IN');
}

export function formatConfidence(c: number): string {
  return (Math.round(c * 100) / 100).toFixed(2);
}

export function confidenceTier(c: number): ConfidenceTier {
  if (c >= CONFIDENCE_TIERS.strong) return 'strong';
  if (c >= CONFIDENCE_TIERS.fair) return 'fair';
  return 'weak';
}

export function formatValue(kind: FormatKind, v: number): string {
  switch (kind) {
    case 'inr':
      return formatINR(v);
    case 'pct':
      return formatPct(v);
    case 'score100':
      return formatScore100(v);
    case 'ratio':
      return formatRatio(v);
    case 'index':
      return formatIndex(v);
    case 'minutes':
      return formatMinutes(v);
    case 'days':
      return formatDays(v);
    case 'count':
      return formatCount(v);
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateIST(d: IsoDate | IsoDateTime): string {
  const y = +d.slice(0, 4);
  const m = +d.slice(5, 7) - 1;
  const day = +d.slice(8, 10);
  return `${day} ${MONTHS[m]} ${y}`;
}

export function formatOffsetHours(h: number): string {
  if (h === 0) return 'T0';
  if (Math.abs(h) >= 168 && h % 24 === 0) {
    const days = Math.round(h / 24);
    return days > 0 ? `T+${days} d` : `T-${Math.abs(days)} d`;
  }
  return h > 0 ? `T+${h} h` : `T-${Math.abs(h)} h`;
}

export function hazardLabel(h: HazardType): string {
  switch (h) {
    case 'flood':
      return 'Flood';
    case 'cyclone':
      return 'Cyclone';
    case 'power':
      return 'Power disruption';
    case 'toxic_release':
      return 'Toxic release';
    case 'fire':
      return 'Fire';
  }
}

export function ledgerStateLabel(s: LedgerState): string {
  switch (s) {
    case 'recommended':
      return 'Recommended';
    case 'accepted':
      return 'Accepted';
    case 'in_procurement':
      return 'In procurement';
    case 'implemented':
      return 'Implemented';
    case 'verified':
      return 'Verified';
    case 'drift_detected':
      return 'Drift detected';
    case 'retired':
      return 'Retired';
  }
}

export function methodLabel(m: VerificationMethod): string {
  switch (m) {
    case 'self_attested':
      return 'Self-attested';
    case 'document':
      return 'Document evidence';
    case 'photo_geo':
      return 'Photo/geolocation';
    case 'remote_expert':
      return 'Remote expert review';
    case 'physical_inspection':
      return 'Physical inspection';
    case 'outcome':
      return 'Outcome verification';
  }
}

export function coverageClassLabel(c: CoverageClass): string {
  switch (c) {
    case 'building':
      return 'Building';
    case 'machinery':
      return 'Plant & machinery';
    case 'stock':
      return 'Stock';
    case 'bi':
      return 'Business interruption';
    case 'extra_expense':
      return 'Extra expense / recovery';
    case 'contingent_bi':
      return 'Contingent BI';
  }
}

export function windowLabel(w: MonitoringWindow): string {
  switch (w) {
    case '7d':
      return '7 days';
    case '72h':
      return '72 hours';
    case '24h':
      return '24 hours';
    case '6h':
      return '6 hours';
    case '1h':
      return '1 hour';
    case 'post_event':
      return 'Post-event';
  }
}
