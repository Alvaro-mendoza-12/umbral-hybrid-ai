# Auditoría Heurística UX, Accesibilidad (WCAG 2.2 AA) y Carga Cognitiva: UMBRAL

**Base de evaluación:** Inspección directa del código fuente (`src/`), capturas reales en `D:\umbral-hybrid-ai\artifacts.local/` y aplicación sistemática de las **10 Heurísticas de Usabilidad de Jakob Nielsen**, **WCAG 2.2 AA**, **ISO 9241-210** (Diseño Centrado en las Personas), **Ley de Hick**, **Ley de Fitts**, **Divulgación Progresiva** y las **Vercel Web Interface Guidelines** (`web-design-guidelines`).

---

## 1. Resumen ejecutivo de evaluación por marco normativo

| Marco / Principio | Estado actual observado | Diagnóstico principal |
| --- | --- | --- |
| **1. Visibilidad del estado del sistema** | `Parcial` | Los estados técnicos (App Check, Gemini Nano `"unavailable"`, contador de ruta `1/1`, `2/3`) son visibles, pero faltan indicadores útiles para el usuario humano: urgencia real del plazo en tarjetas y % / proporción de compatibilidad en el catálogo. |
| **2. Coincidencia sistema–mundo real** | `Deficiente en vistas clave` | `SettingsPage.tsx` y `HybridAIPanel.tsx` hablan idioma de ingeniero (*«Preferir en dispositivo»*, *«App Check»*, *«Formato v2»*, *«Preferencia de inferencia híbrida»*) en lugar de lenguaje humano (*«Privado en tu navegador»*, *«Modo con internet»*). |
| **3. Control y libertad del usuario** | `Aceptable con fricciones` | Existen «Deshacer» al quitar guardados, «Omitir» en tour, botón «Cancelar» durante inferencia y «Limpiar perfil». Falla cuando el tour aparece encima del contenido en el primer pantallazo o cuando los 6 campos del perfil ocupan espacio aunque no se quieran usar. |
| **4. Consistencia y estándares** | `Deficiente en jerarquía` | Se mezcla diseño editorial con tarjetas SaaS uniformes; además, en `OpportunityDetailPage` la etiqueta de origen oficial varía y los mismos requisitos cambian de estilo 3 veces en la misma pantalla. |
| **5. Prevención de errores** | `Sólida en lógica, débil en UI` | La lógica previene muy bien falsos positivos (`matcher.ts`), URLs inseguras (`catalogRules.ts`) y envío sin consentimiento (`aiOrchestrator.ts`). Sin embargo, en `ExplorePage`, el checkbox «Incluir cerradas o por reverificar (6)» permite entrar a fichas vencidas sin avisar visualmente con antelación qué filtro causó su aparición. |
| **6. Reconocimiento frente a recuerdo** | `Deficiente en catálogo y ficha` | En `/` (`ExplorePage`), las tarjetas no muestran qué tan compatible es la oferta con tu perfil guardado; debes abrir cada ficha y recordar qué respondiste. |
| **7. Flexibilidad y eficiencia de uso** | `Deficiente` | Faltan atajos de intención («Becas vigentes», «Para Perú», «Solo online») y los filtros en `ExplorePage` no se sincronizan en la URL (`searchParams`), perdiendo el estado si el usuario abre un enlace o vuelve atrás desde un marcador. |
| **8. Diseño estético y minimalista** | `Crítico (Principal fallo)` | Exceso simultáneo de bloques, triple duplicación de requisitos, panel de IA de 744 líneas y formulario completo incrustado en medio de la ficha. Todo compite al mismo nivel visual. |
| **9. Ayuda a reconocer, diagnosticar y recuperar errores** | `Parcial / Técnico` | Los mensajes de error están bien tipados en `ai.errors.*`, pero varios conservan texto de sistema en inglés (*«LanguageModel API exists, but the local Gemini Nano model is unavailable...»* visto literalmente en `ux-settings-desktop.png` en modo español). |
| **10. Ayuda y documentación** | `Sobrecargada en entrada` | El product tour de 4 pasos aparece automáticamente en la primera visita y se suma a 3 tarjetas estáticas de «1 / 2 / 3» dentro del hero, explicando lo que una interfaz bien diseñada debería comunicar por sí sola. |
| **WCAG 2.2 AA & Reflow** | `Bien cubierto técnicamente` | Contraste, skip link, `aria-live`, Axe (0 violaciones verificadas) y reflow `320px`/`640px` pasan. **Brecha UX:** las media queries de `<640px` en `layout.css:876-880` redujeron botones `.hero-actions .btn` a `min-height: 36px` (debajo de los **44 px** recomendados en diseño táctil WCAG/Fitts). |
| **Ley de Hick & Carga Cognitiva** | `Vulnerado` | `ExplorePage` presenta 3 botones hero + 5 selects + search + checkbox = 10 controles de decisión antes del primer resultado. `HybridAIPanel` presenta ~10 áreas funcionales en paralelo. |

---

## 2. Inventario concreto de los 14 problemas detectados en Umbral

### Problema H-01 · Cero oportunidades visibles «above the fold» en `/`
- **Dónde ocurre:** `src/features/explore/ExplorePage.tsx:118-437`; capturas `ux-home-desktop.png` y `ux-home-mobile.png`.
- **Usuario afectado:** Todo visitante en primera entrada (especialmente en laptop `1280x800` y móvil `390x844`).
- **Por qué es problema:** Viola el **principio de eficiencia de descubrimiento** y desperdicia la zona más valiosa de la pantalla en auto-explicaciones (`.hero-surface` + `.steps-overview-grid` + 5 filtros en `.finder-grid`). En desktop, el primer resultado queda fuera del viewport; en móvil, requiere más de 2 pantallas de desplazamiento.
- **Consecuencia:** El usuario percibe una página estática burocrática en lugar de un buscador vivo con convocatorias reales. Aumenta el rebote inmediato.
- **Cómo resolverlo:** Compactar el hero a un encabezado de 1–2 líneas + barra de búsqueda con 2 filtros esenciales (Categoría como chips visuales con icono + País) y popover `+ Filtros`. Eliminar `.steps-overview-grid` de la portada (la UI misma lo demuestra en acción) para mostrar **2–3 tarjetas reales visibles desde el primer segundo**.
- **Prioridad:** `P0 · Crítica`

### Problema H-02 · Triple duplicación de los requisitos dentro de la ficha
- **Dónde ocurre:** `src/features/detail/OpportunityDetailPage.tsx:320-344`, `src/features/detail/SelfCheckPanel.tsx:295-338` y `src/features/detail/HybridAIPanel.tsx:492-510`.
- **Usuario afectado:** Cualquier persona revisando una convocatoria para saber si califica.
- **Por qué es problema:** Viola la **Heurística #8 (Minimalismo)** y dispara la **Carga Cognitiva (Sweller)**: la misma persona lee los mismos 4–6 requisitos como lista plana (`<ul>`), vuelve a leerlos abajo en tarjetas de autocomprobación (`<li className="match-item-row">`) y, si pide explicación IA, los lee por tercera vez en `groundedRequirements`.
- **Consecuencia:** La ficha parece un documento interminable; genera fatiga visual y confunde al usuario sobre dónde mirar para tomar su decisión.
- **Cómo resolverlo:** **Unificar «Requisitos publicados» + `SelfCheckPanel` en una única sección maestra: «Requisitos y tu compatibilidad»**. Cada requisito vive en un solo renglón enriquecido con su estado (`Coincide` / `No coincide` / `Por confirmar` / `Falta dato`) y un enlace/botón inline `"Explicar con IA"` que consulta únicamente si el usuario tiene duda sobre esa línea.
- **Prioridad:** `P0 · Crítica`

### Problema H-03 · Formulario de 6 campos permanentemente abierto en medio de la lectura
- **Dónde ocurre:** `src/features/detail/SelfCheckPanel.tsx:106-251` y captura `ux-selfcheck.png`.
- **Usuario afectado:** Usuarios que abren varias fichas o usuarios móviles (`360px`–`390px`).
- **Por qué es problema:** Viola **Divulgación Progresiva** y **Reconocimiento vs. Recuerdo**. Aunque `profile` ya se guarda globalmente en `localStorage`, el componente renderiza siempre los 6 inputs desplegados (~280px de altura en desktop, ~520px en móvil) antes del marcador `.match-scoreboard`.
- **Consecuencia:** Empuja los resultados reales del semáforo hacia abajo y obliga a hacer scroll innecesario cada vez que se visita una nueva oportunidad.
- **Cómo resolverlo:** Colapsar el perfil por defecto en una **barra resumen compacta** (*«Comparando con tu perfil: Perú · Técnico · Inglés · 4/6 datos [Editar perfil]»*) cuando ya tenga datos o como panel expandible inline (`<details>` o Drawer) con cálculo instantáneo justo encima de los requisitos.
- **Prioridad:** `P0 · Crítica`

### Problema H-04 · Sobrecarga técnica y extensión excesiva del Panel de IA (`HybridAIPanel`)
- **Dónde ocurre:** `src/features/detail/HybridAIPanel.tsx` (744 líneas; específicamente líneas `209-276`, `383-429`, `596-740`) y captura `ux-ai-panel.png`.
- **Usuario afectado:** Usuarios no técnicos que solo necesitan aclarar una duda o preparar su siguiente paso.
- **Por qué es problema:** Viola la **Ley de Hick**, la **Heurística #2 (Mundo real)** y la **Heurística #8**. En la captura `ux-ai-panel.png`, antes de haber obtenido una sola respuesta útil, el usuario ve: badge de consentimiento, 2 tarjetas técnicas de hardware, dropdown de 4 modos (`PREFER_ON_DEVICE`, etc.), campo libre, 2 botones primarios/secundarios, línea divisoria, segundo encabezado, badge `startChat`, desplegable de 19 oportunidades para comparar, textarea y botón enviar.
- **Consecuencia:** Intimidación cognitiva (*«no entiendo qué debo elegir»*), competencia visual directa con la ficha y scroll vertical desmesurado en móvil (`< 920px`).
- **Cómo resolverlo:** Rediseñar `HybridAIPanel` como **Copiloto Contextual Compacto**: (1) fila única de estado de privacidad (*«Privado en este equipo»* o *«Nube con permiso»* + enlace sutil *«Cambiar»*); (2) **4 chips de acción rápida centrados en la tarea** (*«¿Qué significa un requisito?»*, *«Documentos necesarios»*, *«Primeros 3 pasos»*, *«Comparar con otra»*); (3) salida concisa enfocada en dudas que NO repita literalmente el título ni los bullets ya visibles; y (4) relegar el selector técnico de 4 modos al modal/página de Ajustes.
- **Prioridad:** `P0 · Crítica`

### Problema H-05 · Homogeneidad visual total entre tarjetas y oportunidades
- **Dónde ocurre:** `src/features/explore/ExplorePage.tsx:471-583`, `src/styles/tokens.css:1-70` y `src/styles/layout.css:679-720`.
- **Usuario afectado:** Usuarios que escanean el listado en búsqueda rápida (`ExplorePage`).
- **Por qué es problema:** Viola **Reconocimiento vs. Recuerdo** y la guía **`frontend-design`**. Todas las tarjetas usan exactamente el mismo contenedor blanco uniforme (`.surface-card`), mismo radio (`16px`), mismas pills grises indistinguibles para categoría y modalidad (`ExplorePage.tsx:485-490`), y carecen de identidad visual por tipo de oportunidad, urgencia del plazo o progreso de compatibilidad.
- **Consecuencia:** La vista se siente plana y difícil de escanear en diagonal; encontrar una beca frente a un empleo obliga a leer texto denso párrafo por párrafo.
- **Cómo resolverlo:** Asignar **identificador cromático + icono propio por categoría**, chip de **urgencia real** (*«Quedan 16 días»* / *«Sin fecha límite»*), **cifra/beneficio destacado en primer plano**, y un **mini-indicador de compatibilidad previa** (`Cumples 2 de 4`) cuando el perfil ya tenga al menos 1 dato guardado.
- **Prioridad:** `P1 · Alta`

### Problema H-06 · Exceso de texto y jerga de desarrollador en `/settings` y mensajes de estado
- **Dónde ocurre:** `src/features/settings/SettingsPage.tsx:49-180`, `src/locales/es/translation.json` y captura `ux-settings-desktop.png`.
- **Usuario afectado:** Todo usuario no programador en escritorio o móvil.
- **Por qué es problema:** Viola **Heurística #2 (Coincidencia con el mundo real)** y **ISO 9241-210**. En `ux-settings-desktop.png` se muestran tarjetas con textos técnicos como `Chrome Prompt API (window.LanguageModel)`, `Configurado (umbral-21e8b)`, `Modo token de depuración local`, `Estado C · App Check inicializado — pendiente de primera solicitud real exitosa a Gemini Cloud`, e incluso un mensaje en inglés crudo bajo interfaz en español (`"LanguageModel API exists, but the local Gemini Nano model is unavailable on this hardware/disk configuration."`).
- **Consecuencia:** Destruye la sensación de producto terminado, genera desconfianza (*«¿esto está en pruebas?»*) y mezcla idiomas en pantalla.
- **Cómo resolverlo:** Separar `/settings` en **Preferencias del usuario** (Idioma, Nivel de privacidad IA en lenguaje humano y Borrado de datos) y un acordeón colapsado por defecto **«Detalles técnicos y diagnóstico del sistema»** (localizado al 100 % en ES/EN) para auditores, jueces del hackathon y soporte.
- **Prioridad:** `P1 · Alta`

### Problema H-07 · Navegación fragmentada y pérdida de estado de filtros en URL
- **Dónde ocurre:** `src/features/explore/ExplorePage.tsx:59`, `src/app/Shell.tsx:61-98` y regla **Navigation & State** de `web-design-guidelines`.
- **Usuario afectado:** Usuarios que abren una ficha, regresan con «Atrás» del navegador, o desean compartir un filtro de búsqueda por WhatsApp/correo.
- **Por qué es problema:** Viola **Heurística #7 (Flexibilidad y eficiencia)** y la norma de **URL refleja estado** (`web-design-guidelines`). En `ExplorePage.tsx:59`, `const [filters, setFilters] = useState<CatalogFilters>(INITIAL_FILTERS)` vive solo en memoria de componente: al navegar a `/opportunities/:id` y volver atrás con el enlace «Volver a Explorar» (`<Link to="/">`), **todos los filtros escritos se borran a cero**.
- **Consecuencia:** Frustración enorme al explorar 3 o 4 convocatorias de Perú o becas seguidas: obliga a reescribir la búsqueda o seleccionar país y categoría en cada regreso.
- **Cómo resolverlo:** Sincronizar `filters` con `useSearchParams()` de React Router (`/?q=...&country=PE&cat=education`) para que **Atrás**, recarga y enlaces compartidos conserven el contexto exacto.
- **Prioridad:** `P0 · Crítica`

### Problema H-08 · Flujo de 5 filtros simultáneos que empuja la vista y rompe la Ley de Hick
- **Dónde ocurre:** `src/features/explore/ExplorePage.tsx:276-389` y `src/styles/layout.css:653-669`.
- **Usuario afectado:** Usuarios móviles (`< 640px`, donde 5 selects se apilan en 5 filas de ~420px de alto) y usuarios nuevos en desktop.
- **Por qué es problema:** Viola **Ley de Hick**, **Ley de Fitts** y **Divulgación Progresiva**. Para filtrar rápido casi nadie usa en simultáneo 5 desplegables («País», «Categoría», «Modalidad», «Idioma», «Plazo»). Mostrarlos todos abiertos en móvil hunde los resultados media página más abajo.
- **Consecuencia:** En móvil se requiere recorrer un formulario largo antes de ver el catálogo.
- **Cómo resolverlo:** Mostrar en barra superior **solo Buscador + Píldoras rápidas de Categoría + País**; ocultar Modalidad, Idioma de fuente, Plazo e «Incluir cerradas» dentro de un botón/popover compacto **`+ Filtros`** con contador de filtros activos (`Filtros (2)`).
- **Prioridad:** `P1 · Alta`

### Problema H-09 · Asimetría rígida en la vista de detalle y degradación en pantallas medianas/móviles
- **Dónde ocurre:** `src/features/detail/OpportunityDetailPage.tsx:286-394`, `src/styles/layout.css:722-733`.
- **Usuario afectado:** Usuarios en tablet (`768px`–`919px`) y teléfonos (`320px`–`639px`).
- **Por qué es problema:** Hasta `919px`, `.detail-layout` apila secuencialmente: Cabecera -> Ficha verificable -> Autocomprobación completa -> Panel completo de IA (~2.800px+ de desplazamiento continuo). Incluso en desktop (`>= 920px`), `minmax(0, 1.35fr) minmax(0, 1fr)` deja el panel derecho con ~380px donde etiquetas pill largas, formularios y tarjetas de motores se ven comprimidos (`ux-ai-panel.png` muestra placeholders truncados en `#ai-focus-note`: *«Ej.: ¿Qué constancia conviene verificar antes de empez»*).
- **Consecuencia:** En móvil el usuario nunca descubre fácilmente el asistente de IA porque queda sepultado al fondo de una página kilométrica; en desktop los textos de input y tarjetas IA se ven apretados.
- **Cómo resolverlo:** En desktop, unificar Ficha + Autocomprobación en una columna principal limpia (`max-width: 72ch`) acompañada de un **Panel/Cajón lateral de Copiloto IA adherido (sticky)** más amplio; en móvil (`< 920px`), usar **pestañas claras (`Ficha y requisitos` | `Asistente IA`) o botón flotante inferior (`Preguntar a la IA`) que abre un Bottom Sheet**, más una barra fija con «Guardar» y «Ir al sitio oficial».
- **Prioridad:** `P1 · Alta`

### Problema H-10 · Redundancia visual y solapamiento conceptual entre `IntroSplash`, Hero 3-pasos y `OnboardingTour`
- **Dónde ocurre:** `src/app/IntroSplash.tsx`, `src/features/explore/ExplorePage.tsx:191-227` y `src/app/OnboardingTour.tsx`.
- **Usuario afectado:** Visitantes de primera vez.
- **Por qué es problema:** En su primera visita, el usuario pasa por: (1) animación inicial (`IntroSplash`), (2) tarjeta Hero con explicación de 3 pasos (`1. Filtra`, `2. Evalúa`, `3. Organiza Mi Ruta`), y (3) popover flotante `OnboardingTour` («Paso 1 de 4») encima de los filtros (`ux-home-desktop.png` muestra el popover cubriendo el 5.º filtro `Plazo`).
- **Consecuencia:** Sobreesfuerzo explicativo al llegar (*«demasiadas instrucciones antes de dejarme probar nada»*), tapa parcialmente el select `Plazo` en `1280x800` y refuerza la sensación de prototipo académico en lugar de producto intuitivo.
- **Cómo resolverlo:** Convertir la experiencia inicial en **auto-explicativa sin tutorial obligatorio por defecto**: retirar el disparo automático del popover `OnboardingTour` al cargar la página (dejarlo disponible bajo demanda al pulsar `Cómo funciona` o convertirlo en un banner sutil descartable de 1 línea en cabecera).
- **Prioridad:** `P1 · Alta`

### Problema H-11 · Objetivos táctiles reducidos a `< 44px` en el hero móvil
- **Dónde ocurre:** `src/styles/layout.css:876-880` (`@media (max-width: 639px) { .hero-actions .btn { min-height: 36px; padding: 5px 10px; ... } }`).
- **Usuario afectado:** Usuarios en teléfonos de pantalla pequeña o con dificultades motoras.
- **Por qué es problema:** Viola la **Ley de Fitts** y el estándar ergonómico adoptado por el propio proyecto (`>= 44x44 px` documentado en `UX_UI_DESIGN_SYSTEM.md` previo y superior a WCAG 2.5.8 Target Size `24px`, buscando comodidad real en pantalla táctil). Ese `36px` se introdujo como parche de emergencia para evitar colisión con `OnboardingTour`.
- **Consecuencia:** Menor comodidad táctil y botones comprimidos (`ux-home-mobile.png` muestra botones apilados en 2 filas densas).
- **Cómo resolverlo:** Al eliminar el popover flotante automático en la carga inicial (H-10) y compactar el copy del hero, devolver `.btn` en móvil a `min-height: 44px` limpio con jerarquía primaria/secundaria clara.
- **Prioridad:** `P2 · Media`

### Problema H-12 · Meta-objetivo redundante y controles repetitivos en `MyRoutePage`
- **Dónde ocurre:** `src/features/route/MyRoutePage.tsx:147-246` y captura `ux-my-route.png`.
- **Usuario afectado:** Usuarios que regresan a gestionar su postulación.
- **Por qué es problema:** En `ux-my-route.png`, cuando ya existe un objetivo activo, **se muestra el texto del objetivo duplicado dos veces seguidas**: una vez dentro de una barra verde (`.banner-good`) y exactamente debajo dentro del `<input>` editable (`route.goal.text`). Asimismo, cada paso muestra `<select>`, `<input type="date">` nativo con texto literal `dd/mm/aaaa`, dos flechas, lápiz y tacho de basura, generando densidad visual para solo 2 tareas.
- **Consecuencia:** La tarjeta de «Mi Ruta» parece un CRUD administrativo en vez de un planificador motivador y sereno.
- **Cómo resolverlo:** Si ya hay objetivo activo, mostrarlo en modo lectura limpio con un único botón `Editar` (que transforma el texto en input al pulsar). En los pasos, priorizar un **checkbox visual de completado + texto + etiqueta de oportunidad vinculada + fecha opcional discreta**, agrupando reordenar/editar/eliminar en acciones compactas accesibles.
- **Prioridad:** `P1 · Alta`

### Problema H-13 · Cumplimiento incompleto de micro-reglas tipográficas y de formularios (`Web Interface Guidelines`)
- **Dónde ocurre:** Múltiples vistas (`ExplorePage.tsx`, `HybridAIPanel.tsx`, `MyRoutePage.tsx`, locales `es/translation.json` y `en/translation.json`).
- **Usuario afectado:** Usuarios de lectores de pantalla, usuarios internacionales/móviles y calidad visual global.
- **Por qué es problema:** La auditoría contra `vercel-labs/web-interface-guidelines` revela puntos concretos mejorables:
  1. `text-wrap: balance` ausente en `h1`/`h2` largos (`ExplorePage.tsx:138`, `OpportunityDetailPage.tsx:218`) y títulos de tarjetas de oportunidad.
  2. Tokens de marca o siglas técnicas (`UMBRAL`, `ETH Zürich`, `AWS`, `Firebase`, `Gemini Nano`) sin `translate="no"`, vulnerables a traducción automática dañina del navegador.
  3. Placeholders usando tres puntos ASCII (`...`) en lugar de elipsis tipográfica (`…`) y algunos textos de estado sin `scroll-margin-top` en encabezados anclados (`.surface-card` tiene `scroll-margin-top`, pero los anclajes por id `#finder-heading`, `#self-check-heading` no todos).
  4. `HybridAIPanel` usa `<textarea>` sin `enterKeyHint` o atajo de teclado claro ni estado visible en el botón cuando espera consentimiento.
- **Consecuencia:** Menor pulido tipográfico, truncamiento brusco en titulos multilínea y degradación al usar Google Translate automático del navegador.
- **Cómo resolverlo:** Incorporar `text-wrap: balance`, `translate="no"` en nombres propios/modelos, normalizar tipografía de elipsis/comillas y completar `autocomplete="off"` + atributos semánticos en formularios no personales.
- **Prioridad:** `P2 · Media`

### Problema H-14 · Falta de «Estado de preparación» directo en el listado de Guardados
- **Dónde ocurre:** `src/features/route/MyRoutePage.tsx` (sección «Oportunidades guardadas») y `src/domain/types.ts`.
- **Usuario afectado:** Usuario que guarda 3 oportunidades para decidir a cuál postular esta semana.
- **Por qué es problema:** El usuario guarda convocatorias para compararlas y ejecutarlas, pero en «Oportunidades guardadas» (`ux-my-route.png`) la tarjeta solo muestra título, entidad, desplegable de estado (`Guardada`) y botón `Ver requisitos e IA`. No muestra fecha límite ni cuántos requisitos ya cumplió ni qué paso concreto falta para enviarla.
- **Consecuencia:** Obliga al usuario a volver a entrar a cada ficha (violando Reconocimiento vs. Recuerdo) para recordar qué urgía o qué le faltaba.
- **Cómo resolverlo:** Mostrar en cada tarjeta guardada en `/route` **fecha límite / días restantes + resumen de autocomprobación calculado con el perfil actual (`2 coincide · 1 por confirmar`)** y un CTA `Añadir paso` vinculado directo a esa oportunidad.
- **Prioridad:** `P1 · Alta`

---

## 3. Matriz de Priorización para el Rediseño

| Prioridad | IDs de Problema | Objetivo del cambio |
| --- | --- | --- |
| **P0 (Bloqueantes de comprensión y adopción)** | `H-01`, `H-02`, `H-03`, `H-04`, `H-07` | Mostrar convocatorias desde el primer pantallazo, eliminar la triple repetición de requisitos, colapsar el perfil a resumen editable, transformar el Panel IA en copiloto por preguntas rápidas y persistir filtros en la URL. |
| **P1 (Alto impacto en claridad y móvil)** | `H-05`, `H-06`, `H-08`, `H-09`, `H-10`, `H-12`, `H-14` | Diferenciar categorías visualmente, limpiar jerga técnica de `/settings`, reducir filtros visibles a 2+1 nivel, usar Bottom Sheet/Tabs en ficha móvil, eliminar tour intrusivo al entrar y enriquecer tarjetas en Mi Ruta. |
| **P2 (Pulido profesional y ergonomía fina)** | `H-11`, `H-13` | Restaurar botones `>= 44px` en móvil, `text-wrap: balance`, `translate="no"` en marcas/modelos y refinamientos tipográficos de `Web Interface Guidelines`. |
