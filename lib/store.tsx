'use client';

import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { FACILITY_IDS, getFacility, getReplayCase, ledgerSeed } from '@/data';
import { DEMO_NOW } from '@/lib/constants';
import { applyTransition, canTransition } from '@/lib/engines/ledger';
import { buildPortfolio } from '@/lib/engines/portfolio';
import { foldReplay } from '@/lib/engines/stateMachine';
import { buildFacilityModel } from '@/lib/model';
import type {
  DemoAction,
  DemoState,
  DemoStore,
  FacilityId,
  FacilityModel,
  InsuranceBasis,
  IncidentType,
  LedgerState,
  PortfolioSummary,
  ReplayCaseId,
  ScenarioOverride,
  TransitionCheck,
  TransitionPayload,
} from '@/lib/types';

export function initialDemoState(): DemoState {
  const wb = getFacility('fac-wb-metal');
  const vz = getFacility('fac-vz-polymer');

  return {
    ledger: structuredClone(ledgerSeed),
    scenarioOverrides: {},
    selectedScenario: {
      'fac-wb-metal': 'sa1-rainfall',
      'fac-vz-polymer': 'sb1-release',
    },
    insuranceBasis: {
      'fac-wb-metal': { kind: 'max_exposure' },
      'fac-vz-polymer': { kind: 'max_exposure' },
    },
    incidentType: {
      'fac-wb-metal': wb.primaryIncident,
      'fac-vz-polymer': vz.primaryIncident,
    },
    replay: {
      caseId: 'amphan-2020',
      stepIndex: -1,
      eventState: 'NORMAL',
      log: [],
    },
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'ledger/transition': {
      const entry = state.ledger.find((e) => e.id === action.entryId);
      if (!entry) return state;
      const check = canTransition(entry, action.to, action.payload);
      if (!check.ok) return state;

      const nextEntry = applyTransition(entry, action.to, action.payload, action.at);
      return {
        ...state,
        ledger: state.ledger.map((e) => (e.id === action.entryId ? nextEntry : e)),
      };
    }

    case 'scenario/override': {
      const existing = state.scenarioOverrides[action.scenarioId] ?? {};
      return {
        ...state,
        scenarioOverrides: {
          ...state.scenarioOverrides,
          [action.scenarioId]: { ...existing, ...action.patch },
        },
      };
    }

    case 'scenario/clear': {
      const nextOverrides = { ...state.scenarioOverrides };
      delete nextOverrides[action.scenarioId];
      return {
        ...state,
        scenarioOverrides: nextOverrides,
      };
    }

    case 'scenario/select': {
      return {
        ...state,
        selectedScenario: {
          ...state.selectedScenario,
          [action.facilityId]: action.scenarioId,
        },
      };
    }

    case 'insurance/basis': {
      return {
        ...state,
        insuranceBasis: {
          ...state.insuranceBasis,
          [action.facilityId]: action.basis,
        },
      };
    }

    case 'access/incident': {
      return {
        ...state,
        incidentType: {
          ...state.incidentType,
          [action.facilityId]: action.incident,
        },
      };
    }

    case 'replay/case': {
      return {
        ...state,
        replay: {
          caseId: action.caseId,
          stepIndex: -1,
          eventState: 'NORMAL',
          log: [],
        },
      };
    }

    case 'replay/step': {
      const replayCase = getReplayCase(state.replay.caseId);
      const maxIndex = replayCase.steps.length - 1;
      const nextIndex = Math.max(
        -1,
        Math.min(maxIndex, state.replay.stepIndex + action.direction)
      );
      const { eventState, log } = foldReplay(replayCase, nextIndex);
      return {
        ...state,
        replay: {
          caseId: state.replay.caseId,
          stepIndex: nextIndex,
          eventState,
          log,
        },
      };
    }

    case 'replay/reset': {
      return {
        ...state,
        replay: {
          caseId: state.replay.caseId,
          stepIndex: -1,
          eventState: 'NORMAL',
          log: [],
        },
      };
    }

    case 'demo/reset': {
      return initialDemoState();
    }

    default:
      return state;
  }
}

const DemoContext = createContext<DemoStore | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(demoReducer, undefined, initialDemoState);

  const store: DemoStore = useMemo(
    () => ({
      state,
      transitionLedger: (
        entryId: string,
        to: LedgerState,
        payload: TransitionPayload
      ): TransitionCheck => {
        const entry = state.ledger.find((e) => e.id === entryId);
        if (!entry) {
          return { ok: false, reason: `Ledger entry ${entryId} not found` };
        }
        const check = canTransition(entry, to, payload);
        if (check.ok) {
          dispatch({
            type: 'ledger/transition',
            entryId,
            to,
            payload,
            at: DEMO_NOW,
          });
        }
        return check;
      },
      setScenarioOverride: (scenarioId: string, patch: ScenarioOverride) => {
        dispatch({ type: 'scenario/override', scenarioId, patch });
      },
      clearScenarioOverride: (scenarioId: string) => {
        dispatch({ type: 'scenario/clear', scenarioId });
      },
      selectScenario: (facilityId: FacilityId, scenarioId: string) => {
        dispatch({ type: 'scenario/select', facilityId, scenarioId });
      },
      setInsuranceBasis: (facilityId: FacilityId, basis: InsuranceBasis) => {
        dispatch({ type: 'insurance/basis', facilityId, basis });
      },
      setIncidentType: (facilityId: FacilityId, incident: IncidentType) => {
        dispatch({ type: 'access/incident', facilityId, incident });
      },
      selectReplayCase: (caseId: ReplayCaseId) => {
        dispatch({ type: 'replay/case', caseId });
      },
      stepReplay: (direction: 1 | -1) => {
        dispatch({ type: 'replay/step', direction });
      },
      resetReplay: () => {
        dispatch({ type: 'replay/reset' });
      },
      resetDemo: () => {
        dispatch({ type: 'demo/reset' });
      },
    }),
    [state]
  );

  return <DemoContext.Provider value={store}>{children}</DemoContext.Provider>;
}

export function useDemoStore(): DemoStore {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemoStore must be used within a DemoStoreProvider');
  }
  return ctx;
}

export function useFacilityModel(id: FacilityId): FacilityModel {
  const { state } = useDemoStore();
  return useMemo(() => buildFacilityModel(id, state), [id, state]);
}

export function usePortfolio(): PortfolioSummary {
  const { state } = useDemoStore();
  return useMemo(() => {
    const models = FACILITY_IDS.map((fid) => buildFacilityModel(fid, state));
    return buildPortfolio(models);
  }, [state]);
}
