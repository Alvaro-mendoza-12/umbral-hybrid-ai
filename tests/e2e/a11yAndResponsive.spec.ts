import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { name: 'small-phone-320', width: 320, height: 568 },
  { name: 'android-360', width: 360, height: 800 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'iphone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'wide-1440', width: 1440, height: 900 },
] as const;

const ROUTES = [
  '/',
  '/opportunities/int-eth-esop-2027',
  '/route',
  '/settings',
  '/privacy',
] as const;

test.describe('WCAG 2.2 AA accessibility and responsive layout checks', () => {
  test.beforeEach(async ({ page }) => {
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
  });

  for (const route of ROUTES) {
    test(`passes Axe WCAG 2.2 AA audit on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }

  for (const vp of VIEWPORTS) {
    test(`has zero horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of ['/', '/opportunities/int-eth-esop-2027', '/route', '/settings']) {
        await page.goto(route);
        await page.waitForLoadState('domcontentloaded');

        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth + 1;
        });
        expect(overflow, `Horizontal overflow detected on ${route} at ${vp.name}`).toBe(
          false,
        );
      }
    });
  }

  test('maintains reflow at 200% zoom equivalent (640px viewport and doubled base font size)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 450 });
    await page.goto('/');
    const overflowAt640 = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflowAt640).toBe(false);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });
    const overflowAt32px = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflowAt32px).toBe(false);
  });

  test('has no overlapping interactive controls across all routes at mobile, tablet, and desktop widths', async ({
    page,
  }) => {
    for (const vp of [
      { width: 360, height: 800 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(vp);
      for (const route of ROUTES) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');

        const overlaps = await page.evaluate(() => {
          const containerSelectors = [
            'header.site-header',
            'main#main-content',
            'nav.mobile-bottom-nav',
          ];
          const issues: string[] = [];

          for (const containerSel of containerSelectors) {
            const root = document.querySelector(containerSel);
            if (!root) continue;
            const els = Array.from(
              root.querySelectorAll<HTMLElement>('a, button, input, select'),
            ).filter((el) => {
              const rect = el.getBoundingClientRect();
              const style = window.getComputedStyle(el);
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.visibility !== 'hidden' &&
                style.display !== 'none'
              );
            });

            for (let i = 0; i < els.length; i += 1) {
              const a = els[i]!.getBoundingClientRect();
              for (let j = i + 1; j < els.length; j += 1) {
                if (els[i]!.contains(els[j]!) || els[j]!.contains(els[i]!)) continue;
                const b = els[j]!.getBoundingClientRect();
                const intersectX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
                const intersectY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
                if (intersectX > 2 && intersectY > 2) {
                  issues.push(
                    `${containerSel}: ${els[i]!.textContent?.trim() || els[i]!.tagName} overlaps ${els[j]!.textContent?.trim() || els[j]!.tagName}`,
                  );
                }
              }
            }
          }
          return issues;
        });
        expect(overlaps, `Overlapping interactive controls on ${route} at ${vp.width}px`).toEqual(
          [],
        );
      }

      // Verify scrolled-to-bottom footer links clear above mobile bottom nav cleanly
      if (vp.width < 768) {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.getByRole('link', { name: /ETH Zurich/i }).first().waitFor({ state: 'visible' });
        await page.evaluate(() =>
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
        );
        const bottomOcclusion = await page.evaluate(() => {
          const bottomNav = document.querySelector('nav.mobile-bottom-nav')?.getBoundingClientRect();
          const footerLinks = Array.from(document.querySelectorAll('footer a'));
          if (!bottomNav || footerLinks.length === 0) return false;
          return footerLinks.some((a) => a.getBoundingClientRect().bottom > bottomNav.top);
        });
        expect(bottomOcclusion).toBe(false);
      }
    }
  });

  test('supports keyboard-only skip link and navigation cleanly', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeFocused();
    await skipLink.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });
});
