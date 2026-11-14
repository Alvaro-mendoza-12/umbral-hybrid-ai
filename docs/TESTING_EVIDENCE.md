# Testing, Accessibility & Verification Evidence

**Date:** November 14, 2026  
**Repository:** `Alvaro-mendoza-12/umbral-hybrid-ai` (branch `feat/hybrid-ai-web`)  
**Environment:** Windows, Node.js, Vite 8.3.8, Google Chrome 157.0.8103.51 (desktop binary)

---

## 1. Automated Verification Commands & Observed Results

| Check | Command | Result | Details |
| :--- | :--- | :--- | :--- |
| **TypeScript Check** | `npm run typecheck` | Pass (exit `0`) | Strict TypeScript (`tsc --noEmit`), 0 errors |
| **Linter** | `npm run lint` | Pass (exit `0`) | ESLint 10 (`@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`), 0 errors/warnings |
| **Unit & Integration** | `npm run test` | Pass (exit `0`) | **8 test files, 23 tests passed** (`vitest run`) |
| **Production & PWA Build** | `npm run build` | Pass (exit `0`) | Vite 8 + `vite-plugin-pwa`, built in `525ms`, 17 precache entries (`641.74 KiB`) |
| **E2E, WCAG 2.2 AA & Layout** | `npm run test:e2e` | Pass (exit `0`) | **17 Playwright tests passed** across Chromium (`channel: 'chrome'` / Chrome 157) |

### Unit & Integration Breakdown (`tests/unit/` and `tests/integration/`)

- `tests/unit/aiContract.test.ts` (2 tests): Prompt-injection boundary tagging, structured JSON output validation filtering invalid/hallucinated `evidenceIds`.
- `tests/unit/aiOrchestrator.test.ts` (3 tests): Consent gate blocking silent cloud fallback, strict `ONLY_ON_DEVICE` narrowing when local model is ready, multi-turn `ONLY_IN_CLOUD` consent gate, non-PII execution audit log.
- `tests/unit/browserCapabilities.test.ts` (3 tests): WebIDL function-shaped `window.LanguageModel` detection (catching real Chrome desktop API exposure), `unavailable` distinction from `unsupported`, absent API handling.
- `tests/unit/catalogRules.test.ts` (3 tests): Filtering by country/category/query, HTTPS source link enforcement, `reviewBy` expiration flagging.
- `tests/unit/localRouteAdapter.test.ts` (3 tests): `localStorage` route/profile persistence, JSON export/import validation, full wipe.
- `tests/unit/matcher.test.ts` (3 tests): Deterministic 4-state matching (`MATCHES`, `DOES_NOT_MATCH`, `NEEDS_CONFIRMATION`, `UNKNOWN`) without official eligibility claims.
- `tests/unit/routeRules.test.ts` (3 tests): Cognitive guardrail enforcing 1 active goal and max 3 active steps.
- `tests/integration/appFlows.test.tsx` (3 tests): Full end-to-end mocked hybrid flows covering cloud consent + provenance (`IN_CLOUD`), offline zero-cloud local execution (`ON_DEVICE`), and bilingual EN/ES switching + tour completion persistence.

### E2E, Accessibility & Responsive Breakdown (`tests/e2e/`)

- **Axe WCAG 2.2 AA Audits (0 violations):**
  - `/` (Explore)
  - `/opportunities/int-eth-esop-2027` (Detail + Self-Check + Hybrid AI panel)
  - `/route` (My Route workspace)
  - `/settings` (Language, Hybrid Mode, Diagnostics & Wipe)
  - `/privacy` (Privacy Guarantees)
- **Zero Horizontal Overflow Across 7 Viewports:** `320x568`, `360x800`, `390x844`, `768x1024`, `1024x768`, `1280x800`, `1440x900`.
- **200% Zoom Reflow (`wcag22aa` reflow check):** `640px` viewport width with doubled base font size (`32px`) maintains zero horizontal overflow.
- **No Overlapping Interactive Controls:** Verified intra-container collision-free hitboxes in header, main views, mobile navigation bar, and scrolled footer clearance at `360px` and `1280px`.
- **Keyboard Navigation & `prefers-reduced-motion`:** Verified skip-to-content focus transition, interactive tour navigation, filter -> detail -> self-check -> save to My Route -> persistence across reload -> one-click local data deletion, and reduced-motion launch behavior.

---

## 2. Production Security & Dependency Check

- **Static Secret & XSS Sink Scan:** Verified zero occurrences of `dangerouslySetInnerHTML`, `eval(`, `innerHTML`, hardcoded OpenRouter/Firebase API keys (`AIzaSy...`), or third-party AI SDK shims inside `src/`.
- **CSP Headers:** Enforced via both [firebase.json](../firebase.json) and [vercel.json](../vercel.json).
- **`npm audit --omit=dev` Finding:** Reports 4 high-severity advisories on `@grpc/grpc-js <=1.13.5` as a transitive dependency of `firebase -> @firebase/firestore` (`npm audit fix --force` suggests an incompatible downgrade to `firebase@9.14.0`, which predates `firebase/ai`). **Impact analysis:** `@firebase/firestore` is neither imported nor bundled in UMBRAL Hybrid AI (`src/` imports only `firebase/app`, `firebase/app-check`, and `firebase/ai`).

---

## 3. Real Runtime Diagnostics & Honest Limits

Running the production Vite preview build directly in headless **Google Chrome 157** (`/settings`) confirmed:

- **Detected browser:** `Google Chrome 157`
- **Chrome Prompt API (`window.LanguageModel`):** `Compatible` (`typeof window.LanguageModel === 'function'`, `typeof window.LanguageModel.availability === 'function'`)
- **Local Gemini Nano status (in this headless test environment):** `"unavailable"` (`No disponible en este equipo o disco` — rendered honestly without faking on-device availability)
- **Firebase Web App config & App Check:** `Not configured` (`.env` / `.env.local` absent in the public repo by design; `firebase-tools login:list` reports no signed-in account in this session)
- **Default Cloud Model ID:** `gemini-3.5-flash-lite`

**What cannot run live in this local offline verification pass (requires owner credentials / Firebase setup / non-headless hardware):**

1. Live Firebase AI Logic cloud responses (`GoogleAIBackend` / `gemini-3.5-flash-lite`) with real Firebase Web App credentials and App Check reCAPTCHA Enterprise tokens.
2. Live Chrome Gemini Nano model download (`initializeDeviceModel`) and hardware-backed `ON_DEVICE` token generation (depends on client GPU/disk eligibility on Chrome Desktop `>=139` outside headless constraints).
3. Live deployment to Firebase Hosting (`firebase deploy --only hosting`).
