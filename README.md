# UMBRAL Hybrid AI

[Español](README.es.md) · [Release Readiness Audit](docs/BUILDHYBRIDAI_RELEASE_READINESS.md) · [Devpost Submission](docs/DEVPOST_SUBMISSION.md) · [Final Audit](docs/FINAL_AUDIT.md) · [Production Checklist](docs/PRODUCTION_CHECKLIST.md) · [Firebase Setup](docs/FIREBASE_SETUP.md) · [IDX Handoff Guide](docs/IDX_HANDOFF_GUIDE.md) · [Gemini Nano Setup](docs/GEMINI_NANO_SETUP.md) · [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) · [Testing Evidence](docs/TESTING_EVIDENCE.md) · [Prior Work Attribution](docs/PRIOR_WORK_AND_ATTRIBUTION.md)

**Live Deployments:** [Firebase Hosting (`umbral-21e8b.web.app`)](https://umbral-21e8b.web.app) · [Vercel (`umbral-hybrid-ai.vercel.app`)](https://umbral-hybrid-ai.vercel.app)

**UMBRAL Hybrid AI** is a bilingual (English / Spanish), privacy-first civic opportunity companion built for Google Firebase's **#BuildHybridAI 2026** hackathon. It helps students, job seekers, and early founders discover verified education, scholarship, job, and funding opportunities, run a deterministic requirement check, organize next steps in a local **My Route** workspace, and get structured contextual AI guidance via **Firebase AI Logic Hybrid Inference**.

> **Preservation of Prior Entry:** The original Kiroween 2026 repository ([Alvaro-mendoza-12/Umbral](https://github.com/Alvaro-mendoza-12/Umbral) / [umbral-seven-khaki.vercel.app](https://umbral-seven-khaki.vercel.app)) was kept 100% untouched. All work in this repository was engineered independently on branch `feat/hybrid-ai-web`. See [docs/PRIOR_WORK_AND_ATTRIBUTION.md](docs/PRIOR_WORK_AND_ATTRIBUTION.md).

---

## Core Capabilities

1. **Fast Discovery & Source Transparency (`/`)**:
   - Curated catalog of 20 opportunities (`CURATED_CATALOG_VERSION = 2026.11.14-r1`) across `INT`, `PE`, `CO`, `MX`, `ES`, and `US` with official HTTPS source URLs, timezone-aware deadlines, verification dates (`verifiedAt`), and `reviewBy` expiration checks.
   - Instant filtering by country, category, modality, deadline window, language, and free-text search in 3 clicks or fewer.
2. **Deterministic 4-State Self-Check (`/opportunities/:id`)**:
   - Evaluates a learner's profile against opportunity requirements without ever issuing an official eligibility decision.
   - Separates `MATCH`, `MISMATCH`, `NEEDS_CONFIRMATION`, and `UNKNOWN` (displayed as Match, Mismatch, Needs confirmation, and Unknown) deterministically in pure TypeScript (`src/domain/matcher.ts`), completely independent of LLM availability.
3. **Firebase AI Logic Hybrid Inference (`src/adapters/firebase/`)**:
   - Powered by `firebase/ai` (`firebase@^13.3.0`) with `GoogleAIBackend`, `useLimitedUseAppCheckTokens: true`, and Firebase App Check (`ReCaptchaEnterpriseProvider` in production, optional env-driven debug token in non-production dev).
   - Supports all four Firebase AI Logic modes (`PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`), user-triggered on-device Gemini Nano model initialization (`initializeDeviceModel`), structured JSON outputs (`Schema.object` for cloud and `responseConstraint` JSON schema for on-device Chrome `LanguageModel`), and `ONLY_IN_CLOUD` multi-turn follow-up/comparison (`startChat`).
   - **Privacy-First Cloud Consent Gate (`src/services/aiOrchestrator.ts`)**: Never triggers silent cloud fallback unless the user explicitly enables cloud consent. Every AI card displays the verified execution provenance read directly from `result.response.inferenceSource` (`ON_DEVICE`, `IN_CLOUD`, or `UNVERIFIED`).
4. **My Route Workspace (`/route`)**:
   - Local-first persistence (`localStorage` keys `umbral:route:v2`, `umbral:profile:v1`, `umbral:prefs:v1`) enforcing 1 active goal and up to 3 active checklist steps at a time to reduce cognitive overload, plus offline-friendly export/import and one-click local data deletion.
5. **Accessible, Thoughtful UX (`src/app/`, `src/styles/`)**:
   - Non-blocking center-pulse-to-header launch transition (`IntroSplash`, honors `prefers-reduced-motion`).
   - Keyboard-accessible, non-modal 4-step guided spotlight tour (`OnboardingTour`) with persisted completion state.
   - Responsive mobile-first layout verified across 8 viewport widths (`320px` to `1440px`), 200% zoom reflow, keyboard navigation, PWA offline reload (`/route`), and Axe WCAG 2.2 AA audits.

---

## Tech Stack

- **Frontend:** React 19, TypeScript 5.9, Vite 8, React Router 7, i18next, Lucide Icons, `vite-plugin-pwa`
- **Hybrid AI & Security:** Firebase JS SDK (`firebase@^13.3.0` — `firebase/app`, `firebase/ai`, `firebase/app-check` with `ReCaptchaEnterpriseProvider`), CSP headers configured in both [firebase.json](firebase.json) and [vercel.json](vercel.json)
- **Testing & QA:** Vitest 5 + Testing Library (unit & integration), Playwright + `@axe-core/playwright` (E2E, WCAG 2.2 AA, responsive & reflow tests)

---

## Local Setup & Commands

### Prerequisites

- Node.js `>=20.19.0`
- Google Chrome Desktop `>=139` (required if you want to exercise Chrome Built-in AI `window.LanguageModel` on supported hardware)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase AI Logic (Required for Live Hybrid & Cloud AI Calls)

Copy [.env.example](.env.example) to `.env.local` and supply your Firebase Web App credentials, reCAPTCHA Enterprise Site Key, and cloud model ID:

```ini
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=...
# Optional local dev/CI App Check debug token (never commit real secrets)
VITE_APP_CHECK_DEBUG_TOKEN=
# Cloud Gemini model used via GoogleAIBackend (defaults to gemini-3.5-flash-lite)
VITE_FIREBASE_AI_CLOUD_MODEL=gemini-3.5-flash-lite
```

> **Note when running without `.env.local`:** Catalog browsing, deterministic self-checks, My Route persistence, Settings capability diagnostics, and the entire deterministic test suite run locally without Firebase credentials. Live on-device `GenerativeModel` initialization and cloud Gemini execution require a configured Firebase project with Firebase AI Logic + App Check enabled.

### 3. Run & Verify

```bash
npm run dev          # Start Vite dev server
npm run typecheck    # Strict TypeScript verification
npm run lint         # ESLint 10 check
npm run test         # Vitest unit + integration tests
npm run build        # Typecheck + production Vite + PWA build
npm run test:e2e     # Production build + Playwright E2E + Axe WCAG 2.2 AA suite
```

---

## Architecture & Key Files

- Domain rules & matcher: [src/domain/matcher.ts](src/domain/matcher.ts), [src/domain/catalogRules.ts](src/domain/catalogRules.ts), [src/domain/routeRules.ts](src/domain/routeRules.ts), [src/domain/aiContract.ts](src/domain/aiContract.ts)
- Clean architecture ports & adapters: [src/ports/](src/ports/), [src/adapters/firebase/hybridAiAdapter.ts](src/adapters/firebase/hybridAiAdapter.ts), [src/adapters/firebase/firebaseApp.ts](src/adapters/firebase/firebaseApp.ts), [src/adapters/localCatalogAdapter.ts](src/adapters/localCatalogAdapter.ts), [src/adapters/localRouteAdapter.ts](src/adapters/localRouteAdapter.ts)
- AI consent & capability orchestration: [src/services/aiOrchestrator.ts](src/services/aiOrchestrator.ts), [src/services/browserCapabilities.ts](src/services/browserCapabilities.ts)
- Routes: `/` ([ExplorePage](src/features/explore/ExplorePage.tsx)), `/opportunities/:id` ([OpportunityDetailPage](src/features/detail/OpportunityDetailPage.tsx)), `/route` ([MyRoutePage](src/features/route/MyRoutePage.tsx)), `/settings` ([SettingsPage](src/features/settings/SettingsPage.tsx)), `/privacy` ([PrivacyPage](src/features/privacy/PrivacyPage.tsx))
- Security & deployment configs: [firebase.json](firebase.json), [vercel.json](vercel.json)
- Product discovery & architecture docs: [docs/](docs/)

---

## Current Operational & Submission Transparency

- **Verified locally on Chrome `157.0.8103.51` / Windows 11 (`2026-11-15`):** `npm run typecheck`, `npm run lint`, `npm run test` (10 files, 51 unit/integration tests), `npm run build` (`PWA v1.3.0`), and `npx playwright test --workers=3 --reporter=list` (21 Chromium E2E & WCAG 2.2 AA Axe checks) pass cleanly.
- **Verified live Cloud inference (`IN_CLOUD`):** Both [umbral-21e8b.web.app](https://umbral-21e8b.web.app) and [umbral-hybrid-ai.vercel.app](https://umbral-hybrid-ai.vercel.app) run Firebase AI Logic (`gemini-3.5-flash-lite`) protected by Firebase App Check (`reCAPTCHA Enterprise`, `useLimitedUseAppCheckTokens: true`) and block silent cloud fallback cleanly when Cloud Consent is OFF.
- **Hardware gating for real Gemini Nano 4 (`ON_DEVICE`) execution:** Testing in non-headless Chrome Desktop `157.0.8103.51` downloaded `gemma4_component` (`2026.8.7.929`, `2,360.73 MiB` `weights.bin`) once `>= 20480 MiB` free disk was available on both the Chrome User Data and `%TEMP%`/`%TMP%` volumes, flipping `window.LanguageModel.availability()` to `"available"`. However, creating an active session failed on the `RTX 3050 4 GB` laptop GPU with Chromium `Performance Class: ServiceCrash` and `Enough VRAM: false (0 MiB actual, 3000 MiB required)`. Real `ON_DEVICE` inference verification & demo recording require Chrome Desktop `157+` on hardware with `>= 6–8 GB` dedicated GPU VRAM (or `>= 16 GB` Apple Silicon unified memory) and `>= 25 GB` free disk on `%TEMP%` and Chrome profile drives. See [docs/GEMINI_NANO_SETUP.md](docs/GEMINI_NANO_SETUP.md) and [docs/BUILDHYBRIDAI_RELEASE_READINESS.md](docs/BUILDHYBRIDAI_RELEASE_READINESS.md).
- **Android / iOS clients:** Not included because this entry targets the single-platform **Web/Chrome** category.
