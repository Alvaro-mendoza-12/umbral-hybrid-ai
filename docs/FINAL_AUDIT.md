# Final Technical, Functional, Security & Accessibility Audit — UMBRAL Hybrid AI

**Audit Reference Date:** November 14, 2026  
**Target Hackathon:** `#BuildHybridAI 2026` (Deadline: November 30, 2026, 17:00 PET / 14:00 PST)  
**Repository:** `Alvaro-mendoza-12/umbral-hybrid-ai` (branch `feat/hybrid-ai-web`)  
**Prior Project Isolation:** `Alvaro-mendoza-12/Umbral` and `https://umbral-seven-khaki.vercel.app` left **100% untouched**.

---

## 1. Phase-by-Phase Engineering Closure Summary

### Phase 0 — Architecture & Preservation
- **Preserved Stack:** React `19.3.1`, TypeScript `5.9.3` strict mode, Vite `8.3.8`, React Router `7.18.5`, `i18next` / `react-i18next`, Lucide icons, `vite-plugin-pwa`, Firebase JS SDK (`firebase@^13.3.0`), Vitest `5.1.0`, and Playwright `1.65.1` + `@axe-core/playwright`.
- **Clean Ports & Adapters:** Domain rules (`src/domain/`) are framework-agnostic TypeScript tested directly without DOM/Firebase mocks; runtime adapters sit behind explicit `CatalogPort`, `RoutePort`, and `HybridAIPort`.

### Phase 1 — Catalog Verification & Filtering (`ExplorePage` & `curatedOpportunities`)
- **20 Curated Opportunities Audited (`CURATED_CATALOG_VERSION = '2026.11.14-r1'`):**
  - **5 `open`:** `int-eth-esop-2027` (`rev=2026-11-29`), `int-leiden-lexs-2027` (`rev=2026-11-30`), `co-fondo-emprender-168` (`rev=2026-12-15`), `us-pell-2026` (`America/Chicago`, `rev=2027-01-15`), `us-va-nurse` (`rev=2027-01-15`).
  - **9 `ongoing`:** `pe-abc-digital`, `pe-cse-ofis`, `co-sena-english-1`, `mx-unam-excel`, `mx-nafin-women`, `es-enisa-digital-women`, `int-cs50x-2026`, `int-google-it-support` (`lang=es/en`), `int-yc-startup-school`.
  - **4 `review_required` (Pending Re-Check):** `pe-promigas-billing` (CONADIS Soy Capaz Trujillo 01 vacancy), `pe-xylem-electromechanical` (CONADIS Soy Capaz Xylem Water Solutions Peru), `co-aws-intern` (AWS Job ID `10506034`, Bogotá 12 months), and `es-cybersecurity-94` (Junta de Andalucía IFCT050PO `2025/98/47/EMO2/0089-04/0007`, window `28/10/2026–18/11/2026`, 20 seats). Live requisition/seat availability could not be confirmed interactively against source portals today, so all 4 retain `editorialStatus: 'review_required'` and are **excluded by default** from active results (`filterOpportunities` hides `review_required` whenever `!includeClosed && deadlineWindow !== 'review_required'`), use `Last checked` instead of green `Verified` labels on cards, and show `pill-warn` + `<AlertCircle />` + a prominent `"Pending re-verification"` warning alert on Detail pages.
  - **2 `closed`:** `pe-beca-18-2027`, `pe-innovasuyu-libertad` (updated closing deadline confirmed at `2026-11-12T13:00:00-05:00` `America/Lima`).
- **Completed Filter & Error UX:** Added `language` (`es`, `en`, matching `'es/en'`) and `deadlineWindow` (`closing_soon`, `has_deadline`, `ongoing`, `review_required`) facets in `src/domain/catalogRules.ts` and `ExplorePage.tsx`, desktop 3-column `.finder-grid`, and recoverable catalog `loadError` + Retry state (`role="alert"`).
- **Peru Eligibility Transparency:** International scholarships/courses in the curated international cohort (`PE` listed in `eligibleCountries`) were checked against restrictions (`int-leiden-lexs-2027` clarifies non-EEA rules apply broadly including `PE`, while EEA applicants face Advanced LLM / MSc IRD restrictions).

### Phase 2 — Deterministic 4-State Self-Check Engine (`src/domain/matcher.ts`)
- **Pure TypeScript Rule Engine:** Independent of LLM execution, always returns `MATCH`, `MISMATCH`, `NEEDS_CONFIRMATION`, or `UNKNOWN`, accompanied by a disclaimer noting pre-check orientation only.
- **Refinements Verified:**
  - Separated `mandatoryCounts` vs `optionalCounts` and appended non-blocking notes onto `mandatory: false` items (`evaluateCriterion` wrapper over `evaluateCriterionCore`).
  - Added `detectProfileContradictions` flagging contradictory residence country + `"No"` legal authorization on `requiresExternalVerification` country requirements and marking that country criterion as `MISMATCH`.
  - Fixed i18n key bug `detail.selfCheck.educationOptions.` -> `detail.selfCheck.authOptions.unselected` in `SelfCheckPanel.tsx`.
  - Added unit coverage for optional rules, contradictions, and incomplete profile resistance against false positives.

### Phase 3 — Firebase AI Logic Hybrid Inference & Consent Gate
- **4 Inference Modes (`PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`):** Audited end-to-end across `src/services/aiOrchestrator.ts` and `src/adapters/firebase/hybridAiAdapter.ts`.
- **Privacy & Stability Hardening:**
  - Explicit cloud consent gate blocks silent fallback from `PREFER_ON_DEVICE` to Cloud unless `cloudConsentGranted === true` (and clamps `PREFER_ON_DEVICE` -> `ONLY_ON_DEVICE` when ready locally with consent off).
  - Early `ONLY_ON_DEVICE` guard in `FirebaseHybridAIAdapter.runStructuredTask` rejects immediately with `ON_DEVICE_UNAVAILABLE` if `LanguageModel` is not `'available'`, and `HybridReadinessPill` requires `isNavigatorOnline()` (`isOnline`) before rendering `cloudPill` so offline browsers never present Firebase Cloud AI as ready.
  - Added `REQUEST_TIMEOUT` protection (`DEFAULT_STRUCTURED_TIMEOUT_MS = 45_000`, `DEFAULT_CLOUD_CHAT_TIMEOUT_MS = 35_000`) via `raceWithAbortAndTimeout` ensuring `clearTimeout`, `AbortController` cleanup, and cancellation error mapping (`TimeoutError` / `REQUEST_TIMEOUT`) without UI hangs.
  - Added non-blocking `downloadError` alert banners in `HybridAIPanel.tsx` & `SettingsPage.tsx` and explicit `downloadNeedsFirebase` guidance when `window.LanguageModel` reports `downloadable` without `.env` credentials.
  - SDK inspection (`@firebase/ai/dist/ai-public.d.ts`) confirmed `GenerativeModel` exposes `initializeDeviceModel`, `generateContent`, `generateContentStream`, `startChat`, and `countTokens` (no `.destroy()` handle; cancellation relies on request `{ signal }`).
  - Multi-turn `startChat` cloud turns strictly honor `ONLY_IN_CLOUD`, consent, non-PII logging (`timestamp: new Date().toISOString()` fix verified), and localized turn labels (`You` / `Tú` vs `Firebase Cloud AI`).
  - Verified provenance badges derive exclusively from `result.response.inferenceSource` (`ON_DEVICE`, `IN_CLOUD`, or `UNVERIFIED`).

### Phase 4 — Security, CSP & Dependency Vulnerability Analysis
- **CSP & HTTP Headers:** Audited matching strict rules across [firebase.json](../firebase.json) and [vercel.json](../vercel.json): `worker-src 'self'`, `manifest-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and strict `script-src`/`connect-src`/`frame-src` scoped exclusively to `'self'`, Googleapis, Firebase, and reCAPTCHA Enterprise.
- **No XSS Sinks / No Production Debug Backdoor:** Zero occurrences of `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `eval(`, `new Function`, or `document.write` across `src/`, and zero `.env` or debug tokens in `dist/`. `src/adapters/firebase/firebaseApp.ts` gates `FIREBASE_APPCHECK_DEBUG_TOKEN` behind `!import.meta.env.PROD`, disabling debug mode automatically in production bundles. `normalizeMyRouteState()` rejects non-HTTPS `officialUrlSnapshot` entries (`isSafeHttpsUrl`), preventing `javascript:`/`http:` persistence via imported backups.
- **`npm audit --omit=dev` Technical Investigation (`@grpc/grpc-js`):**
  - **Reported Findings:** 4 propagated `high` entries (`@grpc/grpc-js`, `@firebase/firestore`, `@firebase/firestore-compat`, `firebase`), caused by two advisories affecting `@grpc/grpc-js <= 1.13.5`:
    1. `GHSA-m9gg-hp2v-232j` (High, CWE-295, CVSS 3.1 `7.4` `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N`, patched in `>= 1.13.6`): `getAuthContext` can report unauthorized peer TLS certificates under certain Node gRPC configurations.
    2. `GHSA-f596-whhp-79r4` (Low standalone / CWE-550, CVSS 3.1 `3.7`, patched in `>= 1.13.6`): server error message reflection in gRPC status messages.
  - **Dependency Chain & Upgrade Check:** `umbral-hybrid-ai@1.0.0 -> firebase@13.3.0 (latest) -> @firebase/firestore@4.20.0 (and @firebase/firestore-compat) -> @grpc/grpc-js@1.9.16`. Because `@firebase/firestore@4.20.0` explicitly locks `"@grpc/grpc-js": "~1.9.0"`, `@grpc/grpc-js@1.14.7` cannot be installed via semver-compatible resolution, and `npm audit fix --force` proposes an incompatible downgrade to `firebase@9.14.0` (which removes `firebase/ai`).
  - **Production Execution Feasibility & Bundle Verification:** `@grpc/grpc-js` is a server/Node gRPC dependency inside `@firebase/firestore`; UMBRAL imports only `firebase/app`, `firebase/app-check`, and `firebase/ai`. Inspecting built browser chunks (`dist/assets/*.js`) confirms zero `@grpc/grpc-js` runtime code (`grpcHits: 0`), with only Firebase's standard internal component name string registry present inside `@firebase/app`.
  - **Residual Risk & Mitigation:** Residual lockfile audit noise remains until Firebase upstream bumps `@firebase/firestore`'s `@grpc/grpc-js` dependency beyond `~1.9.0`; zero runtime exploitability exists in UMBRAL's client SPA/PWA bundle.

### Phase 5 & Phase 6 — My Route Focus & Offline PWA Support
- **My Route (`src/domain/routeRules.ts`, `MyRoutePage.tsx`):** Preserved 1 active goal with `confirmReplace` guard and 3-active-step cognitive guardrail. Fixed inline task `<input>` missing `aria-label` (`route.taskEditLabel`) and hardcoded status `<select>` label (`route.taskStatusLabel`).
- **Validated JSON Export & Import (`parseAndValidateRouteImport`):** Added 512 KB `MAX_ROUTE_IMPORT_BYTES` check, schema typing (`INVALID_JSON`, `INVALID_SCHEMA`, `UNSUPPORTED_VERSION`, `FILE_TOO_LARGE`), v1 -> v2 state upgrade, `javascript:`/`http:` URL filtering (`rejectedUrlsCount`), and active-task cap enforcement.
- **PWA Offline Routing (`vite.config.ts`):** Added `workbox.navigateFallback: '/index.html'` (`precache 18 entries`, `dist/sw.js`), verified live in Playwright E2E by loading `/route` online, going offline (`context.setOffline(true)`), and reloading `/route` cleanly with zero network errors.

### Phase 7 — Accessibility & Responsive Verification
- Full bilingual parity verified programmatically (`In EN not ES: []`, `In ES not EN: []`).
- WCAG 2.2 AA (`AxeBuilder` with `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), 200% zoom reflow (`640px` + `32px` root scale), overlapping control detection across mobile (`360px`), tablet (`768px`), and desktop (`1280px`) widths on all 5 routes, keyboard-only skip link navigation, and **8 viewport widths** (`320px`, `360px`, `375px`, `390px`, `768px`, `1024px`, `1280px`, `1440px`) all pass cleanly.

### Phase 8 — Firebase AI Logic Integration Readiness & Autonomous RC Polish
- **Installed SDK Verification (`firebase@13.3.0` / `@firebase/ai@3.1.0` / `@firebase/app-check`):** Inspected installed ESM bundles to verify `GoogleAIBackend`, `DEFAULT_HYBRID_IN_CLOUD_MODEL = 'gemini-3.5-flash-lite'`, `getAI(..., { useLimitedUseAppCheckTokens: true })`, `getGenerativeModel`, `initializeDeviceModel`, `startChat`, `Schema`, `ReCaptchaEnterpriseProvider`, and `CustomProvider` compatibility, plus CSP alignment with `https://firebasevertexai.googleapis.com`, `https://content-firebaseappcheck.googleapis.com`, and `https://www.google.com/recaptcha/enterprise.js`.
- **Diagnostic & Error Differentiation Hardening:** Prioritized non-production App Check debug-token initialization cleanly before `siteKey` (`!import.meta.env.PROD`), separated cloud vs local `API_NOT_ENABLED` (`AI_EXECUTION_FAILED` vs `ON_DEVICE_UNAVAILABLE`), added `AI_SAFETY_OR_QUOTA` (`429`/`RESOURCE_EXHAUSTED`), surfaced live **States A–E** diagnostics and `kind · requestedMode → inferenceSource` execution log provenance in `/settings`, and protected `.firebaserc` in `.gitignore`.
- **Autonomous Bug Fixes Applied Across UI & Routes:**
  - Localized `NotFoundView` (404) and route `Suspense` loading fallback in [App.tsx](../src/app/App.tsx) via `react-i18next`.
  - Guarded startup capability probe against unhandled rejections in [AppContext.tsx](../src/app/AppContext.tsx).
  - Keyed `OpportunityDetailContent` by route `id`, added `loadError` + Retry recovery and localized `notFoundTitle`/`notFoundBody` alerts, and keyed `<HybridAIPanel key={opportunity.id}>` in [OpportunityDetailPage.tsx](../src/features/detail/OpportunityDetailPage.tsx).
  - Rolled back orphaned user turns and restored draft questions when cloud follow-up calls fail, isolated inline chat consent banners alongside the chat form, and added visible `offlineChatHint` text when offline in [HybridAIPanel.tsx](../src/features/detail/HybridAIPanel.tsx).
  - Surfaced `rejectedUrlsCount` warnings (`route.importedNoticeWithRejected`) when My Route JSON imports omit non-HTTPS links in [MyRoutePage.tsx](../src/features/route/MyRoutePage.tsx).
