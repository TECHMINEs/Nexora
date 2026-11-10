// lib/types.ts — every domain, result, store and view type. No runtime code.
import type { ReactNode } from 'react';

// ---------- primitives ----------
export type FacilityId = 'fac-wb-metal' | 'fac-vz-polymer';
export type ReplayCaseId = 'amphan-2020' | 'vizag-release-2020';
export type ModuleId =
  | '6.1' | '6.2' | '6.3' | '6.4' | '6.5' | '6.6' | '6.7' | '6.8'
  | '6.9' | '6.10' | '6.11' | '6.12' | '6.13' | '6.14' | '6.15';
export type Rupees = number;          // integer rupees
export type Minutes = number;
export type IsoDate = string;         // 'YYYY-MM-DD'
export type IsoDateTime = string;     // 'YYYY-MM-DDTHH:mm:ss+05:30'
export type Score5 = 1 | 2 | 3 | 4 | 5;

export type HazardType = 'flood' | 'cyclone' | 'power' | 'toxic_release' | 'fire';
export type HazardClass = 'hydromet' | 'chemical_industrial' | 'infrastructure';
export type Peril = 'stfi' | 'fire_explosion' | 'utility_failure' | 'toxic_release';
export type Band = 'High' | 'Medium' | 'Low' | 'Unknown';
export type AccessBand = 'Good' | 'Medium' | 'Poor' | 'Unknown';
export type ConfidenceTier = 'strong' | 'fair' | 'weak';
export type SourceAuthority = 'official' | 'partner' | 'open' | 'customer' | 'estimated';
export type LicenceStatus = 'established' | 'uncertain';
export type ValidationStatus = 'backtested' | 'expert_reviewed' | 'unvalidated';
export type AssetCategory = 'building' | 'machinery' | 'inventory';
export type CoverageClass = 'building' | 'machinery' | 'stock' | 'bi' | 'extra_expense' | 'contingent_bi';
export type PropertyClass = 'building' | 'machinery' | 'stock';
export type WeightLabel = 'High' | 'Medium/High' | 'Medium';
export type LedgerKind = 'control' | 'mitigation';
export type LedgerTarget = HazardType | 'supply' | 'insurance' | 'general';
export type LedgerState =
  | 'recommended' | 'accepted' | 'in_procurement' | 'implemented'
  | 'verified' | 'drift_detected' | 'retired';
export type VerificationMethod =
  | 'self_attested' | 'document' | 'photo_geo' | 'remote_expert' | 'physical_inspection' | 'outcome';
export type Capability = 'BLS' | 'ALS' | 'fire' | 'hazmat';
export type IncidentType = 'medical' | 'fire' | 'hazmat';
export type NodeType =
  | 'hazard' | 'infrastructure' | 'utility' | 'asset' | 'process' | 'supply' | 'people' | 'financial';
export type ChecklistStatus = 'pass' | 'partial' | 'fail';
export type EventState = 'NORMAL' | 'WATCH' | 'ALERT' | 'INCIDENT' | 'STABILISE' | 'RECOVER' | 'POST_MORTEM';
export type SignalLevel = 'NORMAL' | 'WATCH' | 'ALERT' | 'INCIDENT';
export type MonitoringWindow = '7d' | '72h' | '24h' | '6h' | '1h' | 'post_event';
export type ReplayPhase = 'pre' | 'impact' | 'stabilise' | 'recover' | 'postmortem';
export type SignalKey = 'rain24hMm' | 'windKmh' | 'tankTempC' | 'vapourPpm';
export type OperationalMode = 'prepare' | 'prevent' | 'respond' | 'recover';
export type ScenarioMode = 'gross' | 'residual' | 'committed';
export type FormatKind = 'inr' | 'pct' | 'score100' | 'ratio' | 'index' | 'minutes' | 'days' | 'count';
export type SensitivityDriver = 'downtimeDays' | 'inventoryLossFraction' | 'supplierInterruptionDays';
export type AccessFactor = 'coverage' | 'reliability' | 'speed' | 'redundancy' | 'capabilityMatch';
export type PercentileKey = 'P50' | 'P90' | 'P95';

// ---------- provenance-carrying number ----------
export interface Tracked<T = number> {
  value: T;
  confidence: number;          // 0..1 = min(provenance of sourceIds, extra confidences); 0 if any source gated
  sourceIds: string[];         // DataSource ids
  assumptionIds: string[];     // Assumption ids; links only, never change confidence
  section: string;             // dossier anchor, e.g. '§62' or 'KD §35.5'
}

// ---------- registers ----------
export interface SourceDims {
  freshness: number; completeness: number; spatialAccuracy: number; temporalAccuracy: number; consistency: number;
}
export interface DataSource {
  id: string; name: string; authority: SourceAuthority; licence: LicenceStatus;
  sourceTimestamp: IsoDateTime; spatialResolution: string; dims: SourceDims;
  knownLimitations: string; validationStatus: ValidationStatus; section: string;
}
export interface Assumption {
  id: string; label: string; value: string; rationale: string; section: string; sourceId: string;
}

// ---------- facility ----------
export type Point = [number, number];
export interface Rect { x: number; y: number; w: number; h: number }
export interface SchematicZone { hazard: HazardType; label: string; points: Point[] }
export interface SchematicRoad { id: string; label: string; kind: 'primary' | 'secondary'; points: Point[] }
export interface SchematicPoi {
  id: string; label: string; kind: 'hospital' | 'fire_station' | 'ambulance_base' | 'community';
  at: Point; resourceId: string | null;
}
export interface SchematicLayout {
  viewBox: [number, number]; facility: Rect; zones: SchematicZone[]; roads: SchematicRoad[];
  pois: SchematicPoi[]; note: string;
}
export interface ChecklistItem { domain: string; status: ChecklistStatus; note: string }
export interface CriticalSupplier {
  id: string; name: string; leadTimeDays: number; bufferDays: number; dependencyShare: number;
  singleSource: boolean; route: string;
}
export interface HazardousInventory {
  material: string; quantityTonnes: number; storage: string; exclusionRadiusKm: number; communityPopulationInZone: number;
}
export interface PowerProfile { gridDependency: Score5; generatorKva: number; fuelAutonomyHours: number }
export interface Facility {
  id: FacilityId; name: string; archetype: string; state: string; district: string; pincode: string;
  lat: number; lon: number; geocodeConfidence: number;
  builtUpAreaSqft: number; floorCount: number; constructionType: string; yearBuilt: number; roofType: string; basement: boolean;
  headcountTotal: number; headcountPeakShift: number; shiftPattern: string;
  revenuePerDay: Rupees; contributionMargin: number; mtpdDays: number; rtoDays: number;
  power: PowerProfile;
  accessRoutes: number; primaryIncident: IncidentType; requiredCapabilities: Capability[];
  criticalSupplier: CriticalSupplier; hazardousInventory: HazardousInventory | null;
  maxExposureBiDays: number; maxExposureExtraExpense: Rupees;
  replayCaseId: ReplayCaseId;
  checklist: ChecklistItem[]; schematic: SchematicLayout;
  sourceIds: string[]; assumptionIds: string[]; section: string;
}
export interface Asset {
  id: string; facilityId: FacilityId; name: string; category: AssetCategory; coverageClass: PropertyClass;
  valueRupees: Rupees; criticality: Score5; zone: string; elevationM: number; exposedTo: HazardType[];
  replacementLeadTimeDays: number; sourceId: string; section: string;
}
export interface VulnerabilityDriver {
  id: string; variable: string; failureCondition: string; weightLabel: WeightLabel;
  conditionScore: number;       // 0..1, 1 = failure condition fully present
  evidenceSource: string; section: string;
}
export interface HazardProfile {
  facilityId: FacilityId; hazard: HazardType; hazardClass: HazardClass; label: string;
  intensity: number;            // H, 0..1
  intensityBasis: string; criticality: Score5;  // C, 1..5
  drivers: VulnerabilityDriver[]; sourceIds: string[]; assumptionIds: string[]; section: string;
}

// ---------- scenarios ----------
export interface DamageRatio { assetId: string; ratio: number }
export interface Scenario {
  id: string; facilityId: FacilityId; name: string; hazard: HazardType; peril: Peril; description: string;
  damageRatios: DamageRatio[]; inventory: { assetIds: string[]; lossFraction: number };
  downtimeDays: number; biBasis: 'revenue' | 'contribution';
  extraExpense: Rupees; recovery: Rupees; supplierInterruptionDays: number;
  replayCaseId: ReplayCaseId | null; sourceIds: string[]; assumptionIds: string[]; section: string;
}
export interface ScenarioOverride { downtimeDays?: number; inventoryLossFraction?: number; supplierInterruptionDays?: number }
export interface ScenarioEffect {
  scenarioId: string;           // '*' = every scenario of the facility
  field: 'downtimeDays' | 'inventoryLossFraction' | 'damageRatio' | 'supplierDependencyShare';
  assetId: string | null;       // required when field = 'damageRatio'
  op: 'set' | 'add' | 'mul'; value: number;
}

// ---------- ledger ----------
export interface Evidence {
  id: string; method: VerificationMethod; description: string; verifier: string | null; timestamp: IsoDateTime;
}
export interface LedgerEvent { from: LedgerState | null; to: LedgerState; at: IsoDateTime; actor: string; note: string }
export interface PriorityInputs {
  impact: Score5; feasibility: Score5; likelihoodOverride: 1 | 3 | 5 | null; rationale: string;
}
export interface LedgerEntry {
  id: string; facilityId: FacilityId; kind: LedgerKind; title: string; target: LedgerTarget;
  state: LedgerState; stateSince: IsoDateTime; owner: string; dueDate: IsoDate; poRef: string | null;
  costMin: Rupees | null; costMax: Rupees | null; effectiveness: number;   // 0..1, used in M only when verified
  verificationRequired: VerificationMethod[]; evidence: Evidence[]; history: LedgerEvent[];
  scenarioEffects: ScenarioEffect[]; priorityInputs: PriorityInputs | null; section: string;
}
export interface TransitionPayload {
  actor: string; note: string;
  ownerName?: string; dueDate?: IsoDate; poRef?: string;
  evidence?: { method: VerificationMethod; description: string; verifier: string | null };
  retireReason?: string;
}
export interface TransitionCheck { ok: boolean; reason: string | null }

// ---------- insurance ----------
export interface PerilSublimit { peril: Peril; limit: Rupees }
export interface PolicySection {
  coverageClass: CoverageClass; covered: boolean; sumInsured: Rupees; deductible: Rupees;
  perilSublimits: PerilSublimit[];
  biTimeExcessDays: number | null; biIndemnityMonths: number | null; biBasisPerDay: Rupees | null;
}
export interface PolicySchedule {
  id: string; facilityId: FacilityId; insurerLabel: string; policyType: string; perilsCovered: Peril[];
  renewalDate: IsoDate; sections: PolicySection[]; exclusions: string[];
  extractionConfidence: number; requiresAdviserReview: true;
  sourceId: string; assumptionIds: string[]; section: string;
}
export type InsuranceBasis = { kind: 'max_exposure' } | { kind: 'scenario'; scenarioId: string };

// ---------- accessibility ----------
export interface ResponderResource {
  id: string; facilityId: FacilityId; label: string; type: 'ambulance' | 'fire_tender'; capabilities: Capability[];
  distanceKm: number; currentTravelEstimateMin: Minutes; currentEstimateSourceId: string; sourceId: string; section: string;
}
export interface ResponseObservation {
  id: string; resourceId: string; requestedAt: IsoDateTime; dispatchMin: Minutes; mobiliseMin: Minutes; travelMin: Minutes;
}

// ---------- cascade ----------
export interface DependencyNode { id: string; facilityId: FacilityId; type: NodeType; label: string }
export interface DependencyEdge { facilityId: FacilityId; from: string; to: string; weight: number; rationale: string; section: string }

// ---------- monitoring / replay ----------
export interface SignalReading { signal: SignalKey; value: number; unit: string; sourceId: string }
export interface ReplayStep {
  id: string; offsetHours: number; label: string; window: MonitoringWindow; phase: ReplayPhase;
  siteIntersected: boolean; signals: SignalReading[]; officialSource: string; note: string;
}
export interface ReplayOutcome {
  scenarioId: string; observedDowntimeDays: number; observedSupplierInterruptionDays: number; reportedLoss: Rupees;
  unmodelled: string[]; sourceIds: string[]; assumptionIds: string[]; section: string;
}
export interface ReplayCase {
  id: ReplayCaseId; title: string; eventDate: IsoDate; t0: IsoDateTime; hazardClass: HazardClass; facilityId: FacilityId;
  whyChosen: string; modulesExercised: ModuleId[]; evidenceSummary: string; steps: ReplayStep[];
  outcome: ReplayOutcome; section: string;
}
export interface MonitoringThreshold {
  facilityId: FacilityId; signal: SignalKey; unit: string; watchAt: number; alertAt: number; incidentAt: number | null;
  sourceId: string; assumptionIds: string[];
}
export interface Advisory { id: string; facilityId: FacilityId; window: MonitoringWindow; text: string; ledgerEntryIds: string[]; section: string }

// ---------- preparedness ----------
export interface BcpProcess { id: string; name: string; rtoDays: number; mtpdDays: number; alternate: string }
export interface BcpRole { role: string; shift: string; assigned: boolean; trained: boolean }
export interface BcpRecord {
  facilityId: FacilityId; criticalProcesses: BcpProcess[]; roles: BcpRole[]; contactTreeLevels: number;
  alternateSite: string; communicationPlan: string; lastReviewed: IsoDate; sourceId: string; section: string;
}
export interface DrillRecord {
  id: string; facilityId: FacilityId; type: string; lastRun: IsoDate | null; intervalDays: number;
  plannedMinutes: number; actualMinutes: number | null; participantsPlanned: number; participantsActual: number | null;
  gaps: string[]; sourceId: string; section: string;
}

// ---------- catalog ----------
export interface ModuleInfo { id: ModuleId; title: string; section: string; routes: string[] }
export interface ScreenInfo { route: string; title: string; dossierScreen: string; modules: ModuleId[] }

// ---------- engine results ----------
export interface ProvenanceResult {
  sourceId: string; score: number; gated: boolean; authorityFactor: number;
  weighted: SourceDims;          // each dim × its weight (before authority factor)
  dataAgeHours: number;
}
export interface ExposureResult {
  hazard: HazardType; E: Tracked; exposedAssetIds: string[]; exposedValue: Rupees; totalValue: Rupees;
}
export interface DriverContribution { driver: VulnerabilityDriver; weight: number; contribution: number; share: number }
export interface VulnerabilityResult { hazard: HazardType; V: Tracked; drivers: DriverContribution[] }
export interface MitigationFactorResult { hazard: HazardType; M: Tracked; contributingEntryIds: string[] }
export interface RiskResult {
  facilityId: FacilityId; hazard: HazardType; hazardClass: HazardClass; label: string;
  H: Tracked; E: Tracked; V: Tracked; C: Tracked; M: Tracked; R: Tracked; Rnorm: Tracked;
  band: Band; drivers: DriverContribution[]; exposure: ExposureResult; contributingEntryIds: string[];
}
export interface LossComponents<T> {
  physical: T; inventory: T; bi: T; extraExpense: T; recovery: T; supplyChain: T;
}
export interface EffectiveScenario {
  base: Scenario; mode: ScenarioMode; appliedEntryIds: string[];
  downtimeDays: number; inventoryLossFraction: number; damageRatios: DamageRatio[];
  supplierInterruptionDays: number; supplierDependencyShare: number; overridesApplied: boolean;
}
export interface ScenarioLossResult {
  scenarioId: string; mode: ScenarioMode; components: LossComponents<Tracked>; total: Tracked;
  byCoverageClass: Record<CoverageClass, Rupees>; effective: EffectiveScenario;
}
export interface SensitivityBand {
  driver: SensitivityDriver; points: { input: number; total: Rupees }[]; swing: Rupees;
  baseInput: number; baseOutsideBand: boolean;
}
export interface SensitivityResult {
  scenarioId: string; base: Tracked; bands: SensitivityBand[]; envelope: { min: Rupees; max: Rupees };
  ranking: SensitivityDriver[];
}
export interface GapRow {
  coverageClass: CoverageClass; exposure: Tracked; usableProtection: Tracked; gap: Tracked; covered: boolean; note: string;
}
export interface GapResult {
  basis: InsuranceBasis; peril: Peril | null; perilCovered: boolean; rows: GapRow[];
  totals: { exposure: Tracked; protection: Tracked; gap: Tracked };
  requiresAdviserReview: true; extractionConfidence: number;
}
export interface PriorityResult {
  entryId: string; title: string; target: LedgerTarget; state: LedgerState;
  impact: Score5; likelihood: 1 | 3 | 5; urgency: Score5; feasibility: Score5;
  product: number; score: Tracked;              // score.value = product / 625 (0..1)
  rank: number; avoidedLoss: Tracked; costMin: Rupees | null; costMax: Rupees | null; daysUntilDue: number;
}
export interface ResourceStats {
  resource: ResponderResource; n: number; travelP50: number | null;
  totalP50: number | null; totalP90: number | null; totalP95: number | null;
  meanDecomposition: { dispatch: number; mobilise: number; travel: number };
  confidence: number; insufficient: PercentileKey[];
}
export interface SelectionCandidate { resourceId: string; capable: boolean; distanceKm: number; currentTravelEstimateMin: number }
export interface SelectionResult {
  incident: IncidentType; selectedResourceId: string | null; nearestResourceId: string;
  candidates: SelectionCandidate[]; confidence: number; reason: string;
}
export interface AccessibilitySubscore { factor: AccessFactor; weight: number; value: number | null; note: string }
export interface AccessibilityResult {
  facilityId: FacilityId; score: Tracked; band: AccessBand; partial: boolean; subscores: AccessibilitySubscore[];
  resources: ResourceStats[]; selections: Record<IncidentType, SelectionResult>;
}
export interface Chain { id: string; nodeIds: string[]; score: number; compound: boolean; targetType: 'financial' | 'people' }
export interface SpofResult { nodeId: string; label: string; type: NodeType; share: number; chainCount: number }
export interface StateLogEntry {
  stepId: string; offsetHours: number; level: SignalLevel; firedRules: string[];
  from: EventState; to: EventState; owner: string; advisoryIds: string[]; suppressedAdvisoryIds: string[];
}
export interface AlertQualityCheck { id: string; label: string; pass: boolean; detail: string }
export interface OutcomeResult {
  scenarioId: string; predicted: Tracked; observed: Tracked; error: number;
  recalibrated: Tracked; recalibratedError: number; unmodelled: string[];
}
export interface DrillResult { drill: DrillRecord; effectiveness: Tracked | null; overdue: boolean; nextDue: IsoDate | null }

// ---------- views ----------
export interface ScenarioView {
  scenario: Scenario; gross: ScenarioLossResult; residual: ScenarioLossResult; committed: ScenarioLossResult;
  sensitivity: SensitivityResult; override: ScenarioOverride | null;
}
export interface CascadeView { nodes: DependencyNode[]; edges: DependencyEdge[]; chains: Chain[]; spof: SpofResult[] }
export interface InsuranceView { policy: PolicySchedule; maxExposure: GapResult; byScenario: Record<string, GapResult>; active: GapResult }
export interface ProvenanceRow { source: DataSource; result: ProvenanceResult }
export interface ReplayStatus { active: boolean; state: EventState; log: StateLogEntry[]; latestStep: ReplayStep | null }
export interface FacilityModel {
  facility: Facility; assets: Asset[]; contributionPerDay: Tracked; completeness: Tracked;
  risks: RiskResult[]; topRisk: RiskResult; cascade: CascadeView;
  scenarios: ScenarioView[]; selectedScenarioId: string;
  priorities: PriorityResult[]; ledger: LedgerEntry[]; preparedness: Tracked; drills: DrillResult[]; bcp: BcpRecord;
  insurance: InsuranceView; accessibility: AccessibilityResult; incidentType: IncidentType;
  thresholds: MonitoringThreshold[]; advisories: Advisory[];
  replayCase: ReplayCase; replayStatus: ReplayStatus; outcome: OutcomeResult;
  provenance: ProvenanceRow[]; assumptions: Assumption[];
}
export interface PortfolioRow {
  facilityId: FacilityId; name: string; topRisk: RiskResult; preparedness: Tracked; completeness: Tracked;
  accessibility: Tracked; accessBand: AccessBand; accessPartial: boolean; maxExposureGap: Tracked;
  openCritical: number; largestResidual: { scenarioId: string; loss: Tracked };
}
export interface PortfolioSummary {
  rows: PortfolioRow[]; totalGap: Tracked; openCritical: number;
  evidenceBackedRate: Tracked; actionConversion: Tracked; meanPreparedness: Tracked;
}

// ---------- store ----------
export interface ReplayState { caseId: ReplayCaseId; stepIndex: number; eventState: EventState; log: StateLogEntry[] }
export interface DemoState {
  ledger: LedgerEntry[];
  scenarioOverrides: Record<string, ScenarioOverride>;
  selectedScenario: Record<FacilityId, string>;
  insuranceBasis: Record<FacilityId, InsuranceBasis>;
  incidentType: Record<FacilityId, IncidentType>;
  replay: ReplayState;
}
export type DemoAction =
  | { type: 'ledger/transition'; entryId: string; to: LedgerState; payload: TransitionPayload; at: IsoDateTime }
  | { type: 'scenario/override'; scenarioId: string; patch: ScenarioOverride }
  | { type: 'scenario/clear'; scenarioId: string }
  | { type: 'scenario/select'; facilityId: FacilityId; scenarioId: string }
  | { type: 'insurance/basis'; facilityId: FacilityId; basis: InsuranceBasis }
  | { type: 'access/incident'; facilityId: FacilityId; incident: IncidentType }
  | { type: 'replay/case'; caseId: ReplayCaseId }
  | { type: 'replay/step'; direction: 1 | -1 }
  | { type: 'replay/reset' }
  | { type: 'demo/reset' };
export interface DemoStore {
  state: DemoState;
  transitionLedger: (entryId: string, to: LedgerState, payload: TransitionPayload) => TransitionCheck;
  setScenarioOverride: (scenarioId: string, patch: ScenarioOverride) => void;
  clearScenarioOverride: (scenarioId: string) => void;
  selectScenario: (facilityId: FacilityId, scenarioId: string) => void;
  setInsuranceBasis: (facilityId: FacilityId, basis: InsuranceBasis) => void;
  setIncidentType: (facilityId: FacilityId, incident: IncidentType) => void;
  selectReplayCase: (caseId: ReplayCaseId) => void;
  stepReplay: (direction: 1 | -1) => void;
  resetReplay: () => void;
  resetDemo: () => void;
}
export type Children = { children: ReactNode };


// ---------- Shared component prop interfaces (KIT_03 §2.8) ----------
// common
export interface MetricProps { label: string; tracked: Tracked; kind: FormatKind; band?: Band | AccessBand; size?: 'sm' | 'md' | 'lg'; caption?: string; facilityId?: FacilityId }
export interface TrackedCellProps { tracked: Tracked; kind: FormatKind; facilityId?: FacilityId; align?: 'left' | 'right' }
export interface ConfidenceChipProps { confidence: number; showLabel?: boolean }
export interface AssumptionLinkProps { assumptionIds: string[]; sourceIds: string[]; section: string; facilityId?: FacilityId }
export interface AssumptionDrawerProps { open: boolean; onOpenChange: (open: boolean) => void; assumptionIds: string[]; sourceIds: string[]; section: string; facilityId?: FacilityId }
export interface SourceBadgeProps { sourceId: string }
export interface ModuleTagProps { id: ModuleId }
export interface BandBadgeProps { band: Band | AccessBand }
export interface SectionCardProps { title: string; moduleIds: ModuleId[]; section: string; description?: string; actions?: ReactNode; children: ReactNode }
export interface EmptyStateProps { title: string; reason: string; nextStep: string }
export interface InsufficientDataProps { metric: string; required: string; available: string }
export interface DisclaimerProps { variant: 'insurance' | 'official_source' | 'demo' }
// shell
export interface AppShellProps { children: ReactNode }
export interface SideNavProps { activeFacilityId: FacilityId }
export interface FacilitySwitcherProps { currentId: FacilityId }
export interface FacilityHeaderProps { facility: Facility }
// facility
export interface SchematicMapProps { layout: SchematicLayout; highlightHazard: HazardType | null; showResponders: boolean; selectedResourceId: string | null; caption: string }
export interface ChecklistTableProps { items: ChecklistItem[]; completeness: Tracked; facilityId: FacilityId }
export interface StatusListProps { model: FacilityModel }
// risk
export interface RiskTableProps { risks: RiskResult[]; selectedHazard: HazardType; onSelect: (h: HazardType) => void; facilityId: FacilityId }
export interface DriverListProps { risk: RiskResult; facilityId: FacilityId }
export interface ExposedAssetsProps { exposure: ExposureResult; assets: Asset[]; facilityId: FacilityId }
// scenario
export interface ScenarioPickerProps { scenarios: Scenario[]; selectedId: string; onSelect: (id: string) => void }
export interface LossBreakdownProps { view: ScenarioView; facilityId: FacilityId }
export interface ScenarioControlsProps { view: ScenarioView; onChange: (patch: ScenarioOverride) => void; onReset: () => void }
export interface SensitivityTornadoProps { result: SensitivityResult }
export interface CascadeGraphProps { cascade: CascadeView }
// mitigation
export interface PriorityQueueProps { items: PriorityResult[]; ledger: LedgerEntry[]; facilityId: FacilityId }
// ledger
export interface LedgerTableProps { entries: LedgerEntry[]; selectedId: string | null; onSelect: (id: string) => void; kindFilter: LedgerKind | 'all' }
export interface LedgerTransitionDialogProps { entry: LedgerEntry; open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (to: LedgerState, payload: TransitionPayload) => TransitionCheck }
export interface LedgerHistoryProps { entry: LedgerEntry }
export interface VerificationHierarchyProps { highlight: VerificationMethod | null }
// insurance
export interface BasisSelectorProps { scenarios: Scenario[]; basis: InsuranceBasis; onChange: (b: InsuranceBasis) => void }
export interface GapBarsProps { gap: GapResult }
export interface GapTableProps { gap: GapResult; facilityId: FacilityId }
export interface PolicyScheduleCardProps { policy: PolicySchedule }
// accessibility
export interface ResourceTableProps { stats: ResourceStats[]; facilityId: FacilityId }
export interface ResponseDecompositionProps { stats: ResourceStats[] }
export interface AccessibilityScoreCardProps { result: AccessibilityResult; facilityId: FacilityId }
export interface IncidentSelectorProps { value: IncidentType; onChange: (t: IncidentType) => void; selection: SelectionResult }
// monitoring
export interface ThresholdTableProps { thresholds: MonitoringThreshold[]; latest: SignalReading[] | null }
export interface AdvisoryListProps { advisories: Advisory[]; firedIds: string[]; ledger: LedgerEntry[] }
export interface AlertQualityChecksProps { checks: AlertQualityCheck[] }
// replay
export interface CaseToggleProps { value: ReplayCaseId; onChange: (id: ReplayCaseId) => void }
export interface ReplayTimelineProps { replayCase: ReplayCase; stepIndex: number; log: StateLogEntry[]; onStep: (direction: 1 | -1) => void; onReset: () => void }
export interface SignalChartProps { replayCase: ReplayCase; thresholds: MonitoringThreshold[]; stepIndex: number }
export interface OutcomePanelProps { outcome: OutcomeResult; replayCase: ReplayCase; reached: boolean }
// lifecycle
export interface StateMachineDiagramProps { current: EventState; visited: EventState[] }
export interface ModeCardsProps { facilityId: FacilityId; current: EventState }
export interface BcpPanelProps { bcp: BcpRecord }
export interface DrillTableProps { drills: DrillResult[]; facilityId: FacilityId }
// report
export interface ReportSectionProps { id: string; title: string; children: ReactNode }
export interface AssumptionRegisterProps { assumptions: Assumption[] }
export interface SourceRegisterProps { rows: ProvenanceRow[] }
export interface ExportButtonsProps { model: FacilityModel }
