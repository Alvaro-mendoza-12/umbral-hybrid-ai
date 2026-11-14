export const DEFAULT_CLOUD_MODEL_ID = 'gemini-3.5-flash-lite';

export interface FirebaseRuntimeStatus {
  firebaseConfigured: boolean;
  appCheckConfigured: boolean;
  appCheckMode: 'recaptcha_enterprise' | 'debug' | 'unconfigured';
  cloudModelId: string;
  missingVars: string[];
}

export interface FirebasePublicConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  siteKey: string;
  debugToken: string;
}

const PLACEHOLDER_VALUES = new Set(['', 'undefined', 'null', 'demo', 'changeme']);

export function cleanEnvValue(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (PLACEHOLDER_VALUES.has(trimmed.toLowerCase()) || trimmed.startsWith('your-')) {
    return '';
  }
  return trimmed;
}

export function getFirebaseRuntimeStatus(): FirebaseRuntimeStatus {
  const apiKey = cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY);
  const projectId = cleanEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID);
  const appId = cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID);
  const siteKey = cleanEnvValue(import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY);
  const debugToken = cleanEnvValue(import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN);
  const cloudModelId =
    cleanEnvValue(import.meta.env.VITE_FIREBASE_AI_CLOUD_MODEL) || DEFAULT_CLOUD_MODEL_ID;

  const missingVars: string[] = [];
  if (!apiKey) missingVars.push('VITE_FIREBASE_API_KEY');
  if (!projectId) missingVars.push('VITE_FIREBASE_PROJECT_ID');
  if (!appId) missingVars.push('VITE_FIREBASE_APP_ID');

  const firebaseConfigured = missingVars.length === 0;
  let appCheckMode: FirebaseRuntimeStatus['appCheckMode'] = 'unconfigured';

  if (firebaseConfigured && siteKey) {
    appCheckMode = 'recaptcha_enterprise';
  } else if (firebaseConfigured && !import.meta.env.PROD && debugToken) {
    appCheckMode = 'debug';
  }

  return {
    firebaseConfigured,
    appCheckConfigured: appCheckMode !== 'unconfigured',
    appCheckMode,
    cloudModelId,
    missingVars,
  };
}

export function readFirebasePublicConfig(): FirebasePublicConfig {
  return {
    apiKey: cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: cleanEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || undefined,
    projectId: cleanEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: cleanEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || undefined,
    messagingSenderId:
      cleanEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || undefined,
    appId: cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID),
    siteKey: cleanEnvValue(import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY),
    debugToken: cleanEnvValue(import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN),
  };
}
