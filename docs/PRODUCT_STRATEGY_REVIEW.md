# Auditoría Estratégica y Redefinición de Producto: UMBRAL

**Fecha de evaluación:** 14 de noviembre de 2026  
**Repositorio evaluado:** `Alvaro-mendoza-12/umbral-hybrid-ai` (`D:\umbral-hybrid-ai`, rama `feat/hybrid-ai-web`)  
**Despliegue actual preservado:** `https://umbral-21e8b.web.app`  
**Rol de este documento:** Diagnóstico ejecutivo crítico y decisión estratégica vinculante antes de cualquier nueva línea de código por Orchestrator (Argon).

---

## 0. Nota metodológica y transparencia sobre la evidencia

- Este análisis se realizó en **modo de solo lectura sobre el código fuente real** (`src/`), las pruebas y las **8 capturas visuales vigentes en `D:\umbral-hybrid-ai\artifacts.local/`** (`ux-home-desktop.png`, `ux-home-mobile.png`, `ux-lang-switch.png`, `ux-detail-desktop.png`, `ux-selfcheck.png`, `ux-ai-panel.png`, `ux-my-route.png`, `ux-settings-desktop.png`). *Nota de transparencia:* en el mensaje de entrada no se incluyeron archivos adjuntos binarios en el registro de conversación (`media`), por lo que la inspección visual se basó directamente en las capturas reales del árbol actual y la inspección línea por línea de los componentes React y hojas CSS.
- Toda afirmación externa distingue explícitamente entre **[Dato comprobado]** (fuentes consultadas el 12–14 de noviembre de 2026: OIT, Gob.pe/MIDIS SISFOH, Andina, documentación oficial de plataformas competidoras) e **[Inferencia de producto]** / **[Hipótesis por validar con usuarios]**.

---

## 1. Diagnóstico crítico sin concesiones del producto actual

### Qué funciona bien (el activo que NO debemos perder)
Técnicamente, Umbral posee una base de ingeniería sólida que merece conservarse íntegra:
1. **Infraestructura Firebase AI Logic real probada en producción:** integración limpia en `src/adapters/firebase/hybridAiAdapter.ts` y `firebaseApp.ts` con `GoogleAIBackend`, `gemini-3.5-flash-lite`, App Check con `ReCaptchaEnterpriseProvider` y tokens limitados.
2. **Arquitectura híbrida y compuerta ética de privacidad:** `src/services/aiOrchestrator.ts` separa la ejecución local (`window.LanguageModel` / Gemini Nano) de la nube (`IN_CLOUD`), bloquea todo envío remoto sin consentimiento explícito y exige trazabilidad (`evidenceIds` verificados en `aiContract.ts`).
3. **Motor determinista libre de alucinaciones:** `src/domain/matcher.ts` evalúa 4 estados honestos (`MATCH`, `MISMATCH`, `NEEDS_CONFIRMATION`, `UNKNOWN`) sin delegar decisiones de elegibilidad a un LLM.
4. **Arquitectura limpia y PWA offline:** React 19 + TypeScript estricto + puertos y adaptadores + persistencia local + Service Worker funcional en `/route`.

### Por qué el producto actual falla frente a un usuario humano real
Si quitamos los elogios de ingeniería y juzgamos a Umbral como un producto digital frente a un estudiante, egresado o ciudadano común en los primeros 10 segundos:

1. **Hoy se siente como un «demostrador técnico de arquitectura IA» disfrazado de portal web, no como una herramienta centrada en una persona.**
   - En `/`, **todo el primer pantallazo en escritorio (`1280x800`)** está ocupado por un hero genérico, tres cajas de «Cómo funciona» y un formulario con **5 `<select>` + buscador + checkbox** (`ExplorePage.tsx:118-437`). **No se ve ni una sola oportunidad real al abrir la página.**
   - En `/settings` (`SettingsPage.tsx`), el usuario promedio se encuentra con diagnósticos internos para desarrolladores (*«Estado C · App Check inicializado»*, *«Chrome Prompt API (window.LanguageModel)»*, *«gemini-3.5-flash-lite»*).
2. **La vista de detalle (`/opportunities/:id`) castiga al usuario con triple repetición y densidad burocrática.**
   - `OpportunityDetailPage.tsx` lista los requisitos en «Ficha verificable» (`lines 320-344`).
   - Debajo, `SelfCheckPanel.tsx` abre un **formulario de 6 campos siempre visible** (`lines 106-251`) seguido de **los mismos requisitos listados por segunda vez** (`lines 295-338`).
   - En la columna derecha, `HybridAIPanel.tsx` (744 líneas) expone selectores técnicos de inferencia (`PREFER_ON_DEVICE`, `ONLY_IN_CLOUD`), badges de hardware, comparador de 19 fichas y chat; y cuando el usuario pulsa «Explicar requisitos», **le muestra los mismos requisitos por tercera vez** (`lines 492-510`).
3. **Ausencia de identidad visual orientada a resultados.**
   - Todas las oportunidades tienen la misma apariencia neutra de ficha textual blanca (`ExplorePage.tsx:478-580`). No existe diferenciación visual entre una beca suiza de CHF 13.500/semestre, una práctica de AWS en Colombia o un fondo peruano de innovación, ni indicadores inmediatos de urgencia o compatibilidad antes de abrir el detalle.
4. **Falta un resultado tangible emocionalmente inmediato.**
   - La app muestra *información* y *diagnósticos*, pero no responde en 3 segundos: **«¿Esta convocatoria es para mí, qué documento me falta hoy y cuál es el primer clic real que debo dar?»**

---

## 2. Evaluación estratégica: Dirección A vs. Dirección B

El proyecto nació con una tensión no resuelta:
- **Dirección A:** Descubrimiento e interpretación inteligente de oportunidades (becas, formación, empleo, prácticas, emprendimiento, convocatorias internacionales).
- **Dirección B:** Asistente de acceso a programas sociales y servicios públicos (antecedente ligado a la preparación de **Clasificación Socioeconómica — CSE** en **SISFOH** para hogares de Chiclayo).

### Datos verificados sobre la Dirección B (CSE / SISFOH Chiclayo)
- **[Dato comprobado · Gob.pe / MIDIS / Andina]:** Para solicitar o actualizar la Clasificación Socioeconómica (CSE) en Chiclayo, un integrante mayor de edad del hogar debe acudir **presencialmente** a la **Unidad Local de Empadronamiento (ULE)** de su municipalidad (Municipalidad Provincial de Chiclayo o municipalidad distrital correspondiente como José Leonardo Ortiz o La Victoria) llevando **DNI (o Carnet de Extranjería) vigente de todos los miembros del hogar** y un **recibo de energía eléctrica (antigüedad <= 3 meses)**.
- **[Dato comprobado · MIDIS]:** En la ULE se suscribe físicamente el **Formato S100** (solicitud/declaración jurada blanca) y se recibe una constancia; días después, un empadronador municipal visita físicamente la vivienda para aplicar la **Ficha Socioeconómica Única (FSU)** (formato rosado). Posteriormente, el **Formato D100** es un documento institucional interno generado por MIDIS y suscrito por la autoridad municipal para consolidar la validación en el **Padrón General de Hogares (PGH)** (el ciudadano no llena el D100). El plazo estimado llega hasta **25 días hábiles** y el resultado se consulta en **Consulta Mi Hogar**.
- **[Inferencia clave de producto]:** Una persona no desea «tener una CSE» por gusto; tramita la CSE **porque es una llave obligatoria** para postular a becas focalizadas (como PRONABEC Beca 18) o programas sociales del Estado (Juntos, Pensión 65, SIS). El cuello de botella real del trámite SISFOH en Chiclayo **es físico y municipal** (acudir en horario de oficina a la ULE, reunir los DNI del hogar y atender al empadronador en casa), no falta de un chatbot complejo.

### Matriz comparativa bajo los 8 criterios solicitados

| Criterio | Dirección A: Descubrimiento y preparación de oportunidades | Dirección B: Asistente de acceso a programas sociales (CSE / Chiclayo) |
| --- | --- | --- |
| **1. Relevancia social** | **[Dato comprobado · OIT]** 20,4 % de jóvenes (15–24 años) en el mundo no estudiaba, trabajaba ni se capacitaba en 2023. En LATAM e Iberoamérica existe una brecha crítica entre la existencia de becas/empleo/capacitación gratuita y la capacidad de descifrar bases técnicas y no quedar descalificado por un requisito oculto. | Muy alta relevancia social en Perú para hogares en situación de pobreza/vulnerabilidad, donde un error al acudir a la ULE (faltar un DNI o recibo reciente) provoca rechazo de ventanilla y pérdida de acceso a subvenciones y becas estatales. |
| **2. Usuario principal** | Estudiantes de últimos ciclos o egresados, jóvenes en transición al primer empleo/práctica y profesionales/emprendedores tempranos (18–35 años) con smartphone o laptop buscando su siguiente salto educativo o laboral. | Jefes de hogar, madres/padres de familia o jóvenes en Chiclayo/Perú preparando empadronamiento en la ULE o trámites ante MIDIS/municipalidades (a menudo con menor literacidad digital, conectividad intermitente y uso compartido de teléfono). |
| **3. Necesidad concreta** | Filtrar ruido y estafas, saber en <30 segundos si cumple los requisitos reales de una convocatoria, entender cláusulas ambiguas (idioma, nivel académico, permiso migratorio) y organizar la postulación antes del cierre. | Saber exactamente qué documentos físicos llevar a su municipalidad (DNI de todos, recibo de luz), qué formulario le corresponde (S100 vs FSU), dónde queda su ULE y cómo revisar si su hogar ya figura en el PGH sin perder días de trabajo en colas inútiles. |
| **4. Solución que aporta valor real** | **Verificador determinista de elegibilidad + traductor contextual de requisitos oficiales con IA + plan accionable de máximo 3 pasos** antes de enviar al portal oficial. | **Lista de chequeo offline sin registro** de requisitos físicos municipales + explicación clara de qué documento preparar antes de ir a la ULE + seguimiento del plazo de 25 días hábiles. |
| **5. Funcionalidades necesarias** | Búsqueda por intención/país, ficha escaneable centrada en elegibilidad, perfil mínimo reutilizable, IA contextual por pregunta/requisito y lista de 3 pasos + guardados locales offline. | Geolocalización/directorio verificado de ULEs locales, árbol de decisión por motivo de trámite (primera vez, cambio de domicilio, inclusión de miembro), checklist de documentos físicos y lector de pasos del S100/FSU. **No necesita Gemini Cloud comparado ni catálogo internacional.** |
| **6. Viabilidad técnica y riesgo** | **Muy alta.** Cero PII sensible obligatoria (solo país, grado, rango de experiencia e idioma). Apto para web/PWA, Firebase AI Logic, Gemini Nano + Cloud con consentimiento, bilingüe ES/EN y escalable a cualquier país con JSON curado. | **Riesgo alto si se digitaliza de más:** Pedir composición familiar, número de DNI, dirección o recibos eléctricos dispara obligaciones estrictas de protección de datos sensibles (Ley 29733 en Perú) y requiere convenios municipales para que las ULE mantengan direcciones/horarios vigentes. Además, inutilizaría la bilingüización EN y la estructura internacional actual. |
| **7. Diferenciación frente al mercado** | Frente a LinkedIn, Indeed o Google Jobs (agregadores centrados en volumen y CV), **UMBRAL no compite por volumen**: compite por **claridad de elegibilidad determinista (sin puntuaciones inventadas) + IA híbrida con privacidad local + ruta acotada anti-parálisis**. | Gob.pe y las cartillas del MIDIS ya publican los requisitos del SISFOH en texto oficial; diferenciarse requeriría alianzas directas con municipalidades locales o audios en lenguas/dialectos locales y soporte comunitario presencial. |
| **8. Alcance realista para versión competitiva** | **Alto e inmediato:** Reutiliza el 100 % de Firebase AI Logic, Gemini Nano/Cloud, matcher determinista, catálogo curado de 20 convocatorias reales (`INT`, `PE`, `CO`, `MX`, `ES`, `US`) y arquitectura ES/EN actual, transformando completamente la UX en 4 sprints incrementales. | Requeriría descartar el 80 % del catálogo existente, eliminar o reescribir el matcher de empleo/becas, cambiar los esquemas de IA y realizar trabajo de campo con ULEs de Chiclayo para no publicar información obsoleta o errónea. |

---

## 3. Decisión Estratégica Vinculante (SIN mezclar productos)

### Dirección recomendada como PRODUCTO PRINCIPAL: **Dirección A redefinida**
UMBRAL debe posicionarse sin ambigüedades como un **Verificador de Elegibilidad y Copiloto de Preparación de Oportunidades Verificadas** (*From verified opportunity to eligibility clarity & 3-step action*), no como un agregador genérico de ofertas ni como un portal municipal del SISFOH.

**Por qué esta decisión es la correcta:**
1. **Un problema transversal, urgente y medible:** Las personas pierden decenas de horas postulando a becas, empleos o convocatorias para las que no califican por una cláusula oculta (permiso de residencia, nivel mínimo, certificado previo), o abandonan por no entender el lenguaje oficial de las bases.
2. **Encaje perfecto con IA Híbrida (Gemini Nano + Firebase AI Logic):** Un usuario que compara si cumple requisitos reales o pide explicar una cláusula en español sencillo sin entregar su DNI ni su CV obtiene valor inmediato de la IA local y, cuando necesita comparar dos convocatorias o hacer preguntas complejas, autoriza Gemini Cloud explícitamente.
3. **Coherencia con lo que ya funciona:** Mantiene intacto el catálogo verificado (`PE`, `CO`, `MX`, `ES`, `US`, `INT`), la infraestructura Firebase `umbral-21e8b` + App Check, el soporte bilingüe `ES/EN` y la PWA offline.

### Qué hacer con la Dirección B (CSE / SISFOH Chiclayo y trámites públicos)
**No mezclarla como segundo menú ni segundo producto en el MVP.** En su lugar:
1. **Integración inteligente por «Micro-guía de Requisito Previo» (Fase 4 / Post-MVP inmediato):** Cuando una convocatoria real en Perú exija acreditación socioeconómica SISFOH (como Beca 18) o Certificado Único Laboral (CUL del MTPE), ese requisito específico dentro de la ficha puede desplegar un acordeón breve verificado (*«¿Qué es la CSE / Formato S100 y qué llevar a la ULE?»*, con enlace oficial a `gob.pe` y recordatorio offline de DNI + recibo de luz `<= 3 meses`). De ese modo se conserva el impacto social territorial en Chiclayo/Perú **como parte natural del camino hacia una beca o empleo**, sin fracturar el producto en dos apps incompatibles.
2. **Vertical autónoma de Programas Sociales Municipales:** Queda explícitamente **fuera del MVP**, documentada como **Expansión Fase 3+ condicionada a validación de campo y convenio con ULE/MIDIS** (con política específica de cero captura de DNI).

---

## 4. Propuesta de Valor Redefinida (El «Nuevo Umbral» en una frase)

- **Antes (abstracto):** *«Encuentra convocatorias reales y verifica si cumples en minutos.»* (seguido de un documento denso y controles de desarrollador).
- **Nuevo posicionamiento concreto:** **«Descubre si calificas a becas, empleos y programas verificados antes de postular, sin formularios invasivos ni promesas falsas.»**
- **Promesa en 3 bloques de valor verificable:**
  1. **Filtra por tu situación real** (beca, práctica, primer empleo, fondo) y ve convocatorias reales desde el primer segundo.
  2. **Ve de un vistazo qué requisitos cumples, cuáles te bloquean y cuáles debes confirmar**, reutilizando un perfil ligero que tú controlas.
  3. **Convierte la duda en acción** usando IA en tu dispositivo o en la nube con tu permiso para traducir requisitos oficiales a tus **3 próximos pasos concretos** en *Mi Ruta* (disponible sin conexión).
