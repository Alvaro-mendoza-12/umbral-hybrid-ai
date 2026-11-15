# Deployment Guide — Firebase Hosting & Vercel

UMBRAL Hybrid AI ships with aligned strict CSP headers across Firebase Hosting and Vercel, SPA fallback routing, Workbox offline PWA precaching (`navigateFallback: '/index.html'`), and zero hardcoded credentials. External deployment must only be executed by the project owner once `.env.local` / hosting environment variables are verified.

> **Isolation Reminder:** Do **NOT** deploy to `https://umbral-seven-khaki.vercel.app` or push to `Alvaro-mendoza-12/Umbral`. Deploy exclusively from `umbral-hybrid-ai` to a **brand-new** Firebase Hosting site or new Vercel project.

---

## Option A: Firebase Hosting (Recommended for #BuildHybridAI 2026)

1. **Authenticate CLI:**
   ```bash
   npx firebase-tools login
   ```
2. **Bind your new Firebase project (creates `.firebaserc` locally; keep untracked):**
   ```bash
   npx firebase-tools use --add
   ```
   Select your `#BuildHybridAI 2026` Firebase project and alias it as `default`.
3. **Verify `.env.local` & run a clean production build:**
   Confirm `.env.local` contains `VITE_FIREBASE_*` and `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` (leave `VITE_APP_CHECK_DEBUG_TOKEN` blank; `!import.meta.env.PROD` strips debug-token activation from production bundles automatically).
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```
4. **Verify `dist/` artifacts before upload:**
   - Confirm `dist/index.html`, `dist/sw.js`, `dist/manifest.webmanifest`, and `dist/assets/*.js` were generated.
   - Verify no `.env` files exist in `dist/`.
5. **Deploy Hosting only:**
   ```bash
   npx firebase-tools deploy --only hosting
   ```
6. **Post-deploy live checks:**
   - Add `https://<project-id>.web.app` and `https://<project-id>.firebaseapp.com` to Google Cloud Console -> **reCAPTCHA Enterprise -> Key -> Domains**.
   - Open the deployed HTTPS URL in Chrome DevTools -> **Network** and confirm HTTP response headers match [firebase.json](../firebase.json): `Content-Security-Policy` (including `worker-src 'self'; manifest-src 'self'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
   - Open `/settings` -> confirm **Firebase Web App config** = `Configured`, **Firebase App Check** = `reCAPTCHA Enterprise (with limited-use AI tokens)`.
   - Open `/route` and press browser Reload (`F5`) directly to confirm SPA rewrite -> `/index.html` and PWA service worker registration.
   - Run one **Cloud Only (Firebase AI Logic)** request and verify **`Ran in cloud · Firebase AI (gemini-3.5-flash-lite)`**.

---

## Option B: Vercel (Optional Standalone Mirror)

[vercel.json](../vercel.json) mirrors [firebase.json](../firebase.json) with identical CSP, security headers, cache headers on `/assets/**` and `/sw.js`, and SPA rewrites.

1. Connect `Alvaro-mendoza-12/umbral-hybrid-ai` as a **new Vercel project** (never overwrite `Alvaro-mendoza-12/Umbral`).
2. Set Framework Preset = **Vite**, Build Command = `npm run build`, Output Directory = `dist`.
3. In Vercel Project Settings -> **Environment Variables**, set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` (plus `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and optionally `VITE_FIREBASE_AI_CLOUD_MODEL`). **Never** set `VITE_APP_CHECK_DEBUG_TOKEN` in Production.
4. Add `<your-project>.vercel.app` to Google Cloud reCAPTCHA Enterprise allowed domains and deploy.
