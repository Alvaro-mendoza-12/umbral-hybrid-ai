import { afterEach, describe, expect, it, vi } from 'vitest';
import { getFirebaseRuntimeStatus } from '../../src/adapters/firebase/firebaseStatus';
import {
  FirebaseHybridAIAdapter,
  isTransientAppCheckError,
  mapAdapterError,
  withAppCheckRetry,
} from '../../src/adapters/firebase/hybridAiAdapter';
import { curatedOpportunities } from '../../src/data/opportunities';
import { buildSourceFragments } from '../../src/domain/aiContract';

describe('FirebaseHybridAIAdapter', () => {
  const originalLanguageModel = (globalThis as Record<string, unknown>).LanguageModel;

  afterEach(() => {
    vi.unstubAllEnvs();
    delete (self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN;
    if (originalLanguageModel === undefined) {
      delete (globalThis as Record<string, unknown>).LanguageModel;
    } else {
      (globalThis as Record<string, unknown>).LanguageModel = originalLanguageModel;
    }
    vi.restoreAllMocks();
  });

  it('reports Firebase and App Check as unconfigured when env variables are absent', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '');
    delete (globalThis as Record<string, unknown>).LanguageModel;

    const adapter = new FirebaseHybridAIAdapter();
    const report = await adapter.inspectCapabilities('en');

    expect(report.firebaseConfigured).toBe(false);
    expect(report.appCheckConfigured).toBe(false);
    expect(report.appCheckMode).toBe('unconfigured');
    expect(report.onDeviceAvailability).toBe('unsupported');
  });

  it('rejects cloud, structured, follow-up, and download calls cleanly when Firebase is unconfigured', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'demo');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'your-project-id');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '');

    const adapter = new FirebaseHybridAIAdapter();
    const opportunity = curatedOpportunities[0]!;
    const fragments = buildSourceFragments(opportunity, 'en');

    await expect(adapter.initializeOnDeviceModel()).rejects.toMatchObject({
      code: 'FIREBASE_NOT_CONFIGURED',
    });

    await expect(
      adapter.runStructuredTask({
        requestId: 'req-cloud',
        kind: 'EXPLAIN_REQUIREMENTS',
        locale: 'en',
        opportunity,
        fragments,
        preference: 'ONLY_IN_CLOUD',
      }),
    ).rejects.toMatchObject({ code: 'FIREBASE_NOT_CONFIGURED' });

    await expect(
      adapter.runStructuredTask({
        requestId: 'req-local',
        kind: 'PREPARE_NEXT_STEPS',
        locale: 'en',
        opportunity,
        fragments,
        preference: 'ONLY_ON_DEVICE',
      }),
    ).rejects.toMatchObject({ code: 'FIREBASE_NOT_CONFIGURED' });

    await expect(
      adapter.runCloudFollowUp({
        requestId: 'req-followup',
        locale: 'en',
        opportunity,
        fragments,
        history: [],
        question: 'What are the key conditions?',
      }),
    ).rejects.toMatchObject({ code: 'FIREBASE_NOT_CONFIGURED' });
  });

  it('blocks ONLY_ON_DEVICE execution immediately when Chrome LanguageModel is not ready', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key-123');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'umbral-test-proj');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456:web:abcdef');
    (globalThis as Record<string, unknown>).LanguageModel = {
      availability: async () => 'downloadable',
    };

    const adapter = new FirebaseHybridAIAdapter();
    const opportunity = curatedOpportunities[0]!;
    const fragments = buildSourceFragments(opportunity, 'en');

    await expect(
      adapter.runStructuredTask({
        requestId: 'req-strict-local',
        kind: 'EXPLAIN_REQUIREMENTS',
        locale: 'en',
        opportunity,
        fragments,
        preference: 'ONLY_ON_DEVICE',
      }),
    ).rejects.toMatchObject({ code: 'ON_DEVICE_UNAVAILABLE' });
  });

  it('prioritizes local debug token mode in non-production runtime status and detects reCAPTCHA Enterprise mode', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key-123');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'umbral-test-proj');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456:web:abcdef');
    vi.stubEnv('VITE_RECAPTCHA_ENTERPRISE_SITE_KEY', '6LeSiteKey123');
    vi.stubEnv('VITE_APP_CHECK_DEBUG_TOKEN', '');

    const enterpriseStatus = getFirebaseRuntimeStatus();
    expect(enterpriseStatus.firebaseConfigured).toBe(true);
    expect(enterpriseStatus.appCheckConfigured).toBe(true);
    expect(enterpriseStatus.appCheckMode).toBe('recaptcha_enterprise');

    vi.stubEnv('VITE_APP_CHECK_DEBUG_TOKEN', 'true');
    const debugStatus = getFirebaseRuntimeStatus();
    expect(debugStatus.appCheckConfigured).toBe(true);
    expect(debugStatus.appCheckMode).toBe('debug');
  });

  it('distinguishes cloud API_NOT_ENABLED and 429 quota errors from local LanguageModel unavailability', async () => {
    const sdk = await import('firebase/ai');

    const cloudServiceDisabledErr = new sdk.AIError(
      sdk.AIErrorCode.API_NOT_ENABLED,
      "The Firebase AI SDK requires the Firebase AI API ('firebasevertexai.googleapis.com') to be enabled in your Firebase project.",
    );
    expect(mapAdapterError(sdk, cloudServiceDisabledErr, 'ONLY_IN_CLOUD').code).toBe(
      'AI_EXECUTION_FAILED',
    );

    const localDisabledErr = new sdk.AIError(
      sdk.AIErrorCode.API_NOT_ENABLED,
      'Local LanguageModel API not available in this environment.',
    );
    expect(mapAdapterError(sdk, localDisabledErr, 'PREFER_ON_DEVICE').code).toBe(
      'ON_DEVICE_UNAVAILABLE',
    );

    const quotaErr = new sdk.AIError(
      sdk.AIErrorCode.RESPONSE_ERROR,
      '429 RESOURCE_EXHAUSTED: Quota exceeded for gemini-3.5-flash-lite.',
    );
    expect(mapAdapterError(sdk, quotaErr, 'ONLY_IN_CLOUD').code).toBe(
      'AI_SAFETY_OR_QUOTA',
    );
  });

  it('classifies AppCheck / reCAPTCHA errors as APP_CHECK_FAILED and strips raw endpoint URLs', async () => {
    const sdk = await import('firebase/ai');
    const recaptchaErr = new sdk.AIError(
      sdk.AIErrorCode.ERROR,
      'AI: Error fetching from https://firebasevertexai.googleapis.com/v1beta/projects/umbral-21e8b/models/gemini-3.5-flash-lite:generateContent: FirebaseError: AppCheck: ReCAPTCHA error. (appCheck/recaptcha-error) (AI/error)',
    );
    const mapped = mapAdapterError(sdk, recaptchaErr, 'ONLY_IN_CLOUD');
    expect(mapped.code).toBe('APP_CHECK_FAILED');
    expect(mapped.message).not.toContain('https://');
    expect(mapped.message).not.toContain('firebasevertexai.googleapis.com');
    expect(mapped.message).toContain('appCheck/recaptcha-error');
  });

  it('initializes Firebase project umbral-21e8b cleanly with App Check Debug Provider in non-production dev mode', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'AIzaSyTestKeyForProjectCheck');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'umbral-21e8b.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'umbral-21e8b');
    vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'umbral-21e8b.firebasestorage.app');
    vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '2458204140');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:2458204140:web:3ee64e487472f3c97b32c9');
    vi.stubEnv('VITE_RECAPTCHA_ENTERPRISE_SITE_KEY', '');
    vi.stubEnv('VITE_APP_CHECK_DEBUG_TOKEN', '');
    vi.stubEnv('VITE_FIREBASE_AI_CLOUD_MODEL', 'gemini-3.5-flash-lite');

    const unconfiguredStatus = getFirebaseRuntimeStatus();
    expect(unconfiguredStatus.firebaseConfigured).toBe(true);
    expect(unconfiguredStatus.appCheckConfigured).toBe(false);
    expect(unconfiguredStatus.appCheckMode).toBe('unconfigured');

    vi.stubEnv('VITE_APP_CHECK_DEBUG_TOKEN', 'true');

    const adapter = new FirebaseHybridAIAdapter();
    const report = await adapter.inspectCapabilities('en');

    expect((self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN).toBe(true);
    expect(report.firebaseConfigured).toBe(true);
    expect(report.firebaseProjectId).toBe('umbral-21e8b');
    expect(report.appCheckConfigured).toBe(true);
    expect(report.appCheckMode).toBe('debug');
    expect(report.cloudModelId).toBe('gemini-3.5-flash-lite');
  });

  it('withAppCheckRetry retries transient App Check errors at most once and respects non-AppCheck errors and AbortSignal', async () => {
    vi.useFakeTimers();
    try {
      const transientErr = new Error(
        'AI: Error fetching from https://firebasevertexai.googleapis.com/...: FirebaseError: AppCheck: ReCAPTCHA error. (appCheck/recaptcha-error)',
      );
      expect(isTransientAppCheckError(transientErr)).toBe(true);
      expect(isTransientAppCheckError(new Error('429 RESOURCE_EXHAUSTED: quota exceeded'))).toBe(false);
      expect(isTransientAppCheckError(new Error('INVALID_AI_OUTPUT: bad json'))).toBe(false);
      expect(isTransientAppCheckError(new DOMException('Aborted', 'AbortError'))).toBe(false);

      // 1) Transient error recovers on the single retry (2 calls total).
      let attempts = 0;
      const succeedOnRetry = vi.fn(async () => {
        attempts += 1;
        if (attempts === 1) throw transientErr;
        return 'ok';
      });
      const retryPromise = withAppCheckRetry(succeedOnRetry);
      await vi.advanceTimersByTimeAsync(900);
      await expect(retryPromise).resolves.toBe('ok');
      expect(succeedOnRetry).toHaveBeenCalledTimes(2);

      // 2) Persistent AppCheck error stops after max 1 retry (2 calls total).
      const alwaysFail = vi.fn(async () => {
        throw transientErr;
      });
      const failPromise = withAppCheckRetry(alwaysFail);
      const rejectionCheck = expect(failPromise).rejects.toThrow('appCheck/recaptcha-error');
      await vi.advanceTimersByTimeAsync(900);
      await rejectionCheck;
      expect(alwaysFail).toHaveBeenCalledTimes(2);

      // 3) Non-AppCheck error is never retried (1 call total).
      const quotaFail = vi.fn(async () => {
        throw new Error('429 RESOURCE_EXHAUSTED: Quota exceeded');
      });
      await expect(withAppCheckRetry(quotaFail)).rejects.toThrow('429 RESOURCE_EXHAUSTED');
      expect(quotaFail).toHaveBeenCalledTimes(1);

      // 4) Abort during backoff prevents the second call.
      const controller = new AbortController();
      const abortFn = vi.fn(async () => {
        throw transientErr;
      });
      const abortedRetry = withAppCheckRetry(abortFn, controller.signal);
      const abortExpectation = expect(abortedRetry).rejects.toMatchObject({ name: 'AbortError' });
      await vi.advanceTimersByTimeAsync(200);
      controller.abort();
      await abortExpectation;
      expect(abortFn).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('runCloudFollowUp awaits appCheckReady and uses a fresh ChatSession per attempt without duplicating turns', async () => {
    vi.useFakeTimers();
    vi.resetModules();
    try {
      vi.stubEnv('VITE_FIREBASE_API_KEY', 'AIzaSyTestKeyForProjectCheck');
      vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'umbral-21e8b');
      vi.stubEnv('VITE_FIREBASE_APP_ID', '1:2458204140:web:3ee64e487472f3c97b32c9');
      vi.stubEnv('VITE_APP_CHECK_DEBUG_TOKEN', 'true');

      const startChatHistories: unknown[] = [];
      let sendAttempts = 0;

      vi.doMock('../../src/adapters/firebase/firebaseApp', () => ({
        getOrInitFirebaseAIServices: () => ({
          app: { options: { projectId: 'umbral-21e8b' } },
          ai: {},
          appCheck: {},
          appCheckReady: Promise.resolve(),
          status: {
            firebaseConfigured: true,
            firebaseProjectId: 'umbral-21e8b',
            appCheckConfigured: true,
            appCheckMode: 'debug',
            cloudModelId: 'gemini-3.5-flash-lite',
            missingVars: [],
          },
        }),
      }));

      vi.doMock('firebase/ai', () => ({
        InferenceMode: {
          ONLY_ON_DEVICE: 'only_on_device',
          ONLY_IN_CLOUD: 'only_in_cloud',
          PREFER_IN_CLOUD: 'prefer_in_cloud',
          PREFER_ON_DEVICE: 'prefer_on_device',
        },
        InferenceSource: {
          ON_DEVICE: 'on_device',
          IN_CLOUD: 'in_cloud',
        },
        AIError: class AIError extends Error {},
        AIErrorCode: { UNSUPPORTED: 'unsupported', API_NOT_ENABLED: 'api-not-enabled', FETCH_ERROR: 'fetch-error', ERROR: 'error' },
        getGenerativeModel: () => ({
          startChat: ({ history }: { history: Array<{ role: string; parts: unknown[] }> }) => {
            startChatHistories.push(history.map((h) => ({ ...h, parts: [...h.parts] })));
            return {
              sendMessage: async (msg: string) => {
                sendAttempts += 1;
                // Simulate ChatSession pushing user turn before failing on attempt 1
                history.push({ role: 'user', parts: [{ type: 'text', text: msg }] });
                if (sendAttempts === 1) {
                  throw new Error('FirebaseError: AppCheck: ReCAPTCHA error. (appCheck/recaptcha-error)');
                }
                return {
                  response: {
                    inferenceSource: 'in_cloud',
                    text: () => 'Respuesta verificada sin turnos duplicados [req-1].',
                  },
                };
              },
            };
          },
        }),
      }));

      const { FirebaseHybridAIAdapter: FreshAdapter } = await import(
        '../../src/adapters/firebase/hybridAiAdapter'
      );
      const adapter = new FreshAdapter();
      const opportunity = curatedOpportunities[0]!;
      const fragments = buildSourceFragments(opportunity, 'en');

      const promise = adapter.runCloudFollowUp({
        requestId: 'req-retry-chat',
        locale: 'en',
        opportunity,
        fragments,
        history: [{ id: 't1', role: 'user', text: 'First question', timestamp: '2026-11-15T00:00:00Z' }],
        question: 'Follow up question',
      });

      await vi.advanceTimersByTimeAsync(900);
      const result = await promise;

      expect(sendAttempts).toBe(2);
      expect(startChatHistories).toHaveLength(2);
      expect(startChatHistories[0]).toHaveLength(1);
      expect(startChatHistories[1]).toHaveLength(1);
      expect(result.inferenceSource).toBe('IN_CLOUD');
      expect(result.answer).toContain('Respuesta verificada');
    } finally {
      vi.doUnmock('../../src/adapters/firebase/firebaseApp');
      vi.doUnmock('firebase/ai');
      vi.resetModules();
      vi.useRealTimers();
    }
  });
});
