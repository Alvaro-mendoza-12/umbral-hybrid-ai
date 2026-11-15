# Firebase Setup Guide — UMBRAL Hybrid AI

This guide gives exact, step-by-step instructions to connect live Firebase AI Logic Cloud inference (`gemini-3.5-flash-lite`) and Firebase App Check protection in `.env.local` without modifying application source code.

---

## 1. Create or Select Your Firebase Project

1. Sign in to the [Firebase Console](https://console.firebase.google.com/) and create a project (or open your dedicated **#BuildHybridAI 2026** project).
   - Do **not** modify any Firebase project linked to the prior Kiroween `Alvaro-mendoza-12/Umbral` submission.
2. In the left sidebar, open **Project overview -> Project settings** (gear icon) -> **General**.
3. Under **Your apps**, click **Add app (`</>`) -> Web**, register an app nickname (e.g., `umbral-hybrid-ai-web`), and optionally check Firebase Hosting.
4. From the displayed `firebaseConfig = { ... }` snippet, copy the values into the table in Section 4 below.

> **Security note:** Client Firebase config fields (`apiKey`, `projectId`, `appId`) identify your project in browser requests; they are **not** private admin secrets. API abuse protection is enforced by **Firebase App Check** (Section 3). Never copy service-account JSON credentials, server API tokens, or reCAPTCHA *secret* keys into `.env.local`.

---

## 2. Enable Firebase AI Logic (Gemini Developer API)

1. In Firebase Console left navigation, go to **Build -> AI -> Firebase AI Logic** (or **Firebase AI Logic** in the left menu).
2. Click **Get started** and enable the **Gemini Developer API** provider (`GoogleAIBackend` in `src/adapters/firebase/firebaseApp.ts`).
   - Do **not** enable Vertex AI in Firebase unless you intentionally want billing-linked Vertex endpoints; UMBRAL uses `new GoogleAIBackend()`.
3. Confirm `gemini-3.5-flash-lite` (default in `.env.example`) is available on your project quota. If Google AI / Firebase Console assigns a different active Flash model ID to your account, put that exact model string into `VITE_FIREBASE_AI_CLOUD_MODEL`.
4. Do **not** upgrade to paid billing unless your hackathon account quota requires it; verify free-tier quota before recording or deploying.

---

## 3. Configure Firebase App Check (reCAPTCHA Enterprise + Local Debug Token)

UMBRAL initializes App Check in [firebaseApp.ts](../src/adapters/firebase/firebaseApp.ts) using `ReCaptchaEnterpriseProvider`, `isTokenAutoRefreshEnabled: true`, and `getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true })`.

### A. Create a Public reCAPTCHA Enterprise Site Key

1. Open [Google Cloud Console](https://console.cloud.google.com/) with the **exact same Google Cloud Project** used by your Firebase project.
2. Enable **reCAPTCHA Enterprise API** if prompted.
3. Open **Security -> reCAPTCHA Enterprise -> Keys -> Create key**:
   - **Platform type:** Website
   - **Domain list:** Add `localhost`, `127.0.0.1`, `<your-project-id>.web.app`, `<your-project-id>.firebaseapp.com` (and `<your-site>.vercel.app` if mirroring on Vercel).
   - **Integration type:** Score-based (standard App Check web provider).
4. Copy **only the public Site Key ID** (`6L...`). Paste it into `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`.
5. Return to **Firebase Console -> Build -> App Check -> Apps**, click your Web App -> **Register -> reCAPTCHA Enterprise**, and paste that same Site Key.
6. In **Firebase Console -> Build -> App Check -> APIs**, select **Firebase AI Logic** -> **Enforce** once you have verified both local debug testing and your deployed origin.

### B. Local Development Debug Token (Optional, Non-Production Only)

1. On `localhost` / `127.0.0.1`, if reCAPTCHA Enterprise tokens fail due to headless/strict browser profiles during local development, open **Firebase Console -> Build -> App Check -> Apps -> `⋮` (three dots on your Web App) -> Manage debug tokens -> Add debug token**.
2. Paste the generated UUID string into `VITE_APP_CHECK_DEBUG_TOKEN` in `.env.local` (or set `VITE_APP_CHECK_DEBUG_TOKEN=true` to print a browser-generated UUID in DevTools console, then register that UUID in Firebase Console).
3. In production builds (`npm run build`), [firebaseApp.ts](../src/adapters/firebase/firebaseApp.ts) checks `if (!import.meta.env.PROD && publicConfig.debugToken)` so debug tokens are **never** activated in deployed bundles.

---

## 4. Exact `.env.local` Variable Reference

Copy [.env.example](../.env.example) to `.env.local` in `d:\umbral-hybrid-ai\.env.local` (git-ignored) and fill every required field:

| Variable | Required? | Exact Place to Obtain | Empty / Default Behavior |
| :--- | :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | **Required** | Firebase Console -> Project settings -> General -> Your apps (Web) -> `apiKey` | If blank or `your-...`/`demo`, Firebase & Cloud AI remain disabled (`Missing env keys`). |
| `VITE_FIREBASE_PROJECT_ID` | **Required** | Firebase Console -> Project settings -> General -> Your apps (Web) -> `projectId` | If blank or placeholder, Firebase AI Logic stays unconfigured. |
| `VITE_FIREBASE_APP_ID` | **Required** | Firebase Console -> Project settings -> General -> Your apps (Web) -> `appId` | If blank or placeholder, Firebase AI Logic stays unconfigured. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Recommended | Web App `authDomain` (`<project-id>.firebaseapp.com`) | Optional in code (`readFirebasePublicConfig`), include the value from Firebase snippet. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Recommended | Web App `storageBucket` (`<project-id>.firebasestorage.app`) | Optional metadata in code; include snippet value if shown. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Recommended | Web App `messagingSenderId` (numeric ID) | Optional metadata in code; include snippet value if shown. |
| `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` | **Required for Prod App Check** | Google Cloud Console -> Security -> reCAPTCHA Enterprise -> Key ID (`6L...`) | If empty, Cloud calls work only when App Check is unenforced on Firebase AI Logic (unsafe for prod). |
| `VITE_APP_CHECK_DEBUG_TOKEN` | Optional (Local dev only) | Firebase Console -> App Check -> Apps -> `⋮` -> Manage debug tokens (UUID) | Leave **blank** in `.env.local` unless debugging App Check locally, and **unset** in hosting env. |
| `VITE_FIREBASE_AI_CLOUD_MODEL` | Optional (Recommended) | Active Gemini Developer API model name | Defaults cleanly to `gemini-3.5-flash-lite` if left empty (`DEFAULT_CLOUD_MODEL_ID`). |

> `cleanEnvValue()` in [firebaseStatus.ts](../src/adapters/firebase/firebaseStatus.ts) rejects empty strings, `undefined`, `null`, `demo`, `changeme`, and any placeholder starting with `your-`, listing exact missing keys in `/settings`.

---

## 5. How to Confirm Everything Works Locally

1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173/settings` (**Settings & Hybrid AI Diagnostics**) and verify **Live Environment & Model Readiness** + **Operational verification status (States A–E)**:
   - **State A (`Firebase not configured`):** Shown before `.env.local` is added.
   - **State B (`Firebase configured, but App Check not initialized`):** Shown if `VITE_FIREBASE_*` are set without `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` or `VITE_APP_CHECK_DEBUG_TOKEN`.
   - **State C (`App Check initialized — awaiting first confirmed Cloud AI request`):** Shown once `Firebase Web App config` = **`Configured`** and `Firebase App Check` = **`reCAPTCHA Enterprise (with limited-use AI tokens)`** (or **`Local debug token mode (non-production)`**), before any live request has been sent.
3. Verify the top header pill transitions to **`Firebase Cloud AI ready`** (when online) or **`On-device AI ready`** / **`Prepare local model`** on Chrome Desktop `>= 139`.
4. Open `/opportunities/int-eth-esop-2027`, select **Cloud Only (Firebase AI Logic)** or toggle **Allow Firebase Cloud AI for this browser**, click **Explain requirements**, and confirm:
   - The provenance badge displays **`Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`** (`inferenceSource: IN_CLOUD`).
   - In Browser DevTools (**Network** tab), outbound requests reach `https://firebasevertexai.googleapis.com/v1beta/projects/<project-id>/models/gemini-3.5-flash-lite:generateContent` with headers `x-goog-api-key`, `X-Firebase-Appid`, and `X-Firebase-AppCheck` (returning HTTP `200`).
   - Returning to `/settings` transitions **Operational verification status** to **`State D · Gemini Cloud operational (real IN_CLOUD response confirmed in session)`** (and **`State E`** once a local `ON_DEVICE` run succeeds), with `EXPLAIN_REQUIREMENTS · ONLY_IN_CLOUD → IN_CLOUD` recorded in **Session AI Execution Log (Non-PII)**.

---

## 6. Allowed Domains & Content Security Policy (CSP)

1. **Authorized domains to register across Google Cloud reCAPTCHA Enterprise (and optional API key HTTP referrer restrictions):**
   - Local development: `localhost`, `127.0.0.1`
   - Firebase Hosting: `<project-id>.web.app`, `<project-id>.firebaseapp.com`
   - Optional standalone mirror (if used): `<your-new-project>.vercel.app`
   - **Never add or overwrite:** `umbral-seven-khaki.vercel.app` (reserved untouched for prior Kiroween submission `Alvaro-mendoza-12/Umbral`).
2. **CSP headers already configured in [firebase.json](../firebase.json) & [vercel.json](../vercel.json):**
   - `script-src`: `'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.recaptcha.net/recaptcha/`
   - `connect-src`: `'self' https://*.googleapis.com https://*.firebaseio.com https://*.gstatic.com https://www.google.com/recaptcha/ https://www.recaptcha.net` (covers `https://firebasevertexai.googleapis.com` used by `@firebase/ai@3.1.0` and `https://content-firebaseappcheck.googleapis.com` used by `@firebase/app-check`)
   - `frame-src`: `https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/ https://www.recaptcha.net/recaptcha/`
   - `worker-src 'self'; manifest-src 'self'; object-src 'none'; frame-ancestors 'none'`

---

## 7. Public Config vs. Private Secrets

| Asset | Safe in `.env.local` / Client Bundle? | Reason |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY`, `PROJECT_ID`, `APP_ID`, `AUTH_DOMAIN`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID` | **Yes (Public Web App Identifiers)** | Required by Firebase JS SDK in browser runtime; protected at runtime by App Check enforcement, not obscurity. |
| `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` | **Yes (Public Site Key)** | Browser client uses this site key to obtain reCAPTCHA Enterprise tokens. |
| `VITE_APP_CHECK_DEBUG_TOKEN` | **Localhost dev ONLY (`!import.meta.env.PROD`)** | Stripped cleanly from production activation by [firebaseApp.ts](../src/adapters/firebase/firebaseApp.ts); never set in hosting environment variables or git. |
| Google Cloud / Firebase Service Account JSON, reCAPTCHA *secret* key, Admin API keys, `.env.local` file | **NO — Strictly Secret** | Never place inside `VITE_*`, `src/`, `public/`, `dist/`, or git history. |

---

## 8. Billing, Plan & Free-Tier Quota Notes

- **Firebase AI Logic SDK:** Free to integrate.
- **Gemini Developer API (`new GoogleAIBackend()`):**
  - On an **unbilled Spark Firebase project** (no Google Cloud Billing account linked), eligible Flash models use the **Gemini Developer API Free Tier** at **$0 cost** (within per-minute/daily free limits; Google free-tier prompts may be used per Gemini API Free Tier terms).
  - If the Firebase project is upgraded to **Blaze (pay-as-you-go)** by attaching a Cloud Billing account, **Gemini Developer API Free Tier access ends** and usage bills per token. Set Google Cloud billing budgets/alerts first if enabling Blaze.
  - Model override note: `VITE_FIREBASE_AI_CLOUD_MODEL` defaults to `gemini-3.5-flash-lite` (matching `@firebase/ai@3.1.0`'s internal hybrid cloud default). If an alternate Flash model (`gemini-2.5-flash-lite`, `gemini-2.5-flash`) is needed for your account tier, override `.env.local` without editing code.
- **reCAPTCHA Enterprise (App Check):** Includes **10,000 free assessments per calendar month** across the Google Cloud organization (Essentials tier returns `429` beyond 10,000/month unless upgraded to billed tiers).

---

## 9. 10-Step Post-Credential Integration & App Check Test Procedure

Run these checks sequentially immediately after populating `.env.local`:

1. **Missing keys negative check first (optional baseline):** Verify `/settings` shows `State A` and `Missing env keys` before saving `.env.local`.
2. **State C readiness check:** Save `.env.local`, restart `npm run dev`, open `/settings`, and confirm `Firebase Web App config` = `Configured`, `Firebase App Check` = `reCAPTCHA Enterprise` (or `Local debug token mode`), and `Operational verification status` = `State C`.
3. **Consent Gate test (no cloud call allowed yet):** Ensure Cloud Consent is OFF on `/opportunities/int-eth-esop-2027` -> click **Explain requirements** (with Gemini Nano unavailable) -> confirm `Cloud AI Consent Required` appears and **0 requests** fire in Chrome DevTools Network.
4. **Real Cloud structured task (`EXPLAIN_REQUIREMENTS`):** Grant consent -> select `Cloud Only` (or retry `Explain requirements`) -> confirm **`Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`** (`inferenceSource: IN_CLOUD`), valid schema sections, and HTTP `200` to `firebasevertexai.googleapis.com` with header `X-Firebase-AppCheck`.
5. **Cloud step proposal (`PREPARE_NEXT_STEPS`):** Click **Propose 3 prep steps** -> verify each suggestion cites valid catalog evidence IDs and **Add to My Route** saves without duplicates.
6. **Multi-turn Cloud comparison (`startChat`):** Select a comparison opportunity (`Leiden University LExS`) -> ask a comparison question -> verify contextual bilingual comparison response and turn provenance badge.
7. **State D & non-PII log check:** Open `/settings` -> confirm **Operational verification status** shows `State D` and **Session AI Execution Log** displays `{kind} · {requestedMode} → IN_CLOUD` with zero personal text saved.
8. **Offline error resilience:** In Chrome DevTools -> **Network -> Offline**, attempt a Cloud call -> confirm clean `NETWORK_OFFLINE` notice, form draft preservation in follow-up chat, and visible offline hint without crashes.
9. **Production preview parity (no debug token):** Clear `VITE_APP_CHECK_DEBUG_TOKEN` -> run `npm run build && npm run preview` (`http://localhost:4173`) -> verify `App Check` stays in `recaptcha_enterprise` mode and `/settings` passes zero console/CSP errors.
10. **Deployed origin smoke test:** After `npx firebase-tools deploy --only hosting`, repeat Steps 2, 4, and 6 on `https://<project-id>.web.app` to confirm App Check domain whitelisting and CSP headers live.
