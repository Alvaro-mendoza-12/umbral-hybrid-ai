# UMBRAL Hybrid AI

[English](README.md) · [Auditoría `#BuildHybridAI`](docs/BUILDHYBRIDAI_RELEASE_READINESS.md) · [Postulación Devpost](docs/DEVPOST_SUBMISSION.md) · [Auditoría Final](docs/FINAL_AUDIT.md) · [Checklist de Producción](docs/PRODUCTION_CHECKLIST.md) · [Configurar Firebase](docs/FIREBASE_SETUP.md) · [Configurar Gemini Nano](docs/GEMINI_NANO_SETUP.md) · [Guía de Despliegue](docs/DEPLOYMENT_GUIDE.md) · [Evidencia de Pruebas](docs/TESTING_EVIDENCE.md) · [Atribución de Trabajo Previo](docs/PRIOR_WORK_AND_ATTRIBUTION.md)

**Despliegues públicos:** [Firebase Hosting (`umbral-21e8b.web.app`)](https://umbral-21e8b.web.app) · [Vercel (`umbral-hybrid-ai.vercel.app`)](https://umbral-hybrid-ai.vercel.app)

**UMBRAL Hybrid AI** es una aplicación web bilingüe (español / inglés), accesible y centrada en la privacidad, construida para la hackathon oficial **#BuildHybridAI 2026** de Google Firebase. Ayuda a estudiantes, personas en búsqueda de empleo y emprendedores a descubrir oportunidades verificadas (becas, empleo, formación y financiamiento), comprobar sus requisitos de forma determinista, organizar sus próximos pasos en **Mi Ruta** y recibir ayuda contextual mediante **Firebase AI Logic Hybrid Inference**.

> **Preservación de candidatura previa:** El repositorio original de Kiroween 2026 ([Alvaro-mendoza-12/Umbral](https://github.com/Alvaro-mendoza-12/Umbral) / [umbral-seven-khaki.vercel.app](https://umbral-seven-khaki.vercel.app)) permanece completamente intacto. Toda esta versión nueva se desarrolló de forma exclusiva en la rama `feat/hybrid-ai-web`. Consulta [docs/PRIOR_WORK_AND_ATTRIBUTION.md](docs/PRIOR_WORK_AND_ATTRIBUTION.md).

---

## Capacidades principales

1. **Descubrimiento rápido y fuentes verificables (`/`)**:
   - Catálogo curado de 20 oportunidades (`CURATED_CATALOG_VERSION = 2026.11.14-r1`) en `INT`, `PE`, `CO`, `MX`, `ES` y `US`, con enlaces HTTPS oficiales, fechas límite con zona horaria, fecha de verificación (`verifiedAt`) y fecha sugerida de revisión (`reviewBy`).
   - Filtros inmediatos por país, categoría, modalidad, ventana de cierre, idioma y texto libre en tres clics o menos.
2. **Autocomprobación determinista en 4 estados (`/opportunities/:id`)**:
   - Compara el perfil ingresado con los requisitos de la convocatoria sin emitir decisiones oficiales de elegibilidad.
   - Separa `MATCH`, `MISMATCH`, `NEEDS_CONFIRMATION` y `UNKNOWN` (mostrados como Coincide, No coincide, Por confirmar y Desconocido) de forma determinista en TypeScript puro (`src/domain/matcher.ts`), sin depender de modelos de IA.
3. **IA Híbrida real con Firebase AI Logic (`src/adapters/firebase/`)**:
   - Integración directa con `firebase/ai` (`firebase@^13.3.0`) usando `GoogleAIBackend`, `useLimitedUseAppCheckTokens: true` y Firebase App Check (`ReCaptchaEnterpriseProvider` en producción y token de depuración configurable solo fuera de producción).
   - Soporta los cuatro modos (`PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`), descarga explícita bajo acción del usuario (`initializeDeviceModel`), salidas JSON estructuradas (`Schema.object` en nube y `responseConstraint` en Chrome local) y chat/comparación multi-turno en la nube (`startChat` con `ONLY_IN_CLOUD`).
   - **Puerta de consentimiento previo (`src/services/aiOrchestrator.ts`)**: bloquea cualquier fallback silencioso a la nube si el usuario no otorgó consentimiento explícito. La procedencia (`ON_DEVICE`, `IN_CLOUD` o `UNVERIFIED`) se lee directamente de `result.response.inferenceSource`.
4. **Mi Ruta local (`/route`)**:
   - Persistencia local (`localStorage` con claves `umbral:route:v2`, `umbral:profile:v1`, `umbral:prefs:v1`) limitada a 1 meta activa y hasta 3 pasos activos para evitar saturación cognitiva, más exportación/importación JSON y borrado completo en un clic.
5. **UX accesible y diseño centrado en las personas (`src/app/`, `src/styles/`)**:
   - Animación inicial breve hacia la esquina superior izquierda (`IntroSplash`, respeta `prefers-reduced-motion`).
   - Guía interactiva no modal de 4 pasos (`OnboardingTour`) operable por teclado y lectores de pantalla, con persistencia de finalización.
   - Diseño responsive mobile-first verificado en 8 anchos (`320px` a `1440px`), reflow al 200%, recarga offline PWA (`/route`), navegación completa con teclado y auditorías Axe WCAG 2.2 AA.

---

## Instalación y comandos locales

Requisitos: Node.js `>=20.19.0` y Google Chrome Desktop `>=139` para inspeccionar `window.LanguageModel`.

```bash
npm install
npm run dev          # Servidor de desarrollo Vite
npm run typecheck    # Comprobación estricta TypeScript
npm run lint         # Reglas ESLint 10
npm run test         # Pruebas unitarias e integración (Vitest)
npm run build        # Compilación de producción + PWA
npm run test:e2e     # Build + Playwright E2E + Axe WCAG 2.2 AA
```

Para habilitar llamadas reales contra Firebase AI Logic y Gemini en la nube, copia [.env.example](.env.example) a `.env.local` y completa tus claves públicas de Firebase Web App, la clave de sitio reCAPTCHA Enterprise y `VITE_FIREBASE_AI_CLOUD_MODEL=gemini-3.5-flash-lite`. Sin esas credenciales la aplicación funciona íntegramente en modo local/curado (catálogo, autocomprobación, Mi Ruta y diagnósticos), y muestra con claridad en Configuración (`/settings`) qué variables faltan.
