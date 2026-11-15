# Sistema de Diseño UX/UI: UMBRAL («Cartografía Cívica»)

**Propósito:** Dotar a UMBRAL de una identidad visual humana, luminosa, diferenciable y mobile-first que rompa el aspecto actual de «bloques SaaS grises uniformes» (`tokens.css` y `layout.css` vigentes), aplicando los principios de dirección autoral de `frontend-design` y las reglas prácticas de `web-design-guidelines`.

---

## 1. Dirección visual y referentes funcionales (sin copiar plantillas)

### Personalidad de marca: **«Claridad de Umbral» (Editorial Cívico Humano)**
UMBRAL no es un tablero financiero ni una app de redes sociales; es un **mapa confiable que aclara el camino antes de dar el paso**. Su estética combina:
- La **limpieza editorial y tipográfica** de servicios públicos de referencia mundial (*GOV.UK Design System* en jerarquía de requisitos y honestidad textual).
- La **diferenciación escaneable por códigos visuales** de buscadores curados modernos (*Roadmap.sh*, *Linear* en estados nítidos, *Stripe Docs* en divulgación progresiva sin saturar).
- La **calidez orgánica** heredada del verde umbral (`#0F4C3A`), enriquecida con papel marfil luminoso y acentos cromáticos estrictamente funcionales según categoría y fuente de inferencia.

### Lo que evitamos explícitamente (antipatrones del código actual)
- **Tarjetas clónicas (`SaaS-card kit`):** no todas las secciones deben llevar `border-radius: 16px` idéntico sobre `#F6F7F5`. Separamos claramente **bandas de contexto** (sin borde grueso, sobre lienzo), **tarjetas interactivas de oportunidad** (borde lateral + elevación al foco/hover) y **módulos de trabajo** (autocomprobación y checklist).
- **Eyebrows en mayúsculas repetidos en cada caja y guiones largos decorativos.**
- **Transiciones CSS genéricas `transition: all`** (sustituir por transiciones explícitas de `transform` y `opacity` únicamente).

---

## 2. Sistema cromático con propósito y contraste WCAG 2.2 AA verificado

### 2.1. Lienzos, superficies y tintas base

| Token propuesto | HEX | Uso funcional | Contraste mínimo requerido |
| --- | --- | --- | --- |
| `--bg-canvas` | `#F5F6F2` | Fondo papel piedra muy suave (fatiga visual baja) | — |
| `--bg-paper` | `#FFFFFF` | Tarjetas principales, ficha, inputs | — |
| `--bg-subtle` | `#ECEFE9` | Bloques secundarios, barras resumen colapsadas | — |
| `--ink-primary` | `#12211C` | Títulos, datos clave, texto principal | `> 15:1` sobre blanco y canvas |
| `--ink-secondary` | `#354841` | Descripciones y cuerpo secundario | `> 8.5:1` sobre blanco y canvas |
| `--ink-muted` | `#4F635B` | Metadatos de fecha y origen | `>= 5.8:1` sobre blanco (cumple AA `4.5:1`) |
| `--brand-primary` | `#0F4C3A` | Acción principal (Explorar, Postular, Guardar) | `> 9.8:1` con texto `#FFFFFF` |
| `--brand-primary-hover` | `#0A382A` | Estado hover/active de CTA primario | `> 12.5:1` con texto `#FFFFFF` |
| `--focus-ring` | `#1D4ED8` | Anillo `:focus-visible` `3px` con `offset: 2px` | `> 3:1` frente a fondo adyacente |

### 2.2. Identidad cromática funcional por categoría de oportunidad (Resuelve `H-05`)
Cada tarjeta y ficha lleva una **barra o insignia lateral + ícono propio de categoría** para reconocimiento en `< 0.5 s` (siempre acompañado de etiqueta de texto para no depender solo del color):

| Categoría | Icono Lucide | Color Acento (`fg`) | Fondo Pill (`bg`) | Borde (`border`) |
| --- | --- | --- | --- | --- |
| **Educación y becas** (`education`) | `GraduationCap` | `#1E40AF` (Azul académico) | `#EFF6FF` | `#BFDBFE` |
| **Empleo y prácticas** (`employment`) | `Briefcase` | `#0F4C3A` (Esmeralda profesional) | `#E6F4EC` | `#A7D7BE` |
| **Formación y cursos** (`training`) | `BookOpenCheck` | `#92400E` (Ámbar oficio) | `#FEF3C7` | `#FCD34D` |
| **Emprendimiento y fondos** (`entrepreneurship`) | `Rocket` | `#5B21B6` (Violeta proyecto) | `#F3E8FF` | `#DDD6FE` |
| **Participación / Cívico** (`civic`) | `Landmark` | `#0F766E` (Turquesa público) | `#CCFBF1` | `#99F6E4` |

### 2.3. Semáforo de Elegibilidad y Origen de IA (Siempre Icono + Texto + Color)

| Estado | Uso | Fondo / Tinta / Borde |
| --- | --- | --- |
| **Coincide (`MATCH`)** | Cumples este requisito | `#E6F4EC` / `#0D5434` / `#86C7A7` + Icono `CheckCircle2` |
| **No coincide (`MISMATCH`)** | Bloqueo probable detectado | `#FDECEC` / `#8E1B1B` / `#E5A1A1` + Icono `XCircle` |
| **Por confirmar (`NEEDS_CONFIRMATION`)** | Requiere certificado o revisión externa | `#FDF4DB` / `#754C00` / `#E0B85A` + Icono `AlertTriangle` |
| **Falta tu dato (`UNKNOWN`)** | Aún no completaste ese campo en tu perfil | `#EEF1EF` / `#3B4A44` / `#C4CEC9` + Icono `HelpCircle` |
| **IA Local (`ON_DEVICE`)** | Ejecutado en navegador (Gemini Nano) | `#E6F4EC` / `#0D5434` / `#9FD4B8` + Icono `Cpu` |
| **IA Nube (`IN_CLOUD`)** | Ejecutado en Firebase con consentimiento | `#EBF0FF` / `#1E3A8A` / `#B3C4FA` + Icono `Cloud` |

---

## 3. Tipografía, escala y ritmo de lectura

- **Par tipográfico propuesto (distintivo y cargable sin bloquear la app offline):**
  - **Titulares de página, nombres de convocatoria y cifras de beneficio:** `'Fraunces', Georgia, serif` o `'Newsreader', Georgia, serif` (en peso `600`, `line-height: 1.15`, `text-wrap: balance`). Aporta autoridad cívico-editorial y rompe por completo el aspecto frío de formulario. *Nota de rendimiento PWA:* autohospedar un único subconjunto `.woff2` (`latin`/`latin-ext`, `~30 KB`) con `font-display: swap` para no depender de internet ni violar la CSP `font-src 'self'`.
  - **Interfaz, etiquetas, botones, requisitos y controles:** `'Plus Jakarta Sans', 'Segoe UI Variable', system-ui, sans-serif` (`font-variant-numeric: tabular-nums` en plazos, días restantes y contadores).
- **Escala tipográfica (base `16px`, nunca inferior a `13px`):**
  - `Display / H1` (Hero / Ficha): `clamp(1.38rem, 2.5vw, 1.95rem)`
  - `H2` (Títulos de tarjeta y secciones): `1.125rem` (`18px`)
  - `Body` (Descripciones y requisitos): `0.95rem` – `1rem` (`15–16px`, ancho máximo `65ch`, `line-height: 1.55`)
  - `Meta / Badge`: `0.8125rem` (`13px`)
- **Escala de espaciado (múltiplos de `4px`):** `4, 8, 12, 16, 20, 24, 32, 48`.

---

## 4. Sistema de componentes clave

### 4.1. Tarjeta de Oportunidad (`OpportunityRow`)
- **Anatomía en máximo 5 zonas visuales claras:**
  1. **Fila superior de contexto:** `[Badge Categoría con color/icono]` + `[Estado y cuenta regresiva: Quedan 16 d]` + `[Entidad · País/Ciudad]` (sin desbordes).
  2. **Título enlazable limpio** (`text-wrap: balance`, área clickeable clara; nunca anidar botones dentro del `<Link>`).
  3. **Dato de valor en negrita suave:** *«Beneficio: Exención de matrícula + CHF 13.500/semestre»*.
  4. **Mini-medidor de encaje (`Match Meter`)** *(solo si el usuario ya completó >=1 campo de su perfil, o etiqueta «Comprobar encaje» si aún está en 0/6)*: barra segmentada compacta de requisitos (`2 cumple · 1 por confirmar`) en una sola línea.
  5. **Acciones en la base:** CTA primario claro (`Ver requisitos y aplicar` o `Revisar ficha`) + Botón secundario discreto (`Guardar` / `Guardada` con `aria-pressed`).

### 4.2. Bloque Único de Requisitos + Semáforo (`UnifiedRequirementsCheck`)
- **Cabecera integrada:** *«¿Cumples los requisitos? (4 en total)»* + Píldora del perfil activo (`Perú · Técnico · EN · Editar 4/6`).
- **Marcador horizontal (`Match Scoreboard`)** con 4 chips interactivos que además **sirven de filtro rápido dentro de la propia ficha** (*ver todos / ver solo bloqueos / ver por confirmar*).
- **Cada requisito (fila escaneable):**
  - Borde izquierdo `4px` semántico por estado.
  - Badge de prioridad (`Obligatorio` / `Opcional`).
  - Explicación determinista en 1 línea (`evalItem.reason[locale]`).
  - Micro-acción inline a la derecha: **`¿Qué significa? (IA)`** (envía la duda puntual al Copiloto) o **`Completar dato`** (si el estado es `UNKNOWN` por campo vacío).

### 4.3. Estrategia de elementos visuales funcionales (No decorativos)
1. **Emblemas de Categoría y Banderas/Alcance tipográficos:** Cada categoría posee su icono y código visual coherente en tarjetas, chips de filtro y Mi Ruta.
2. **Logos/Monogramas oficiales verificados (con respaldo limpio):** Cuando exista logotipo oficial verificado con licencia segura y CSP permitida (o **monograma geométrico tipográfico verificado** con los colores institucionales de ETH Zürich, PRONABEC, AWS, Google, SENA, etc. sin hacer peticiones externas de terceros que vulneren privacidad/offline), se muestra un avatar cuadrado `36x36` junto al `providerName`, acelerando el reconocimiento visual al escanear el listado offline u online.
3. **Medidores de progreso gráficos:**
   - En tarjeta/ficha: barra segmentada de compatibilidad (`[■ ■ ◧ □]`).
   - En plazo: chip de barra de tiempo / urgencia cuando faltan `<= 21 días`.
   - En *Mi Ruta*: barra de avance real de pasos completados (`2 de 3 pasos listos`).
4. **Ilustraciones SVG ligeras (`< 4 KB`, inline sin dependencias externas):**
   - Estado vacío de búsqueda (*«No hay convocatorias con esos 3 filtros»* + ilustración de brújula limpia + CTA único «Mostrar todas»).
   - Estado vacío de *Mi Ruta* (*«Aún no guardaste ninguna oportunidad»* + ilustración de mapa con 1 punto marcado + CTA directo «Explorar oportunidades»).

---

## 5. Diseño Mobile-First y Reglas de Composición Responsive

**Regla fundamental:** No comprimir dos columnas estrechas ni apilar paneles interminables en teléfonos. El espacio disponible manda la interacción:

| Ancho CSS | Estructura de Página | Navegación | Filtros en `/` | Asistente IA en Ficha |
| --- | --- | --- | --- | --- |
| **`320px` – `639px` (Móvil)** | 1 columna (`padding: 12px 14px`) | Header compacto (Logo + `ES\|EN`) + Barra inferior fija (`>=48px` altura) | Buscador + scroll horizontal de chips de categoría + botón **`Filtros`** que abre **Modal/Sheet** | Barra fija inferior encima de nav con `Sitio oficial` + botón **`Preguntar a IA ✨`** que abre **Bottom Sheet (`82dvh`, `overscroll-behavior: contain`)** |
| **`640px` – `959px` (Tablet vertical)** | 1 columna amplia (`max-width: 720px`) | Header horizontal con 3 enlaces + `ES\|EN` | Buscador + chips + País en una fila + Popover `+ Filtros` | Pestañas claras encima del bloque (`Ficha y requisitos` \| `Asistente IA`) o botón flotante |
| **`>= 960px` (Desktop)** | 2 columnas asimétricas en Detalle (`minmax(0, 1.35fr)` lectura + `minmax(0, 0.95fr)` Copiloto `position: sticky; top: 84px`) | Header horizontal limpio | Buscador + Chips + País + Popover `+ Filtros` | Panel lateral sticky siempre accesible sin competir con el título |

### Reglas específicas de botones, acordeones y modales
- **Botones:** Nunca bajar de `44 × 44 px` en controles principales ni en móvil (`touch-action: manipulation`). Máximo **1 botón `.btn-primary` visible por tarjeta o bloque**.
- **Acordeones nativos (`<details>` / `<summary>`):** Para *«Cómo postular paso a paso»*, *«Condiciones e información no publicada»*, *«Fuentes oficiales»* y *«Diagnóstico técnico»* en Ajustes. Cero JavaScript pesado, accesible con teclado por defecto y animación suave respetando `prefers-reduced-motion`.
- **Modales y Bottom Sheets (`+ Filtros`, `Copiloto IA móvil`, `Editar perfil`):** Trap de foco accesible, cierre por tecla `Escape` y botón visible `Cerrar`, bloqueo de scroll trasero (`overscroll-behavior: contain`) y compatibilidad total con zoom del navegador al 200 % (`640px` reflow).

---

## 6. Animaciones y microinteracciones con propósito

| Elemento | Comportamiento propuesto | Regla `prefers-reduced-motion` |
| --- | --- | --- |
| **`IntroSplash`** | Solo cuando el usuario pulsa «Repetir bienvenida» o transición mínima `< 350ms` no bloqueante al cargar por 1.ª vez | Omitir por completo al instante |
| **Selector `ES \| EN`** | Indicador deslizante `.lang-switch-thumb` (`transform: translateX`, `220ms cubic-bezier(0.22, 1, 0.36, 1)`) | Cambio inmediato (`transition-duration: 0ms`) |
| **Botón `Guardar`** | Pulso sutil de icono (`scale(1.12)`) + cambio inmediato de texto a `Guardada` y contador en `Mi Ruta` | Cambio de estado instantáneo |
| **Chips y Acordeones** | Expansión controlada por `opacity`/`transform` (sin `transition: all`) | Apertura inmediata sin animación |
| **Bottom Sheet IA móvil** | Deslizamiento `translateY(100% -> 0)` de `240ms` con `overscroll-behavior: contain` | Aparición instantánea |
