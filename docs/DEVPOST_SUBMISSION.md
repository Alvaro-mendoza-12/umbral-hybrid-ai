# Devpost Submission Package — UMBRAL Hybrid AI (#BuildHybridAI 2026)

> **Important Honesty Note:** This file prepares accurate text and demo structure based strictly on verified code and local test runs. Live Firebase deployment URLs, video links, and live cloud/Gemini Nano hardware screenshots must be captured only after the project owner connects their Firebase project (`.env.local` + `firebase deploy`).

---

## Project Title & Tagline

- **Project Name:** UMBRAL Hybrid AI
- **Tagline:** Turn verified scholarships, jobs, and training into clear, accessible next steps with privacy-first on-device and Firebase AI Logic cloud assistance.
- **Target Categories:**
  - Grand Prize (`$10,000`)
  - Best Web/Chrome (`$3,000`)

---

## Elevator Pitch / What It Does

Finding scholarships, jobs, and public training programs across Latin America, Europe, and global fellowships is overwhelming: requirements are scattered across dense PDFs, deadlines depend on time zones, and learners hesitate to paste personal details into generic chatbots.

**UMBRAL Hybrid AI** solves this with a structured, human-centered web app that never turns into an open-ended chatbot:

1. **Discover in ≤ 3 clicks:** Browse a verified, timestamped catalog of 20 curated opportunities (`INT`, `PE`, `CO`, `MX`, `ES`, `US`) with direct HTTPS source links and deadline urgency badges.
2. **Deterministic 4-state Self-Check:** Check how your profile relates to official conditions (`Matches`, `Does not match`, `Needs confirmation`, `Unknown`) using transparent rule logic—never fabricated by an LLM and never claiming official eligibility.
3. **Real Firebase AI Logic Hybrid Inference:** Summarize requirements or prepare tailored action steps using Firebase AI Logic JS SDK (`firebase/ai`, `PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`).
   - Runs **on-device via Chrome Prompt API (`window.LanguageModel`)** for privacy-sensitive summaries and checklists when Chrome desktop + Gemini Nano are available.
   - Enforces an explicit **Cloud Consent Gate** before any `GoogleAIBackend` fallback or multi-turn comparison (`startChat` with `ONLY_IN_CLOUD`, defaulting to `gemini-3.5-flash-lite`), protected by **Firebase App Check (`ReCaptchaEnterpriseProvider`)** with `useLimitedUseAppCheckTokens: true`.
   - Always reports actual execution provenance straight from `result.response.inferenceSource` (`ON_DEVICE` vs `IN_CLOUD` vs `UNVERIFIED`).
4. **My Route:** Save one active goal and up to three active next steps locally in the browser (`localStorage`), export/import progress as JSON, or wipe all local data in one confirmation step.

---

## How We Aligned With #BuildHybridAI 2026 Criteria

1. **Technological Implementation:**
   - Official `firebase/ai` (`firebase@^13.3.0`) hybrid SDK integration (`getAI`, `getGenerativeModel`, `initializeDeviceModel`, `Schema`, `InferenceMode`, `InferenceSource`).
   - Strict cloud consent guard in `AIOrchestrator` (`src/services/aiOrchestrator.ts`) that dynamically narrows `PREFER_ON_DEVICE` to `ONLY_ON_DEVICE` when cloud consent is off, preventing silent cloud transmission.
   - Prompt-injection boundary tagging (`<opportunity_data>`, `<user_note>`), strict structured JSON schema validation filtering out hallucinated `evidenceIds`, stale request cancellation via `AbortController`, and CSP headers in `firebase.json` and `vercel.json`.
   - Dynamic SDK bundle splitting so offline catalog browsing and deterministic checks remain instant and lightweight.
2. **Design:**
   - Light civic-editorial interface designed around Nielsen's 10 heuristics, ISO 9241-210 human-centered design, and WCAG 2.2 AA accessibility.
   - Non-blocking launch transition (`IntroSplash`) docking cleanly into the header mark (`prefers-reduced-motion` compliant), plus a 4-step keyboard-accessible spotlight onboarding tour.
   - Full English / Spanish bilingual UI, deterministic matcher reasons, and opportunity content.
   - Tested across 7 viewport sizes (`320px` to `1440px`), 200% zoom reflow, keyboard-only navigation, and zero Axe WCAG 2.2 AA violations.
3. **Potential Impact:**
   - Serves first-generation students, career switchers, and underserved entrepreneurs across Peru, Colombia, Mexico, Spain, the US, and international fellowships with clear, source-attributed guidance even offline.
   - Protects user privacy by keeping personal profile inputs and `My Route` state local-first (`localStorage`) unless cloud AI consent is explicitly given.
4. **Quality of the Idea:**
   - Avoids generic chatbot sprawl by pairing deterministic four-state eligibility transparency with bounded, provenance-labeled hybrid AI tasks.

---

## Prior Work Attribution Summary (For Devpost Form)

UMBRAL Hybrid AI builds conceptually on **UMBRAL** (Kiroween 2026 submission at `Alvaro-mendoza-12/Umbral`), which remains untouched. For #BuildHybridAI 2026, a brand-new codebase was engineered from the ground up with Firebase AI Logic Hybrid Inference, Firebase App Check security, Chrome Prompt API on-device integration, a complete UI/UX & accessibility overhaul, bilingual EN/ES architecture, prompt-injection/provenance guardrails, and full Vitest + Playwright + Axe test coverage. See [docs/PRIOR_WORK_AND_ATTRIBUTION.md](PRIOR_WORK_AND_ATTRIBUTION.md).

---

## Checklist Before Clicking "Submit" on Devpost (User Action Required)

- [ ] Add your own `.env.local` Firebase Web App config (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`) and enable Firebase AI Logic + App Check in the Firebase Console.
- [ ] Verify a real live inference trace on a Chrome desktop machine with Gemini Nano downloaded (shows `ON_DEVICE`) and one live cloud follow-up (`IN_CLOUD`), capturing screenshots for the Devpost gallery & demo video.
- [ ] Run `npm run build` and deploy to Firebase Hosting (`firebase deploy --only hosting`), then add the live URL to Devpost.
- [ ] Record a 2-3 minute English demo video highlighting: (1) 3-click opportunity discovery & 4-state deterministic check, (2) hybrid inference toggle & consent gate, (3) real `inferenceSource` provenance badge (`On-Device` vs `Firebase Cloud`), and (4) `Settings -> Hybrid Diagnostics`.
