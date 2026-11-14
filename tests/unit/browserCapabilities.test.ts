import { afterEach, describe, expect, it, vi } from 'vitest';
import { probeBrowserCapabilities } from '../../src/services/browserCapabilities';

describe('probeBrowserCapabilities', () => {
  const originalLanguageModel = (globalThis as Record<string, unknown>).LanguageModel;

  afterEach(() => {
    if (originalLanguageModel === undefined) {
      delete (globalThis as Record<string, unknown>).LanguageModel;
    } else {
      (globalThis as Record<string, unknown>).LanguageModel = originalLanguageModel;
    }
    vi.restoreAllMocks();
  });

  it('recognizes WebIDL function-shaped window.LanguageModel exposed by Chrome desktop', async () => {
    class MockLanguageModel {
      static async availability() {
        return 'downloadable';
      }
    }
    (globalThis as Record<string, unknown>).LanguageModel = MockLanguageModel;

    const caps = await probeBrowserCapabilities('en');

    expect(caps.browserSupportsPromptApi).toBe(true);
    expect(caps.onDeviceAvailability).toBe('downloadable');
    expect(caps.requestedLocaleSupported).toBe(true);
  });

  it('distinguishes Prompt API present with unavailable local model from unsupported browsers', async () => {
    (globalThis as Record<string, unknown>).LanguageModel = {
      availability: async () => 'unavailable',
    };

    const caps = await probeBrowserCapabilities('es');

    expect(caps.browserSupportsPromptApi).toBe(true);
    expect(caps.onDeviceAvailability).toBe('unavailable');
    expect(caps.requestedLocaleSupported).toBe(false);
    expect(caps.englishFallbackSupported).toBe(false);
  });

  it('reports unsupported cleanly when LanguageModel is absent', async () => {
    delete (globalThis as Record<string, unknown>).LanguageModel;

    const caps = await probeBrowserCapabilities('en');

    expect(caps.browserSupportsPromptApi).toBe(false);
    expect(caps.onDeviceAvailability).toBe('unsupported');
  });
});
