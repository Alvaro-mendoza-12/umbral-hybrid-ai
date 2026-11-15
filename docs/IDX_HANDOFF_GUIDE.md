# Guía de Continuación y Handoff para Project IDX (Firebase Studio) — UMBRAL Hybrid AI

Esta guía resume el estado actual del proyecto **UMBRAL Hybrid AI** (`feat/hybrid-ai-web`) y detalla exactamente **qué ya está implementado**, **qué falta por completar en Project IDX / Firebase Studio** y el **prompt listo para copiar y pegar** al iniciar la sesión con el asistente de IDX.

---

## 1. Reglas Críticas de Aislamiento y Seguridad

Antes de tocar cualquier archivo o ejecutar comandos en IDX:

1. **Repositorio y rama exclusivos**:
   - Repositorio activo: `Alvaro-mendoza-12/umbral-hybrid-ai` (directorio local Windows de origen: `D:\umbral-hybrid-ai`).
   - Rama activa: `feat/hybrid-ai-web`.
2. **Prohibido modificar el proyecto previo**:
   - **Nunca** modifiques `Alvaro-mendoza-12/Umbral` ni su despliegue anterior en Vercel (`https://umbral-seven-khaki.vercel.app`), perteneciente a Kiroween 2026.
3. **No reconstruir la arquitectura existente**:
   - Mantén intacta la arquitectura `ports` / `adapters`, los componentes ya probados y los **42 tests unitarios de Vitest** junto con los **20 tests E2E de Playwright**.
4. **Cero secretos en Git ni en documentación**:
   - `.gitignore` ya excluye `.env`, `.env.local`, `.env.*.local`, `*.local`, `.firebase/` y `.firebaserc`.
   - **Nunca** escribas claves API, contenidos completos de `.env.local` ni UUIDs de debug tokens de App Check en archivos rastreados por Git, código fuente o documentación.
5. **Autorización explícita para cambios externos y costos**:
   - No ejecutes `git push`, `firebase deploy` ni habilites facturación sin confirmación explícita del usuario.

---

## 2. Estado Actual: Qué YA Está Hecho y Verificado

### 2.1. Proyecto Firebase (`umbral-21e8b`) en Firebase Console

- **Proyecto configurado**: `umbral-21e8b`
- **Dominio Auth / Hosting**: `umbral-21e8b.firebaseapp.com`
- **Storage Bucket**: `umbral-21e8b.firebasestorage.app`
- **Messaging Sender ID**: `2458204140`
- **Web App ("Umbral") registrada**: `1:2458204140:web:3ee64e487472f3c97b32c9`
- **Gemini Developer API**: habilitada.
- **Firebase AI Logic**: protección básica de App Check aplicada (sin proveedor de certificación de producción todavía).
- **reCAPTCHA Enterprise**: aún **no** configurado en consola (`VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` vacío).

### 2.2. Código e Integración Local Verificados

1. **Inicialización de Firebase, App Check y Firebase AI Logic (`src/adapters/firebase/firebaseApp.ts`)**:
   - Inicializa la app web mediante `initializeApp()`.
   - Instancia Firebase AI Logic con `getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true })`.
   - Separa estrictamente desarrollo local de producción:
     - En desarrollo (`!import.meta.env.PROD && publicConfig.debugToken`), asigna `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` e inicializa App Check con `CustomProvider` antes de `getAI()`.
     - En producción (`import.meta.env.PROD`), usa únicamente `ReCaptchaEnterpriseProvider` cuando existe `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`.
   - Se verificó en el bundle de producción (`npm run build`) que la rama de depuración queda eliminada (`customProviderHits=0`, `debugAssignHits=0`, `envInDist=0`).

2. **Adaptador de IA Híbrida y Orquestador**:
   - `src/adapters/firebase/hybridAiAdapter.ts`: sondeo de capacidades, inicialización de modelo en dispositivo (`initializeDeviceModel`), generación estructurada (`generateContent`), flujo con `useLimitedUseAppCheckTokens` y mapeo de errores (`mapAdapterError`).
   - `src/services/aiOrchestrator.ts`: enrutamiento entre los 4 modos de ejecución y puerta de consentimiento explícito antes de usar nube.

3. **Diagnóstico UI Honesto (Estados A–E y Readiness Pill)**:
   - `src/features/settings/SettingsPage.tsx`: pantalla `/settings` con diagnóstico detallado (`Configured (umbral-21e8b)`, `appCheckMode`, `cloudModelId`) y máquina de estados `STATE_A`–`STATE_E`. En servidor de desarrollo local (`vite dev`) ya muestra `Local debug token mode (non-production)` y `State C · App Check initialized`.
   - `src/components/HybridReadinessPill.tsx`: badge de cabecera que distingue de forma honesta `appCheckPendingPill` (`Firebase configured · App Check pending`), `cloudConfiguredPill` (`Firebase configured · Cloud untested`), `cloudPill` (`Firebase Cloud AI ready`), `localPill`, `downloadPill` y `setupPill`.

4. **Funcionalidad Core, Catálogo y PWA**:
   - Catálogo de 20 oportunidades (con las 4 oportunidades `review_required` preservadas honestamente: `pe-promigas-billing`, `pe-xylem-electromechanical`, `co-aws-intern`, `es-cybersecurity-94`).
   - Matcher determinista de 4 estados y módulo offline PWA Mi Ruta.

5. **Batería de Pruebas y Compilación Baseline Verificada**:
   - `npm run typecheck`: OK (`0` errores)
   - `npm run lint`: OK (`0` errores)
   - `npm run test`: **42 tests** en verde en **9 archivos** (Vitest)
   - `npm run build`: OK (bundle generado con PWA)
   - `npx playwright test --reporter=list`: **20 tests** E2E en verde

6. **Comportamiento Esperado Observado Antes del Handoff**:
   - En prueba local viva con `vite dev`, el SDK emite automáticamente en la consola del navegador un UUID (36 caracteres) como debug token de App Check y `/settings` muestra `State C · App Check initialized` + pill `Firebase configured · Cloud untested`.
   - El endpoint `:exchangeDebugToken` devuelve HTTP `403` **únicamente** porque falta registrar ese UUID en Firebase Console.

---

## 3. Qué FALTA por Hacer en Project IDX (Paso a Paso)

Ejecuta estas tareas en orden dentro de IDX:

### Tarea 1 — Verificar o recrear `.env.local` en el workspace de IDX

En la máquina Windows original existe `.env.local` (ignorado por Git). Si abres el repositorio en IDX desde un clon limpio, `.env.local` no existirá.

1. Comprueba si `.env.local` existe; si falta, créalo copiando `.env.example`.
2. Obtén la configuración oficial de la Web App registrada en `umbral-21e8b` mediante Firebase CLI (sin hardcodear claves en el repo):
   ```bash
   npx firebase-tools apps:sdkconfig WEB 1:2458204140:web:3ee64e487472f3c97b32c9 --project umbral-21e8b
   ```
3. Completa las variables `VITE_FIREBASE_*` en `.env.local` y confirma también:
   - `VITE_FIREBASE_AI_CLOUD_MODEL=gemini-3.5-flash-lite`
   - `VITE_APP_CHECK_DEBUG_TOKEN=true` (solo para pruebas de desarrollo locales; debe vaciarse antes del build de producción)
   - `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=` (vacío hasta completar la Tarea 5)
4. Verifica que Git ignore el archivo:
   ```bash
   git check-ignore -v .env.local
   ```

### Tarea 2 — Blindar `VITE_APP_CHECK_DEBUG_TOKEN` en `src/adapters/firebase/firebaseStatus.ts`

Aunque `src/adapters/firebase/firebaseApp.ts` ya bloquea el modo debug en producción mediante `!import.meta.env.PROD`, durante la revisión del bundle compilado se detectó que `src/adapters/firebase/firebaseStatus.ts` (líneas **38** y **75**, en `getFirebaseRuntimeStatus()` y `readFirebasePublicConfig()`) lee `import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN` sin comprobar `import.meta.env.PROD`, permitiendo que el string `"true"` aparezca en el objeto de configuración pública si la variable está presente al compilar.

- **Cambio exacto requerido**: Envolver la lectura de `VITE_APP_CHECK_DEBUG_TOKEN` en ambas líneas (`38` y `75`) con:
  ```ts
  import.meta.env.PROD ? '' : cleanEnvValue(import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN)
  ```
- Verifica después con `npm run typecheck`, `npm run lint` y `npm run test`.

### Tarea 3 — Registrar el Debug Token de App Check y validar `:exchangeDebugToken` (`200`)

1. Inicia el servidor de desarrollo (`npm run dev`) y abre `/settings` en la preview de IDX / navegador.
2. Abre DevTools → Console y localiza el UUID de depuración de App Check generado automáticamente por el SDK (`self.FIREBASE_APPCHECK_DEBUG_TOKEN = true`).
3. En **Firebase Console → Proyecto `umbral-21e8b` → Security → App Check → Apps → Umbral → Manage debug tokens**, agrega ese UUID con un nombre identificable (por ejemplo, `IDX Dev`). **No guardes ese UUID en ningún archivo del repositorio.**
4. Recarga `/settings` y verifica en Network que la petición a `:exchangeDebugToken` responda **HTTP `200`** (en lugar de `403`).

### Tarea 4 — Ejecutar la primera prueba real `IN_CLOUD` hasta alcanzar `State D`

1. Con `:exchangeDebugToken` devolviendo `200`, habilita el consentimiento explícito para modo nube y dispara una solicitud real (`IN_CLOUD`) mediante `aiOrchestrator.ts` / `hybridAiAdapter.ts` (`generateContent`) contra `gemini-3.5-flash-lite`.
2. Confirma que:
   - La respuesta de Gemini Cloud se renderiza correctamente en la aplicación.
   - En `/settings`, el diagnóstico transiciona de `State C · App Check initialized` a **`State D`**.
   - El badge `HybridReadinessPill.tsx` pasa de `Firebase configured · Cloud untested` a **`Firebase Cloud AI ready`**.

### Tarea 5 — Configurar `reCAPTCHA Enterprise` para Producción y Dominios de IDX / Hosting

1. En **Google Cloud Console / Firebase Console** del proyecto `umbral-21e8b`, crea una clave web **score-based** de **reCAPTCHA Enterprise**.
2. Añade a la lista blanca de dominios permitidos de esa clave:
   - `umbral-21e8b.web.app`
   - `umbral-21e8b.firebaseapp.com`
   - Si vas a probar un build de producción desde la preview de Project IDX, incluye también el dominio de Cloud Workstations correspondiente.
3. En **Firebase Console → App Check → Apps → Umbral**, registra el proveedor **reCAPTCHA Enterprise** con esa Site Key (la configuración del SDK en `firebaseApp.ts` ya usa `ReCaptchaEnterpriseProvider` y `useLimitedUseAppCheckTokens: true`).
4. Actualiza `.env.local` para preparar producción:
   - Coloca la Site Key pública en `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`.
   - **Vacía o elimina `VITE_APP_CHECK_DEBUG_TOKEN`** antes de compilar producción.

### Tarea 6 — Verificación Final, Build de Producción y Despliegue a Firebase Hosting

1. Ejecuta la batería completa tras los últimos cambios y confirma 100% en verde:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   npx playwright test --reporter=list
   ```
2. Confirma que en `dist/` no exista ninguna referencia residual al token de depuración ni `.env.local` rastreado en Git (`git status --short`).
3. Revisa `firebase.json` y, **solo tras obtener confirmación del usuario**, ejecuta el despliegue:
   ```bash
   npx firebase-tools deploy --only hosting --project umbral-21e8b
   ```
4. En la URL publicada (`https://umbral-21e8b.web.app`), valida que App Check con `ReCaptchaEnterpriseProvider` autentique correctamente contra Firebase AI Logic y Gemini Cloud (`State D` / `Firebase Cloud AI ready`) sin errores `403`.

---

## 4. Prompt Listo para Copiar y Pegar en Project IDX

Copia este prompt y pégalo directamente en el asistente de IA de Project IDX / Firebase Studio al abrir el proyecto:

```text
Lee primero `docs/IDX_HANDOFF_GUIDE.md` completo antes de proponer o editar código.

Contexto estricto:
- Trabaja exclusivamente en este repositorio (`Alvaro-mendoza-12/umbral-hybrid-ai`) y en la rama `feat/hybrid-ai-web`.
- Prohibido modificar o desplegar sobre el repositorio previo `Alvaro-mendoza-12/Umbral` o su despliegue en Vercel.
- No reconstruyas la arquitectura existente ni elimines pruebas; conserva todos los tests actuales (42 Vitest + 20 Playwright).
- Nunca escribas API keys, contenidos completos de `.env.local` ni debug tokens UUID de App Check en archivos rastreados por Git o en documentación.
- No hagas `git push`, `firebase deploy` ni habilites facturación sin pedirme confirmación explícita primero.

Tu plan inmediato de trabajo es:
1. Verificar si existe `.env.local`; si falta, crearlo a partir de `.env.example` usando `npx firebase-tools apps:sdkconfig WEB 1:2458204140:web:3ee64e487472f3c97b32c9 --project umbral-21e8b`, `VITE_FIREBASE_AI_CLOUD_MODEL=gemini-3.5-flash-lite` y `VITE_APP_CHECK_DEBUG_TOKEN=true` solo para dev, verificando `git check-ignore -v .env.local`.
2. En `src/adapters/firebase/firebaseStatus.ts` (líneas 38 y 75), endurecer la lectura de `VITE_APP_CHECK_DEBUG_TOKEN` con `import.meta.env.PROD ? '' : cleanEnvValue(...)` y validar con `typecheck`, `lint` y `test`.
3. Guiarme para registrar en Firebase Console (proyecto `umbral-21e8b` → App Check → Apps → Umbral → Manage debug tokens) el UUID de depuración emitido en consola al abrir `/settings`, confirmar `:exchangeDebugToken` con HTTP 200 y ejecutar una prueba real `IN_CLOUD` hasta ver `State D` y el pill `Firebase Cloud AI ready`.
4. Guiarme para configurar `reCAPTCHA Enterprise` (score-based web key con los dominios de Firebase Hosting y preview de Cloud Workstations), actualizar `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`, limpiar `VITE_APP_CHECK_DEBUG_TOKEN`, ejecutar toda la suite (`typecheck`, `lint`, `test`, `build`, `playwright test`) y esperar mi confirmación antes de ejecutar `firebase deploy --only hosting`.

Empieza inspeccionando si `.env.local` existe y revisando `src/adapters/firebase/firebaseStatus.ts` alrededor de las líneas 38 y 75.
```
