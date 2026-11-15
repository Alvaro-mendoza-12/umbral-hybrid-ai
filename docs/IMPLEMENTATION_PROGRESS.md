# UMBRAL · Implementation Progress & Release Candidate Report

**Branch:** `feat/hybrid-ai-web`  
**Product Direction:** Eligibility Checker & Verified Application Preparation Companion (**Cartografía Cívica**)  
**Preserved Infrastructure:** Firebase AI Logic (`umbral-21e8b`), `GoogleAIBackend`, Gemini Developer API, Gemini Cloud, Gemini Nano (`LanguageModel`), App Check (`reCAPTCHA Enterprise` / debug token in non-prod), `aiOrchestrator.ts`, `hybridAiAdapter.ts`, deterministic `matcher.ts` (4 states: `MATCH`, `MISMATCH`, `NEEDS_CONFIRMATION`, `UNKNOWN`), `catalogRules.ts`, `routeRules.ts`, `localStorage` persistence + JSON/Markdown export/import, VitePWA offline cache, and 100% EN/ES translation key parity.

---

## 1. Cross-Document Resolutions

| Topic | Decision Implemented | Rationale |
| --- | --- | --- |
| Public-sector procedures vs. Eligibility Checker | Keep focus strictly on the 5 curated opportunity tracks (`education`, `employment`, `training`, `entrepreneurship`, `civic`) and embed public-procedure guidance only as contextual `prerequisiteGuide` micro-guides inside relevant requirements (`CSE / SISFOH` on `pe-beca-18-2027`, `CUL` on `pe-promigas-billing`). | Prevents scope drift into a generic government portal while solving the exact procedural blockers candidates face. |
| Top navigation & Privacy access | Reduced desktop top navigation in `src/app/Shell.tsx` to 3 primary links (`Explore`, `My Route`, `Settings`), while preserving the `/privacy` route, footer link, and a top **Privacy & Local-First Protection** summary card inside `/settings`. | Matches `NEW_INFORMATION_ARCHITECTURE.md §2` without sacrificing privacy discoverability or breaking direct `/privacy` links. |
| Mobile detail action placement | Removed the fixed bottom action bar inside `<main>` and placed the mobile `Ask AI` trigger (`data-testid="mobile-ask-ai-btn"`) inside `.detail-actions` in `.detail-hero` plus inline `What does this mean?` triggers on every requirement row. | Eliminates fixed-element overlap over scrolled interactive elements at `320px–390px` viewports while keeping Copilot one tap away. |
| First-visit guidance vs. immediate utility | Disabled automatic popup of `OnboardingTour` on first load (`tourActive` starts `false`); the 4-step tour remains available on demand via the compact **How it works** CTA in the Explore header and Settings. | Ensures 2–3 opportunity cards appear above the fold on desktop (`1280×800`) and Card #1 appears above the fold on mobile (`390×844`) with zero hero occlusion. |

---

## 2. Implemented Phases & File Inventory

### Phase 1 — Above-the-Fold Discovery & Navigation Simplification
- **`src/domain/catalogRules.ts`**: Added `DeadlineCountdown` and `getDeadlineCountdown(opportunity, now)` computing verified time-zone-aware remaining days without inventing dates.
- **`src/components/categoryMeta.ts`** *(created)*: Defined `CATEGORY_META` icons and theme classes plus `monogramFor` helper.
- **`src/components/OpportunityIndicators.tsx`** *(created)*: Added `CategoryBadge`, `ProviderMonogram`, `DeadlineChip`, and deterministic count-only `FitSummary`.
- **`src/features/explore/ExplorePage.tsx`**: Rebuilt discovery with a compact hero, side-by-side `.finder-top-row` (search, country, `+ More filters` collapsible drawer `#more-filters-panel`), category chip row with icon+label identity, URL query synchronization (`useSearchParams` for `q`, `cat`, `country`, `mod`, `lang`, `win`, `closed`), `fromSearch` navigation state preservation, monogrammed cards, deadline chips, benefit preview, fit counts, and SVG empty state.
- **`src/app/Shell.tsx`**: Streamlined desktop header navigation to `Explore`, `My Route`, and `Settings`.
- **`src/app/AppContext.tsx` & `src/app/OnboardingTour.tsx`**: Switched `OnboardingTour` to on-demand activation and updated highlight positioning selectors.

### Phase 2 — Unified Detail View & Contextual Prerequisite Micro-Guides
- **`src/features/detail/SelfCheckPanel.tsx`** *(deleted)*: Merged duplicate requirements check panels into a single unified interactive view.
- **`src/features/detail/UnifiedRequirementsCheck.tsx`** *(created)*: Built compact `.profile-bar` (`Edit profile (X/6)` expandable drawer), interactive 4-status scoreboard filter (`Match`, `Mismatch`, `Needs confirmation`, `Unknown`), per-requirement `What does this mean?` trigger, and `<details className="prereq-guide">` guarded by `isSafeHttpsUrl`.
- **`src/features/detail/OpportunityDetailPage.tsx`**: Implemented 6-section information hierarchy, `fromSearch` back navigation, mobile bottom-sheet Copilot dialog (`role="dialog"`, Escape & focus-trap support) stacked above header/bottom nav (`.animate-enter` moved onto `.detail-main`), and collapsible secondary disclosures (`Important conditions`, `Sources checked`).
- **`src/domain/types.ts` & `src/data/opportunities.ts`**: Added `RequirementPrerequisiteGuide` to `RequirementCriterion` and verified `gob.pe` micro-guides for CSE/SISFOH (`pe-beca-18-2027` -> `req-b18-rules`) and CUL (`pe-promigas-billing` -> `req-promigas-country`).

### Phase 3 — Conversational Hybrid AI Copilot, My Route Enrichment & Simplified Settings
- **`src/domain/aiContract.ts`**: Refined `EXPLAIN_REQUIREMENTS` prompt instruction to cover practical requirements, needed documents, and unknowns without repeating the opportunity title verbatim.
- **`src/features/detail/HybridAIPanel.tsx`**: Replaced technical panel chrome with 3 clear radio mode cards (`Automatic`, `On this device` = *Private on your device*, `Cloud` = *Online, with your permission*), 4 quick action buttons (`Explain requirements`, `Documents needed`, `Suggest 3 steps`, `Compare with another` prioritizing saved & same-category calls), inline cloud-consent banner, and collapsible `<details>` for `Sources used (N)` and `Ask your own question`.
- **`src/features/route/MyRoutePage.tsx`**: Deduplicated goal display via read-mode banner + `Edit goal` toggle, added ARIA task progress bar (`progress-track`), enriched saved opportunity cards with live catalog lookup (`CategoryBadge`, `DeadlineChip`, `FitSummary`), and added an SVG empty state.
- **`src/services/browserCapabilities.ts`**: Localized `probeBrowserCapabilities(locale)` status `reason` messages in Spanish when `locale === 'es'`.
- **`src/features/settings/SettingsPage.tsx`**: Added top **Privacy & Local-First Protection** summary card linking to `/privacy` and collapsed technical Firebase diagnostics & session AI audit log inside `<details data-testid="tech-diagnostics-disclosure">`.

### Phase 4 — Cartografía Cívica Typography, Tokens, Accessibility & Tests
- **`package.json` & `package-lock.json`**: Added self-hosted `@fontsource-variable/fraunces` and `@fontsource-variable/plus-jakarta-sans` `.woff2` font packages (preserving strict `font-src 'self' data:` CSP and VitePWA offline caching).
- **`src/styles/tokens.css` & `src/styles/layout.css`**: Applied **Cartografía Cívica** tokens, per-category accessible palette tokens, responsive layout rules, 44px minimum touch targets, bottom-sheet transitions, closed `<details>` visibility guard, and prerequisite/progress components.
- **`src/locales/en/translation.json` & `src/locales/es/translation.json`**: Added complete bilingual UI copy, fixed WCAG 2.5.3 Label-in-Name accessible name on `detail.requirement.askAiAria`, and removed 27 obsolete keys while preserving 100% key parity.
- **Test Suites Updated**: `tests/unit/browserCapabilities.test.ts`, `tests/unit/catalogRules.test.ts`, `tests/integration/appFlows.test.tsx`, `tests/e2e/userFlows.spec.ts`.

---

## 3. Verification Results (Latest Run After Final Edit)

| Check | Command | Result | Scope / Notes |
| --- | --- | --- | --- |
| TypeScript check | `npm run typecheck` | **Passed** (`exit 0`) | Strict `tsc --noEmit` across `src/` & `tests/`. |
| ESLint check | `npm run lint` | **Passed** (`exit 0`) | Zero lint errors or warnings. |
| Unit & integration suite | `npm run test` | **Passed** (`exit 0`) | **10/10 files, 48/48 tests passed** (`vitest run`). Includes EN/ES 100% key parity check. |
| Production build & PWA | `npm run build` | **Passed** (`exit 0`) | `tsc -b && vite build`; generated 22 PWA precache entries (`777.96 KiB`) including `.woff2` fonts. |
| E2E & WCAG 2.2 AA suite | `npx playwright test --workers=3 --reporter=list` | **Passed** (`exit 0`) | **21/21 Chromium tests passed** (`32.3s`, 0 skipped/failed): 5/5 Axe WCAG 2.2 AA audits, 8 viewport overflow checks (`320px–1440px`), 200% zoom reflow, zero control overlaps across `360px/768px/1280px`, keyboard skip link, URL filter sync, JSON round-trip, PWA offline `/route` reload, prereq micro-guides, mobile bottom sheet dialog, and zero console/page errors. Note: `--workers=3` avoids parallel Chrome cold-start contention observed at default 8 workers on Windows. |
| Dependency audit | `npm audit --omit=dev` | **4 upstream high advisories** | Transitive `firebase -> @firebase/firestore -> @grpc/grpc-js` (not imported/used by Umbral); left untouched to avoid breaking `firebase@13.3.0` / Firebase AI Logic (`npm audit fix --force` proposes downgrading to `firebase@9.14.0`). |

---

## 4. Visual Inspection Screenshots (`artifacts.local/`)

All screenshots were captured against the built preview bundle (`dist-e2e.local`) and inspected individually via `read_file`:
- `artifacts.local/ux-home-desktop.png` (`1280×800`): 3 nav links, compact hero, unified finder row, 2 full opportunity cards completely above the fold.
- `artifacts.local/ux-home-mobile.png` (`390×844`): Responsive search/country/`More filters`, scrollable category chips, full first opportunity card visible above the mobile bottom navigation.
- `artifacts.local/ux-detail-desktop.png` (`1280×800`, full page): Sticky right AI Copilot panel, 3-column key facts, unified Requirements & Fit scoreboard, and expanded official CSE/SISFOH micro-guide with `gob.pe` link.
- `artifacts.local/ux-detail-mobile-sheet.png` (`390×844`): Bottom sheet (`role="dialog"`) with full backdrop overlay covering header & bottom nav cleanly, visible `Close assistant` button, 3 AI mode cards, and 2×2 action grid.
- `artifacts.local/ux-my-route.png` (`1280×800`, full page): Deduplicated read-mode goal banner (`Edit goal`), 50% step progress bar, and saved call enriched with category/countdown/fit metadata.
- `artifacts.local/ux-settings-desktop.png` (`1280×800`, full page): Privacy summary card linking to `/privacy`, clear hybrid preferences, and collapsed technical diagnostics disclosure.
