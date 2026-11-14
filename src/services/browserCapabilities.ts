import type { Locale, OnDeviceAvailability } from '../domain/types';

export interface ChromeLanguageModelExpected {
  type: 'text' | 'image' | 'audio';
  languages?: string[];
}

export interface ChromeLanguageModelProvider {
  availability(options?: {
    expectedInputs?: ChromeLanguageModelExpected[];
    expectedOutputs?: ChromeLanguageModelExpected[];
  }): Promise<string>;
}

export interface BrowserPromptCapabilities {
  browserSupportsPromptApi: boolean;
  onDeviceAvailability: OnDeviceAvailability;
  requestedLocaleSupported: boolean;
  englishFallbackSupported: boolean;
  userAgentSummary: string;
  reason?: string;
}

function getGlobalLanguageModel(): ChromeLanguageModelProvider | undefined {
  if (typeof globalThis === 'undefined') return undefined;
  const candidate = (globalThis as Record<string, unknown>).LanguageModel;
  if (
    candidate &&
    (typeof candidate === 'object' || typeof candidate === 'function') &&
    typeof (candidate as ChromeLanguageModelProvider).availability === 'function'
  ) {
    return candidate as ChromeLanguageModelProvider;
  }
  return undefined;
}

function normalizeAvailability(raw: unknown): OnDeviceAvailability {
  if (raw === 'available' || raw === 'readily') return 'available';
  if (raw === 'downloadable' || raw === 'after-download') return 'downloadable';
  if (raw === 'downloading') return 'downloading';
  if (raw === 'unavailable' || raw === 'no') return 'unavailable';
  return 'unsupported';
}

export function getUserAgentSummary(): string {
  if (typeof navigator === 'undefined' || !navigator.userAgent) {
    return 'Unknown runtime environment';
  }
  const ua = navigator.userAgent;
  const edgeMatch = ua.match(/Edg\/(\d+)/);
  if (edgeMatch?.[1]) {
    return `Microsoft Edge ${edgeMatch[1]}`;
  }
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch?.[1] && !ua.includes('OPR/')) {
    return `Google Chrome ${chromeMatch[1]}`;
  }
  if (ua.includes('Firefox/')) {
    const ff = ua.match(/Firefox\/(\d+)/);
    return ff?.[1] ? `Mozilla Firefox ${ff[1]}` : 'Mozilla Firefox';
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    return 'Apple Safari / WebKit';
  }
  return 'Web browser';
}

export function isNavigatorOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

async function probeAvailabilityForLanguages(
  provider: ChromeLanguageModelProvider,
  languages: string[],
): Promise<OnDeviceAvailability> {
  try {
    const result = await provider.availability({
      expectedInputs: [{ type: 'text', languages }],
      expectedOutputs: [{ type: 'text', languages }],
    });
    return normalizeAvailability(result);
  } catch {
    return 'unavailable';
  }
}

export async function probeBrowserCapabilities(
  locale: Locale = 'en',
): Promise<BrowserPromptCapabilities> {
  const userAgentSummary = getUserAgentSummary();
  const provider = getGlobalLanguageModel();

  if (!provider) {
    return {
      browserSupportsPromptApi: false,
      onDeviceAvailability: 'unsupported',
      requestedLocaleSupported: false,
      englishFallbackSupported: false,
      userAgentSummary,
      reason:
        'Chrome Prompt API (LanguageModel) is not exposed in this browser context. On-device AI requires Chrome desktop 139+ with built-in AI enabled.',
    };
  }

  const localeAvailability = await probeAvailabilityForLanguages(provider, [locale]);
  const englishAvailability =
    locale === 'en'
      ? localeAvailability
      : await probeAvailabilityForLanguages(provider, ['en']);

  const effectiveAvailability =
    localeAvailability !== 'unavailable' && localeAvailability !== 'unsupported'
      ? localeAvailability
      : englishAvailability;

  const requestedLocaleSupported =
    localeAvailability === 'available' ||
    localeAvailability === 'downloadable' ||
    localeAvailability === 'downloading';
  const englishFallbackSupported =
    englishAvailability === 'available' ||
    englishAvailability === 'downloadable' ||
    englishAvailability === 'downloading';

  let reason: string | undefined;
  if (effectiveAvailability === 'unavailable') {
    reason =
      'LanguageModel API exists, but the local Gemini Nano model is unavailable on this hardware/disk configuration.';
  } else if (effectiveAvailability === 'downloadable') {
    reason =
      'Local Gemini Nano weights can be downloaded on user interaction before offline inference.';
  } else if (effectiveAvailability === 'downloading') {
    reason = 'Local Gemini Nano weights are currently downloading in Chrome.';
  } else if (locale !== 'en' && !requestedLocaleSupported && englishFallbackSupported) {
    reason =
      'Chrome on-device model currently reports English-only support in this build; Spanish queries may fall back to cloud if consented.';
  }

  return {
    browserSupportsPromptApi: true,
    onDeviceAvailability: effectiveAvailability,
    requestedLocaleSupported,
    englishFallbackSupported,
    userAgentSummary,
    reason,
  };
}
