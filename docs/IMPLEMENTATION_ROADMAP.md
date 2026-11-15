# Hoja de Ruta de Implementación para Orchestrator (Argon): UMBRAL

**Objetivo:** Permitir que **Orchestrator (Argon)** ejecute la transformación completa de producto y UX/UI en **4 fases secuenciales y verificables**, preservando al 100 % Firebase AI Logic (`umbral-21e8b`), App Check (`reCAPTCHA Enterprise`), Gemini Nano/Cloud, el catálogo curado, el motor determinista, el bilingüismo ES/EN y la cobertura de pruebas existente.

---

## 1. Principios técnicos de ejecución segura

1. **No romper los contratos de puertos y dominio (`src/ports/`, `src/domain/`, `src/services/`):** Toda la lógica crítica (`evaluateOpportunityFit`, `AIOrchestrator`, `FirebaseHybridAIAdapter`, `localRouteAdapter`) se conserva. Solo se añaden funciones puras ligeras (ej. cálculo de días restantes y resumen de encaje para tarjetas).
2. **Sincronización incremental con pruebas:** En cada fase, ejecutar `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` y `npx playwright test --reporter=list` actualizando únicamente los selectores/aserciones E2E afectados por el rediseño de UX.
3. **Preservación de secretos y hosting:** No tocar `.env.local`, `.env.development.local`, `firebase.json` (salvo si se añadiera una fuente local autohospedada dentro de `public/fonts/`, ya permitida por `font-src 'self'`), ni redesplegar sin autorización explícita.

---

## 2. Desglose por Fases, Prioridades y Complejidad

### Fase 1 · Rediseño del Descubrimiento (`/`), Filtros en URL y Tarjetas Diferenciadas
- **Prioridad:** `P0 · Crítica` (resuelve visibilidad «above the fold», pérdida de filtros y homogeneidad de tarjetas).
- **Complejidad estimada:** `Media` (2–3 iteraciones locales acotadas).
- **Dependencias:** Ninguna externa; consume `catalogRules.ts` y `matcher.ts` existentes.
- **Archivos a intervenir:**
  - `src/app/Shell.tsx` y `src/styles/layout.css`: simplificar el header a **Explorar · Mi Ruta · Ajustes**, mover privacidad dentro de Ajustes (manteniendo ruta `/privacy` compatible), ocultar la píldora técnica del header salvo offline o estado activo relevante, y restaurar `min-height: 44px` táctil en botones móviles.
  - `src/app/OnboardingTour.tsx` y `src/app/AppContext.tsx`: cambiar el tour de 4 pasos para que **no se dispare automáticamente en primera visita** (solo al pulsar «Cómo funciona» bajo demanda).
  - `src/domain/catalogRules.ts`: agregar función pura `getDeadlineCountdown(opportunity, now)` (devuelve días restantes / urgencia sin depender de IA) y helper para construir un badge breve de encaje con `evaluateOpportunityFit`.
  - `src/features/explore/ExplorePage.tsx`:
    - Reemplazar `.hero-surface` + `.steps-overview-grid` por cabecera compacta de 2 líneas + buscador + barra horizontal de **chips con icono y color por categoría** + selector rápido de País + popover **`+ Filtros`** (Modalidad, Idioma, Plazo, Incluir cerradas).
    - Sincronizar `filters` con `useSearchParams()` de `react-router-dom`.
    - Enriquecer cada tarjeta con color/ícono de categoría, urgencia de fecha (*«Quedan X días»*), beneficio destacado y mini-resumen determinista contra `profile` guardado.
- **Criterio de aceptación de Fase 1:**
  - En `1280x800`, al menos **2 tarjetas reales de oportunidad son visibles en el primer pantallazo sin hacer scroll**.
  - Al abrir una ficha y volver con botón Atrás o enlace «Volver a Explorar», **los filtros y búsqueda previos se conservan** mediante la URL.
  - Playwright verifica cero violaciones Axe y cero desbordes horizontales de `320px` a `1440px`.

---

### Fase 2 · Ficha Unificada de Decisión (`/opportunities/:id`) y Perfil Compacto
- **Prioridad:** `P0 · Crítica` (elimina la triple repetición de requisitos y el formulario intrusivo de 6 campos siempre abierto).
- **Complejidad estimada:** `Media`.
- **Dependencias:** Fase 1 (`useSearchParams` para enlace «Volver a Explorar» transparente y tokens de categoría).
- **Archivos a intervenir:**
  - `src/features/detail/OpportunityDetailPage.tsx` y `src/features/detail/SelfCheckPanel.tsx`:
    - Fusionar «Requisitos publicados» y la lista de autocomprobación de `SelfCheckPanel.tsx` en un único componente: **`UnifiedRequirementsCheck`**.
    - Colapsar el formulario de 6 campos de perfil en una **píldora editable** en la cabecera del bloque (*«Tu perfil: Perú · Técnico · EN · [Editar 4/6]»*); abrirlo automáticamente solo cuando el usuario pulsa editar (con cálculo reactivo instantáneo al cambiar cada dato).
    - Permitir filtrar visualmente los requisitos pulsando las 4 tarjetas del marcador (`Coincide`, `No coincide`, `Por confirmar`, `Falta dato`).
    - Convertir *«Cómo postular en el portal oficial»*, *«Condiciones e información no publicada»* y *«Fuentes oficiales y auditoría»* en **acordeones nativos accesibles (`<details>/<summary>`)** con el primero expandible en 1 clic.
    - En cada fila de requisito, incluir botón inline **`¿Qué significa?`** que comunica al Copiloto IA qué cláusula explicar.
- **Criterio de aceptación de Fase 2:**
  - Cada requisito aparece **una única vez** en toda la página (antes de consultar a la IA).
  - En móvil (`360x800`), los botones de acción principales (`Abrir sitio oficial`, `Guardar`, `Preguntar a IA`) permanecen accesibles en barra inferior fija sobre la navegación móvil.
  - Todas las pruebas de `matcher.test.ts` y flujos de autocomprobación en `appFlows.test.tsx` y `userFlows.spec.ts` siguen en verde.

---

### Fase 3 · Transformación del Asistente de IA (`HybridAIPanel`) en Copiloto Contextual
- **Prioridad:** `P0 · Crítica` (reduce drásticamente la intimidación visual y elimina texto repetitivo de las respuestas).
- **Complejidad estimada:** `Media`.
- **Dependencias:** Fase 2 (recepción de `focusedRequirement` desde las filas de requisitos).
- **Archivos a intervenir:**
  - `src/features/detail/HybridAIPanel.tsx`:
    - Reducir el encabezado a **1 píldora honesta y comprensible** (`Privado en tu dispositivo · Gemini Nano` o `En la nube con tu permiso · Gemini Cloud` + enlace discreto a preferencia).
    - Reemplazar la pila de controles por **4 acciones rápidas claras**: *«Explicar requisito»*, *«Documentos necesarios»*, *«Sugerir 3 pasos»* y *«Comparar con otra»* (mostrando prioritariamente oportunidades guardadas o de la misma categoría).
    - Mover el selector técnico de 4 modos (`PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`) fuera del panel principal hacia la sección de Configuración Avanzada en `/settings` (manteniendo en el panel un ajuste simple cuando sea necesario).
    - En móvil (`< 960px`), encapsular el Copiloto en un **Bottom Sheet / Drawer accesible** activado desde botón contextual y desde cualquier botón `¿Qué significa?` de los requisitos, con `overscroll-behavior: contain`, cierre con `Escape` y restauración de foco.
  - `src/domain/aiContract.ts` y `src/adapters/firebase/hybridAiAdapter.ts`:
    - Ajustar el texto del prompt estructurado (conservando estrictamente el JSON Schema y la validación anti-injection `<opportunity_data>`) para que el resumen IA **no repita textualmente el título ni liste de nuevo todos los requisitos sin aportar aclaración práctica**.
- **Criterio de aceptación de Fase 3:**
  - Ninguna llamada automática a Gemini Cloud sin consentimiento explícito del usuario.
  - La respuesta de `HybridAIPanel` sigue mostrando la etiqueta real de procedencia (`inferenceSource`: `ON_DEVICE`, `IN_CLOUD` o `UNVERIFIED`), citas `evidenceIds` validadas y botón de 1 clic para enviar acciones a *Mi Ruta*.
  - En desktop (`>= 960px`), el Copiloto se mantiene sticky sin estrechar los inputs por debajo de un ancho cómodo.

---

### Fase 4 · Sistema Visual «Cartografía Cívica», Simplificación de Mi Ruta y Ajustes/Privacidad
- **Prioridad:** `P1 · Alta`.
- **Complejidad estimada:** `Baja-Media`.
- **Dependencias:** Fases 1–3 estabilizadas.
- **Archivos a intervenir:**
  - `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/layout.css` y fuentes autohospedadas opcionales en `public/fonts/`:
    - Incorporar escala tipográfica editorial (`Newsreader`/`Fraunces` opcional local + `Plus Jakarta Sans`), paleta semántica de categorías (`Section 2.2` de `UX_UI_DESIGN_SYSTEM.md`), `text-wrap: balance` en títulos, eliminación de `transition: all`, y mejoras SVG ligeras de estados vacíos.
  - `src/features/route/MyRoutePage.tsx`:
    - Eliminar duplicación del objetivo activo (vista lectura + botón `Editar`).
    - Mostrar barra gráfica de progreso de pasos, días restantes y mini-estado de compatibilidad calculado en cada tarjeta guardada.
  - `src/features/settings/SettingsPage.tsx`:
    - Integrar arriba el resumen visual de **Tu Privacidad en Umbral** (antes disperso solo en `/privacy`).
    - Traducir al 100 % las cadenas residuales del diagnóstico local (eliminando texto crudo en inglés en modo ES) y encerrar el bloque de telemetría técnica (`State A-D`, `window.LanguageModel`, debug token, AI Audit Log) dentro de un `<details>` colapsado por defecto.
  - `src/data/opportunities.ts` *(opcional si cabe en alcance)*: agregar micro-guía verificada de requisitos habilitantes externos frecuentes (por ejemplo, trámites previos en Perú como Clasificación Socioeconómica SISFOH / Formato S100 o CUL del MTPE cuando una beca o empleo los exija, con enlace oficial a `gob.pe`).

---

## 3. Mapa de Dependencias y Riesgos Técnicos

| Riesgo técnico | Probabilidad | Impacto | Mitigación concreta para Argon |
| --- | --- | --- | --- |
| **Romper pruebas unitarias/integración existentes al fusionar `SelfCheckPanel` dentro de `OpportunityDetailPage`** | Media | Alto | Revisar primero `tests/integration/appFlows.test.tsx` y `tests/e2e/userFlows.spec.ts` para conservar atributos `aria-label` o `data-testid` semánticos donde sea coherente y actualizar aserciones solo en textos o controles movidos a popovers/acordeones. |
| **Violación de CSP al cargar tipografía web externa (`fonts.googleapis.com`)** | Alta si se usa CDN externo | Alto (bloqueo en navegador + fallo offline PWA) | **No usar CDN externo.** Si se añade tipografía editorial, empaquetar únicamente archivos `.woff2` locales en `public/fonts/` o `src/assets/` cubiertos por `font-src 'self'` y precacheados por Workbox PWA. |
| **Regresiones de solapamiento o foco al añadir Bottom Sheet móvil y Popover `+ Filtros`** | Media | Alto (fallo Axe / Playwright `a11yAndResponsive.spec.ts`) | Usar retorno de foco explícito al botón disparador al cerrar, `overscroll-behavior: contain`, `Escape` handler y probar en `320px`, `360px`, `390px`, `640px` zoom 200 % y `1280px`. |
| **Afectar límites de precache PWA o tamaño de bundle** | Baja | Medio | Mantener `firebase/ai` con importación dinámica (`hybridAiAdapter.ts`) y evitar librerías nuevas de animación/UI (usar Lucide + CSS nativo + SVG inline). |
| **Consumir cuota de Firebase Gemini Cloud durante pruebas** | Baja | Medio | Mantener la separación actual: Playwright E2E corre con `build:e2e` sin credenciales (`dist-e2e.local`), y la batería Vitest simula los adaptadores sin red. |

---

## 4. Orden exacto de ejecución recomendado para Argon

1. Ejecutar **Fase 1** (`ExplorePage` + `Shell` + `OnboardingTour` bajo demanda + URL `searchParams`) -> correr suite completa -> inspección visual en desktop y móvil.
2. Ejecutar **Fase 2** (Ficha unificada + Perfil colapsable + Acordeones) -> correr suite completa.
3. Ejecutar **Fase 3** (Copiloto IA contextual + Bottom Sheet móvil + Prompt conciso) -> correr suite completa.
4. Ejecutar **Fase 4** (Tokens tipográficos/categoría + `MyRoutePage` + `Settings/Privacy` unificado + Micro-guías) -> regenerar capturas en `artifacts.local/` -> verificación final completa (`typecheck`, `lint`, `test`, `build`, `playwright`).
