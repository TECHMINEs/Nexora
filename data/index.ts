import type {
  Asset,
  Assumption,
  BcpRecord,
  DataSource,
  DependencyEdge,
  DependencyNode,
  DrillRecord,
  Facility,
  FacilityId,
  HazardProfile,
  LedgerEntry,
  ModuleInfo,
  MonitoringThreshold,
  Advisory,
  PolicySchedule,
  ReplayCase,
  ReplayCaseId,
  ResponderResource,
  ResponseObservation,
  Scenario,
  ScreenInfo,
} from '@/lib/types';

import facilitiesData from './facilities.json';
import assetsData from './assets.json';
import hazardsData from './hazards.json';
import scenariosData from './scenarios.json';
import ledgerData from './ledger.json';
import policiesData from './policies.json';
import respondersData from './responders.json';
import observationsData from './observations.json';
import cascadeData from './cascade.json';
import replayData from './replay.json';
import monitoringData from './monitoring.json';
import sourcesData from './sources.json';
import assumptionsData from './assumptions.json';
import bcpData from './bcp.json';
import drillsData from './drills.json';
import catalogData from './catalog.json';

export const facilities = facilitiesData as unknown as Facility[];
export const assets = assetsData as unknown as Asset[];
export const hazardProfiles = hazardsData as unknown as HazardProfile[];
export const scenarios = scenariosData as unknown as Scenario[];

export const ledgerSeed: LedgerEntry[] = (
  ledgerData as unknown as Array<Omit<LedgerEntry, 'history'>>
).map((entry) => ({
  ...entry,
  history: [
    {
      from: null,
      to: entry.state,
      at: entry.stateSince,
      actor: 'Seed',
      note: 'Seeded state',
    },
  ],
})) as LedgerEntry[];

export const policies = policiesData as unknown as PolicySchedule[];
export const responders = respondersData as unknown as ResponderResource[];
export const observations = observationsData as unknown as ResponseObservation[];

const rawCascade = cascadeData as unknown as {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
};
export const dependencyNodes = rawCascade.nodes;
export const dependencyEdges = rawCascade.edges;

export const replayCases = replayData as unknown as ReplayCase[];

const rawMonitoring = monitoringData as unknown as {
  thresholds: MonitoringThreshold[];
  advisories: Advisory[];
};
export const thresholds = rawMonitoring.thresholds;
export const advisories = rawMonitoring.advisories;

export const sources = sourcesData as unknown as DataSource[];
export const assumptions = assumptionsData as unknown as Assumption[];
export const bcpRecords = bcpData as unknown as BcpRecord[];
export const drills = drillsData as unknown as DrillRecord[];

const rawCatalog = catalogData as unknown as {
  modules: ModuleInfo[];
  screens: ScreenInfo[];
};
export const moduleCatalog = rawCatalog.modules;
export const screenCatalog = rawCatalog.screens;

export const FACILITY_IDS: readonly FacilityId[] = ['fac-wb-metal', 'fac-vz-polymer'] as const;

export function isFacilityId(x: string): x is FacilityId {
  return x === 'fac-wb-metal' || x === 'fac-vz-polymer';
}

export function getFacility(id: FacilityId): Facility {
  const f = facilities.find((item) => item.id === id);
  if (!f) throw new Error(`Facility not found: ${id}`);
  return f;
}

export function getSource(id: string): DataSource {
  const s = sources.find((item) => item.id === id);
  if (!s) throw new Error(`Source not found: ${id}`);
  return s;
}

export function getAssumption(id: string): Assumption {
  const a = assumptions.find((item) => item.id === id);
  if (!a) throw new Error(`Assumption not found: ${id}`);
  return a;
}

export function getReplayCase(id: ReplayCaseId): ReplayCase {
  const c = replayCases.find((item) => item.id === id);
  if (!c) throw new Error(`Replay case not found: ${id}`);
  return c;
}

export function getPolicy(facilityId: FacilityId): PolicySchedule {
  const p = policies.find((item) => item.facilityId === facilityId);
  if (!p) throw new Error(`Policy not found for facility: ${facilityId}`);
  return p;
}

export function getBcp(facilityId: FacilityId): BcpRecord {
  const b = bcpRecords.find((item) => item.facilityId === facilityId);
  if (!b) throw new Error(`BCP record not found for facility: ${facilityId}`);
  return b;
}

export function byFacility<T extends { facilityId: FacilityId }>(
  rows: readonly T[],
  id: FacilityId
): T[] {
  return rows.filter((item) => item.facilityId === id);
}
