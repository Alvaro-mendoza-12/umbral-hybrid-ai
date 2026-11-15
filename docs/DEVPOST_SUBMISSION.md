# Devpost Submission Package — UMBRAL Hybrid AI (`#BuildHybridAI 2026`)

> **Important Pre-Submission Note for the Team:** All repository, `Apache-2.0` license, security hardening (`useLimitedUseAppCheckTokens: true`), and live production deployment items (`https://umbral-21e8b.web.app` and `https://umbral-hybrid-ai.vercel.app`) on `feat/hybrid-ai-web` are completed and verified. Before clicking **Submit** on Devpost (`2026-11-30 2:00 PM PST`), complete the remaining hardware/media step: capture real offline `ON_DEVICE` (`result.response.inferenceSource === 'ON_DEVICE'`) demo footage/screenshot and record/upload the `<= 3 min` public YouTube video on a machine meeting Chrome 157's GPU VRAM (`>= 3000 MiB` detected free VRAM, e.g., `>= 6–8 GB` GPU or Apple Silicon `>= 16 GB`) and disk (`>= 25 GB` free on Chrome profile + `TEMP` drive) requirements. See [BUILDHYBRIDAI_RELEASE_READINESS.md](./BUILDHYBRIDAI_RELEASE_READINESS.md).

---

## 1. Devpost Form Fields (Copy-Ready English)

### Project Name
**UMBRAL Hybrid AI**

### Tagline
*From verified opportunity to clear next step — private on-device AI paired with consented Firebase Cloud Gemini.*

### Links
- **Repository URL:** `https://github.com/Alvaro-mendoza-12/umbral-hybrid-ai` (branch: `feat/hybrid-ai-web`)
- **Live Application URL (Firebase Hosting):** `https://umbral-21e8b.web.app`
- **Live Application URL (Vercel):** `https://umbral-hybrid-ai.vercel.app`
- **Prior Pre-Hackathon Baseline Reference (Attribution Transparency):** `https://github.com/Alvaro-mendoza-12/Umbral` (created prior to hackathon kickoff on 2026-11-11 as a static React client prototype; zero Firebase/Gemini/AI dependencies in `package.json`)

---

### Inspiration
Finding and applying for real scholarships, public training programs, grants, and employment calls across Latin America, Spain, the US, and international institutions often breaks down for three practical reasons:
1. **Scattered, noisy portals:** Applicants open dozens of tabs trying to tell whether a call is currently open, free, or relevant to their country and background.
2. **Opaque eligibility rules:** Long PDFs hide mandatory blockers (citizenship, visa authorization, GPA/education level, language requirements, or unstated application fees) until someone has already lost hours.
3. **Privacy anxiety with cloud AI:** People rightly hesitate to paste personal eligibility notes or career plans into black-box cloud chatbots — yet deterministic rule forms alone don't explain dense bureaucratic wording in plain language.

We wanted an assistant that respects privacy **on-device first**, never makes up dates or eligibility decisions, and only calls the cloud when the user explicitly allows it.

---

### What It Does
**UMBRAL Hybrid AI** is an offline-capable bilingual (**English & Spanish**) Progressive Web App (`Web/Chrome`) that takes users from a verified public call to an organized, three-step preparation plan in minutes — without creating an account:

1. **3-Click Verified Explorer (`/`):** Filter **20 verified opportunities** (**14 open/ongoing/upcoming visible by default**; 6 closed or pending re-check accessible via toggle) across **6 scopes** (`INT`, `PE`, `CO`, `MX`, `ES`, `US`), **5 categories**, modality, language, and deadline window (`Closing within 30 days`, `Ongoing`, `Has fixed deadline`). Every card displays its benefit, official source verification date, and live timezone-aware countdown.
2. **Deterministic 4-State Self-Check (`/opportunities/:id`):** Before invoking any AI, a transparent client-side matcher (`src/domain/matcher.ts`) evaluates each requirement strictly as `Match`, `Mismatch`, `Needs confirmation`, or `Unknown` — detecting contradictions and preserving missing details as `Unknown` rather than guessing. Prerequisite action guides explain how to resolve complex steps (e.g., apostilles, official certificates) with verified HTTPS links.
3. **Consent-Gated Hybrid AI Copilot (`HybridAIPanel`):** Users switch seamlessly among four SDK inference modes (`PREFER_ON_DEVICE` / Automatic, `ONLY_ON_DEVICE` / Local-only, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`). The assistant:
   - Explains requirements in plain English or Spanish (`EXPLAIN_REQUIREMENTS`),
   - Lists documents to prepare,
   - Proposes up to 3 grounded next steps (`PREPARE_NEXT_STEPS`) tied to exact `[id]` source fragments (`evidenceIds`) that users can add to their planner in one click, and
   - Compares two verified opportunities side-by-side (`Compare with another`, Cloud-only with explicit consent).
4. **Private Local Focus Planner (`/route`):** Users keep **1 active goal** (120 chars max) and **up to 3 active next steps** (200 chars max), track saved calls (`saved`, `preparing`, `applied_self_reported`, `closed`), and export/import portable JSON or Markdown backups with HTTPS link sanitization and a 500 KB import guard.
5. **Live Readiness & Privacy Diagnostics (`/settings`, `/privacy`):** Exposes non-PII session logs reporting exact SDK telemetry (`result.response.inferenceSource`, `modelId`, latency in ms), App Check status, and explicit Cloud consent controls.

---

### How We Built It
- **Frontend & PWA:** React `19.3`, TypeScript, Vite `8.3`, React Router, `i18next` (`384` keys in both `EN` and `ES`), self-hosted `@fontsource-variable/fraunces` and `@fontsource-variable/plus-jakarta-sans` fonts, and `vite-plugin-pwa` (Workbox navigation fallback with zero third-party font or API caching).
- **Firebase Web App & Security:** Firebase SDK `13.3` using `firebase/app`, `firebase/app-check`, and `firebase/ai`. Protected with **reCAPTCHA Enterprise** (`ReCaptchaEnterpriseProvider` in production, `CustomProvider` dev guard only outside `import.meta.env.PROD`), strict **Content-Security-Policy** headers aligned across `firebase.json` and `vercel.json`, HTTPS-only external link validation, and untrusted-input isolation in prompts.
- **Verification Stack:** `Vitest` (unit + React Testing Library integration tests across domain logic, Firebase config sanitization, orchestrator consent/timeout guards, and UI flows) plus `Playwright` end-to-end tests with `@axe-core/playwright` accessibility checks and offline Service Worker reloads.

---

### How Firebase AI Logic Is Used
All generative inference in UMBRAL flows dynamically through the official `firebase/ai` client SDK (`src/adapters/firebase/firebaseApp.ts` and `src/adapters/firebase/hybridAiAdapter.ts`):
- **Backend Initialization:** `getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true })`.
- **Hybrid Model Configuration:** `getGenerativeModel(ai, { mode, onDeviceParams, inCloudParams })`, mapping UMBRAL's four privacy policies directly to `InferenceMode.PREFER_ON_DEVICE`, `InferenceMode.ONLY_ON_DEVICE`, `InferenceMode.PREFER_IN_CLOUD`, and `InferenceMode.ONLY_IN_CLOUD`, with `gemini-3.5-flash-lite` configured for consented cloud execution.
- **User-Triggered Model Initialization:** `model.initializeDeviceModel(onProgress)` triggers Chrome's on-device model download exclusively on explicit user interaction from Copilot or Settings, reporting real download ratios cleanly to the UI.
- **Structured Grounding & Real Provenance:** Structured responses enforce JSON schemas on both paths (`ON_DEVICE_JSON_SCHEMA` for Chrome Prompt API `responseConstraint` and `Schema.object(...)` for Firebase `responseSchema`), and every execution inspects `result.response.inferenceSource` (`ON_DEVICE` vs `IN_CLOUD` vs `UNVERIFIED`) to display honest provenance badges (`Ran on-device · Chrome Gemini Nano` vs `Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`) rather than hardcoded labels.

---

### Hybrid Inference Architecture
```text
User Action ("Explain requirements" / "Documents needed" / "Suggest 3 steps")
   │
   ▼
AIOrchestrator (src/services/aiOrchestrator.ts)
   ├─ 1. Inspect Chrome `window.LanguageModel.availability()` + Firebase readiness
   ├─ 2. Enforce Privacy & Consent Policy (ZERO silent fallback):
   │     ├─ ONLY_ON_DEVICE ──────────────────────► Chrome On-Device Only
   │     ├─ PREFER_ON_DEVICE & Consent OFF:
   │     │     ├─ local === 'available' ─────────► Upgraded to ONLY_ON_DEVICE
   │     │     └─ local !== 'available' ─────────► Blocks (`CLOUD_CONSENT_REQUIRED_FOR_FALLBACK`)
   │     ├─ PREFER_ON_DEVICE & Consent ON ───────► On-Device first, Cloud fallback if needed
   │     └─ ONLY_IN_CLOUD / PREFER_IN_CLOUD ─────► Requires explicit `cloudConsentGranted === true`
   │
   ▼
FirebaseAIHybridAdapter (src/adapters/firebase/hybridAiAdapter.ts)
   ├─ Bounded untrusted-data prompt (`<opportunity_data>` + `[id]` source fragments)
   ├─ Awaits App Check token when cloud path is allowed (`withAppCheckRetry` once on 401/403)
   ├─ Calls `getGenerativeModel(ai, hybridParams).generateContent(prompt, { signal })`
   ├─ Reads actual `result.response.inferenceSource` (`ON_DEVICE` | `IN_CLOUD`)
   └─ `validateStructuredAIOutput()` strips unknown `evidenceIds` & sanitizes output
```

---

### Challenges We Ran Into
1. **Strict Zero-Silent-Fallback Guarantee:** Standard hybrid demos quietly route to the cloud whenever the local model is missing or mid-download. We explicitly overrode `PREFER_ON_DEVICE` to `ONLY_ON_DEVICE` whenever `cloudConsentGranted === false` (blocking preemptively with `CLOUD_CONSENT_REQUIRED_FOR_FALLBACK` when local weights aren't ready) and verified zero `firebasevertexai.googleapis.com` network calls via Playwright.
2. **App Check + CSP + Production Key Hardening:** Strict Content-Security-Policy rules initially blocked reCAPTCHA Enterprise frames/workers, and early debug tokens risked leaking into production bundles. We gated debug token checks behind `!import.meta.env.PROD`, synchronized strict CSP headers across `vercel.json` and `firebase.json`, and enforced domain allowlists.
3. **Real Chrome 157 Gemini Nano 4 Desktop Resource Constraints (`%TEMP%`, Disk, and GPU VRAM):** Testing on real Chrome Desktop `157.0.8103.51` uncovered two critical real-world desktop nuances:
   - Chrome's on-device broker requires `>= 20,480 MiB` (`20 GiB`) free disk space to start downloading **and** stages ~4.2 GB in OS `%TEMP%` before unpacking `weights.bin` (`2,360.73 MiB` for `gemma4_cpu_model`). If `C:` has `< 20 GB` free, `window.LanguageModel.availability()` immediately drops to `unavailable` even when another drive has hundreds of gigabytes free.
   - Even after redirecting `TEMP`/`TMP` and user-data to a 268 GB+ free volume (`D:`) and completing the full 100% download (`gemma4_component 2026.8.7.929 Ready`), Chrome 157's `OnDeviceModelService` reported `Enough VRAM: false (0 MiB actual, 3000 MiB required)` and `Performance Class: ServiceCrash` on a 4 GB RTX 3050 Laptop GPU, hitting the 3-crash cap when calling `LanguageModel.create()`. Building clean error mapping (`ON_DEVICE_UNAVAILABLE` fallback boundary without leaking data to cloud) and clear disk/hardware guidance proved essential.

---

### Accomplishments We're Proud Of
- **Zero-trust hybrid consent architecture** verified end-to-end with zero cloud payload leakage when local-only or unconsented.
- **Deterministic clarity before AI:** Every eligibility check stays transparent and auditable, never letting an LLM hallucinate approval odds or unpublished fees.
- **Dual-host CSP-hardened Firebase AI Logic deployment** operating live on both Firebase Hosting (`umbral-21e8b.web.app`) and Vercel (`umbral-hybrid-ai.vercel.app`) with `App Check (reCAPTCHA Enterprise)`, `useLimitedUseAppCheckTokens: true`, and verified `IN_CLOUD` inference (`HTTP 200 OK`).
- **Comprehensive quality bar:** Unit tests, React integration tests, `axe-core` accessibility verification, offline PWA persistence tests, and visual multi-viewport verification across `390px` mobile and `1280px` desktop.

---

### Impact
- Helps students, job seekers, and civic applicants cut through confusing official announcements in **Spanish or English** with zero sign-up barriers.
- Keeps personal notes, saved opportunities, and action checklists **local on the user's browser**, enabling offline review via PWA caching and portable JSON/Markdown export.
- Reduces unnecessary cloud token usage by running single-turn guidance locally whenever supported hardware is present.

---

### Testing Instructions (For Judges)

#### Option A — Test Live Web App (Cloud AI with App Check + Deterministic Matcher)
1. Open Chrome Desktop and visit `https://umbral-21e8b.web.app` (or `https://umbral-hybrid-ai.vercel.app`).
2. Switch language (`ES` / `EN`) in the top-right toggle if desired.
3. On `/` (**Explore**), filter by country, category, or deadline window (`More filters`), then open **ETH Zurich ESOP · Master's Excellence Scholarship 2027–28**.
4. Expand **Requirements & your fit**, set a sample country/degree, and observe instant deterministic 4-state badges (`Match`, `Mismatch`, `Needs confirmation`, `Unknown`).
5. **Verify zero silent fallback:** In **AI assistant** (keep **Automatic** selected and Cloud Consent off), click **Explain requirements** — verify the consent prompt appears and zero network requests are sent to `firebasevertexai.googleapis.com`.
6. **Verify live Firebase AI Logic + App Check (`IN_CLOUD`):** Click **Allow Firebase Cloud AI for this browser** and re-run **Explain requirements** or **Suggest 3 steps**. Confirm the header pill updates to `Firebase Cloud AI ready`, the response displays `Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`, and click **Add to My Route** on one step, then check `/route`.

#### Option B — Test Gemini Nano 4 (`ON_DEVICE` Offline) on Compatible Chrome Desktop
- **Hardware Requirements:** Desktop Chrome `157+` (or compatible Chrome Built-in AI release) on a machine with **>= 25 GB free disk** on both the Chrome User Data volume and `%TEMP%` drive, plus a supported GPU meeting Chrome's VRAM gate (**> 4 GB VRAM / `>= 3000 MiB` detected free VRAM** in `chrome://on-device-internals`, or Apple Silicon `>= 16 GB` unified memory).
1. Confirm flags in `chrome://flags` (`#prompt-api` enabled, `#prompt-api-multimodal-input` enabled, `#gemma4-for-built-in-ai` enabled) and verify `chrome://on-device-internals` shows `Enough VRAM: true` and `Performance Class` without `ServiceCrash`.
2. Open UMBRAL `/settings`, expand **Technical diagnostics & session AI log**, and click **Download / initialize local model** (when status shows `Downloadable on user action`).
3. Once status becomes **On-device AI ready**, open an opportunity, keep **Automatic** or **On this device** (`Strict On-Device Only`) selected, disconnect network / toggle DevTools **Offline**, and click **Explain requirements** — confirm `Ran on-device · Chrome Gemini Nano` with zero cloud network requests.

#### Option C — Run Locally
```bash
git clone https://github.com/Alvaro-mendoza-12/umbral-hybrid-ai.git
cd umbral-hybrid-ai
git checkout feat/hybrid-ai-web
npm install
# Copy .env.example to .env.local and fill your Firebase Web App & reCAPTCHA Enterprise keys
# (for localhost without domain allowlist, set VITE_APP_CHECK_DEBUG_TOKEN=true in .env.local only)
npm run start
```
Run verification suite:
```bash
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright test --workers=3 --reporter=list
```

---

## 2. Demo Video Script (`<= 3 Minutes`, Target `02:45`) & Sequence

> **Pre-Generated Video Kit & Honest `ON_DEVICE` Note:** A complete, narrated `02:06` (`1280x720`, H.264/AAC) demo video with burned-in English subtitles and standalone `.srt` track is pre-generated locally at `deliverables/umbral-hybrid-ai-demo-2026.mp4` (`deliverables/` is gitignored; see `deliverables/YOUTUBE_UPLOAD_AND_DEVPOST_GUIDE.md`). Because this test laptop (`RTX 3050 4 GB Laptop GPU` + Chrome `157.0.8103.51`) completed the 2.36 GiB Gemini Nano 4 download cleanly but hit Chromium `OnDeviceModelService` `ServiceCrash` / `Enough VRAM: false (0 MiB actual, 3000 MiB required)` at session creation, that generated MP4 does **not** fake `ON_DEVICE` execution — it demonstrates real zero-silent-fallback privacy and authentic Chrome 157 telemetry in Scene 4. If you capture real offline `ON_DEVICE` inference on a compatible `>= 6–8 GB` VRAM / Apple Silicon `>= 16 GB` machine before submitting (`2026-11-30 2:00 PM PST`), replace Scene 4 (`00:49.5–01:15.5`) using the script below.

| Time | Visual / Screen Action | Voiceover (EN) | Spanish Voiceover Alternative (`SRT Ready`) |
| :--- | :--- | :--- | :--- |
| **0:00–0:20** | Open `/` on desktop Chrome. Click `EN` toggle cleanly. Hover Hero & Filter bar, type `scholarship` or select `Education & Scholarships`. Click into `ETH Zurich ESOP`. | "Every year, talented applicants abandon scholarships and public calls because requirements are scattered and cryptic — and pasting personal situations into cloud chatbots puts privacy at risk. Meet **UMBRAL Hybrid AI**: verified calls, deterministic qualification checks, and privacy-first hybrid Gemini inference." | "Cada año, miles de postulantes abandonan becas y convocatorias porque los requisitos son confusos y pegarlos en chats en la nube expone su privacidad. Este es **UMBRAL Hybrid AI**: convocatorias verificadas, autocomprobación transparente e IA híbrida con privacidad primero." |
| **0:20–0:45** | Open `Requirements & your fit`. Select `Peru`, `Bachelor's / University degree`, `English (EN)`. Point to live counters (`Match`, `Mismatch`, `Needs confirmation`, `Unknown`). Expand a prerequisite guide accordion. | "Before sending a single byte to AI, UMBRAL runs a deterministic 4-state matcher locally. Missing answers stay *Unknown* — never guessed — and prerequisite guides walk through real steps like official apostilles and verified source portals." | "Antes de enviar un solo dato a la IA, UMBRAL evalúa cada requisito localmente en cuatro estados transparentes, sin inventar elegibilidad, e incluye guías de trámites con fuentes oficiales." |
| **0:45–1:25** | Open DevTools **Network** tab (`Fetch/XHR` filtered to `firebasevertexai\|googleapis`). In Copilot (`Automatic`, Cloud consent OFF), click **Explain requirements**. Show consent prompt + `0` network calls. | "Privacy isn't an afterthought. With Automatic mode active and Cloud Consent off, clicking Explain Requirements enforces strict local-only safety: zero silent fallback, zero background cloud requests." | "La privacidad es verificable: con el modo Automático y sin consentimiento en nube, UMBRAL bloquea cualquier envío silencioso. Cero llamadas ocultas en la red." |
| **1:25–2:05** | *(Record on compatible Chrome Desktop GPU machine)* Switch to **On this device**, toggle DevTools **Offline**, click **Explain requirements**. Show **`Ran on-device · Chrome Gemini Nano`** badge, grounded evidence items, and `0` cloud requests. | "When Gemini Nano 4 runs locally in Chrome via Firebase AI Logic Hybrid Inference, we switch completely offline, run *Explain requirements*, and get schema-validated JSON and grounded evidence entirely on-device — verified by the SDK's `inferenceSource: ON_DEVICE`." | "Con Gemini Nano 4 operativo en Chrome mediante Firebase AI Logic, activamos modo sin conexión y obtenemos guía estructurada 100 % en el dispositivo, verificada mediante `inferenceSource: ON_DEVICE`." |
| **2:05–2:30** | Re-enable network, allow **Firebase Cloud AI** consent, click **Suggest 3 steps**. Show App Check token + `gemini-3.5-flash-lite` `200 OK` + badge `Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`. Click **Add to My Route**. | "When users need broader reasoning or lack local hardware support, explicit consent unlocks Firebase AI Logic in the cloud (`gemini-3.5-flash-lite`) protected by App Check with reCAPTCHA Enterprise and limited-use tokens. Users convert AI suggestions into concrete steps in one click." | "Cuando hace falta razonamiento en la nube, el consentimiento explícito habilita Firebase AI Logic (`gemini-3.5-flash-lite`) protegido por App Check con reCAPTCHA Enterprise y tokens de uso limitado, añadiendo pasos reales con un clic." |
| **2:30–2:50** | Switch to `/route`, mark step complete (`100%` progress bar), download JSON backup, reload offline. Briefly flash `/settings` diagnostics (`State D/E`). End on UMBRAL title + live URLs. | "Everything lives privately in **My Route** — 1 active goal, up to 3 focused steps, offline PWA reload, and portable JSON/Markdown export. Audited, accessible, bilingual, and built with Firebase AI Logic. Thank you." | "Todo queda guardado localmente en **Mi Ruta**: 1 meta, hasta 3 pasos activos, funcionamiento offline como PWA y respaldo portátil en JSON o Markdown. UMBRAL Hybrid AI, construido con Firebase AI Logic. Muchas gracias." |

---

## 3. Ready-to-Use English Subtitles (`.srt`) for Spanish Narration

```srt
1
00:00:00,000 --> 00:00:10,000
Every year, applicants abandon scholarships and public programs because requirements are scattered, and cloud chatbots risk personal privacy.

2
00:00:10,000 --> 00:00:20,000
Meet UMBRAL Hybrid AI: verified calls, transparent rule matching, and privacy-first hybrid Gemini inference inside Chrome and Firebase.

3
00:00:20,000 --> 00:00:45,000
Before calling AI, UMBRAL runs a deterministic 4-state check locally — never guessing eligibility — with step-by-step official prerequisite guides.

4
00:00:45,000 --> 00:01:25,000
With Cloud Consent off, UMBRAL blocks silent cloud fallback completely. Zero background requests leave the browser.

5
00:01:25,000 --> 00:02:05,000
Using Firebase AI Logic Hybrid Inference, Gemini Nano 4 runs offline on-device with strict JSON schema grounding and verified ON_DEVICE telemetry.

6
00:02:05,000 --> 00:02:30,000
With explicit user consent, UMBRAL calls Gemini in Firebase Cloud protected by App Check and reCAPTCHA Enterprise, turning advice into tracked steps.

7
00:02:30,000 --> 00:02:50,000
My Route keeps 1 clear goal and 3 active steps private on your device with offline PWA support and portable JSON or Markdown export.
```

---

## 4. Captured Visual Evidence & Devpost Screenshot Plan

Already captured in the session artifact folder (`C:\Users\gamer\.gemini\antigravity\brain\245d7fd9-5d4c-4352-a708-c5afc915e557\`):
1. `live-vercel-home-en.png` — Desktop Explorer (`1280x800`, EN), 3-click filters, hero CTAs clear of onboarding overlays.
2. `live-vercel-selfcheck-en.png` — Detail view + 4-state Self-Check + `Automatic / On this device / Cloud` Copilot selector.
3. `live-vercel-cloud-ai-en.png` & `live-firebase-cloud-ai-en.png` — Consented `IN_CLOUD` structured response (`Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`) with `Add to My Route` and grounded `Sources used (4)` verified on both live hosts.
4. `live-vercel-route-en.png` — My Route planner (`1/1` active goal, `1/3` active steps, JSON/Markdown backup).
5. `live-vercel-mobile-en.png` — Responsive mobile view (`390x844`, zero horizontal overflow, clean bottom navigation).
6. **Diagnostic Evidence (`Chrome 157 Gemini Nano 4`):** `chrome-on-device-internals-gemma4.png` and `gemini-nano-4-on-device-failure.png` documenting why `ON_DEVICE` session creation could not complete on the 4 GB RTX 3050 test laptop (`ServiceCrash` / `0 MiB actual, 3000 MiB required`), showing UMBRAL's honest `ON_DEVICE_UNAVAILABLE` protection.
7. **Needed Before Final Devpost Upload:** Replace #6 in the public gallery with a screenshot captured on compatible GPU/Apple Silicon hardware showing the green **`Ran on-device · Chrome Gemini Nano`** badge in `StructuredAIResult` + `/settings` **State E** (`ON_DEVICE` confirmed in session log).
