# Prior Work Disclosure and Substantial New Engineering Attribution

In accordance with **#BuildHybridAI 2026** official hackathon rules regarding pre-existing projects and prior discovery material, this document clearly distinguishes all pre-existing references from the substantial new engineering implemented exclusively for this competition.

## 1. Pre-Existing References (Strictly Untouched / Read-Only)

- **UMBRAL (Kiroween 2026 Edition)** — `Alvaro-mendoza-12/Umbral` (`https://umbral-seven-khaki.vercel.app`)
  - **Relationship:** Pre-existing domain concept ("From verified opportunity to clear next step", deterministic 4-state requirement matching, local-first "My Route" with 1 active goal & up to 3 active steps) created by the same author.
  - **Preservation guarantee:** The original repository, its `main` branch, its Kiroween candidacy documents, and its production Vercel deployment were left **100% untouched**. No commits, branches, pull requests, or overwrites target the original project.
- **Discovery Documentation Baseline (`docs/product-discovery` commits `72e3a38` and `63ac16a`)**
  - **Relationship:** Product discovery, UX research, architecture specifications, and security requirements prepared prior to coding.

## 2. Substantial New Engineering Built Exclusively in `umbral-hybrid-ai`

Created on a clean branch (`feat/hybrid-ai-web`) from scratch as a new codebase for **#BuildHybridAI 2026**:

1. **Firebase AI Logic Hybrid Inference Architecture (`src/adapters/firebase/`)**:
   - Official `firebase/ai` SDK integration (`^13.3.0`) configured with `GoogleAIBackend` and `useLimitedUseAppCheckTokens: true` (`ReCaptchaEnterpriseProvider` + safe non-hardcoded dev debug token support).
   - Real on-device support via Chrome Prompt API (`window.LanguageModel`) through Firebase AI Logic `HybridParams` (`PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`) with user-triggered `initializeDeviceModel` progress tracking.
   - Dynamic SDK bundle splitting so initial catalog browsing stays fast and light even offline.
   - Real provenance badge extracted directly from `result.response.inferenceSource` (`ON_DEVICE` vs `IN_CLOUD` vs `UNVERIFIED`), never hardcoded or faked.
   - Multi-turn cloud follow-up and side-by-side opportunity comparison via `startChat` (`ONLY_IN_CLOUD`).
2. **Privacy-First Consent & Safety Orchestrator (`src/services/aiOrchestrator.ts`, `src/domain/aiContract.ts`)**:
   - Blocks silent cloud fallback whenever `cloudConsentGranted` is false (auto-enforcing `ONLY_ON_DEVICE` when ready or prompting explicit consent).
   - Prompt-injection boundary tagging (`<opportunity_data>`, `<user_note>`), strict output JSON Schema + client validation stripping hallucinated `evidenceIds`, XSS sanitization, `AbortController` + request-ID stale-response cancellation, and a non-PII execution audit log.
3. **Complete UX/UI Redesign & Accessibility (`src/styles/`, `src/app/`, `src/features/`)**:
   - Civic-editorial design system focused on readability, keyboard navigation, and WCAG 2.2 AA contrast & touch targets.
   - 5-step non-blocking threshold launch animation docking into the header brand mark (honors `prefers-reduced-motion` and immediate user skip/interrupt).
   - 4-step keyboard-accessible, non-modal guided spotlight tour with persisted state and responsive mobile placement.
   - Full English/Spanish bilingual switcher (`i18next`) across UI, deterministic matcher reasons, AI prompts, and opportunity records.
4. **Refreshed & Expanded Catalog Verification (`src/data/opportunities.ts`)**:
   - Verified call metadata, official HTTPS URL enforcement, deadline time-zone precision (`America/Lima`, `Europe/Zurich`, `America/Bogota`, etc.), `reviewBy` expiration checks, and explicit transparency for unpublished fields.
5. **Automated Quality Assurance (`tests/unit/`, `tests/integration/`, `tests/e2e/`)**:
   - Unit, integration, end-to-end Playwright, Axe WCAG 2.2 AA, keyboard-only navigation, 200% zoom reflow, and 7-viewport responsive test suites.
