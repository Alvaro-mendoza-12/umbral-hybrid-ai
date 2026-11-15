import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getFirebaseRuntimeStatus,
  readFirebasePublicConfig,
} from '../../src/adapters/firebase/firebaseStatus';

describe('Firebase App Check environment boundary', () => {
  afterEach(() => vi.unstubAllEnvs());

  function configureFirebase(production: boolean, siteKey = '') {
    vi.stubEnv('PROD', production);
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-placeholder');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app');
    vi.stubEnv('VITE_RECAPTCHA_ENTERPRISE_SITE_KEY', siteKey);
    vi.stubEnv('VITE_APP_CHECK_DEBUG_TOKEN', 'true');
  }

  it('requires a production provider even when debug is enabled in the build environment', () => {
    configureFirebase(true);

    expect(readFirebasePublicConfig().debugToken).toBe('');
    expect(getFirebaseRuntimeStatus()).toMatchObject({
      firebaseConfigured: true,
      appCheckConfigured: false,
      appCheckMode: 'unconfigured',
    });
  });

  it('uses reCAPTCHA Enterprise in production and excludes the debug configuration', () => {
    configureFirebase(true, 'test-site-key');

    expect(readFirebasePublicConfig().debugToken).toBe('');
    expect(getFirebaseRuntimeStatus()).toMatchObject({
      appCheckConfigured: true,
      appCheckMode: 'recaptcha_enterprise',
    });
  });

  it('keeps local development debug mode available', () => {
    configureFirebase(false);

    expect(readFirebasePublicConfig().debugToken).toBe('true');
    expect(getFirebaseRuntimeStatus()).toMatchObject({
      appCheckConfigured: true,
      appCheckMode: 'debug',
    });
  });
});
