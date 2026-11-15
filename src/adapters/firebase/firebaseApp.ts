import { getAI, GoogleAIBackend, type AI } from 'firebase/ai';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  CustomProvider,
  getToken,
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
  appCheckReady: Promise<void>;
  status: FirebaseRuntimeStatus;
}

let cachedServices: InitializedFirebaseServices | null = null;
let cachedAppCheck: AppCheck | null = null;
let cachedAppCheckReady: Promise<void> = Promise.resolve();
let cachedAi: AI | null = null;

export function getOrInitFirebaseAIServices(): InitializedFirebaseServices | null {
  const status = getFirebaseRuntimeStatus();
  if (!status.firebaseConfigured) {
    return null;
  }

  if (cachedServices) {
    return {
      ...cachedServices,
      status,
    };
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

  if (!cachedAppCheck && typeof self !== 'undefined') {
    if (!import.meta.env.PROD && publicConfig.debugToken) {
      const globalScope = self as unknown as {
        FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
      };
      globalScope.FIREBASE_APPCHECK_DEBUG_TOKEN =
        publicConfig.debugToken === 'true' ? true : publicConfig.debugToken;

      cachedAppCheck = initializeAppCheck(app, {
        provider: new CustomProvider({
          getToken: async () => {
            throw new Error(
              'App Check CustomProvider fallback should not be called while debug mode is active.',
            );
          },
        }),
        isTokenAutoRefreshEnabled: true,
      });
    } else if (publicConfig.siteKey) {
      cachedAppCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(publicConfig.siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }

    if (cachedAppCheck) {
      cachedAppCheckReady = getToken(cachedAppCheck, false)
        .then(() => undefined)
        .catch(() => undefined);
    }
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
    appCheckReady: cachedAppCheckReady,
    status,
  };

  return cachedServices;
}
