# Testing, Accessibility & Verification Evidence

**Date:** November 15, 2026  
**Repository:** `Alvaro-mendoza-12/umbral-hybrid-ai` (branch `feat/hybrid-ai-web`)  
**Environment:** Windows 11, Node.js, Vite 8.3.8, Google Chrome 157.0.8103.51 (desktop binary)

---

## 1. Automated Verification Commands & Observed Results

| Check | Command | Result | Details |
| :--- | :--- | :--- | :--- |
| **TypeScript Check** | `npm run typecheck` | Pass (exit `0`) | Strict TypeScript (`tsc --noEmit`), 0 errors |
| **Linter** | `npm run lint` | Pass (exit `0`) | ESLint 10 (`@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`), 0 errors/warnings |
| **Unit & Integration** | `npm run test` | Pass (exit `0`) | **10 test files, 51 tests passed** (`vitest run`) |
| **Production & PWA Build** | `npm run build` | Pass (exit `0`) | Vite 8.3.8 + `vite-plugin-pwa`, **22 precache entries**, `dist/sw.js` + `firebaseApp-*.js` (`useLimitedUseAppCheckTokens: true`) |
| **E2E, WCAG 2.2 AA & Layout** | `npx playwright test --workers=3 --reporter=list` | Pass (exit `0`) | **21 Playwright tests passed** across Chromium (`channel: 'chrome'`) |

### Unit & Integration Breakdown (`tests/unit/` and `tests/integration/`)

- `tests/unit/aiContract.test.ts` (2 tests): Prompt-injection boundary tagging, structured JSON output validation filtering invalid/hallucinated `evidenceIds`.
- `tests/unit/aiOrchestrator.test.ts` (5 tests): Privacy consent gate blocking silent cloud fallback, strict `ONLY_ON_DEVICE` narrowing when ready, `PREFER_IN_CLOUD` & `ONLY_IN_CLOUD` consent enforcement across all 4 modes, request cancellation & `REQUEST_TIMEOUT` abort cleanup, and non-PII execution audit logging.
- `tests/unit/browserCapabilities.test.ts` (3 tests): WebIDL function-shaped `window.LanguageModel` detection, `unavailable` distinction from `unsupported`, absent API handling.
- `tests/unit/catalogRules.test.ts` (5 tests): Country/category/modality/language (`es`, `en`, `es/en`) and `deadlineWindow` (`closing_soon`, `has_deadline`, `ongoing`, `review_required`) filtering, default exclusion of both `closed` and `review_required` when `!includeClosed`, strict HTTPS enforcement, `reviewBy` expiration flagging, and `pe-innovasuyu-libertad` timezone instant cutoff (`America/Lima`).
- `tests/unit/firebaseStatus.test.ts` (3 tests): Production provider guard even when debug env flags are present, reCAPTCHA Enterprise production config excluding debug fields, and local dev debug mode availability.
- `tests/unit/hybridAiAdapter.test.ts` (6 tests): Unconfigured `.env` / placeholder detection (`FIREBASE_NOT_CONFIGURED` across structured/cloud/download paths), honest `firebaseConfigured: false` / `appCheckMode: 'unconfigured'` status, immediate `ON_DEVICE_UNAVAILABLE` guard on `ONLY_ON_DEVICE` when `LanguageModel` is not `'available'`, non-production `debugToken` vs `siteKey` runtime status priority, `mapAdapterError` separation of Cloud `API_NOT_ENABLED` (`firebasevertexai.googleapis.com`), local `LanguageModel` `API_NOT_ENABLED`, and HTTP `429 RESOURCE_EXHAUSTED` quota errors, and clean initialization for project `umbral-21e8b` with App Check Debug Provider in non-production dev mode.
- `tests/unit/localRouteAdapter.test.ts` (3 tests): `localStorage` route/profile persistence, JSON backup validation, full wipe.
- `tests/unit/matcher.test.ts` (6 tests): Deterministic 4-state matching (`MATCH`, `MISMATCH`, `NEEDS_CONFIRMATION`, `UNKNOWN`), separate optional (`mandatory: false`) vs mandatory tracking, residence/work-authorization contradiction detection, and partial-profile protection against false matches.
- `tests/unit/routeRules.test.ts` (5 tests): Cognitive guardrail enforcing 1 active goal + max 3 active steps, strict HTTPS URL rejection during `normalizeMyRouteState` and import, and `parseAndValidateRouteImport` handling valid v2 round-trips, v1 upgrades, `INVALID_JSON`, `INVALID_SCHEMA`, `UNSUPPORTED_VERSION`, and `FILE_TOO_LARGE`.
- `tests/integration/appFlows.test.tsx` (8 tests): End-to-end React + Testing Library flows covering cloud consent + provenance (`IN_CLOUD`), offline zero-cloud local execution (`ON_DEVICE`), EN/ES toggle + guided tour completion, catalog `loadError` + Retry recovery, My Route invalid/valid JSON backup imports, hidden-by-default `review_required` cards + pending-verification detail warning banner, unsafe-URL import warnings + failed cloud follow-up rollback + localized Spanish 404 routes, and 100% ES/EN translation key parity + segmented ES/EN keyboard switching + hero CTAs + logo home navigation.

### E2E, Accessibility & Responsive Breakdown (`tests/e2e/`)

- **Axe WCAG 2.2 AA Audits (0 violations):** `/`, `/opportunities/int-eth-esop-2027`, `/route`, `/settings`, `/privacy`.
- **Zero Horizontal Overflow Across 8 Viewports:** `320x568`, `360x800`, `375x812`, `390x844`, `768x1024`, `1024x768`, `1280x800`, `1440x900`.
- **200% Zoom Reflow (`wcag22aa`):** `640px` viewport width with doubled base font size (`32px`) maintains zero horizontal overflow.
- **Collision & Navigation Safety:** Verified zero overlapping interactive controls across **all 5 routes** at mobile (`360px`), tablet (`768px`), and desktop (`1280px`), scrolled footer clearance above mobile bottom navigation at `360px`, keyboard-only skip link transition, and `prefers-reduced-motion` launch skip.
- **No-Credentials Runtime Stability:** Verified zero uncaught console errors and zero page errors across `/settings`, `/privacy`, `/opportunities/:id` (`FIREBASE_NOT_CONFIGURED` feedback without crash), and localized 404 fallback without Firebase `.env` keys.
- **Full User & PWA Offline Flows:** Verified onboarding tour -> search -> self-check -> My Route 3-step cap -> reload persistence -> undo -> data wipe, language/window filters, genuine JSON export -> clear -> JSON re-import round-trip, and VitePWA Service Worker activation (`navigator.serviceWorker.ready`) + offline `/route` reload recovery (`context.setOffline(true)`).
- **UX/UI, Non-Overlapping Onboarding, `npm run start` & Visual Verification (`tests/e2e/userFlows.spec.ts` #5 & `artifacts.local/`):** Verified zero bounding-box overlap between `[data-testid="onboarding-tour"]` and all three hero CTAs (`hero-explore-cta`, `hero-route-cta`, `hero-tour-cta`) on first visit at both desktop (`1280x800`) and mobile (`360x800`, `390x844`), dismissal persistence across reloads, real `npm run start` launch with `host: '127.0.0.1'` in `vite.config.ts` (cleanly advancing past busy local ports to `http://127.0.0.1:5175/`, HTTP `200`, brand logo & `Explorar` home navigation), sliding `ES / EN` control (`translateX(0%)` to `translateX(100%)`), honest AI engine status strip, and 8 visually inspected captures in `artifacts.local/` (`ux-home-desktop.png`, `ux-home-mobile.png`, `ux-lang-switch.png`, `ux-detail-desktop.png`, `ux-selfcheck.png`, `ux-ai-panel.png`, `ux-my-route.png`, `ux-settings-desktop.png`).

---

## 2. Production Security & Dependency Check

- **Static Secret & XSS Sink Scan:** Verified zero occurrences of `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `eval(`, `new Function`, or `document.write` inside `src/`.
- **CSP Headers:** Enforced identically across [firebase.json](../firebase.json) and [vercel.json](../vercel.json).
- **`npm audit --omit=dev` Finding:** Reports 4 high-severity advisories on `@grpc/grpc-js <=1.13.5` (`GHSA-m9gg-hp2v-232j` CWE-295 CVSS 7.4 and `GHSA-f596-whhp-79r4` CWE-550 CVSS 3.1) as a transitive dependency of `firebase -> @firebase/firestore -> @firebase/firestore-compat` (`npm audit fix --force` recommends an incompatible downgrade to `firebase@9.14.0`, which predates `firebase/ai`, and `@firebase/firestore@4.20.0` explicitly locks `"@grpc/grpc-js": "~1.9.0"`). **Impact analysis:** `@firebase/firestore` and `@grpc/grpc-js` are neither imported in `src/` nor bundled into `dist/assets/*.js` (`grpcHits: 0`). See [docs/FINAL_AUDIT.md](FINAL_AUDIT.md).

---

## 3. Real Runtime Diagnostics & Honest Limits

Running the isolated Playwright E2E build (`dist-e2e.local` with blank `VITE_FIREBASE_*` env vars) and the production `.env.local` Vite preview build (`dist/`) in **Google Chrome 157** confirmed:

- **Detected browser:** `Google Chrome 157`
- **Chrome Prompt API (`window.LanguageModel`):** API surface supported in Chrome Desktop WebIDL (`typeof window.LanguageModel === 'function'`)
- **Local Gemini Nano status (in this desktop/headless test environment):** `"unavailable"` — surfaced transparently in `/settings` without faking on-device readiness
- **Isolated E2E baseline (`dist-e2e.local`):** `Not configured` with zero console/page errors and clear fallback UI
- **Local `.env.local` production preview (`dist/`):** `Configurado (umbral-21e8b)`, App Check `reCAPTCHA Enterprise (tokens limitados de IA)`, model `gemini-3.5-flash-lite`, verification state `Estado C · App Check inicializado — pendiente de primera solicitud real exitosa a Gemini Cloud`, with `0` console errors and `0` page errors across `/`, `/opportunities/int-eth-esop-2027`, and `/settings` (without executing unnecessary quota-consuming Gemini requests)

**Items requiring hardware / live external operations:**

1. Live Chrome Gemini Nano model download (`initializeDeviceModel`) and hardware-backed `ON_DEVICE` inference on eligible desktop hardware.
2. Live deployment confirmation if publishing updated UX/UI assets to Firebase Hosting (`firebase deploy --only hosting`), plus manual owner re-verification of the 4 `'review_required'` entries (`pe-promigas-billing`, `pe-xylem-electromechanical`, `co-aws-intern`, `es-cybersecurity-94`).
