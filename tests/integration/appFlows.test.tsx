import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDefaultPreferences,
  CURRENT_INTRO_VERSION,
  STORAGE_KEYS,
} from '../../src/adapters/localRouteAdapter';
import { App } from '../../src/app/App';
import type { AICapabilityReport, HybridAIPort } from '../../src/ports/aiPort';

function seedCompletedOnboarding(locale: 'en' | 'es' = 'en') {
  const prefs = createDefaultPreferences(locale);
  prefs.introVersionSeen = CURRENT_INTRO_VERSION;
  prefs.tourStatus = 'completed';
  window.localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(prefs));
}

function createMockAiPort(availability: AICapabilityReport['onDeviceAvailability'] = 'downloadable'): {
  port: HybridAIPort;
  runStructuredTask: ReturnType<typeof vi.fn>;
  runCloudFollowUp: ReturnType<typeof vi.fn>;
} {
  const runStructuredTask = vi.fn(async (input) => ({
    requestId: input.requestId,
    schemaVersion: 1 as const,
    kind: input.kind,
    opportunityId: input.opportunity.id,
    sourceVersion: input.opportunity.sourceVersion,
    summary:
      input.preference === 'ONLY_IN_CLOUD'
        ? 'Cloud verified summary from Gemini.'
        : 'Local summary from Chrome Gemini Nano.',
    groundedRequirements: [
      {
        text: 'Official registration window verified in source.',
        evidenceIds: [input.fragments[0]?.id ?? 'meta-overview'],
      },
    ],
    suggestedActions: [
      {
        text: 'Gather official academic transcript copy',
        evidenceIds: [input.fragments[0]?.id ?? 'meta-overview'],
      },
    ],
    unknowns: ['Exact selection committee interview week'],
    cautionNote: 'Informational guidance only. Always verify on official source.',
    inferenceSource:
      input.preference === 'ONLY_IN_CLOUD' ? ('IN_CLOUD' as const) : ('ON_DEVICE' as const),
    requestedMode: input.preference,
    modelId:
      input.preference === 'ONLY_IN_CLOUD'
        ? 'gemini-3.5-flash-lite'
        : 'chrome-prompt-api-gemini-nano',
    latencyMs: 65,
    completedAt: new Date().toISOString(),
  }));

  const runCloudFollowUp = vi.fn(async (input) => ({
    requestId: input.requestId,
    answer: 'Focus on [meta-cost-deadline] before submitting.',
    inferenceSource: 'IN_CLOUD' as const,
    modelId: 'gemini-3.5-flash-lite',
    latencyMs: 140,
  }));

  return {
    port: {
      inspectCapabilities: vi.fn(async () => ({
        browserSupportsPromptApi: availability !== 'unsupported',
        onDeviceAvailability: availability,
        firebaseConfigured: true,
        appCheckConfigured: true,
        appCheckMode: 'recaptcha_enterprise' as const,
        cloudModelId: 'gemini-3.5-flash-lite',
        userAgentSummary: 'Google Chrome 157',
      })),
      initializeOnDeviceModel: vi.fn(async () => undefined),
      runStructuredTask,
      runCloudFollowUp,
    },
    runStructuredTask,
    runCloudFollowUp,
  };
}

describe('UMBRAL Hybrid AI integration flows', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('guides search -> detail -> self-check -> cloud consent -> AI provenance -> add step -> My Route persistence', async () => {
    seedCompletedOnboarding('en');
    const user = userEvent.setup();
    const { port, runStructuredTask } = createMockAiPort('downloadable');

    render(<App ports={{ ai: port }} />);

    // 1. Filter on Explore
    const searchInput = await screen.findByLabelText(/Search title, institution, or requirement/i);
    await user.type(searchInput, 'ETH Zurich');

    const detailLink = await screen.findByRole('link', { name: /ETH Zurich ESOP/i });
    await user.click(detailLink);

    // 2. Self-check 4-state evaluation
    const countrySelect = await screen.findByLabelText(/Country of residence/i);
    await user.selectOptions(countrySelect, 'PE');

    const eduSelect = screen.getByLabelText(/Highest completed or current level/i);
    await user.selectOptions(eduSelect, 'technical');

    expect(screen.getAllByText('Mismatch').length).toBeGreaterThan(0);

    // 3. Click Explain requirements without Cloud Consent -> blocks silently fallback & asks consent
    await user.click(screen.getByRole('button', { name: /Explain requirements/i }));

    expect(await screen.findByText(/Cloud AI Consent Required/i)).toBeInTheDocument();
    expect(runStructuredTask).not.toHaveBeenCalled();

    // 4. Grant consent and run Explain requirements -> displays IN_CLOUD inference badge
    await user.click(
      screen.getByRole('button', { name: /Allow Firebase Cloud AI for this browser/i }),
    );
    await user.selectOptions(
      screen.getByLabelText(/Active mode/i),
      'ONLY_IN_CLOUD',
    );
    await user.click(screen.getByRole('button', { name: /Explain requirements/i }));

    const resultBox = await screen.findByTestId('structured-ai-result');
    expect(resultBox).toHaveTextContent(/Cloud verified summary from Gemini/i);
    expect(resultBox).toHaveTextContent(/Ran in cloud/i);

    // 5. Add AI suggested step to My Route and navigate to My Route
    await user.click(screen.getByRole('button', { name: /Add to My Route/i }));
    const routeLinks = screen.getAllByRole('link', { name: /My Route/i });
    await user.click(routeLinks[0]!);

    expect(await screen.findByRole('heading', { name: /^My Route$/i })).toBeInTheDocument();
    expect(screen.getByText(/Gather official academic transcript copy/i)).toBeInTheDocument();

    // Verify Confirm Replace guard for Active Goal
    const goalInput = await screen.findByRole('textbox', { name: /Goal statement/i });
    await user.type(goalInput, 'Submit ETH ESOP dossier');
    await user.click(screen.getByRole('button', { name: /Save goal/i }));

    await user.clear(goalInput);
    await user.type(goalInput, 'Switch goal immediately');
    await user.click(screen.getByRole('button', { name: /Save goal/i }));

    expect(await screen.findByText(/Replace your current goal\?/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Replace goal/i }));
    expect(screen.getByText('Switch goal immediately')).toBeInTheDocument();
  });

  it('runs ON_DEVICE locally with zero cloud transmission when Chrome Gemini Nano is ready', async () => {
    seedCompletedOnboarding('en');
    const user = userEvent.setup();
    const { port, runStructuredTask } = createMockAiPort('available');

    render(<App ports={{ ai: port }} />);
    const detailLink = await screen.findByRole('link', { name: /ETH Zurich ESOP/i });
    await user.click(detailLink);

    await user.click(await screen.findByRole('button', { name: /Explain requirements/i }));

    const resultBox = await screen.findByTestId('structured-ai-result');
    expect(resultBox).toHaveTextContent(/Ran on-device/i);
    expect(runStructuredTask).toHaveBeenCalledWith(
      expect.objectContaining({ preference: 'ONLY_ON_DEVICE' }),
    );
  });

  it('supports bilingual EN <-> ES toggle and guided tour completion persistence', async () => {
    // Seed intro already seen so 4-step tour opens immediately
    const prefs = createDefaultPreferences('en');
    prefs.introVersionSeen = CURRENT_INTRO_VERSION;
    prefs.tourStatus = 'never';
    window.localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(prefs));

    const user = userEvent.setup();
    const { port } = createMockAiPort('unsupported');

    render(<App ports={{ ai: port }} />);

    const tour = await screen.findByTestId('onboarding-tour');
    expect(tour).toHaveTextContent(/Step 1 of 4/i);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(tour).toHaveTextContent(/Step 2 of 4/i);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    await waitFor(() => {
      expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument();
    });

    const esButton = screen.getByRole('button', { name: 'ES' });
    await user.click(esButton);
    expect(await screen.findByText(/Buscador rápido en 3 clics/i)).toBeInTheDocument();
  });
});
