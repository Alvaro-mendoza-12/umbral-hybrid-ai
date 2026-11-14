import { getAI, GoogleAIBackend, type AI } from 'firebase/ai';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';
import {
  getFirebaseRuntimeStatus,
  readFirebasePublicConfig,
  type FirebaseRuntimeStatus,
} from './firebaseStatus';

export interface InitializedFirebaseServices {
  app: FirebaseApp;
  ai: AI;
  appCheck: AppCheck | null;
  status: FirebaseRuntimeStatus;
}

let cachedServices: InitializedFirebaseServices | null = null;
let cachedAppCheck: AppCheck | null = null;
let cachedAi: AI | null = null;

export function getOrInitFirebaseAIServices(): InitializedFirebaseServices | null {
  const status = getFirebaseRuntimeStatus();
  if (!status.firebaseConfigured) {
    return null;
  }

  if (cachedServices) {
    return cachedServices;
  }

  const publicConfig = readFirebasePublicConfig();
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: publicConfig.apiKey,
          authDomain: publicConfig.authDomain,
          projectId: publicConfig.projectId,
          storageBucket: publicConfig.storageBucket,
          messagingSenderId: publicConfig.messagingSenderId,
          appId: publicConfig.appId,
        });

  if (!cachedAppCheck && publicConfig.siteKey && typeof window !== 'undefined') {
    if (!import.meta.env.PROD && publicConfig.debugToken) {
      const globalSelf = window as unknown as Record<string, unknown>;
      globalSelf.FIREBASE_APPCHECK_DEBUG_TOKEN =
        publicConfig.debugToken === 'true' ? true : publicConfig.debugToken;
    }

    cachedAppCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(publicConfig.siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }

  if (!cachedAi) {
    cachedAi = getAI(app, {
      backend: new GoogleAIBackend(),
      useLimitedUseAppCheckTokens: true,
    });
  }

  cachedServices = {
    app,
    ai: cachedAi,
    appCheck: cachedAppCheck,
    status,
  };

  return cachedServices;
}
