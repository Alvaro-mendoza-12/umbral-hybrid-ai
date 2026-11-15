import { expect, test } from '@playwright/test';

test.describe('UMBRAL Hybrid AI core E2E user flows', () => {
  test('starts without auto-tour, runs tour on demand, filters, self-checks, saves My Route, and clears local data', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Entry splash finishes quickly or can be skipped cleanly; tour stays off until requested
    const splash = page.getByTestId('intro-splash');
    if (await splash.isVisible().catch(() => false)) {
      await page
        .getByRole('button', { name: /Skip intro|Omitir entrada/i })
        .click({ timeout: 1500 })
        .catch(() => undefined);
    }
    await expect(splash).toBeHidden({ timeout: 3000 });
    await expect(page.getByTestId('onboarding-tour')).toBeHidden();

    // Force deterministic English for predictable assertions
    await page.getByRole('button', { name: 'EN', exact: true }).click();

    // 2. On-demand 4-step tour triggered from hero CTA
    await page.getByTestId('hero-tour-cta').click();
    const tour = page.getByTestId('onboarding-tour');
    await expect(tour).toBeVisible();
    await expect(tour).toContainText('Step 1 of 4');
    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(tour).toContainText('Step 2 of 4');
    await tour.getByRole('button', { name: 'Back' }).click();
    await expect(tour).toContainText('Step 1 of 4');
    await tour.getByRole('button', { name: 'Next' }).click();
    await tour.getByRole('button', { name: 'Next' }).click();
    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(tour).toContainText('Step 4 of 4');
    await tour.getByRole('button', { name: 'Finish' }).click();
    await expect(tour).toBeHidden();

    await page.reload();
    await expect(page.getByTestId('onboarding-tour')).toBeHidden();

    // 3. 3-click opportunity discovery -> Detail -> Edit profile self-check -> Save
    await page.getByLabel(/Search title, institution, or requirement/i).fill('ETH Zurich');
    await page.getByRole('link', { name: /Check requirements/i }).first().click();

    await expect(page).toHaveURL(/\/opportunities\/int-eth-esop-2027/);
    await page.getByRole('button', { name: /Save to My Route/i }).click();
    await expect(page.getByRole('button', { name: /Saved in My Route/i })).toBeVisible();

    await page.getByRole('button', { name: /Edit profile/i }).click();
    await page.getByLabel(/Country of residence/i).selectOption('PE');
    await page.getByLabel(/Highest completed or current level/i).selectOption('bachelor');
    await expect(page.getByText(/Mismatch|Match/i).first()).toBeVisible();

    // 4. My Route goal read/edit mode + 3-task limit + progress bar + reload persistence
    await page.getByRole('link', { name: /My Route/i }).first().click();
    await expect(page).toHaveURL(/\/route/);
    await expect(page.getByRole('link', { name: /ETH Zurich ESOP/i })).toBeVisible();

    const goalInput = page.getByRole('textbox', { name: /Goal statement/i });
    await goalInput.fill('Prepare ETH ESOP statement before Dec 1');
    await page.getByRole('button', { name: /Save goal/i }).click();
    await expect(page.getByRole('button', { name: /Edit goal/i })).toBeVisible();
    await expect(page.locator('#route-goal-input')).toBeHidden();

    const taskInput = page.getByPlaceholder(/Add one concrete next step/i);
    await taskInput.fill('Step 1: Verify sealed official transcript');
    await page.getByRole('button', { name: /Add step/i }).click();
    await taskInput.fill('Step 2: Contact two referees');
    await page.getByRole('button', { name: /Add step/i }).click();
    await taskInput.fill('Step 3: Draft pre-proposal PDF');
    await page.getByRole('button', { name: /Add step/i }).click();

    await expect(page.getByText(/Focus limit reached \(3 active steps\)/i)).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Prepare ETH ESOP statement before Dec 1')).toBeVisible();
    await expect(page.getByText('Step 1: Verify sealed official transcript')).toBeVisible();

    // 5. Undo saved opportunity removal
    await page.getByRole('button', { name: 'Remove' }).last().click();
    await expect(page.getByText(/Removed/i)).toBeVisible();
    await page.getByRole('button', { name: /Undo/i }).click();
    await expect(page.getByRole('link', { name: /ETH Zurich ESOP/i })).toBeVisible();

    // 6. Settings: clear local data
    await page.getByRole('link', { name: /Settings/i }).first().click();
    await page.getByRole('button', { name: /Clear all local data/i }).click();
    await page.getByRole('button', { name: /Yes, delete everything/i }).click();
    await expect(page.getByText(/All local browser data cleared/i)).toBeVisible();
  });

  test('skips entry animation cleanly when prefers-reduced-motion is reduce', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByTestId('intro-splash')).toBeHidden();
  });

  test('filters catalog with More filters + URL sync, imports JSON backup, and supports PWA offline /route reload', async ({
    page,
    context,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'umbral:prefs:v1',
        JSON.stringify({
          version: 1,
          locale: 'en',
          inferencePreference: 'PREFER_ON_DEVICE',
          cloudConsentGranted: false,
          introVersionSeen: 'v1',
          tourStatus: 'completed',
          tourVersion: 'v1',
        }),
      );
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open More filters and test URL query sync for language & window facets
    await page.getByRole('button', { name: /More filters/i }).click();
    await page.locator('#finder-language').selectOption('en');
    await page.locator('#finder-deadline').selectOption('closing_soon');
    await expect(page).toHaveURL(/\?.*lang=en/);
    await expect(page).toHaveURL(/\?.*win=closing_soon/);
    await expect(page.getByRole('link', { name: /ETH Zurich/i }).first()).toBeVisible();

    await page.locator('#finder-language').selectOption('');
    await page.locator('#finder-deadline').selectOption('ongoing');
    await expect(page).toHaveURL(/\?.*win=ongoing/);
    await expect(page.getByRole('link', { name: /OFIS/i }).first()).toBeVisible();

    // Navigate to My Route and test genuine JSON export -> clear -> JSON import round-trip
    await page.getByRole('link', { name: /My Route/i }).first().click();
    await expect(page).toHaveURL(/\/route/);

    const goalInput = page.getByRole('textbox', { name: /Goal statement/i });
    await goalInput.fill('Offline route check after JSON import');
    await page.getByRole('button', { name: /Save goal/i }).click();

    const taskInput = page.getByPlaceholder(/Add one concrete next step/i);
    await taskInput.fill('Confirm visa requirements offline');
    await page.getByRole('button', { name: /Add step/i }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download JSON/i }).click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    await page.getByRole('button', { name: /Clear goal/i }).click();
    await page.getByRole('button', { name: 'Remove' }).first().click();
    await expect(page.getByText('Offline route check after JSON import')).toBeHidden();

    await page.locator('#route-import-input').setInputFiles(downloadPath!);

    await expect(page.getByText(/Imported 0 saved opportunities and 1 action steps/i)).toBeVisible();
    await expect(page.getByText('Offline route check after JSON import')).toBeVisible();
    await expect(page.getByText('Confirm visa requirements offline')).toBeVisible();

    // Wait for VitePWA Service Worker activation before testing offline route navigation reload
    const swReady = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
      ]);
      return Boolean(reg?.active);
    });
    expect(swReady).toBe(true);

    // Go offline and verify /route reloads cleanly with imported state intact
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /^My Route$/i })).toBeVisible();
    await expect(page.getByText('Confirm visa requirements offline')).toBeVisible();
    await context.setOffline(false);
  });

  test('operates cleanly without Firebase credentials (zero console/page errors and collapsible diagnostics)', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'umbral:prefs:v1',
        JSON.stringify({
          version: 1,
          locale: 'en',
          inferencePreference: 'PREFER_ON_DEVICE',
          cloudConsentGranted: false,
          introVersionSeen: 'v1',
          tourStatus: 'completed',
          tourVersion: 'v1',
        }),
      );
    });

    await page.goto('/settings');
    await expect(page.getByTestId('tech-diagnostics-disclosure')).not.toHaveAttribute('open', '');
    await page.getByTestId('tech-diagnostics-summary').click();
    await expect(page.getByText(/^Missing env keys$/i)).toBeVisible();
    await expect(page.getByText(/^Unconfigured$/i)).toBeVisible();
    await expect(page.getByText(/gemini-3\.5-flash-lite/i)).toBeVisible();
    await expect(
      page.getByText(/State A · Firebase not configured/i),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /AI setup incomplete/i }),
    ).toBeVisible();

    await page.goto('/privacy');
    await expect(
      page.getByRole('heading', { name: /Privacy, Transparency & AI Boundaries/i }),
    ).toBeVisible();

    await page.goto('/opportunities/int-eth-esop-2027');
    await page.getByRole('button', { name: /Explain requirements/i }).click();
    await expect(page.getByText(/Cloud AI Consent Required/i)).toBeVisible();

    await page.goto('/non-existent-path');
    await expect(page.getByRole('heading', { name: /404 · Page not found/i })).toBeVisible();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('verifies above-the-fold cards, ES/EN sliding toggle, brand home navigation, prereq micro-guides, AI mode cards, and mobile bottom sheet', async ({
    page,
  }) => {
    const boxesOverlap = (
      a: { x: number; y: number; width: number; height: number },
      b: { x: number; y: number; width: number; height: number },
    ) =>
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;

    // 0. Desktop above-the-fold cards + on-demand tour non-overlap
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const splash = page.getByTestId('intro-splash');
    if (await splash.isVisible().catch(() => false)) {
      await expect(splash).toBeHidden({ timeout: 3000 });
    }
    await expect(page.getByTestId('onboarding-tour')).toBeHidden();

    await expect(page.locator('.opp-card').first()).toBeVisible();
    const visibleDesktopCards = await page.locator('.opp-card').evaluateAll((cards) =>
      cards.filter((card) => card.getBoundingClientRect().top < 800).length,
    );
    expect(visibleDesktopCards).toBeGreaterThanOrEqual(2);

    await page.getByTestId('hero-tour-cta').click();
    const tour = page.getByTestId('onboarding-tour');
    await expect(tour).toBeVisible();
    const desktopTourBox = await tour.boundingBox();
    const desktopHeroCtaBox = await page.getByTestId('hero-tour-cta').boundingBox();
    expect(desktopTourBox).not.toBeNull();
    expect(desktopHeroCtaBox).not.toBeNull();
    expect(boxesOverlap(desktopTourBox!, desktopHeroCtaBox!)).toBe(false);

    await page.setViewportSize({ width: 360, height: 800 });
    await page.waitForTimeout(150);
    const mobileTourBox = await tour.boundingBox();
    const mobileHeroCtaBox = await page.getByTestId('hero-tour-cta').boundingBox();
    expect(mobileTourBox).not.toBeNull();
    expect(mobileHeroCtaBox).not.toBeNull();
    expect(boxesOverlap(mobileTourBox!, mobileHeroCtaBox!)).toBe(false);

    await tour.getByRole('button', { name: /Omitir|Skip/i }).click();
    await expect(tour).toBeHidden();

    // Mobile above-the-fold: first opp card appears above mobile nav (844 - 68 = 776)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.getByTestId('onboarding-tour')).toBeHidden();
    const firstMobileCard = page.locator('.opp-card').first();
    await expect(firstMobileCard).toBeVisible();
    const firstMobileBox = await firstMobileCard.boundingBox();
    expect(firstMobileBox).not.toBeNull();
    expect(firstMobileBox!.y).toBeLessThan(776);

    // 1. Segmented switch switches cleanly to ES and slides smoothly to EN without right-edge shift
    const langSwitch = page.getByTestId('lang-switch');
    await langSwitch.getByRole('button', { name: 'ES', exact: true }).click();
    await expect(langSwitch).toHaveAttribute('data-active-locale', 'es');
    await expect(
      page.getByRole('heading', { name: /Encuentra convocatorias reales/i }),
    ).toBeVisible();
    const thumb = langSwitch.locator('.lang-switch-thumb');
    await expect
      .poll(async () => {
        const currentSwitch = await langSwitch.boundingBox();
        const currentThumb = await thumb.boundingBox();
        return currentSwitch && currentThumb ? currentThumb.x - currentSwitch.x : 999;
      })
      .toBeLessThan(8);
    const esSwitchBox = await langSwitch.boundingBox();
    const esThumbBox = await thumb.boundingBox();
    expect(esSwitchBox).not.toBeNull();
    expect(esThumbBox).not.toBeNull();
    const esRelativeX = esThumbBox!.x - esSwitchBox!.x;

    await langSwitch.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(langSwitch).toHaveAttribute('data-active-locale', 'en');
    await expect(
      page.getByRole('heading', { name: /Find real opportunities/i }),
    ).toBeVisible();

    await expect
      .poll(async () => {
        const currentSwitch = await langSwitch.boundingBox();
        const currentThumb = await thumb.boundingBox();
        return currentSwitch && currentThumb ? currentThumb.x - currentSwitch.x : -1;
      })
      .toBeGreaterThan(esRelativeX + 25);

    const enSwitchBox = await langSwitch.boundingBox();
    expect(enSwitchBox).not.toBeNull();
    expect(
      Math.abs((enSwitchBox!.x + enSwitchBox!.width) - (esSwitchBox!.x + esSwitchBox!.width)),
    ).toBeLessThan(2);

    await page.reload();
    await expect(page.getByTestId('lang-switch')).toHaveAttribute('data-active-locale', 'en');
    await expect(
      page.getByRole('heading', { name: /Find real opportunities/i }),
    ).toBeVisible();

    // 2. Navigate to detail and return home cleanly via brand logo
    await page.getByRole('link', { name: /Check requirements/i }).first().click();
    await expect(page).toHaveURL(/\/opportunities\//);
    await page.locator('a.brand-link').click();
    await expect(page).toHaveURL(/\/$/);

    // 3. Mobile bottom sheet triggers from detail action & requirement contextual button
    await page.goto('/opportunities/int-eth-esop-2027');
    await page.getByTestId('mobile-ask-ai-btn').click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByTestId('ai-mode-group').getByText(/Private on your device/i)).toBeVisible();
    await expect(sheet.getByTestId('ai-mode-group').getByText(/Online, with your permission/i)).toBeVisible();
    await sheet.getByRole('button', { name: /Close assistant/i }).click();
    await expect(sheet).toBeHidden();

    // 4. Desktop copilot + CSE/SISFOH prerequisite micro-guide on Beca 18
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/opportunities/pe-beca-18-2027');
    const modeGroup = page.getByTestId('ai-mode-group');
    await expect(modeGroup).toContainText(/Private on your device/i);
    await expect(modeGroup).toContainText(/Online, with your permission/i);
    const prereq = page.getByTestId('prereq-guide-req-b18-rules');
    await expect(prereq).toBeVisible();
    await prereq.locator('summary').click();
    await expect(prereq).toHaveAttribute('open', '');
  });
});
