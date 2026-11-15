# Final Presentation & Demo Script (2–3 Minutes) — UMBRAL Hybrid AI

**Language:** English  
**Target Event:** `#BuildHybridAI 2026` (Google Firebase)  
**Pre-Recording Environment:** Run **Google Chrome Desktop `>= 139`** against the deployed app (`https://umbral-21e8b.web.app` once updated, or local `vite preview` with `.env.local`) with **Gemini Nano** already initialized on eligible desktop hardware (per [GEMINI_NANO_SETUP.md](GEMINI_NANO_SETUP.md)) so both `ON_DEVICE` and `IN_CLOUD` inference transitions appear live without mocks.

---

## Pre-Demo Verification (30 Seconds Off-Camera)

1. Open `/settings` and verify **Real Browser & Firebase Diagnostics**:
   - **Detected browser:** `Google Chrome ...`
   - **Chrome Prompt API (`window.LanguageModel`):** `Supported`
   - **Local Gemini Nano status:** `Ready on-device` (requires eligible desktop disk/GPU + Optimization Guide model downloaded)
   - **Firebase Web App config:** `Configured (umbral-21e8b)`
   - **Firebase App Check:** `reCAPTCHA Enterprise (limited-use AI tokens)`
   - **Configured Cloud Gemini model:** `gemini-3.5-flash-lite`
2. Click **Replay 4-step visual guide** in `/settings` if you want a clean `/` hero walkthrough, and keep DevTools **Network** ready for Stage 7.

---

## Stage 1 — 0:00 to 0:20 | The Problem UMBRAL Solves

- **On screen:** Landing view `/` showing the value-proposition hero (`"Find real opportunities and check if you qualify in minutes."`), the `3-Step Overview`, and the **segmented `ES / EN` switch**. Toggle smoothly between `ES` and `EN` to demonstrate zero-reload localization and header alignment.
- **Narration:** *"Millions of students, workers, and founders miss scholarships, public training, and grants because eligibility rules sit buried inside dense PDFs across time zones—and pasting personal details into generic cloud chatbots creates both privacy risks and hallucinated advice. UMBRAL Hybrid AI turns verified opportunities into clear, private, actionable next steps powered by Firebase AI Logic and Chrome Gemini Nano."*

---

## Stage 2 — 0:20 to 0:45 | Opportunity Discovery

- **On screen:** Click **`Explore opportunities`** on the hero to focus the search bar cleanly.
- **Action:**
  - Show that active search hides `closed` and `review_required` items by default so users only see confirmed active calls first (while transparently allowing `Include closed or pending re-check` for full visibility).
  - Filter by `Education & Scholarships`, select `ETH Zurich ESOP`, highlight the official verified date, location badge, deadline time zone, and direct official HTTPS link, and click **`Check requirements & AI`**.
- **Narration:** *"In three clicks, UMBRAL filters 20 curated, source-attributed opportunities across Latin America, Spain, the US, and global fellowships, flagging time zones, official links, and pending re-verification items honestly."*

---

## Stage 3 — 0:45 to 1:15 | Deterministic 4-State Self-Check

- **On screen:** `/opportunities/int-eth-esop-2027` -> **Requirement self-check**.
- **Action:**
  - Select `Peru`, `Yes` legal authorization, and `Technical degree` -> point out the immediate **`Mismatch`** badge and left red indicator on the degree criterion, while incomplete fields show **`Unknown`** and external-only rules show **`Needs confirmation`**.
  - Switch education to `Bachelor's / University degree` -> highlight the instant transition in the 4-state scoreboard (`Match`, `Mismatch`, `Needs confirmation`, `Unknown`) and the mandatory/optional badges.
- **Narration:** *"Before any generative model executes, a pure TypeScript deterministic engine evaluates official criteria across four explicit states—Match, Mismatch, Needs confirmation, and Unknown. Incomplete profiles never produce false positive matches, and UMBRAL states clearly that it guides orientation without replacing official eligibility rulings."*

---

## Stage 4 — 1:15 to 1:50 | Gemini Cloud (`IN_CLOUD` + App Check)

- **On screen:** Right-hand **Hybrid AI Contextual Assistant** on `/opportunities/int-eth-esop-2027` -> notice the dual engine status cards contrasting **Gemini Nano (On-device)** and **Gemini Cloud (Firebase AI)**.
- **Action:**
  - Show that **Cloud Multi-Turn Follow-Up & Comparison** blocks outbound cloud calls until explicit consent is granted (**Cloud AI Consent Required**).
  - Click **Allow Firebase Cloud AI for this browser**, optionally pick `Leiden University LExS` to compare, type *"Compare language rules and deadlines between these two scholarships"*, and click **`Ask Cloud AI`**.
  - Highlight the provenance badge: **`Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`** (`inferenceSource: IN_CLOUD`), response latency, and App Check protection (`reCAPTCHA Enterprise` limited-use tokens).
- **Narration:** *"When cross-document reasoning or cloud scale is needed—and only after explicit consent—UMBRAL calls `gemini-3.5-flash-lite` through Firebase AI Logic and `GoogleAIBackend`, protected end-to-end by Firebase App Check with reCAPTCHA Enterprise."*

---

## Stage 5 — 1:50 to 2:20 | Gemini Nano (`ON_DEVICE`)

- **On screen:** Top AI panel section (`Active mode: Prefer On-Device (Hybrid Default)`). Toggle DevTools **Network -> Offline** (if capturing live on-device Gemini Nano on eligible desktop hardware).
- **Action:**
  - Click **`Explain requirements`** and then **`Propose 3 prep steps`**.
  - Point directly to the provenance badge: **`Ran on-device · Chrome Gemini Nano`** (`inferenceSource: ON_DEVICE`) and the source-attributed evidence tags attached to structured items (invalid IDs stripped automatically by `aiContract`).
  - Point out **`Add to My Route`** beside a suggested preparation step.
- **Honesty boundary when presenting on non-Nano hardware:** If presenting from hardware where Gemini Nano reports `unavailable`, show `/settings` transparently reporting `"Unavailable on this device or disk"` alongside `State C` / `State D` rather than simulating `ON_DEVICE`, and switch to `Prefer in cloud` only after demonstrating the consent gate blocking silent cloud fallback.
- **Narration:** *"With Prefer On-Device selected, Chrome Gemini Nano runs locally inside the browser with zero bytes leaving the device, while UMBRAL's provenance label strictly reflects the SDK's real `inferenceSource`—never faking local execution when the model is absent."*

---

## Stage 6 — 2:20 to 2:40 | My Route Focus Workspace

- **On screen:** Click **`My Route`** (`/route`).
- **Action:**
  - Highlight the 3 KPI summary cards (`Saved opportunities`, `Active goal`, `Active next steps · X/3`).
  - Save **1 focused Active Goal**, show the added step alongside the **3-active-step cognitive guardrail**, and click **`Download JSON`** to export a portable, schema-versioned backup.
- **Narration:** *"My Route keeps personal momentum focused: one active goal, at most three active steps, status tracking, and portable JSON backup—all stored locally without mandatory accounts."*

---

## Stage 7 — 2:40 to 3:00 | Privacy & Local-First Offline Operation

- **On screen:** Briefly visit `/privacy` -> `/settings` (**Session AI Execution Log (Non-PII)**) -> reload `/route` with **Network -> Offline** active (PWA service worker).
- **Action:** Show `/route` reloading cleanly offline from the VitePWA service worker (`workbox.navigateFallback: '/index.html'`), and point to **`Clear all local data`** in `/settings` and **Non-PII Execution Log** recording only `task · mode → inferenceSource` + latency (zero personal text).
- **Closing line:** *"Local-first by default, offline-ready as a PWA, WCAG 2.2 AA accessible, bilingual in Spanish and English, and built on honest, consent-gated Firebase Hybrid AI. Thank you."*
