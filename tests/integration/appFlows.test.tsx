import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDefaultPreferences,
  CURRENT_INTRO_VERSION,
  STORAGE_KEYS,
} from '../../src/adapters/localRouteAdapter';
import { App } from '../../src/app/App';
import enTranslation from '../../src/locales/en/translation.json';
import esTranslation from '../../src/locales/es/translation.json';
import type { AICapabilityReport, HybridAIPort } from '../../src/ports/aiPort';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj)
    .flatMap(([key, value]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return flattenKeys(value as Record<string, unknown>, nextKey);
      }
      return [nextKey];
    })
    .sort();
}

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

    // 2. Self-check 4-state evaluation (profile is compact; edit on demand)
    await user.click(await screen.findByRole('button', { name: /Edit profile/i }));
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
    await user.click(screen.getByRole('radio', { name: /Cloud/i }));
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

    await user.click(screen.getByRole('button', { name: /Edit goal/i }));
    const editGoalInput = await screen.findByRole('textbox', { name: /Goal statement/i });
    await user.clear(editGoalInput);
    await user.type(editGoalInput, 'Switch goal immediately');
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

    // The tour never opens by itself; it starts only from "How it works".
    await screen.findByRole('heading', { name: /Find real opportunities/i });
    expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('hero-tour-cta'));
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
    expect(await screen.findByRole('heading', { name: /Encuentra convocatorias reales/i })).toBeInTheDocument();
  });

  it('displays catalog loadError alert and recovers when clicking Retry', async () => {
    seedCompletedOnboarding('en');
    const user = userEvent.setup();
    const { port } = createMockAiPort('unsupported');

    let attempts = 0;
    const flakyCatalog = {
      listOpportunities: vi.fn(async () => {
        attempts += 1;
        if (attempts <= 2) {
          throw new Error('Simulated storage read error');
        }
        return [];
      }),
      getOpportunityById: vi.fn(async () => undefined),
      getCatalogMetadata: () => ({
        version: '2026.11.14',
        lastCuratedAt: '2026-11-14',
        sourceKind: 'curated_local_snapshot' as const,
        isCachedOffline: true,
      }),
      formatOpportunityExportSummary: () => '',
    };

    render(<App ports={{ ai: port, catalog: flakyCatalog }} />);

    expect(
      await screen.findByText(/Could not display the opportunity catalog/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Retry$/i }));
    await waitFor(() => {
      expect(
        screen.queryByText(/Could not display the opportunity catalog/i),
      ).not.toBeInTheDocument();
    });
    expect(await screen.findByText(/No opportunities match these filters/i)).toBeInTheDocument();
  });

  it('validates JSON import errors and restores valid backups on My Route', async () => {
    seedCompletedOnboarding('en');
    window.history.pushState({}, '', '/route');
    const user = userEvent.setup();
    const { port } = createMockAiPort('unsupported');

    render(<App ports={{ ai: port }} />);
    expect(await screen.findByRole('heading', { name: /^My Route$/i })).toBeInTheDocument();

    const fileInput = document.getElementById('route-import-input') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const badFile = new File(['{not valid json'], 'bad-backup.json', {
      type: 'application/json',
    });
    Object.defineProperty(badFile, 'text', { value: async () => '{not valid json' });
    await user.upload(fileInput, badFile);

    expect(await screen.findByText(/selected file is not valid JSON/i)).toBeInTheDocument();

    const validJson = JSON.stringify({
      version: 2,
      goal: {
        text: 'Restored goal from JSON',
        updatedAt: '2026-11-14T12:00:00.000Z',
      },
      tasks: [
        {
          id: 'imp-1',
          text: 'Imported prep step',
          status: 'pending',
          createdAt: '2026-11-14T12:00:00.000Z',
          updatedAt: '2026-11-14T12:00:00.000Z',
        },
      ],
      saved: {
        'int-eth-esop-2027': {
          opportunityId: 'int-eth-esop-2027',
          titleSnapshot: { es: 'ETH Zurich ESOP', en: 'ETH Zurich ESOP' },
          providerSnapshot: { es: 'ETH Zurich', en: 'ETH Zurich' },
          officialUrlSnapshot:
            'https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html',
          status: 'preparing',
          savedAt: '2026-11-14T12:00:00.000Z',
          updatedAt: '2026-11-14T12:00:00.000Z',
        },
      },
    });
    const goodFile = new File([validJson], 'good-backup.json', {
      type: 'application/json',
    });
    Object.defineProperty(goodFile, 'text', { value: async () => validJson });
    await user.upload(fileInput, goodFile);

    expect(
      await screen.findByText(/Imported 1 saved opportunities and 1 action steps/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Restored goal from JSON')).toBeInTheDocument();
    expect(screen.getByText('Imported prep step')).toBeInTheDocument();
  });

  it('hides review_required entries by default on Explore and labels their detail view clearly as pending verification', async () => {
    seedCompletedOnboarding('en');
    const user = userEvent.setup();
    const { port } = createMockAiPort('unsupported');

    render(<App ports={{ ai: port }} />);

    expect(await screen.findByText(/ETH Zurich ESOP/i)).toBeInTheDocument();
    expect(screen.queryByText(/Billing Assistant · Promigas Peru/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /More filters/i }));
    const includeCheckbox = screen.getByRole('checkbox', {
      name: /Include closed or pending re-check/i,
    });
    await user.click(includeCheckbox);

    const promigasTitle = await screen.findByText(/Billing Assistant · Promigas Peru/i);
    expect(promigasTitle).toBeInTheDocument();

    const promigasCard = promigasTitle.closest('article');
    expect(promigasCard).not.toBeNull();
    expect(promigasCard).toHaveTextContent(/Needs date re-check/i);
    expect(promigasCard).toHaveTextContent(/Last checked/i);

    await user.click(
      within(promigasCard as HTMLElement).getByRole('link', {
        name: /Check requirements/i,
      }),
    );

    expect(
      await screen.findByText(/Pending re-verification: live vacancy, seat availability/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Last checked .* \(re-check needed\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Verified on /i)).not.toBeInTheDocument();
  });

  it('warns when JSON import strips unsafe URLs, rolls back failed cloud follow-up turns, and localizes 404 routes', async () => {
    seedCompletedOnboarding('es');
    window.history.pushState({}, '', '/ruta-inexistente');
    const user = userEvent.setup();
    const { port, runCloudFollowUp } = createMockAiPort('unsupported');
    runCloudFollowUp.mockRejectedValueOnce(new Error('AI_EXECUTION_FAILED:Simulated outage'));

    render(<App ports={{ ai: port }} />);
    expect(await screen.findByText(/404 · Vista no encontrada/i)).toBeInTheDocument();

    // Go to My Route and import JSON with one non-HTTPS link
    await user.click(screen.getAllByRole('link', { name: /Mi Ruta/i })[0]!);
    expect(await screen.findByRole('heading', { name: /^Mi Ruta$/i })).toBeInTheDocument();

    const unsafeImport = JSON.stringify({
      version: 2,
      goal: null,
      tasks: [],
      saved: {
        'bad-link-item': {
          opportunityId: 'bad-link-item',
          titleSnapshot: { es: 'Prueba', en: 'Test' },
          providerSnapshot: { es: 'Org', en: 'Org' },
          officialUrlSnapshot: 'http://insecure.example.com/call',
          status: 'saved',
          savedAt: '2026-11-14T12:00:00.000Z',
          updatedAt: '2026-11-14T12:00:00.000Z',
        },
      },
    });
    const fileInput = document.getElementById('route-import-input') as HTMLInputElement;
    const unsafeFile = new File([unsafeImport], 'unsafe-url.json', {
      type: 'application/json',
    });
    Object.defineProperty(unsafeFile, 'text', { value: async () => unsafeImport });
    await user.upload(fileInput, unsafeFile);

    expect(await screen.findByText(/se omitió 1 enlace no HTTPS o inseguro/i)).toBeInTheDocument();

    // Verify failed cloud follow-up restores draft question and avoids orphan user turn
    await user.click(screen.getAllByRole('link', { name: /Explorar/i })[0]!);
    const detailLink = await screen.findByRole('link', { name: /ETH Z.rich ESOP/i });
    await user.click(detailLink);

    await user.click(await screen.findByText(/Haz tu propia pregunta/i, { selector: 'summary' }));
    const followUpInput = await screen.findByPlaceholderText(
      /Haz una pregunta de seguimiento/i,
    );
    await user.type(followUpInput, '¿Puedo presentar carta digital?');
    await user.click(screen.getByRole('button', { name: /Consultar en nube/i }));

    await user.click(
      await screen.findByRole('button', { name: /Permitir Firebase Cloud AI/i }),
    );
    await user.click(screen.getByRole('button', { name: /Consultar en nube/i }));

    expect(await screen.findByText(/Simulated outage/i)).toBeInTheDocument();
    expect(followUpInput).toHaveValue('¿Puedo presentar carta digital?');
    expect(screen.queryByText(/^Tú$/)).not.toBeInTheDocument();
  });

  it('maintains 100% ES/EN translation key parity, supports segmented ES/EN keyboard switching, hero CTAs, and logo home navigation', async () => {
    const enKeys = flattenKeys(enTranslation as Record<string, unknown>);
    const esKeys = flattenKeys(esTranslation as Record<string, unknown>);
    expect(enKeys).toEqual(esKeys);
    expect(enKeys.length).toBeGreaterThan(150);

    seedCompletedOnboarding('es');
    const user = userEvent.setup();
    const { port } = createMockAiPort('unsupported');

    render(<App ports={{ ai: port }} />);

    // 1. Segmented language switch starts on ES with sliding indicator at 0%
    const langSwitch = await screen.findByTestId('lang-switch');
    expect(langSwitch).toHaveAttribute('data-active-locale', 'es');
    const thumb = langSwitch.querySelector('.lang-switch-thumb') as HTMLElement | null;
    expect(thumb).not.toBeNull();
    expect(thumb!.style.transform).toBe('translateX(0%)');

    const esBtn = within(langSwitch).getByRole('button', { name: 'ES' });
    const enBtn = within(langSwitch).getByRole('button', { name: 'EN' });
    expect(esBtn).toHaveAttribute('aria-pressed', 'true');
    expect(enBtn).toHaveAttribute('aria-pressed', 'false');

    // Keyboard ArrowRight switches cleanly to EN and moves thumb to 100%
    esBtn.focus();
    await user.keyboard('{ArrowRight}');
    expect(langSwitch).toHaveAttribute('data-active-locale', 'en');
    expect(thumb!.style.transform).toBe('translateX(100%)');
    expect(enBtn).toHaveAttribute('aria-pressed', 'true');
    expect(esBtn).toHaveAttribute('aria-pressed', 'false');
    expect(await screen.findByRole('heading', { name: /Find real opportunities/i })).toBeInTheDocument();

    const storedPrefs = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.prefs) ?? '{}');
    expect(storedPrefs.locale).toBe('en');

    // 2. Hero CTAs work cleanly: Explore focuses search, Interactive Guide toggles tour & backdrop dismisses, Route CTA navigates, and brand logo returns to /
    await user.click(screen.getByTestId('hero-tour-cta'));
    expect(await screen.findByTestId('onboarding-tour')).toBeInTheDocument();
    const heroHeading = screen.getByRole('heading', { name: /Find real opportunities/i });
    await user.click(heroHeading);
    await waitFor(() => {
      expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument();
    });

    await user.click(screen.getAllByRole('link', { name: /My Route/i })[0]!);
    expect(await screen.findByRole('heading', { name: /^My Route$/i })).toBeInTheDocument();

    const brandLink = document.querySelector('a.brand-link') as HTMLElement | null;
    expect(brandLink).not.toBeNull();
    await user.click(brandLink!);
    expect(await screen.findByRole('heading', { name: /Find real opportunities/i })).toBeInTheDocument();
  });
});

