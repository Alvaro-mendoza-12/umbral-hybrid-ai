# UMBRAL Hybrid AI — `#BuildHybridAI 2026` Eligibility & Release Readiness Audit

**Audit Timestamp:** 2026-11-15T10:02-05:00 (`2026-11-15T15:02Z`)  
**Repository:** `D:\umbral-hybrid-ai` (branch `feat/hybrid-ai-web`, synced with `origin/feat/hybrid-ai-web` from `b8d16fb`)  
**Remote Repo:** `https://github.com/Alvaro-mendoza-12/umbral-hybrid-ai` (default branch `feat/hybrid-ai-web`, GitHub detected license: **`Apache-2.0`**)  
**Live Deployments Audited:** `https://umbral-21e8b.web.app` (Firebase Hosting) & `https://umbral-hybrid-ai.vercel.app` (Vercel)  
**Hackathon Category & Deadline:** **Web/Chrome** · Deadline **November 30, 2026, 2:00 PM PST** (`2026-11-30T22:00:00Z`)  

---

## Executive Verdict: `BLOCKED` (READY IN CODE/PROD/GITHUB — ONLY HARDWARE `ON_DEVICE` & VIDEO CAPTURE PENDING)

The engineering Release Candidate passes **100% of automated typechecking, linting, unit/integration tests, production build, and Playwright/Axe WCAG 2.2 AA suites**, is committed and pushed on `origin/feat/hybrid-ai-web`, displays canonical **`Apache-2.0`** license detection on GitHub, and runs identically on **both** `https://umbral-21e8b.web.app` and `https://umbral-hybrid-ai.vercel.app` with `firebaseApp-DzoUPO1a.js` (`useLimitedUseAppCheckTokens: true`), Firebase App Check + reCAPTCHA Enterprise, zero-silent-fallback privacy gating, and verified live Cloud inference (`gemini-3.5-flash-lite`, `HTTP 200 OK`).

However, **UMBRAL Hybrid AI cannot honestly be declared `READY` to click Submit today (`2026-11-15`)** because **2 hardware/media release blockers** remain open and cannot be completed without compatible GPU/Apple Silicon hardware + recording:

| Priority | Remaining Open Blocker | Current State | Impact on Submission |
| :--- | :--- | :--- | :--- |
| **P0** | **Real `ON_DEVICE` Gemini Nano 4 inference unverified on current laptop** | Chrome Desktop `157.0.8103.51` downloaded `gemma4_component` (`2026.8.7.929` / `2,360.73 MiB` `weights.bin`) to `D:` (`availability() === "available"`), then `OnDeviceModelService` hit `Performance Class: ServiceCrash` + `Enough VRAM: false (0 MiB actual, 3000 MiB required)` + `Model crash count: 3 / 3` on `RTX 3050 4 GB Laptop GPU`. **`result.response.inferenceSource === 'ON_DEVICE'` was NOT achieved.** | Mandatory hackathon core requirement & offline demo proof |
| **P0** | **Demo video generated locally (`02:06` MP4 + `.srt`); YouTube upload & compatible `ON_DEVICE` capture pending** | Full narrated `1280x720` H.264/AAC video with burned-in English subtitles and real production capture built at `deliverables/umbral-hybrid-ai-demo-2026.mp4` (`126.47s`), without faking `ON_DEVICE` execution; user only needs to upload to public YouTube (and optionally swap Scene 4 on a `>= 6–8 GB` VRAM / Apple Silicon machine). | Required public YouTube deliverable on Devpost |

Previously identified engineering/repo blockers **resolved & verified since `3102fac` (`b8d16fb` + live redeploys)**:
- **GitHub Repository Sync (`PASS`):** All Release Candidate source files, tests, and documentation pushed cleanly to `Alvaro-mendoza-12/umbral-hybrid-ai` (`feat/hybrid-ai-web`, zero secrets tracked).
- **Canonical License (`PASS`):** `LICENSE` restored verbatim from `https://www.apache.org/licenses/LICENSE-2.0.txt` (`Copyright 2026 Alvaro Mendoza`); GitHub API now reports `"license": "Apache-2.0"`.
- **Live Production Parity (`PASS`):** Both `https://umbral-21e8b.web.app` and `https://umbral-hybrid-ai.vercel.app` now serve `index-CkzAQNe2.js` + `firebaseApp-DzoUPO1a.js` (`hasLimitedUse=True`, `hasReCaptcha=True`).
- **Documentation & UI Polish (`PASS`):** `README.md`, `README.es.md`, `docs/GEMINI_NANO_SETUP.md`, `docs/TESTING_EVIDENCE.md`, and `docs/PRODUCTION_CHECKLIST.md` updated for Chrome 157 flags (`#prompt-api`, `#prompt-api-multimodal-input`, `#gemma4-for-built-in-ai`), `20480 MiB` (`>= 25 GB` on BOTH User Data and `%TEMP%`), and `>= 3000 MiB` VRAM gate; `opportunities.ts` duplicate modality labels removed; `OpportunityDetailPage.tsx` `Cost & funding` layout fixed; `SettingsPage.tsx` download progress bar mounted cleanly during `downloading`.

---

## 1. Gemini Nano 4 Verification on Real Chrome Desktop `157.0.8103.51`

### 1.1 Hardware & OS Test Environment Observed
- **OS:** Microsoft Windows NT `10.0.26300.0` (Windows 11)
- **CPU:** `AMD Ryzen 7 7435HS`
- **System RAM:** `15.82 GB`
- **GPU (observed via WMI & `chrome://gpu`):** `NVIDIA GeForce RTX 3050 Laptop GPU` (`AdapterRAM = 4095 MB`, Driver `32.0.15.8108`, `*ACTIVE*`, DirectML `5.0`, D3D12 `12.2`, WebGPU `Hardware accelerated`)
- **Browser:** Non-headless Google Chrome Desktop `157.0.8103.51` (`C:\Program Files\Google\Chrome\Application\chrome.exe`)
- **Storage observed:** `C:` `8.93 GB` free (447.39 GB total, below Chromium's `20480 MiB` threshold) · `D:` `268.40 GB` free (931.5 GB total)

### 1.2 Step-by-Step Empirical Observations & Root Causes
1. **Default C:\ Profile / Temp Failure (`unavailable` -> mid-download exhaustion):**
   - `chrome://on-device-internals` enforces `Enough disk space to install: 20480 MiB required` (`20 GiB`) and `Enough disk space to retain: 5120 MiB required`. Because `C:` had under `20 GiB` free, default `C:` profiles immediately returned `window.LanguageModel.availability() === "unavailable"`.
   - Even when creating Chrome user data on `D:`, Chromium's `chrome_url_fetcher` downloads the multi-GB compressed archive into OS `%TEMP%`/`%TMP%` (`C:\Users\gamer\AppData\Local\Temp` by default), exhausting `C:` free space down to `4.57 GB` at `98.2%` (`2.2 GB / 2.3 GB`) during early download tests (subsequently cleaned up, restoring `C:` to `15.48 GB`).
2. **Clean Default-Flag Profile on `D:` (`268 GB` free):**
   - Launching real Chrome Desktop `157.0.8103.51` with **zero flags enabled** (`--user-data-dir` on `D:`) yielded:
     `{"api":true,"availDefault":"downloadable","availEn":"downloadable"}`.
3. **Full Download Completed on `D:` (`TEMP`/`TMP` & Profile on `D:`):**
   - Redirecting `TEMP` & `TMP` to `D:` and triggering UMBRAL's `"Download / initialize local model"` (`model.initializeDeviceModel`) downloaded `~4.2 GB` staged in `TEMP` over `~240s` and unpacked:
     - Component: `gemma4_component` `2026.8.7.929` -> **`Ready 100% Error: None`**
     - Model weights: `OptGuideManifestModel\7feacbfe693922f1d6422391a2fec1202689398bbd985d3f0aa13bd765cabeda\2026.8.7.929\weights.bin` (**`2,360.73 MiB`**, listed in `chrome://on-device-internals` as **`gemma4_cpu_model`**, Backend Type **`CPU`**)
     - Use cases shown in `chrome://on-device-internals`: `prompt_api_gemma4: Available`, `summarizer_gemma4: Available`, `writing_assistance_api_gemma4: Available`
     - `window.LanguageModel.availability()` transitioned cleanly to `"available"` (default, `en`, `es`), and UMBRAL's top-bar pill updated to **`On-device AI ready`**.
4. **Session Creation & Inference Verdict (`BLOCKED` — `ServiceCrash` / VRAM Gate):**
   - **Test 1 (UMBRAL `PREFER_ON_DEVICE`, Cloud Consent OFF, live Vercel app):** Triggering `"Explain requirements"` resulted in zero cloud network calls (`[]`), and failed at session creation with:
     `InvalidStateError: The device is unable to create a session to run the model. Please check the result of availability() first.`
   - **Test 2 (Browser restart with downloaded `2,360.73 MiB` `weights.bin` already on disk):**
     - `LanguageModel.availability()` returned `"available"`, then calling `LanguageModel.create(...)` crashed Chrome's model utility process with `InvalidStateError` (`"The device is unable to create a session to run the model..."`), followed on the next attempt by:
       `NotSupportedError: The model process crashed too many times for this version. Check chrome://crashes for additional information.`
     - UMBRAL caught this failure without silently falling back to cloud (`CLOUD CALLS === []`) and rendered `ON_DEVICE_UNAVAILABLE`.
   - **Exact Chromium Internals Telemetry Observed (`chrome://on-device-internals` + `Local State` + `chrome://crashes`):**
     - `Device performance class: Error` (`Broker State -> Performance Class: ServiceCrash`, `performance_class: 7`)
     - `Enough VRAM: false (0 MiB actual, 3000 MiB required)`
     - `Model crash count (current/maximum): 3 / 3` (`Crashpad` generated fresh `.dmp` minidumps; `chrome://crashes` recorded crashes at session init)
   - **Conclusion:** Real **`ON_DEVICE`** inference (`result.response.inferenceSource === 'ON_DEVICE'`) was **NOT** verified on this machine and is therefore reported strictly as **`BLOCKED`**.

### 1.3 Hardware / Configuration Required to Pass `ON_DEVICE` Verification & Record the Demo
To demonstrate real `ON_DEVICE` Gemini Nano 4 inference and capture demo video/screenshots cleanly before submission:
- **GPU / Memory:** Desktop or laptop GPU passing Chrome's **`>= 3000 MiB` detected free VRAM** gate (`> 4 GB` dedicated VRAM recommended, e.g., **NVIDIA RTX 3060 6GB/12GB, RTX 4060 8GB**, or **Apple Silicon M1/M2/M3/M4 with `>= 16 GB` unified memory**) so `chrome://on-device-internals` shows `Enough VRAM: true` and a non-error `Performance Class`.
- **Disk Space:** **`>= 25 GB` free** on **both** the OS `%TEMP%`/`%TMP%` drive and Chrome User Data drive (`chrome://on-device-internals` enforces `>= 20480 MiB` free to install + `~4.2 GB` temporary staging + `2.36 GiB` unpacked model).
- **Browser:** Real non-headless Chrome Desktop `157+` (or current Canary/Dev matching `#BuildHybridAI` Chrome Built-in AI release notes) with `#prompt-api`, `#prompt-api-multimodal-input`, and `#gemma4-for-built-in-ai` verified if not enabled by default.

---

## 2. Gemini Cloud, Firebase AI Logic & App Check Audit

| Component | Local RC Source & `dist/` Build | Live Prod (`umbral-21e8b.web.app` & `umbral-hybrid-ai.vercel.app`) | Status |
| :--- | :--- | :--- | :--- |
| **Firebase AI Logic SDK (`firebase/ai`)** | Imports `GoogleAIBackend`, `InferenceMode`, `InferenceSource`, `getAI`, `getGenerativeModel`, `initializeDeviceModel` cleanly (`src/adapters/firebase/firebaseApp.ts`, `hybridAiAdapter.ts`). | Serves `firebase/ai` runtime (`index.esm-DT2blkuW.js`) dynamically loaded on AI demand. | **`PASS`** |
| **Gemini Cloud Inference (`gemini-3.5-flash-lite`)** | Configured via `VITE_FIREBASE_AI_CLOUD_MODEL=gemini-3.5-flash-lite` (`.env.example`, `firebaseStatus.ts`). | Live `POST https://firebasevertexai.googleapis.com/v1beta/projects/umbral-21e8b/models/gemini-3.5-flash-lite:generateContent` returned **`HTTP 200 OK`** with structured grounded JSON responses on **both** Vercel (`680` chars) and Firebase Hosting (`861` chars), UI badge **`Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`**, `0` console/page errors. | **`PASS`** |
| **App Check + reCAPTCHA Enterprise** | `ReCaptchaEnterpriseProvider` active in production (`import.meta.env.PROD`); debug token strictly disabled in PROD (`firebaseStatus.ts`, `firebaseApp.ts`). | Verified `hasAppCheckHeader: true` (`x-firebase-appcheck`) attached to live `firebasevertexai.googleapis.com` requests on both domains; reCAPTCHA Enterprise executes cleanly under strict CSP (`firebase.json`, `vercel.json`). | **`PASS`** |
| **Limited-Use Tokens (`useLimitedUseAppCheckTokens: true`)** | **Present** in `src/adapters/firebase/firebaseApp.ts` (`getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true })`) and verified inside `dist/assets/firebaseApp-DzoUPO1a.js`. | **Verified live** on BOTH `umbral-21e8b.web.app` and `umbral-hybrid-ai.vercel.app` (`Chunk=firebaseApp-DzoUPO1a.js`, `hasLimitedUse=True`, `hasReCaptcha=True`). | **`PASS`** |
| **Cloud Consent Gate & Zero Silent Fallback** | Enforced in `AIOrchestrator` (`CLOUD_CONSENT_REQUIRED`, `CLOUD_CONSENT_REQUIRED_FOR_FALLBACK`, overriding `PREFER_ON_DEVICE` to `ONLY_ON_DEVICE` when consent is false). Verified in unit & integration tests. | Verified live via Playwright on both `.web.app` and `.vercel.app`: clicking `Explain requirements` without consent shows `Cloud AI Consent Required` banner with **`vertex calls: 0`**. | **`PASS`** |
| **Security Headers & Secrets Hygiene** | `.gitignore` ignores `.env*` & `*.local`. `git ls-files` and untracked file scans found **zero real API keys, private keys, or debug tokens** committed or tracked. | Both domains serve identical `200 OK` CSP (`default-src 'self'`, `script-src`/`frame-src` scoped to Google reCAPTCHA, `connect-src` scoped to `*.googleapis.com`/`*.firebaseio.com`, `worker-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), `X-Frame-Options: DENY`, HSTS, `X-Content-Type-Options: nosniff`. | **`PASS`** |

---

## 3. 12-Point Official Rule Verification (`#BuildHybridAI 2026`)

| # | Requirement | Status | Concrete Observed Evidence & Gaps |
| :--- | :--- | :--- | :--- |
| 1 | **Web/Chrome application (`Web/Chrome` category)** | **`PASS`** | React 19 + Vite PWA targeting desktop & mobile Chrome, hosted on Firebase Hosting & Vercel (`200 OK`, zero console/page errors, `playwright` Chromium 21/21 pass). |
| 2 | **Gemini Nano 4 (`Prompt API`) via Firebase AI Logic** | **`BLOCKED`** | SDK integration verified in code (`InferenceMode.PREFER_ON_DEVICE` / `ONLY_ON_DEVICE`, `model.initializeDeviceModel`, `responseConstraint`) and Chrome 157 downloaded `gemma4_component` (`2026.8.7.929`, `2,360.73 MiB`), **but session creation hit Chromium `ServiceCrash` / `0 MiB VRAM` on the 4 GB RTX 3050 test laptop — real `ON_DEVICE` inference could not execute.** |
| 3 | **Runtime `firebase/ai` import and SDK execution** | **`PASS`** | `src/adapters/firebase/firebaseApp.ts` & `hybridAiAdapter.ts` import `firebase/ai`, initialize `getAI` + `GoogleAIBackend`, call `getGenerativeModel(...).generateContent(...)`, and read `result.response.inferenceSource` (`IN_CLOUD` confirmed live; `ON_DEVICE` tested in mocked unit/integration tests and failed cleanly on incompatible VRAM). |
| 4 | **Firebase App Check enabled & active** | **`PASS`** | Live `x-firebase-appcheck` (`reCAPTCHA Enterprise`) confirmed `200 OK` on both live URLs alongside `useLimitedUseAppCheckTokens: true` (`firebaseApp-DzoUPO1a.js`, `hasLimitedUse=True`) and `CustomProvider` dev isolation outside PROD. |
| 5 | **Functional application (no crashes/broken links)** | **`PASS`** | Both `umbral-21e8b.web.app` and `umbral-hybrid-ai.vercel.app` load home, SPA detail deep links (`/opportunities/int-eth-esop-2027`), self-check, Cloud AI, `/route`, `/settings`, `/privacy` with `[]` console/page/HTTP errors. |
| 6 | **Public GitHub repository (`Umbral Hybrid AI`)** | **`PASS`** | `https://api.github.com/repos/Alvaro-mendoza-12/umbral-hybrid-ai` confirms `"private": false` on default branch `feat/hybrid-ai-web`, synced cleanly from `b8d16fb` (`75` RC files pushed). |
| 7 | **Visible Open Source license on repository** | **`PASS`** | Canonical SPDX `Apache-2.0` text (`apache.org/licenses/LICENSE-2.0.txt`, `Copyright 2026 Alvaro Mendoza`) verified via GitHub API: `"license": "Apache-2.0"`. |
| 8 | **Complete source code cleanly accessible** | **`PASS`** | Complete buildable RC source code, 51 unit/integration tests, 21 Playwright/Axe E2E specs, and documentation are cleanly accessible on `origin/feat/hybrid-ai-web`. |
| 9 | **Clear install, config & run instructions (`<= 3` min testability)** | **`PASS`** | `README.md`, `README.es.md`, `.env.example`, `npm run start`, `docs/FIREBASE_SETUP.md`, `docs/GEMINI_NANO_SETUP.md`, and `docs/DEVPOST_SUBMISSION.md` provide full setup steps updated for Chrome 157 flags (`#prompt-api`, `#prompt-api-multimodal-input`, `#gemma4-for-built-in-ai`), `20480 MiB` (`>= 25 GB` on User Data & `%TEMP%`), and `>= 3000 MiB` VRAM requirements. |
| 10 | **Free & accessible for judges (no paywall/login wall)** | **`PASS`** | Zero authentication/sign-up required; public URLs accessible without login, Spark-compatible client architecture, deterministic matcher + My Route work 100% offline. |
| 11 | **English compatibility (UI & Devpost materials)** | **`PASS`** | Segmented `ES` / `EN` toggle (`384` keys in both `en/translation.json` and `es/translation.json`, `0` missing keys), bilingual catalog/self-check/AI prompts, complete English Devpost copy in `docs/DEVPOST_SUBMISSION.md`. |
| 12 | **Zero private credentials / secrets / debug tokens leaked** | **`PASS`** | Tracked files & untracked docs scanned cleanly (`0` secret pattern matches); `VITE_APP_CHECK_DEBUG_TOKEN` gated by `import.meta.env.PROD ? '' : ...`; Replay Protection & Spark billing untouched. |
| 13 | **Native mobile / secondary OS tracks (Android AICore / iOS Foundation Models)** | **`NOT_APPLICABLE`** | UMBRAL targets exclusively the **Web/Chrome** category (`Web/Chrome` single-platform entry per rules; multi-platform is optional for Grand Prize). |
| 14 | **Additional Firebase backend products (Auth / Firestore / Remote Config / Extensions)** | **`NOT_APPLICABLE`** | Architecture intentionally keeps user goals, checklists, and self-checks private in browser `localStorage` with zero sign-up wall. |

---

## 4. Prior Work & Attribution Audit (Cutoff: November 11, 2026, 1:30 PM PST = `2026-11-11T21:30:00Z`)

GitHub API verification shows exact timeline separation between the prior static prototype (`Alvaro-mendoza-12/Umbral`) and this `#BuildHybridAI 2026` project (`Alvaro-mendoza-12/umbral-hybrid-ai`):

| Artifact / Dimension | Prior Prototype (`Alvaro-mendoza-12/Umbral`, MIT) | Hackathon Project (`Alvaro-mendoza-12/umbral-hybrid-ai`, Apache-2.0) |
| :--- | :--- | :--- |
| **Timeline vs `2026-11-11T21:30:00Z` Cutoff** | Initial commit `813c87a` (`2026-11-11T03:29:05Z`) through `f052d2a` (`2026-11-11T21:15:48Z`, 14 min before cutoff), followed by Kiroween wrap-up PRs `#1` (`aa63bc2`, `2026-11-12T00:59:53Z`) and `#2` (`072af38`/`5c77941`, `2026-11-12T01:43:38Z`). Live at `https://umbral-seven-khaki.vercel.app`. | Created strictly **after** cutoff: `72e3a38` (`2026-11-12T06:28:11Z`) -> `63ac16a` (`06:48:58Z`) -> `d920dc7` / `d82594b` / `3102fac` (`2026-11-14T06:25:37Z`) -> `b8d16fb` (`feat/hybrid-ai-web` Release Candidate + canonical `Apache-2.0` + post-deploy readiness sync). |
| **Dependencies (`package.json`)** | `react` 18, `react-router-dom`, `i18next`, `react-i18next`, `i18next-browser-languagedetector` (**zero** Firebase, zero Gemini, zero PWA, zero Vite-plugin-pwa, zero Lucide/testing). | Upgraded to React 19, TypeScript, Vite `8.3.8`, `firebase ^13.3.0`, `vite-plugin-pwa`, `@fontsource-variable/*`, `lucide-react`, `vitest`, `@testing-library/react`, `@playwright/test`, `@axe-core/playwright`. |
| **Reused Concepts / Preserved Foundations** | Core social-impact thesis (verified opportunity cards, 4-state `Match / Mismatch / Needs confirmation / Unknown` logic concept, 1-goal / 3-step planner concept, EN/ES localization). | Cleanly preserved & hardened in `src/domain/matcher.ts`, `catalogRules.ts`, `routeRules.ts`, verified catalog entries (expanded & curated to 20 opportunities across 6 scopes). |
| **New `#BuildHybridAI 2026` Engineering** | None (pure static client). | **100% new:** `FirebaseHybridAIAdapter` + `firebaseApp.ts` (`firebase/ai`, `GoogleAIBackend`, `InferenceMode`, `useLimitedUseAppCheckTokens`), `AIOrchestrator` (explicit Cloud consent & zero-silent-fallback enforcement, cancellation/timeouts), `browserCapabilities` Chrome Prompt API prober, `aiContract.ts` schema validation & untrusted-data framing, Firebase App Check (`ReCaptchaEnterpriseProvider` + dev `CustomProvider`), CSP hardening (`firebase.json` + `vercel.json`), PWA offline cache, `UnifiedRequirementsCheck` + `HybridAIPanel` Copilot + redesigned editorial UI & `OnboardingTour`, **51 Vitest + 21 Playwright/Axe tests**. |

*Zero unverified user telemetry, usage numbers, or external user claims are asserted anywhere in this report or in Devpost materials.*

---

## 5. UX/UI & Product Coherence Evaluation

Direct inspection of live EN/ES screenshots (`live-vercel-home-en.png`, `live-vercel-mobile-en.png`, `live-vercel-selfcheck-en.png`, `live-vercel-cloud-ai-en.png`, `live-firebase-cloud-ai-en.png`, `live-vercel-route-en.png`, `gemini-nano-4-on-device-failure.png`) and code modules confirms:
- **Anti-"Long Document" Scannability (`PASS`):** Explorer `/` displays clean metadata cards (max 14 active default, 2+ visible above the fold on `1280x800` and first card clearly above bottom bar on `390x844`), segmented ES/EN toggle works without shift, and technical Firebase/session diagnostics live inside a collapsed `<details>` accordion on `/settings`.
- **Self-Check & AI Copilot (`PASS`):** Detail view `/opportunities/:id` places At-a-Glance 3-card summary above the unified `Requirements & your fit` 4-state check and opens a clear right-hand AI rail (desktop) / accessible modal bottom sheet (`<960px`) with explicit `Automatic / On this device / Cloud` choices, evidence citations (`Sources used (4)`), and 1-click `Add to My Route`.
- **My Route (`PASS`):** Clear KPI bar (`1/1` goal, `1/3` steps, `Saved calls`), progress bar, inline editing, portable JSON/Markdown backup with HTTPS validation, and verified offline PWA reload.
- **Polish Status (`b8d16fb` & Live Verification):**
  1. **FIXED & VERIFIED ON LIVE PROD:** Removed redundant modality suffixes across 8 `locationLabel` entries in `src/data/opportunities.ts` (`Zurich, Switzerland · On-site`, no more `Onsite · On-site`).
  2. **FIXED & VERIFIED ON LIVE PROD:** Wrapped Card 3 `.glance-sub` (`Cost & funding`) in a single `<span>` in `src/features/detail/OpportunityDetailPage.tsx` so prose flows inline inside the `Benefits` card.
  3. **FIXED & VERIFIED:** `src/features/settings/SettingsPage.tsx` renders `<progress>` both during active downloads and whenever `avail === 'downloading'`.
  4. **Minor non-blocking note:** Desktop category chip scroller clips `"Civic & P"` at the right edge at `1280px` width unless scrolled horizontally (`ExplorePage.tsx`).
  5. **Minor non-blocking note:** Browser native `<input type="date">` placeholder renders `dd/mm/aaaa` per Windows OS locale even when UMBRAL is set to `EN`.

---

## 6. Devpost Materials & Demo Package

Prepared in full English (plus Spanish voiceover + English `.srt` cues) in [docs/DEVPOST_SUBMISSION.md](./DEVPOST_SUBMISSION.md).

---

## 7. Automated & Live Verification Runs Observed After Final Edits

1. **Local Automated Verification Chain (`npm run typecheck && npm run lint && npm run test && npm run build && npx playwright test --workers=3 --reporter=list`):**
   - Verified clean prior to push (`b8d16fb`) **and** re-executed cleanly immediately after finishing all final markdown edits (`DEVPOST_SUBMISSION.md` and `BUILDHYBRIDAI_RELEASE_READINESS.md`):
   - `npm run typecheck` (`tsc --noEmit`): **PASS** (`0` errors)
   - `npm run lint` (`eslint .`): **PASS** (`0` errors, `0` warnings)
   - `npm run test` (`vitest run`): **PASS** — **`10 passed (10)` test files, `51 passed (51)` tests**
   - `npm run build` (`tsc -b && vite build`): **PASS** — `PWA v1.3.0` (`precache 22 entries`, `dist/assets/firebaseApp-DzoUPO1a.js` with `useLimitedUseAppCheckTokens: true`)
   - `npx playwright test --workers=3 --reporter=list`: **PASS** — **`21 passed (21)` E2E & WCAG 2.2 AA Axe tests** across 320px–1440px, 200% zoom, keyboard skip link, 0 overlap, offline `/route` SW reload, and State A fallback.
2. **Live URLs Verification (HTTPS header/bundle inspection & live Playwright Chrome suite post-deploy):**
   - `https://umbral-21e8b.web.app` (Firebase Hosting) & `https://umbral-hybrid-ai.vercel.app` (Vercel Production):
     - Identical hardened bundle served on both hosts: `Status=200`, `EntryJS=/assets/index-CkzAQNe2.js`, `Chunk=firebaseApp-DzoUPO1a.js`, `hasLimitedUse=True`, `hasReCaptcha=True`.
     - Live Playwright verification (`verify-live.mjs`, identical on both `.web.app` and `.vercel.app`): `homeCount: 14`, `homeOverflow: false`, `dupLocation: 0`, `detailDupLocation: 0`, `consentBanner: 2`, `vertexBeforeConsent: 0`, live `POST https://firebasevertexai.googleapis.com/v1beta/projects/umbral-21e8b/models/gemini-3.5-flash-lite:generateContent` -> `status: 200` (`hasAppCheck: true`), `badgeText: "Ran in cloud · Firebase AI (gemini-3.5-flash-lite)"`, `hasStateD: true`, `hasLimitedLabel: true`, `consoleErrors: []`, `pageErrors: []`, `httpErrors: []`.

---

## 8. Honest Answers to Closing Questions (Evaluación honesta final)

1. **¿Umbral cumple todas las condiciones obligatorias?**  
   **Casi todas (`BLOCKED` únicamente por hardware `ON_DEVICE` y vídeo — en el cuadro técnico de 14 requisitos: `11 PASS`, `1 BLOCKED`, `2 NOT_APPLICABLE`, más el vídeo YouTube pendiente).** Cumple la arquitectura `Web/Chrome` PWA, uso real de `firebase/ai`, App Check operativo con reCAPTCHA Enterprise + `useLimitedUseAppCheckTokens: true` (`firebaseApp-DzoUPO1a.js`), funcionamiento Cloud verificado en ambas URLs públicas, repositorio público con licencia `Apache-2.0` detectada por GitHub, código e instrucciones completas (`Chrome 157`), compatibilidad EN/ES (`384` claves), acceso gratuito sin login y cero fugas de secretos. **Solo quedan dos pendientes bloqueantes**: verificar inferencia real `ON_DEVICE` en hardware compatible (`#2`) y grabar/subir el vídeo demo público (`<= 3 min`).

2. **¿Gemini Nano 4 funciona realmente?**  
   **Parcialmente (`BLOCKED` en este portátil para inferencia real `ON_DEVICE`).** Chrome Desktop `157.0.8103.51` detectó `downloadable`, descargó `gemma4_component` `2026.8.7.929` (`2,360.73 MiB` `weights.bin`) en `D:` y reportó `LanguageModel.availability() === "available"`. Al intentar crear la sesión (`LanguageModel.create()` / `generateContent()`), el proceso de modelo de Chromium falló con `InvalidStateError` / `NotSupportedError` (`Performance Class: ServiceCrash`, `Enough VRAM: false (0 MiB actual, 3000 MiB required)`, `Model crash count: 3 / 3`) en la GPU `RTX 3050 Laptop 4 GB`. UMBRAL bloqueó correctamente sin fallback silencioso (`0` llamadas Cloud), pero **la ejecución real `result.response.inferenceSource === 'ON_DEVICE'` no quedó demostrada en este equipo** y requiere probarse en una GPU con `>= 3000 MiB` de VRAM libre detectada (`>= 6–8 GB` VRAM dedicada o Apple Silicon `>= 16 GB`) y `>= 25 GB` libres en `%TEMP%` y en el volumen del perfil.

3. **¿Podemos publicar la nueva versión?**  
   **Ya está publicada y verificada (`PASS`).** Tanto `https://umbral-21e8b.web.app` (Firebase Hosting) como `https://umbral-hybrid-ai.vercel.app` (Vercel) ya sirven el Release Candidate endurecido (`index-CkzAQNe2.js` + `firebaseApp-DzoUPO1a.js`, `hasLimitedUse=True`, `hasReCaptcha=True`) con inferencia `IN_CLOUD` (`HTTP 200`), `State D` activo en `/settings` y `0` errores de consola/red.

4. **¿Está listo el repositorio público?**  
   **Sí (`PASS`).** `https://github.com/Alvaro-mendoza-12/umbral-hybrid-ai` (`private: false`, rama `feat/hybrid-ai-web`) ya contiene el Release Candidate completo, muestra **`"license": "Apache-2.0"`** en la API de GitHub (`LICENSE` canónico de `apache.org/licenses/LICENSE-2.0.txt`), cero secretos expuestos y trazabilidad temporal/técnica limpia frente al prototipo previo `Alvaro-mendoza-12/Umbral` (corte del 11 de noviembre de 2026, 1:30 PM PST).

5. **¿Está listo el vídeo?**  
   **Generado en local (`PASS` en producción multimedia, pendiente únicamente subirlo a YouTube / insertar tramo `ON_DEVICE` en equipo compatible).** Ya quedó generado en `deliverables/umbral-hybrid-ai-demo-2026.mp4` (`02:06`, `1280x720`, H.264/AAC, `6.94 MiB`) junto con `deliverables/umbral-hybrid-ai-demo-2026.srt`, narración en inglés, subtítulos incrustados en inglés y grabación real de producción (`Explore`, `Requirements & your fit`, bloqueo sin fallback silencioso, arquitectura Firebase AI Logic + diagnóstico real de Chrome 157 sin falsear `ON_DEVICE`, ejecución real `IN_CLOUD` con `App Check`, `My Route` y `Settings` `State D`). **Falta únicamente**: (a) si consigues equipo con `>= 6–8 GB` VRAM / Apple Silicon `>= 16 GB`, sustituir la escena 4 con captura offline real `Ran on-device · Chrome Gemini Nano` (`State E`), y (b) subir el MP4 como vídeo público a YouTube.

6. **¿Podemos enviar la candidatura sin riesgo de incumplimiento?**  
   **Todavía no sin asumir riesgo sobre el requisito de `ON_DEVICE` (`BLOCKED` únicamente por ejecución real `ON_DEVICE` en hardware compatible y subida pública del vídeo a YouTube).** Todo el software, App Check (`useLimitedUseAppCheckTokens: true`), el repositorio `Apache-2.0`, ambos despliegues y el vídeo MP4 base ya están generados y verificados. Antes de pulsar **Submit** en Devpost (antes del **30 de noviembre de 2026, 2:00 PM PST**):
   1. En un equipo con `>= 6–8 GB` VRAM dedicada (o Apple Silicon `>= 16 GB`) y `>= 25 GB` libres (`%TEMP%` y perfil Chrome), comprobar `result.response.inferenceSource === 'ON_DEVICE'` (**State E**) y, si procede, actualizar el bloque `00:49–01:15` del vídeo.
   2. Subir `deliverables/umbral-hybrid-ai-demo-2026.mp4` (+ `.srt` opcional) como **Público** en YouTube y pegar su enlace junto con los campos de [docs/DEVPOST_SUBMISSION.md](./DEVPOST_SUBMISSION.md) en Devpost.
