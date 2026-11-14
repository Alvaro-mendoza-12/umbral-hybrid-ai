import { describe, expect, it, vi } from 'vitest';
import {
  LocalRouteAdapter,
  STORAGE_KEYS,
} from '../../src/adapters/localRouteAdapter';
import { emptyMyRouteState } from '../../src/domain/routeRules';

describe('LocalRouteAdapter persistence and resilience', () => {
  it('recovers gracefully from corrupt localStorage JSON payloads', () => {
    window.localStorage.setItem(STORAGE_KEYS.route, '{not-valid-json');
    window.localStorage.setItem(STORAGE_KEYS.prefs, 'corrupted');
    window.localStorage.setItem(STORAGE_KEYS.profile, 'corrupted');

    const adapter = new LocalRouteAdapter();
    expect(adapter.loadRoute()).toMatchObject({
      ok: true,
      storageAvailable: true,
      value: emptyMyRouteState,
    });
    expect(adapter.loadPreferences().ok).toBe(true);
    expect(adapter.loadProfile().ok).toBe(true);
  });

  it('reports STORAGE_UNAVAILABLE when localStorage throws SecurityError', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededOrDisabled');
      });

    const adapter = new LocalRouteAdapter();
    const res = adapter.saveRoute(emptyMyRouteState);
    expect(res.ok).toBe(false);
    expect(res.storageAvailable).toBe(false);
    expect(res.errorCode).toBe('STORAGE_UNAVAILABLE');

    setItemSpy.mockRestore();
  });

  it('clears all UMBRAL keys on clearAllLocalData', () => {
    const adapter = new LocalRouteAdapter();
    const prefs = adapter.loadPreferences().value;
    prefs.cloudConsentGranted = true;
    adapter.savePreferences(prefs);

    expect(window.localStorage.getItem(STORAGE_KEYS.prefs)).not.toBeNull();
    const wiped = adapter.clearAllLocalData();
    expect(wiped.ok).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEYS.prefs)).toBeNull();
  });
});
