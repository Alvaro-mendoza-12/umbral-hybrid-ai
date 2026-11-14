import { expect, test } from '@playwright/test';

test.describe('UMBRAL Hybrid AI core E2E user flows', () => {
  test('completes intro, 4-step onboarding tour, filter, save, self-check, My Route persistence, and data wipe', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Entry splash either finishes quickly or can be skipped cleanly
    const splash = page.getByTestId('intro-splash');
    if (await splash.isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /Skip intro|Omitir entrada/i }).click();
    }
    await expect(splash).toBeHidden({ timeout: 3000 });

    // Force deterministic English for predictable assertions
    const enBtn = page.getByRole('button', { name: 'EN', exact: true });
    await enBtn.click();

    // 2. Onboarding 4-step tour
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

    // Verify tour stays completed on reload
    await page.reload();
    await expect(page.getByTestId('onboarding-tour')).toBeHidden();

    // 3. 3-click opportunity discovery -> Detail -> Self-check -> Save
    await page.getByLabel(/Search title, institution, or requirement/i).fill('ETH Zurich');
    await page.getByRole('link', { name: /Check requirements & AI/i }).first().click();

    await expect(page).toHaveURL(/\/opportunities\/int-eth-esop-2027/);
    await page.getByRole('button', { name: /Save to My Route/i }).click();
    await expect(page.getByRole('button', { name: /Saved in My Route/i })).toBeVisible();

    await page.getByLabel(/Country of residence/i).selectOption('PE');
    await page.getByLabel(/Highest completed or current level/i).selectOption('bachelor');
    await expect(page.getByText(/1 Mismatch|Match/i).first()).toBeVisible();

    // 4. My Route goal + 3-task limit + reload persistence
    await page.getByRole('link', { name: /My Route/i }).first().click();
    await expect(page).toHaveURL(/\/route/);
    await expect(page.getByRole('link', { name: /ETH Zurich ESOP/i })).toBeVisible();

    const goalInput = page.getByRole('textbox', { name: /Goal statement/i });
    await goalInput.fill('Prepare ETH ESOP statement before Dec 1');
    await page.getByRole('button', { name: /Save goal/i }).click();

    const taskInput = page.getByPlaceholder(/Add one concrete next step/i);
    await taskInput.fill('Step 1: Verify sealed official transcript');
    await page.getByRole('button', { name: /Add step/i }).click();
    await taskInput.fill('Step 2: Contact two referees');
    await page.getByRole('button', { name: /Add step/i }).click();
    await taskInput.fill('Step 3: Draft pre-proposal PDF');
    await page.getByRole('button', { name: /Add step/i }).click();

    await expect(page.getByText(/Focus limit reached \(3 active steps\)/i)).toBeVisible();

    await page.reload();
    await expect(page.getByText('Prepare ETH ESOP statement before Dec 1')).toBeVisible();
    await expect(page.getByText('Step 1: Verify sealed official transcript')).toBeVisible();

    // 5. Undo saved opportunity removal
    await page.getByRole('button', { name: 'Remove' }).last().click();
    await expect(page.getByText(/Removed/i)).toBeVisible();
    await page.getByRole('button', { name: /Undo/i }).click();
    await expect(page.getByRole('link', { name: /ETH Zurich ESOP/i })).toBeVisible();

    // 6. Settings: Replay tour & clear local data
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
});
