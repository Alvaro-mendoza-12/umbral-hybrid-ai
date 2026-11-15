# UMBRAL Hybrid AI — `#BuildHybridAI 2026` Eligibility & Release Readiness Audit

**Audit Timestamp:** 2026-11-15T09:36-05:00 (`2026-11-15T14:36Z`)  
**Repository:** `D:\umbral-hybrid-ai` (local working tree above branch `feat/hybrid-ai-web` at commit `3102fac`)  
**Remote Repo:** `https://github.com/Alvaro-mendoza-12/umbral-hybrid-ai` (default branch `feat/hybrid-ai-web`)  
**Live Deployments Audited:** `https://umbral-21e8b.web.app` (Firebase Hosting) & `https://umbral-hybrid-ai.vercel.app` (Vercel)  
**Hackathon Category & Deadline:** **Web/Chrome** · Deadline **November 30, 2026, 2:00 PM PST** (`2026-11-30T22:00:00Z`)  

---

## Executive Verdict: `BLOCKED` (NOT READY TO SUBMIT YET)

The local engineering Release Candidate passes **100% of automated typechecking, linting, unit/integration tests, production build, and Playwright/Axe WCAG 2.2 AA suites**, and live production Cloud inference (`gemini-3.5-flash-lite`) protected by Firebase App Check + reCAPTCHA Enterprise + zero-silent-fallback privacy gating works end-to-end on both public domains.

However, **UMBRAL Hybrid AI cannot honestly be declared ready to submit today (`2026-11-15`)** because **5 concrete release blockers** remain open:

| Priority | Blocker | Current State | Impact on Submission |
| :--- | :--- | :--- | :--- |
| **P0** | **Real `ON_DEVICE` Gemini Nano 4 inference unverified on current laptop** | Chrome Desktop `157.0.8103.51` downloaded `gemma4_component` (`2026.8.7.929` / `2,360.73 MiB` `weights.bin`) to `D:` (`availability() === "available"`), then `OnDeviceModelService` hit `Performance Class: ServiceCrash` + `Enough VRAM: false (0 MiB actual, 3000 MiB required)` + `Model crash count: 3 / 3` on `RTX 3050 4 GB Laptop GPU`. **`result.response.inferenceSource === 'ON_DEVICE'` was NOT achieved.** | Mandatory hackathon core requirement & demo proof |
| **P0** | **Local RC work is uncommitted and unpushed (`52` modified + `22` untracked files vs `3102fac`)** | GitHub `origin/feat/hybrid-ai-web` reflects `3102fac` (`2026-11-14T06:25:54Z`) and lacks `useLimitedUseAppCheckTokens: true` hardening, redesigned UI components, `UnifiedRequirementsCheck.tsx`, `51` unit/integration tests, and updated docs. | Judges inspecting GitHub repo would see an older pre-hardening tree |
| **P0** | **Live production URLs serve a pre-hardening bundle (`firebaseApp-CaaHTIfv.js`)** | Both `https://umbral-hybrid-ai.vercel.app` and `https://umbral-21e8b.web.app` serve `index-DIvFAngc.js` + `firebaseApp-CaaHTIfv.js` (**without** `useLimitedUseAppCheckTokens: true`), whereas local `src/` and `dist/assets/firebaseApp-B7uOUjBN.js` **do** set `useLimitedUseAppCheckTokens: true`. Settings UI displays `"reCAPTCHA Enterprise (with limited-use AI tokens)"` even on the older prod bundle. | Live deployment diverges from local RC source & security claims |
| **P0** | **GitHub API detects `license: "NOASSERTION"` instead of `Apache-2.0`** | `LICENSE` contains two deviations from canonical SPDX `Apache-2.0`: `"explicitly harmless"` at line 168 instead of `"harmless"`, and omits the `"APPENDIX: How to apply the Apache License to your work."` header between lines 172 and 174 (`package.json` specifies `"license": "Apache-2.0"`). | Fails strict Open Source license detection (`NOASSERTION` on GitHub) |
| **P0** | **Demo video (`<= 3 min`) not yet recorded/uploaded** | `DEVPOST_SUBMISSION.md` includes a timed English/Spanish demo script and `.srt` captions, plus live UI & diagnostic screenshots, but real `ON_DEVICE` + Cloud video capture on compatible hardware is still pending. | Required Devpost deliverable |

Secondary documentation/UX items flagged during audit:
- `README.md` (lines 101–102) and `docs/GEMINI_NANO_SETUP.md` still list older Chrome flags (`#optimization-guide-on-device-model`, `#prompt-api-for-gemini-nano`) and headless test caveats that predate Chrome 157's `#prompt-api` / `#prompt-api-multimodal-input` / `#gemma4-for-built-in-ai` flags and `TEMP` volume findings.

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
| **Limited-Use Tokens (`useLimitedUseAppCheckTokens: true`)** | **Present** in `src/adapters/firebase/firebaseApp.ts` (`getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true })`) and verified inside local `dist/assets/firebaseApp-B7uOUjBN.js`. | **Missing in currently deployed bundle** (`firebaseApp-CaaHTIfv.js`: `hasLimitedUse: false` on both `.web.app` and `.vercel.app`). | **`BLOCKED`** *(Redeploy local RC build required)* |
| **Cloud Consent Gate & Zero Silent Fallback** | Enforced in `AIOrchestrator` (`CLOUD_CONSENT_REQUIRED`, `CLOUD_CONSENT_REQUIRED_FOR_FALLBACK`, overriding `PREFER_ON_DEVICE` to `ONLY_ON_DEVICE` when consent is false). Verified in unit & integration tests. | Verified live via Playwright on both `.web.app` and `.vercel.app`: clicking `Explain requirements` without consent shows `Cloud AI Consent Required` banner with **`vertex calls: 0`**. | **`PASS`** |
| **Security Headers & Secrets Hygiene** | `.gitignore` ignores `.env*` & `*.local`. `git ls-files` and untracked file scans found **zero real API keys, private keys, or debug tokens** committed or tracked. | Both domains serve identical `200 OK` CSP (`default-src 'self'`, `script-src`/`frame-src` scoped to Google reCAPTCHA, `connect-src` scoped to `*.googleapis.com`/`*.firebaseio.com`, `worker-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), `X-Frame-Options: DENY`, HSTS, `X-Content-Type-Options: nosniff`. | **`PASS`** |

---

## 3. 12-Point Official Rule Verification (`#BuildHybridAI 2026`)

| # | Requirement | Status | Concrete Observed Evidence & Gaps |
| :--- | :--- | :--- | :--- |
| 1 | **Web/Chrome application (`Web/Chrome` category)** | **`PASS`** | React 19 + Vite PWA targeting desktop & mobile Chrome, hosted on Firebase Hosting & Vercel (`200 OK`, zero console/page errors, `playwright` Chromium 21/21 pass). |
| 2 | **Gemini Nano 4 (`Prompt API`) via Firebase AI Logic** | **`BLOCKED`** | SDK integration verified in code (`InferenceMode.PREFER_ON_DEVICE` / `ONLY_ON_DEVICE`, `model.initializeDeviceModel`, `responseConstraint`) and Chrome 157 downloaded `gemma4_component` (`2026.8.7.929`, `2,360.73 MiB`), **but session creation hit Chromium `ServiceCrash` / `0 MiB VRAM` on the 4 GB RTX 3050 test laptop — real `ON_DEVICE` inference could not execute.** |
| 3 | **Runtime `firebase/ai` import and SDK execution** | **`PASS`** | `src/adapters/firebase/firebaseApp.ts` & `hybridAiAdapter.ts` import `firebase/ai`, initialize `getAI` + `GoogleAIBackend`, call `getGenerativeModel(...).generateContent(...)`, and read `result.response.inferenceSource` (`IN_CLOUD` confirmed live; `ON_DEVICE` tested in mocked unit/integration tests and failed cleanly on incompatible VRAM). |
| 4 | **Firebase App Check enabled & active** | **`PASS`** *(local RC pending redeploy)* | Live `x-firebase-appcheck` (`reCAPTCHA Enterprise`) confirmed `200 OK` on both live URLs; local RC adds `useLimitedUseAppCheckTokens: true` (`firebaseApp-B7uOUjBN.js`) and `CustomProvider` dev isolation. |
| 5 | **Functional application (no crashes/broken links)** | **`PASS`** | Both `umbral-21e8b.web.app` and `umbral-hybrid-ai.vercel.app` load home, SPA detail deep links (`/opportunities/int-eth-esop-2027`), self-check, Cloud AI, `/route`, `/settings`, `/privacy` with `[]` console/page/HTTP errors. |
| 6 | **Public GitHub repository (`Umbral Hybrid AI`)** | **`BLOCKED`** | `https://api.github.com/repos/Alvaro-mendoza-12/umbral-hybrid-ai` confirms `"private": false` (`feat/hybrid-ai-web` public), **but local RC (`52` modified + `22` untracked files) has NOT been committed/pushed since `3102fac` (`2026-11-14T06:25Z`).** |
| 7 | **Visible Open Source license on repository** | **`BLOCKED`** | GitHub API returns `"license": "NOASSERTION"` because `LICENSE` has `"explicitly harmless"` on line 168 (vs `"harmless"`) and omits the Apache-2.0 `"APPENDIX: How to apply the Apache License to your work."` block between lines 172 and 174 (`package.json` declares `Apache-2.0`). |
| 8 | **Complete source code cleanly accessible** | **`BLOCKED`** | Linked directly to #6: source code is complete locally (`npm run build` succeeds in `< 1s`), but 74 changed/new local files must be pushed to `origin/feat/hybrid-ai-web`. |
| 9 | **Clear install, config & run instructions (`<= 3` min testability)** | **`PASS`** *(docs update needed for Chrome 157 flags)* | `README.md`, `.env.example`, `npm run start`, `docs/FIREBASE_SETUP.md`, and `docs/DEVPOST_SUBMISSION.md` provide full steps. (`README.md` 101–102 and `GEMINI_NANO_SETUP.md` still reference older `#optimization-guide-on-device-model` / `#prompt-api-for-gemini-nano` flags and headless notes.) |
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
| **Timeline vs `2026-11-11T21:30:00Z` Cutoff** | Initial commit `813c87a` (`2026-11-11T03:29:05Z`) through `f052d2a` (`2026-11-11T21:15:48Z`, 14 min before cutoff), followed by Kiroween wrap-up PRs `#1` (`aa63bc2`, `2026-11-12T00:59:53Z`) and `#2` (`072af38`/`5c77941`, `2026-11-12T01:43:38Z`). Live at `https://umbral-seven-khaki.vercel.app`. | Created strictly **after** cutoff: `72e3a38` (`2026-11-12T06:28:11Z`) -> `63ac16a` (`06:48:58Z`) -> `d920dc7` / `d82594b` / `3102fac` (`2026-11-14T06:25:37Z`) + uncommitted local Release Candidate (`52` modified, `22` untracked). |
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
- **Minor Visual / UX Polish Items Observed (Non-Blocking):**
  1. `OpportunityDetailPage.tsx` line 387: `Zurich, Switzerland · Onsite · On-site` duplicates `"Onsite"` when `locationLabel.en` ends with `"Onsite"`.
  2. `OpportunityDetailPage.tsx` line 412 + `layout.css` line 1443: `.glance-sub` (`display: flex`) wraps `"Cost & funding:"` into a narrow vertical column beside cost text inside the `Benefits` card.
  3. `SettingsPage.tsx` lines 312–324: download trigger/progress UI only mounts when `avail === 'downloadable'` (or `isDownloadingModel` in memory), so reloading mid-download (`avail === 'downloading'`) hides the progress UI.
  4. Desktop category chip scroller clips `"Civic & P"` at the right edge at `1280px` width unless scrolled horizontally (`ExplorePage.tsx`).
  5. Browser native `<input type="date">` placeholder renders `dd/mm/aaaa` per Windows OS locale even when UMBRAL is set to `EN`.

---

## 6. Devpost Materials & Demo Package

Prepared in full English (plus Spanish voiceover + English `.srt` cues) in [docs/DEVPOST_SUBMISSION.md](./DEVPOST_SUBMISSION.md).

---

## 7. Automated & Live Verification Runs Observed After Final Edits

1. **Local Automated Verification Chain (`npm run typecheck && npm run lint && npm run test && npm run build && npx playwright test --workers=3 --reporter=list`):**
   - Verified clean prior to writing this report **and** re-executed cleanly immediately after finishing all markdown edits (`DEVPOST_SUBMISSION.md` and `BUILDHYBRIDAI_RELEASE_READINESS.md`):
   - `npm run typecheck` (`tsc --noEmit`): **PASS** (`0` errors)
   - `npm run lint` (`eslint .`): **PASS** (`0` errors, `0` warnings)
   - `npm run test` (`vitest run`): **PASS** — **`10 passed (10)` test files, `51 passed (51)` tests**
   - `npm run build` (`tsc -b && vite build`): **PASS** — `PWA v1.3.0` (`precache 22 entries`, `dist/assets/firebaseApp-B7uOUjBN.js` with `useLimitedUseAppCheckTokens: true`)
   - `npx playwright test --workers=3 --reporter=list`: **PASS** — **`21 passed (21)` E2E & WCAG 2.2 AA Axe tests** across 320px–1440px, 200% zoom, keyboard skip link, 0 overlap, offline `/route` SW reload, and State A fallback.
2. **Live URLs Verification (HTTPS header/bundle inspection & live Playwright Chrome suite):**
   - `https://umbral-hybrid-ai.vercel.app` & `https://umbral-21e8b.web.app`: both return `HTTP 200 OK` (`X-Frame-Options: DENY`, identical CSP), render `14` active cards cleanly without horizontal overflow (`homeOverflow: false`), block Cloud calls when Consent is OFF (`vertexBeforeConsent: 0`), and execute `firebasevertexai.googleapis.com/.../gemini-3.5-flash-lite:generateContent` (`HTTP 200`, `hasAppCheck: true`, badge `Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`, `0` console/page/HTTP errors) when Consent is ON — **except both still run `firebaseApp-CaaHTIfv.js` without `useLimitedUseAppCheckTokens: true` (`BLOCKED` pending redeploy).**

---

## 8. Honest Answers to Closing Questions (Evaluación honesta final)

1. **¿Umbral cumple todas las condiciones obligatorias?**  
   **No (`BLOCKED` — 7 `PASS`, 5 `BLOCKED`, 2 `NOT_APPLICABLE`).** Cumple la arquitectura `Web/Chrome` PWA, uso real de `firebase/ai`, App Check operativo con reCAPTCHA Enterprise, funcionamiento Cloud en ambas URLs públicas, compatibilidad EN/ES (`384` claves), acceso gratuito sin login y cero fugas de secretos. Sin embargo, **cinco requisitos obligatorios siguen pendientes (`BLOCKED`)**: verificar inferencia real `ON_DEVICE` en hardware compatible, publicar en GitHub los `52` archivos modificados + `22` nuevos locales (`feat/hybrid-ai-web`), corregir `LICENSE` para eliminar `NOASSERTION` y mostrar `Apache-2.0`, redesplegar el bundle endurecido (`useLimitedUseAppCheckTokens: true`) en ambas URLs públicas y grabar el vídeo demo (`<= 3 min`).

2. **¿Gemini Nano 4 funciona realmente?**  
   **Parcialmente (`BLOCKED` en este portátil para inferencia real `ON_DEVICE`).** Chrome Desktop `157.0.8103.51` detectó `downloadable`, descargó `gemma4_component` `2026.8.7.929` (`2,360.73 MiB` `weights.bin`) en `D:` y reportó `LanguageModel.availability() === "available"`. Al intentar crear la sesión (`LanguageModel.create()` / `generateContent()`), el proceso de modelo de Chromium falló con `InvalidStateError` / `NotSupportedError` (`Performance Class: ServiceCrash`, `Enough VRAM: false (0 MiB actual, 3000 MiB required)`, `Model crash count: 3 / 3`) en la GPU `RTX 3050 Laptop 4 GB`. UMBRAL bloqueó correctamente sin fallback silencioso (`0` llamadas Cloud), pero **la ejecución real `result.response.inferenceSource === 'ON_DEVICE'` no quedó demostrada en este equipo** y requiere probarse en una GPU con `>= 3000 MiB` de VRAM libre detectada (`>= 6–8 GB` VRAM dedicada o Apple Silicon `>= 16 GB`) y `>= 25 GB` libres en `%TEMP%` y en el volumen del perfil.

3. **¿Podemos publicar la nueva versión?**  
   **Técnicamente en local sí (tras corregir `LICENSE`), pero todavía NO se ha desplegado por restricción explícita de esta auditoría (`BLOCKED` en sincronía con producción).** La compilación local (`typecheck`, `lint`, `51/51` Vitest, `build` PWA y `21/21` Playwright/Axe WCAG 2.2 AA) pasa sin errores e incluye `useLimitedUseAppCheckTokens: true` (`firebaseApp-B7uOUjBN.js`), mientras las dos URLs públicas todavía sirven `firebaseApp-CaaHTIfv.js` (`hasLimitedUse: false`). Antes de desplegar a producción, conviene corregir `LICENSE`, actualizar notas de flags de Chrome 157 en `README.md`/`GEMINI_NANO_SETUP.md` y revalidar la build final.

4. **¿Está listo el repositorio público?**  
   **No (`BLOCKED`).** `https://github.com/Alvaro-mendoza-12/umbral-hybrid-ai` es público (`private: false`, rama `feat/hybrid-ai-web`) y está limpiamente separado temporal y técnicamente del proyecto previo `Alvaro-mendoza-12/Umbral` (corte del 11 de noviembre de 2026, 1:30 PM PST), **pero hoy presenta dos bloqueadores**: (a) los `52` archivos modificados + `22` nuevos del Release Candidate aún no están en el remoto (el remoto sigue en `3102fac`), y (b) GitHub detecta `"license": "NOASSERTION"` por `"explicitly harmless"` en `LICENSE` (línea 168) y la omisión de la cabecera `"APPENDIX: How to apply the Apache License to your work."`.

5. **¿Está listo el vídeo?**  
   **No (`BLOCKED`).** Los textos en inglés para Devpost, las instrucciones de prueba, el guion cronometrado (`<= 3 min`, objetivo `02:45`), los subtítulos `.srt` en inglés y capturas Cloud/UX/diagnóstico están preparados en [docs/DEVPOST_SUBMISSION.md](./DEVPOST_SUBMISSION.md). **Falta grabar y subir el vídeo público a YouTube** una vez ejecutada y capturada la inferencia real offline `ON_DEVICE` (`Ran on-device · Chrome Gemini Nano`) en un equipo con GPU compatible.

6. **¿Podemos enviar la candidatura sin riesgo de incumplimiento?**  
   **No (`BLOCKED` — NO está lista para enviar hoy, 15 de noviembre de 2026).** Enviar hoy con `LICENSE` en `NOASSERTION`, sin los cambios locales en GitHub, con producción sirviendo el bundle antiguo y sin vídeo demostrando `ON_DEVICE` real con Gemini Nano 4 supondría riesgo directo de descalificación o evaluación incompleta. Pasos obligatorios antes de enviar antes del **30 de noviembre de 2026, 2:00 PM PST**:
   1. Corregir `LICENSE` para coincidir con el texto oficial `Apache-2.0` (eliminar `"explicitly"` en línea 168 y añadir la cabecera `APPENDIX: How to apply the Apache License to your work.`) y actualizar las notas de flags de Chrome 157 en `README.md` / `GEMINI_NANO_SETUP.md`.
   2. Hacer `commit` y `push` del Release Candidate a `origin/feat/hybrid-ai-web` y comprobar que GitHub muestra `Apache-2.0`.
   3. Redesplegar la build validada en `umbral-21e8b.web.app` (Firebase Hosting) y `umbral-hybrid-ai.vercel.app` (Vercel) para activar `useLimitedUseAppCheckTokens: true` en producción y revalidar `IN_CLOUD` + `Settings`.
   4. Ejecutar y capturar en vídeo (`<= 3 min`) una prueba real offline con **`result.response.inferenceSource === 'ON_DEVICE'`** (**State E**) en un equipo con `>= 6–8 GB` VRAM / Apple Silicon `>= 16 GB` y `>= 25 GB` libres (`%TEMP%` y perfil Chrome), y luego enviar a Devpost.
