# Informe Final de Release Candidate — UMBRAL Hybrid AI

**Fecha:** 14 de noviembre de 2026  
**Repositorio:** `Alvaro-mendoza-12/umbral-hybrid-ai` (`D:\umbral-hybrid-ai`, rama `feat/hybrid-ai-web`)  
**Proyecto Firebase:** `umbral-21e8b` (plan Spark, sin facturación habilitada)  
**Producción actual desplegada (versión previa):** `https://umbral-21e8b.web.app`  
**Repositorio original preservado e intacto:** `Alvaro-mendoza-12/Umbral` (`https://umbral-seven-khaki.vercel.app`)

---

## 1. Estado general del producto

UMBRAL Hybrid AI se encuentra en estado **Release Candidate** en el árbol local de `D:\umbral-hybrid-ai`:

- La arquitectura limpia por puertos y adaptadores (`domain`, `ports`, `adapters`, `services`, `features`, `locales`) compila en TypeScript estricto y pasa la batería completa de pruebas automatizadas.
- La versión pública actualmente alojada en `https://umbral-21e8b.web.app` conserva la compilación previa (con Firebase AI Logic `IN_CLOUD` y `State D` ya validados en su despliegue original), mientras que el árbol local incorpora todo el rediseño UX/UI, la limpieza visual de detalle/autocomprobación y las verificaciones en vivo de las 4 entradas `review_required` realizadas el **14 de noviembre de 2026**, listas para desplegarse únicamente cuando autorices `firebase deploy`.
- **Único bloqueo técnico de ejecución real pendiente de entorno físico:** Chrome Gemini Nano (`window.LanguageModel`) en este equipo devuelve `"unavailable"` y `NotSupportedError: Unable to create a text session because the service is not running.`, por lo que la inferencia real `ON_DEVICE` sin red requiere ejecutarse en un equipo de escritorio con GPU/disco compatible.

---

## 2. Rediseño UX/UI (Antes vs. Después)

| Área | Antes | Después (Release Candidate local) |
| --- | --- | --- |
| **Primera impresión en `/` ([ExplorePage.tsx](../src/features/explore/ExplorePage.tsx))** | Entrada directa al buscador con riesgo de desplazamiento inicial por `scrollIntoView` en el paso 0 de la guía. | Hero claro con propuesta de valor breve (`.hero-surface`), CTA principal (`hero-explore-cta` hacia `#finder-query`), acceso directo a Mi Ruta (`hero-route-cta`), botón `Cómo funciona`, resumen visual en 3 pasos (`.steps-overview-grid`) y buscador ancho completo sobre 5 filtros. |
| **Guía interactiva y arranque (`Run`)** | Sin script `"start"` en `package.json`; popover inicial cubría botones del hero en primera visita y el modo `host: true` en Vite ocultaba colisiones locales de puerto en Windows. | `"start": "vite"` + `server: { host: '127.0.0.1', port: 5173 }` (detección automática de puerto libre cuando `5173`/`5174` están ocupados en loopback, verificado levantando `http://127.0.0.1:5175/` con `HTTP 200`); `IntroSplash.tsx` acelerado (`220ms`/`440ms`/`580ms`); en [OnboardingTour.tsx](../src/app/OnboardingTour.tsx) y [layout.css](../src/styles/layout.css), medición real de `popoverRef` y límite inferior de los 3 CTAs del hero (`heroCtaBottom`) para garantizar `0` solapamiento en desktop (`1280x800`) y móvil (`360x800` y `390x844`) en primera visita, persistencia oculta en recargas, `scroll-margin-top` en tarjetas bajo cabecera fija y retorno limpio al inicio desde `.brand-link` y `Explorar`. |
| **Selector de idioma `ES / EN` ([LanguageSwitch.tsx](../src/components/LanguageSwitch.tsx))** | Conmutador estático vulnerable a desplazamiento lateral en móvil si cambiaba el ancho del indicador de estado. | Control segmentado tipo píldora con indicador deslizante `.lang-switch-thumb` (`translateX(0%)` ↔ `translateX(100%)`), soporte por teclado (`ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown`), `aria-pressed`, paridad del 100 % `ES/EN`, persistencia inmediata y cabecera móvil fijada (`width: 100%; justify-content: space-between` en `< 768px`). |
| **Filtro de plazos y tarjetas** | Etiqueta `"Cualquier estado o plazo"` / `"Any status or window"` sufría recorte visual en el 5.º select a 1280px. | Etiqueta acortada a `"Cualquier plazo"` / `"Any deadline"` sin recorte visual y ubicación visible con `MapPin` en tarjetas. |
| **Detalle y Autocomprobación ([OpportunityDetailPage.tsx](../src/features/detail/OpportunityDetailPage.tsx), [SelfCheckPanel.tsx](../src/features/detail/SelfCheckPanel.tsx))** | Sufijos técnicos `<code>({req.id})</code>` y `({cond.id})` visibles para el usuario final; conteo textual duplicado bajo el marcador de 4 tarjetas. | Viñetas limpias sin IDs internos expuestos (manteniendo intactas las etiquetas de evidencia en `HybridAIPanel.tsx`); marcador visual `.match-scoreboard` accesible sin duplicar el párrafo inferior (reservado como `.sr-only` para `aria-live="polite"`) y bordes izquierdos semánticos por estado. |
| **IA Híbrida y Mi Ruta ([HybridAIPanel.tsx](../src/features/detail/HybridAIPanel.tsx), [MyRoutePage.tsx](../src/features/route/MyRoutePage.tsx))** | Estado local vs nube menos evidente antes de consultar. | Tira comparativa `.ai-engine-strip` separando Gemini Nano en dispositivo de Gemini Cloud (Firebase AI); tarjetas resumen `.route-kpi-grid` en Mi Ruta, iconos en Privacidad y tarjeta 404 localizada mejorada. |

---

## 3. Clasificación funcional del sistema

| Funcionalidad | Estado | Evidencia / Condición |
| --- | --- | --- |
| **Descubrimiento, búsqueda en 3 clics, filtros (6 facetas) y catálogo de 20 oportunidades** | `COMPLETADA Y VERIFICADA` | Reglas en `catalogRules.ts`, pruebas unitarias, integración y Playwright E2E; las 4 URLs `review_required` devolvieron `HTTP 200` el 14-11-2026 manteniendo estado editorial honesto. |
| **Motor determinista de autocomprobación en 4 estados (`MATCH`, `MISMATCH`, `NEEDS_CONFIRMATION`, `UNKNOWN`)** | `COMPLETADA Y VERIFICADA` | Separación obligatorios vs opcionales, contradicciones país/autorización, cero falsos positivos con perfil parcial, aviso no oficial (`matcher.test.ts`, E2E y captura visual). |
| **Selector segmentado deslizante `ES / EN` y paridad bilingüe 100 %** | `COMPLETADA Y VERIFICADA` | `LanguageSwitch.tsx`, test de paridad ES/EN, teclado, recarga persistente y prueba móvil `360x800`. |
| **Navegación SPA, botón `Run` (`npm start`), logo -> inicio y 404 localizado** | `COMPLETADA Y VERIFICADA` | `package.json`, `vite.config.ts`, `Shell.tsx`, `App.tsx`, `OnboardingTour.tsx`, pruebas de integración y E2E. |
| **Mi Ruta (1 meta, máx. 3 pasos, edición, import/export JSON v2 HTTPS, borrado)** | `COMPLETADA Y VERIFICADA` | `routeRules.ts`, `localRouteAdapter.ts`, `MyRoutePage.tsx`, pruebas unitarias, integración y E2E. |
| **PWA Offline (`/route` con Service Worker Workbox) y WCAG 2.2 AA** | `COMPLETADA Y VERIFICADA` | 5 auditorías Axe (`0` violaciones), 8 viewports (`320px`–`1440px`), reflow 200 % (`640px`), recarga offline real en Playwright. |
| **Integración Firebase AI Logic + Gemini Cloud (`gemini-3.5-flash-lite`) + App Check reCAPTCHA Enterprise** | `COMPLETADA Y VERIFICADA` *(en producción desplegada)* / `IMPLEMENTADA, PENDIENTE DE PRUEBA REAL` *(tras nuevo build UX/UI en Hosting)* | El backend `GoogleAIBackend`, App Check, puerta de consentimiento y `IN_CLOUD` (`State D`) se comprobaron en la versión publicada en `https://umbral-21e8b.web.app` ([SESSION_INFRASTRUCTURE_AUDIT.md](SESSION_INFRASTRUCTURE_AUDIT.md)). El build local actualizado muestra `Estado C` en `vite preview` sin gastar cuota adicional; falta autorizar redeploy en Hosting y repetir 1 solicitud `IN_CLOUD` sobre el nuevo artefacto. |
| **Orquestación híbrida (`PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`) y bloqueo sin consentimiento** | `COMPLETADA Y VERIFICADA` | `aiOrchestrator.ts`, `hybridAiAdapter.ts`, 11 pruebas entre `aiOrchestrator.test.ts` y `hybridAiAdapter.test.ts` + flujo E2E. |
| **Gemini Nano local (`window.LanguageModel`, descarga e inferencia real `ON_DEVICE`)** | `BLOQUEADA POR HARDWARE O CREDENCIALES` | En Chrome 157 local (`http://127.0.0.1`, headless y con UI), `typeof window.LanguageModel === 'function'`, pero `availability()` devuelve `"unavailable"` y `create()` arroja `NotSupportedError: Unable to create a text session because the service is not running.` El código de descarga, progreso, `ON_DEVICE` y manejo de errores está implementado y cubierto por pruebas simuladas, pero **la inferencia real `ON_DEVICE` sin conexión requiere hardware compatible** (ver [GEMINI_NANO_SETUP.md](GEMINI_NANO_SETUP.md)). |
| **Confirmación final de plazas activas por correo/RR. HH. en 4 fuentes `review_required`** | `IMPLEMENTADA, PENDIENTE DE PRUEBA REAL` *(confirmación humana externa)* | Las 4 URLs oficiales están vivas (`HTTP 200` el 14-11-2026), pero las empresas/centros no exponen disponibilidad de vacantes por API pública; UMBRAL mantiene honestamente `review_required` en `opportunities.ts`. |
| **Avisos transitivos `npm audit --omit=dev` en `@grpc/grpc-js <=1.13.5`** | `PENDIENTE DE CORRECCIÓN` *(upstream Firebase, sin ruta de ejecución en cliente)* | Ver sección 6. No existe actualización semver compatible sin romper `firebase@13.3.0`; el paquete no entra al bundle final `dist/assets/*.js`. |

---

## 4. Estado real de Gemini Cloud

- **Proyecto y modelo:** `umbral-21e8b`, Firebase AI Logic con `GoogleAIBackend` y modelo `gemini-3.5-flash-lite` (plan Spark, sin facturación).
- **Protección:** Firebase App Check con `ReCaptchaEnterpriseProvider` y `useLimitedUseAppCheckTokens: true` (`vite` desarrollo usa `.env.development.local` excluido en producción por `!import.meta.env.PROD`).
- **Comprobación observada en producción previa (`https://umbral-21e8b.web.app`):** registrada en [SESSION_INFRASTRUCTURE_AUDIT.md](SESSION_INFRASTRUCTURE_AUDIT.md) con solicitud `ONLY_IN_CLOUD`, `inferenceSource: IN_CLOUD` (4171 ms) y diagnóstico `State D`.
- **Comprobación en este cierre sobre el servidor `npm run start` (`127.0.0.1:5175`) y el build de producción (`dist/`):** en desarrollo (`npm run start`), `/settings` muestra `Configurado (umbral-21e8b)`, `Modo token de depuración local` (`.env.development.local`), `gemini-3.5-flash-lite` y `Estado C` (`0` `pageerror`; las peticiones de depuración sin token registrado devuelven HTTP 403 en consola solo en modo debug local); en build de producción `vite preview` (`dist/`), `/settings` usa `reCAPTCHA Enterprise (tokens limitados de IA)` con `0` errores de consola y `0` `pageerror` (no se consumió cuota Gemini en pruebas automatizadas).

---

## 5. Estado real de Gemini Nano

- **Sonda real ejecutada hoy en Chrome `157.0.8103.51` (contexto seguro `http://127.0.0.1`):**
  - Tanto con `headless: true` como con `headless: false`:
    - `typeof window.LanguageModel === 'function'` (superficie WebIDL presente).
    - `await window.LanguageModel.availability()` -> `"unavailable"`.
    - `await window.LanguageModel.create()` -> `NotSupportedError: Unable to create a text session because the service is not running.`
- **Transparencia UI:** UMBRAL no simula disponibilidad local; `/settings` muestra `"No disponible en este equipo o disco"` y `HybridAIPanel.tsx` bloquea `ONLY_ON_DEVICE` inmediatamente cuando el modelo no está listo.
- **Procedimiento exacto para validarlo en otro equipo Chrome Desktop `>= 139`:** documentado paso a paso en [GEMINI_NANO_SETUP.md](GEMINI_NANO_SETUP.md) (~22 GB libres, `> 4 GB VRAM`, flags `chrome://flags/#optimization-guide-on-device-model` y `chrome://flags/#prompt-api-for-gemini-nano`, `chrome://components`, descarga desde `/settings`, modo Offline en DevTools y verificación de `inferenceSource === 'ON_DEVICE'` y `State E`).

---

## 6. Auditoría de seguridad y `@grpc/grpc-js`

- **CSP y cabeceras HTTP:** configuradas de forma coherente en `firebase.json` y `vercel.json` (`worker-src 'self'`, `manifest-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, orígenes permitidos acotados a `'self'`, Googleapis, Firebase y reCAPTCHA Enterprise).
- **Secretos y saneamiento:** cero claves privadas en variables `VITE_*` ni en `src/`, `.env.local` y `.env.development.local` ignorados por Git, cero sumideros XSS (`dangerouslySetInnerHTML`, `innerHTML`, `eval`, `document.write`) en `src/`, validación estricta HTTPS en URLs importadas (`512 KB` máximo en JSON) y etiquetas delimitadoras contra prompt injection (`<opportunity_data>`, `<user_note>`) + filtrado de `evidenceIds` inventados en `aiContract.ts`.
- **Investigación vigente de `@grpc/grpc-js` (`npm audit --omit=dev`):**
  - `firebase@13.3.0` (última versión publicada comprobada con `npm view`) depende de `@firebase/firestore@4.20.0`, el cual fija `"@grpc/grpc-js": "~1.9.0"` (instalada `1.9.16`).
  - Aunque `@grpc/grpc-js@1.14.7` ya está publicada en npm, no es resoluble por rango semver bajo `@firebase/firestore@4.20.0`; `npm audit fix --force` degradaría a `firebase@9.14.0` eliminando `firebase/ai`.
  - Los 4 avisos altos (`GHSA-m9gg-hp2v-232j` CVSS 7.4 y `GHSA-f596-whhp-79r4` CVSS 3.7, propagados por `@firebase/firestore` y `@firebase/firestore-compat`) corresponden a código gRPC Node no importado ni empaquetado en `dist/assets/*.js` (`grpcHits: 0`). Riesgo de ejecución en cliente: nulo; estado del lockfile: pendiente de actualización upstream del SDK de Firebase.

---

## 7. Resultados de verificaciones automatizadas

*(Ejecutadas sobre la versión final completa — detalles en [TESTING_EVIDENCE.md](TESTING_EVIDENCE.md)):*

- `npm run typecheck` (`tsc --noEmit`): **correcto (`exit 0`)**.
- `npm run lint` (`eslint .`): **correcto (`exit 0`)**.
- `npm run test` (`vitest run`): **10 archivos de prueba, 46 pruebas aprobadas (`0` fallidas)**.
- `npm run build` (`tsc -b && vite build`): **correcto (`PWA v1.3.0`, 18 entradas en caché, `dist/sw.js` generado)**.
- `npx playwright test --reporter=list`: **21 pruebas aprobadas (`0` fallidas, `0` omitidas)** en Chrome (`5` auditorías Axe WCAG 2.2 AA con `0` violaciones, `8` anchos `320px`–`1440px`, zoom 200 %, `0` solapamiento del onboarding tour sobre CTAs del hero en desktop y móvil en primera visita y recarga, colisiones interactivas en las 5 rutas, PWA offline `/route`, modo sin credenciales en `dist-e2e.local` y conmutador deslizante `ES / EN`).
- **Inspección visual directa sobre servidor `npm run start` (8 capturas regeneradas en `artifacts.local/`):** `ux-home-desktop.png`, `ux-home-mobile.png`, `ux-lang-switch.png`, `ux-detail-desktop.png`, `ux-selfcheck.png`, `ux-ai-panel.png`, `ux-my-route.png` y `ux-settings-desktop.png` verificadas sin solapamiento (`overlaps: []` en `1280x800`, `390x844` y `360x800`), sin IDs internos crudos ni recortes de cabecera fija.
- `npm audit --omit=dev`: **4 avisos altos** únicamente por la cadena transitiva `firebase -> @firebase/firestore -> @grpc/grpc-js@1.9.16`.

---

## 8. Últimas acciones recomendadas al propietario

1. **Si deseas probar `ON_DEVICE` real con Gemini Nano:** sigue [GEMINI_NANO_SETUP.md](GEMINI_NANO_SETUP.md) en un PC Chrome Desktop `>= 139` con GPU/disco elegibles.
2. **Cuando autorices publicar la nueva UI:** revisa `git status` / `git diff`, ejecuta `npm run build` y `npx firebase-tools deploy --only hosting --project umbral-21e8b`, verifica `https://umbral-21e8b.web.app/settings` y realiza 1 consulta real `IN_CLOUD` (`State D`).
3. **Antes de entregar en Devpost (límite 30 nov 2026, 17:00 PET):** realiza tu commit intencional en `umbral-hybrid-ai`, graba el video en inglés siguiendo [FINAL_DEMO_SCRIPT.md](FINAL_DEMO_SCRIPT.md) y envía usando [DEVPOST_SUBMISSION.md](DEVPOST_SUBMISSION.md).
