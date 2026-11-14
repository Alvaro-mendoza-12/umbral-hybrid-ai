import { createContext, useContext } from 'react';
import type { RouteMutationResult } from '../domain/routeRules';
import type {
  AIExecutionLogEntry,
  HybridInferencePreference,
  Locale,
  MyRouteState,
  Opportunity,
  SavedOpportunityTracking,
  SelfCheckProfile,
  TaskStatus,
  TrackingStatus,
  UserPreferences,
} from '../domain/types';
import type { AICapabilityReport, HybridAIPort } from '../ports/aiPort';
import type { CatalogPort } from '../ports/catalogPort';
import type { RoutePort } from '../ports/routePort';
import type { AIOrchestrator } from '../services/aiOrchestrator';

export interface AppPorts {
  catalog: CatalogPort;
  route: RoutePort;
  ai: HybridAIPort;
}

export interface AppContextValue {
  catalogPort: CatalogPort;
  aiOrchestrator: AIOrchestrator;
  locale: Locale;
  setLocale: (next: Locale) => void;
  preferences: UserPreferences;
  setInferencePreference: (mode: HybridInferencePreference) => void;
  setCloudConsent: (granted: boolean) => void;
  route: MyRouteState;
  saveGoal: (
    text: string,
    options?: { opportunityId?: string; confirmReplace?: boolean },
  ) => RouteMutationResult;
  clearGoal: () => void;
  addTask: (
    text: string,
    options?: { opportunityId?: string; personalTargetDate?: string },
  ) => RouteMutationResult;
  editTaskText: (taskId: string, text: string) => RouteMutationResult;
  changeTaskStatus: (taskId: string, status: TaskStatus) => RouteMutationResult;
  changeTaskDate: (taskId: string, date: string | undefined) => RouteMutationResult;
  deleteTask: (taskId: string) => void;
  reorderTask: (taskId: string, direction: 'up' | 'down') => void;
  saveOpportunity: (opportunity: Opportunity) => void;
  changeSavedStatus: (opportunityId: string, status: TrackingStatus) => void;
  unsaveOpportunity: (opportunityId: string) => SavedOpportunityTracking | null;
  restoreSavedOpportunity: (snapshot: SavedOpportunityTracking) => void;
  profile: SelfCheckProfile;
  updateProfile: (next: SelfCheckProfile) => void;
  resetProfile: () => void;
  clearAllData: () => void;
  capabilities: AICapabilityReport | null;
  capabilitiesLoading: boolean;
  refreshCapabilities: () => Promise<void>;
  isDownloadingModel: boolean;
  downloadProgress: number | null;
  initializeOnDeviceModel: () => Promise<void>;
  aiLog: AIExecutionLogEntry[];
  clearAiLog: () => void;
  isOnline: boolean;
  storageWarning: boolean;
  introActive: boolean;
  dismissIntro: () => void;
  replayIntro: () => void;
  tourActive: boolean;
  startTour: () => void;
  closeTour: (status: 'completed' | 'dismissed') => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
