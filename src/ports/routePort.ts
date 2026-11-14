import type {
  MyRouteState,
  SelfCheckProfile,
  UserPreferences,
} from '../domain/types';

export interface PersistenceResult<T> {
  ok: boolean;
  value: T;
  storageAvailable: boolean;
  errorCode?: 'STORAGE_UNAVAILABLE' | 'STORAGE_WRITE_FAILED';
}

export interface RoutePort {
  loadRoute(): PersistenceResult<MyRouteState>;
  saveRoute(state: MyRouteState): PersistenceResult<MyRouteState>;
  loadProfile(): PersistenceResult<SelfCheckProfile>;
  saveProfile(profile: SelfCheckProfile): PersistenceResult<SelfCheckProfile>;
  loadPreferences(): PersistenceResult<UserPreferences>;
  savePreferences(prefs: UserPreferences): PersistenceResult<UserPreferences>;
  clearAllLocalData(): PersistenceResult<void>;
}
