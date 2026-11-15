import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { firebaseHybridAiAdapter } from '../adapters/firebase/hybridAiAdapter';
import { localCatalogAdapter } from '../adapters/localCatalogAdapter';
import {
  createDefaultPreferences,
  CURRENT_INTRO_VERSION,
  localRouteAdapter,
} from '../adapters/localRouteAdapter';
import { emptySelfCheckProfile } from '../domain/matcher';
import {
  addRouteTask,
  clearActiveGoal,
  emptyMyRouteState,
  moveRouteTask,
  parseAndValidateRouteImport,
  removeRouteTask,
  removeSavedOpportunity,
  saveOpportunityToRoute,
  setActiveGoal,
  updateRouteTaskDate,
  updateRouteTaskStatus,
  updateRouteTaskText,
  updateSavedOpportunityStatus,
} from '../domain/routeRules';
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
import type { AICapabilityReport } from '../ports/aiPort';
import type { PersistenceResult } from '../ports/routePort';
import { AIOrchestrator } from '../services/aiOrchestrator';
import { ensureI18nInitialized } from '../services/i18n';
import {
  AppContext,
  prefersReducedMotion,
  type AppContextValue,
  type AppPorts,
} from './appContextStore';

export function AppProvider({
  children,
  ports,
  skipInitialCapabilityProbe = false,
}: {
  children: ReactNode;
  ports?: Partial<AppPorts>;
  skipInitialCapabilityProbe?: boolean;
}) {
  const resolvedPorts = useMemo<AppPorts>(
    () => ({
      catalog: ports?.catalog ?? localCatalogAdapter,
      route: ports?.route ?? localRouteAdapter,
      ai: ports?.ai ?? firebaseHybridAiAdapter,
    }),
    [ports?.ai, ports?.catalog, ports?.route],
  );

  const [initialPrefsResult] = useState<PersistenceResult<UserPreferences>>(() =>
    resolvedPorts.route.loadPreferences(),
  );
  const [initialRouteResult] = useState<PersistenceResult<MyRouteState>>(() =>
    resolvedPorts.route.loadRoute(),
  );
  const [initialProfileResult] = useState<PersistenceResult<SelfCheckProfile>>(() =>
    resolvedPorts.route.loadProfile(),
  );

  const [preferences, setPreferences] = useState<UserPreferences>(
    initialPrefsResult.value,
  );
  const [route, setRoute] = useState<MyRouteState>(initialRouteResult.value);
  const [profile, setProfile] = useState<SelfCheckProfile>(initialProfileResult.value);
  const [storageWarning, setStorageWarning] = useState<boolean>(
    !initialPrefsResult.storageAvailable ||
      !initialRouteResult.storageAvailable ||
      !initialProfileResult.storageAvailable,
  );

  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine !== false : true,
  );

  const [capabilities, setCapabilities] = useState<AICapabilityReport | null>(null);
  const [capabilitiesLoading, setCapabilitiesLoading] = useState<boolean>(false);
  const [isDownloadingModel, setIsDownloadingModel] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<{ code: string; details: string } | null>(
    null,
  );
  const [aiLog, setAiLog] = useState<AIExecutionLogEntry[]>([]);

  const [introActive, setIntroActive] = useState<boolean>(
    () => !initialPrefsResult.value.introVersionSeen && !prefersReducedMotion(),
  );
  // The guided tour is on demand only ("How it works"): it never opens by itself,
  // so it can't cover the primary actions on a first visit (UX audit H-10).
  const [tourActive, setTourActive] = useState<boolean>(false);

  const localeRef = useRef<Locale>(initialPrefsResult.value.locale);

  ensureI18nInitialized(preferences.locale);

  useEffect(() => {
    localeRef.current = preferences.locale;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = preferences.locale;
    }
  }, [preferences.locale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const appendLog = useCallback((entry: AIExecutionLogEntry) => {
    setAiLog((prev) => [entry, ...prev].slice(0, 40));
  }, []);

  const aiOrchestrator = useMemo(
    () => new AIOrchestrator(resolvedPorts.ai, appendLog),
    [appendLog, resolvedPorts.ai],
  );

  useEffect(() => {
    return () => {
      aiOrchestrator.cancelActiveRequests();
    };
  }, [aiOrchestrator]);

  const refreshCapabilities = useCallback(async () => {
    setCapabilitiesLoading(true);
    try {
      const report = await aiOrchestrator.inspectCapabilities(localeRef.current);
      setCapabilities(report);
    } catch {
      // Preserve last known capability state without leaking an unhandled rejection
    } finally {
      setCapabilitiesLoading(false);
    }
  }, [aiOrchestrator]);

  useEffect(() => {
    if (skipInitialCapabilityProbe) return;
    let active = true;
    void aiOrchestrator
      .inspectCapabilities(preferences.locale)
      .then((report) => {
        if (active) {
          setCapabilities(report);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [aiOrchestrator, preferences.locale, skipInitialCapabilityProbe]);

  const persistPrefs = useCallback(
    (updater: (prev: UserPreferences) => UserPreferences) => {
      setPreferences((prev) => {
        const next = updater(prev);
        const res = resolvedPorts.route.savePreferences(next);
        if (!res.ok) setStorageWarning(true);
        return next;
      });
    },
    [resolvedPorts.route],
  );

  const persistRouteState = useCallback(
    (nextState: MyRouteState) => {
      const res = resolvedPorts.route.saveRoute(nextState);
      if (!res.ok) setStorageWarning(true);
      setRoute(nextState);
    },
    [resolvedPorts.route],
  );

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      ensureI18nInitialized(nextLocale);
      persistPrefs((prev) => ({ ...prev, locale: nextLocale }));
    },
    [persistPrefs],
  );

  const setInferencePreference = useCallback(
    (mode: HybridInferencePreference) => {
      persistPrefs((prev) => ({ ...prev, inferencePreference: mode }));
    },
    [persistPrefs],
  );

  const setCloudConsent = useCallback(
    (granted: boolean) => {
      persistPrefs((prev) => ({ ...prev, cloudConsentGranted: granted }));
    },
    [persistPrefs],
  );

  const saveGoal = useCallback(
    (
      text: string,
      options?: { opportunityId?: string; confirmReplace?: boolean },
    ) => {
      const result = setActiveGoal(route, text, options);
      if (result.ok) {
        persistRouteState(result.state);
      }
      return result;
    },
    [persistRouteState, route],
  );

  const clearGoal = useCallback(() => {
    persistRouteState(clearActiveGoal(route));
  }, [persistRouteState, route]);

  const addTask = useCallback(
    (
      text: string,
      options?: { opportunityId?: string; personalTargetDate?: string },
    ) => {
      const result = addRouteTask(route, text, options);
      if (result.ok) {
        persistRouteState(result.state);
      }
      return result;
    },
    [persistRouteState, route],
  );

  const editTaskText = useCallback(
    (taskId: string, text: string) => {
      const result = updateRouteTaskText(route, taskId, text);
      if (result.ok) persistRouteState(result.state);
      return result;
    },
    [persistRouteState, route],
  );

  const changeTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      const result = updateRouteTaskStatus(route, taskId, status);
      if (result.ok) persistRouteState(result.state);
      return result;
    },
    [persistRouteState, route],
  );

  const changeTaskDate = useCallback(
    (taskId: string, date: string | undefined) => {
      const result = updateRouteTaskDate(route, taskId, date ?? '');
      if (result.ok) persistRouteState(result.state);
      return result;
    },
    [persistRouteState, route],
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      const next = removeRouteTask(route, taskId);
      persistRouteState(next);
    },
    [persistRouteState, route],
  );

  const reorderTask = useCallback(
    (taskId: string, direction: 'up' | 'down') => {
      const next = moveRouteTask(route, taskId, direction);
      persistRouteState(next);
    },
    [persistRouteState, route],
  );

  const saveOpportunity = useCallback(
    (opportunity: Opportunity) => {
      const next = saveOpportunityToRoute(route, opportunity);
      persistRouteState(next);
    },
    [persistRouteState, route],
  );

  const changeSavedStatus = useCallback(
    (opportunityId: string, status: TrackingStatus) => {
      const next = updateSavedOpportunityStatus(route, opportunityId, status);
      persistRouteState(next);
    },
    [persistRouteState, route],
  );

  const unsaveOpportunity = useCallback(
    (opportunityId: string) => {
      const { state: next, removed } = removeSavedOpportunity(route, opportunityId);
      persistRouteState(next);
      return removed ?? null;
    },
    [persistRouteState, route],
  );

  const restoreSavedOpportunity = useCallback(
    (snapshot: SavedOpportunityTracking) => {
      const next: MyRouteState = {
        ...route,
        saved: {
          ...route.saved,
          [snapshot.opportunityId]: snapshot,
        },
      };
      persistRouteState(next);
    },
    [persistRouteState, route],
  );

  const importRouteJson = useCallback(
    (rawJson: string) => {
      const parsed = parseAndValidateRouteImport(rawJson);
      if (parsed.ok) {
        persistRouteState(parsed.state);
      }
      return parsed;
    },
    [persistRouteState],
  );

  const updateProfile = useCallback(
    (next: SelfCheckProfile) => {
      const res = resolvedPorts.route.saveProfile(next);
      if (!res.ok) setStorageWarning(true);
      setProfile(next);
    },
    [resolvedPorts.route],
  );

  const resetProfile = useCallback(() => {
    const res = resolvedPorts.route.saveProfile(emptySelfCheckProfile);
    if (!res.ok) setStorageWarning(true);
    setProfile(emptySelfCheckProfile);
  }, [resolvedPorts.route]);

  const clearAllData = useCallback(() => {
    const res = resolvedPorts.route.clearAllLocalData();
    if (!res.ok) setStorageWarning(true);
    const defaults = createDefaultPreferences(localeRef.current);
    defaults.introVersionSeen = CURRENT_INTRO_VERSION;
    defaults.tourStatus = 'dismissed';
    resolvedPorts.route.savePreferences(defaults);
    setPreferences(defaults);
    setRoute(emptyMyRouteState);
    setProfile(emptySelfCheckProfile);
    setAiLog([]);
  }, [resolvedPorts.route]);

  const initializeOnDeviceModel = useCallback(async () => {
    setIsDownloadingModel(true);
    setDownloadProgress(0);
    setDownloadError(null);
    try {
      await aiOrchestrator.initializeOnDeviceModel((ratio) => {
        setDownloadProgress(ratio);
      }, localeRef.current);
      const refreshed = await aiOrchestrator.inspectCapabilities(localeRef.current);
      setCapabilities(refreshed);
    } catch (err) {
      const details = err instanceof Error ? err.message : 'Unable to initialize local model.';
      const code =
        err &&
        typeof err === 'object' &&
        'code' in err &&
        typeof (err as { code?: unknown }).code === 'string'
          ? (err as { code: string }).code
          : 'AI_EXECUTION_FAILED';
      setDownloadError({ code, details });
    } finally {
      setIsDownloadingModel(false);
      setDownloadProgress(null);
    }
  }, [aiOrchestrator]);

  const clearDownloadError = useCallback(() => {
    setDownloadError(null);
  }, []);

  const clearAiLog = useCallback(() => {
    setAiLog([]);
  }, []);

  const dismissIntro = useCallback(() => {
    setIntroActive(false);
    persistPrefs((prev) => ({
      ...prev,
      introVersionSeen: CURRENT_INTRO_VERSION,
    }));
  }, [persistPrefs]);

  const replayIntro = useCallback(() => {
    if (prefersReducedMotion()) {
      setIntroActive(false);
      return;
    }
    setIntroActive(true);
  }, []);

  const startTour = useCallback(() => {
    setTourActive(true);
  }, []);

  const closeTour = useCallback(
    (status: 'completed' | 'dismissed') => {
      setTourActive(false);
      persistPrefs((prev) => ({
        ...prev,
        tourStatus: status,
      }));
    },
    [persistPrefs],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      catalogPort: resolvedPorts.catalog,
      aiOrchestrator,
      locale: preferences.locale,
      setLocale,
      preferences,
      setInferencePreference,
      setCloudConsent,
      route,
      saveGoal,
      clearGoal,
      addTask,
      editTaskText,
      changeTaskStatus,
      changeTaskDate,
      deleteTask,
      reorderTask,
      saveOpportunity,
      changeSavedStatus,
      unsaveOpportunity,
      restoreSavedOpportunity,
      importRouteJson,
      profile,
      updateProfile,
      resetProfile,
      clearAllData,
      capabilities,
      capabilitiesLoading,
      refreshCapabilities,
      isDownloadingModel,
      downloadProgress,
      downloadError,
      clearDownloadError,
      initializeOnDeviceModel,
      aiLog,
      clearAiLog,
      isOnline,
      storageWarning,
      introActive,
      dismissIntro,
      replayIntro,
      tourActive,
      startTour,
      closeTour,
    }),
    [
      addTask,
      aiLog,
      aiOrchestrator,
      capabilities,
      capabilitiesLoading,
      changeSavedStatus,
      changeTaskDate,
      changeTaskStatus,
      clearAiLog,
      clearAllData,
      clearDownloadError,
      clearGoal,
      closeTour,
      deleteTask,
      dismissIntro,
      downloadError,
      downloadProgress,
      editTaskText,
      importRouteJson,
      initializeOnDeviceModel,
      introActive,
      isDownloadingModel,
      isOnline,
      preferences,
      profile,
      refreshCapabilities,
      reorderTask,
      replayIntro,
      resetProfile,
      resolvedPorts.catalog,
      restoreSavedOpportunity,
      route,
      saveGoal,
      saveOpportunity,
      setCloudConsent,
      setInferencePreference,
      setLocale,
      startTour,
      storageWarning,
      tourActive,
      unsaveOpportunity,
      updateProfile,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
