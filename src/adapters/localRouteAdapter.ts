import { emptySelfCheckProfile } from '../domain/matcher';
import { emptyMyRouteState, normalizeMyRouteState } from '../domain/routeRules';
import type {
  Locale,
  MyRouteState,
  SelfCheckProfile,
  UserPreferences,
} from '../domain/types';
import type { PersistenceResult, RoutePort } from '../ports/routePort';

export const STORAGE_KEYS = {
  route: 'umbral:route:v2',
  profile: 'umbral:profile:v1',
  prefs: 'umbral:prefs:v1',
} as const;

export const CURRENT_INTRO_VERSION = 'v1';
export const CURRENT_TOUR_VERSION = 'v1';

export function detectDefaultLocale(): Locale {
  if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
    return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
  }
  return 'en';
}

export function createDefaultPreferences(locale: Locale = detectDefaultLocale()): UserPreferences {
  return {
    version: 1,
    locale,
    inferencePreference: 'PREFER_ON_DEVICE',
    cloudConsentGranted: false,
    introVersionSeen: null,
    tourStatus: 'never',
    tourVersion: CURRENT_TOUR_VERSION,
  };
}

function getSafeStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const probeKey = '__umbral_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJsonItem<T>(key: string): { available: boolean; raw: T | null } {
  const storage = getSafeStorage();
  if (!storage) {
    return { available: false, raw: null };
  }
  try {
    const text = storage.getItem(key);
    if (!text) return { available: true, raw: null };
    return { available: true, raw: JSON.parse(text) as T };
  } catch {
    return { available: true, raw: null };
  }
}

function writeJsonItem<T>(key: string, value: T): PersistenceResult<T> {
  const storage = getSafeStorage();
  if (!storage) {
    return {
      ok: false,
      value,
      storageAvailable: false,
      errorCode: 'STORAGE_UNAVAILABLE',
    };
  }
  try {
    storage.setItem(key, JSON.stringify(value));
    return {
      ok: true,
      value,
      storageAvailable: true,
    };
  } catch {
    return {
      ok: false,
      value,
      storageAvailable: true,
      errorCode: 'STORAGE_WRITE_FAILED',
    };
  }
}

function normalizeProfile(raw: unknown): SelfCheckProfile {
  if (!raw || typeof raw !== 'object') return emptySelfCheckProfile;
  const obj = raw as Record<string, unknown>;
  const validLanguages = Array.isArray(obj.languages)
    ? obj.languages.filter((lang): lang is Locale => lang === 'es' || lang === 'en')
    : [];

  return {
    residenceCountry:
      typeof obj.residenceCountry === 'string'
        ? (obj.residenceCountry as SelfCheckProfile['residenceCountry'])
        : '',
    workOrStudyAuthorizedInTarget:
      obj.workOrStudyAuthorizedInTarget === 'yes' ||
      obj.workOrStudyAuthorizedInTarget === 'no' ||
      obj.workOrStudyAuthorizedInTarget === 'unsure'
        ? obj.workOrStudyAuthorizedInTarget
        : '',
    educationLevel:
      typeof obj.educationLevel === 'string'
        ? (obj.educationLevel as SelfCheckProfile['educationLevel'])
        : '',
    languages: validLanguages,
    preferredModality:
      obj.preferredModality === 'online' ||
      obj.preferredModality === 'onsite' ||
      obj.preferredModality === 'hybrid'
        ? obj.preferredModality
        : '',
    experienceLevel:
      typeof obj.experienceLevel === 'string'
        ? (obj.experienceLevel as SelfCheckProfile['experienceLevel'])
        : '',
  };
}

function normalizePreferences(raw: unknown): UserPreferences {
  const defaults = createDefaultPreferences();
  if (!raw || typeof raw !== 'object') return defaults;
  const obj = raw as Record<string, unknown>;

  const locale: Locale = obj.locale === 'es' || obj.locale === 'en' ? obj.locale : defaults.locale;
  const pref =
    obj.inferencePreference === 'PREFER_ON_DEVICE' ||
    obj.inferencePreference === 'ONLY_ON_DEVICE' ||
    obj.inferencePreference === 'PREFER_IN_CLOUD' ||
    obj.inferencePreference === 'ONLY_IN_CLOUD'
      ? obj.inferencePreference
      : defaults.inferencePreference;

  const tourStatus =
    obj.tourStatus === 'never' || obj.tourStatus === 'completed' || obj.tourStatus === 'dismissed'
      ? obj.tourStatus
      : defaults.tourStatus;

  return {
    version: 1,
    locale,
    inferencePreference: pref,
    cloudConsentGranted: obj.cloudConsentGranted === true,
    introVersionSeen: typeof obj.introVersionSeen === 'string' ? obj.introVersionSeen : null,
    tourStatus,
    tourVersion: typeof obj.tourVersion === 'string' ? obj.tourVersion : CURRENT_TOUR_VERSION,
  };
}

export class LocalRouteAdapter implements RoutePort {
  loadRoute(): PersistenceResult<MyRouteState> {
    const { available, raw } = readJsonItem<unknown>(STORAGE_KEYS.route);
    return {
      ok: available,
      value: raw ? normalizeMyRouteState(raw) : emptyMyRouteState,
      storageAvailable: available,
      ...(available ? {} : { errorCode: 'STORAGE_UNAVAILABLE' as const }),
    };
  }

  saveRoute(state: MyRouteState): PersistenceResult<MyRouteState> {
    const normalized = normalizeMyRouteState(state);
    return writeJsonItem(STORAGE_KEYS.route, normalized);
  }

  loadProfile(): PersistenceResult<SelfCheckProfile> {
    const { available, raw } = readJsonItem<unknown>(STORAGE_KEYS.profile);
    return {
      ok: available,
      value: normalizeProfile(raw),
      storageAvailable: available,
      ...(available ? {} : { errorCode: 'STORAGE_UNAVAILABLE' as const }),
    };
  }

  saveProfile(profile: SelfCheckProfile): PersistenceResult<SelfCheckProfile> {
    return writeJsonItem(STORAGE_KEYS.profile, normalizeProfile(profile));
  }

  loadPreferences(): PersistenceResult<UserPreferences> {
    const { available, raw } = readJsonItem<unknown>(STORAGE_KEYS.prefs);
    return {
      ok: available,
      value: normalizePreferences(raw),
      storageAvailable: available,
      ...(available ? {} : { errorCode: 'STORAGE_UNAVAILABLE' as const }),
    };
  }

  savePreferences(prefs: UserPreferences): PersistenceResult<UserPreferences> {
    return writeJsonItem(STORAGE_KEYS.prefs, normalizePreferences(prefs));
  }

  clearAllLocalData(): PersistenceResult<void> {
    const storage = getSafeStorage();
    if (!storage) {
      return {
        ok: false,
        value: undefined,
        storageAvailable: false,
        errorCode: 'STORAGE_UNAVAILABLE',
      };
    }
    try {
      storage.removeItem(STORAGE_KEYS.route);
      storage.removeItem(STORAGE_KEYS.profile);
      storage.removeItem(STORAGE_KEYS.prefs);
      return { ok: true, value: undefined, storageAvailable: true };
    } catch {
      return {
        ok: false,
        value: undefined,
        storageAvailable: true,
        errorCode: 'STORAGE_WRITE_FAILED',
      };
    }
  }
}

export const localRouteAdapter = new LocalRouteAdapter();
