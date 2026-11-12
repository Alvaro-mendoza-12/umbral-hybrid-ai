# Requisitos funcionales

Versión discovery 1.0 · 2026-11-12. Estado: **especificados, no implementados ni probados**. Prioridades MoSCoW; Must es condición de MVP, Should recortable. Actores: V visitante, U persona usuaria, E editor autorizado, S sistema. Cada criterio CA es verificable; los casos UC y reglas RN se definen al final.

## 1. Catálogo y descubrimiento

### RF-CAT-01 · Catálogo trazable · Must · V/E · UC-01
**Historia:** Como visitante quiero conocer el origen de cada oportunidad para comprobar sus condiciones.
**Descripción:** Publicar sólo fichas revisadas, con fuente primaria enlazada, entidad oferente, categoría, estado, fecha de revisión y alcance geográfico explícito.
**Dependencias:** RN-01/02/03; RF-ADMIN-01.
**CA:** (1) Una ficha sin URL, título, entidad, categoría o fecha de revisión no puede publicarse. (2) Elegibilidad desconocida se presenta como «por confirmar», no «global». (3) La fecha de revisión es visible. (4) La etiqueta de verificación explica su alcance editorial. (5) Fuente insegura/no válida no produce enlace activo.

### RF-CAT-02 · Ficha comprensible · Must · V · UC-02
**Historia:** Como persona interesada quiero distinguir requisitos, coste y fecha para decidir sin adivinar.
**Descripción:** Mostrar resumen, requisitos originales, coste y moneda cuando consten, modalidad, fechas y zona horaria cuando estén publicadas, país/elegibilidad, idioma y CTA oficial.
**Dependencias:** RF-CAT-01, RF-I18N-01; RN-02/03/04.
**CA:** (1) Campos desconocidos se identifican. (2) Fecha sin hora oficial no se convierte en una hora de cierre inventada. (3) Estado vencido es visible en ficha y lista. (4) Traducción/resumen se distingue del original. (5) CTA externo indica destino y no envía datos del perfil.

### RF-SEARCH-01 · Búsqueda y filtros explícitos · Must · V · UC-01
**Historia:** Como visitante quiero reducir opciones por criterios comprensibles para no revisar contenido irrelevante.
**Descripción:** Texto, categoría, país/elegibilidad y modalidad; filtros seleccionados visibles, limpiar todo y orden documentado (relevancia textual simple o fecha, sin perfilamiento opaco).
**Dependencias:** RF-CAT-01, RN-02.
**CA:** (1) Los filtros se combinan mediante AND entre dimensiones y OR dentro de una selección múltiple. (2) «Internacional» se incluye sólo con evidencia de alcance. (3) Cero resultados conserva filtros y permite quitarlos. (4) Atrás restaura consulta y posición cuando sea viable. (5) No se genera un «porcentaje de elegibilidad» mediante IA.

### RF-ADMIN-01 · Curación y publicación · Must · E · UC-07
**Historia:** Como editor quiero revisar una ficha antes de publicarla para evitar información no sustentada.
**Descripción:** Flujo editorial documentado, implementable inicialmente como fichero validado en repositorio con revisión; panel administrativo no requerido.
**Dependencias:** RN-01/02/03/10.
**CA:** (1) Esquema valida obligatoriedad, estados y URLs. (2) Cada publicación registra responsable/fecha de revisión sin exponer datos personales del editor. (3) Sólo actor autorizado modifica catálogo compartido. (4) Se puede retirar una ficha sin borrar guardados del usuario. (5) Cambios de requisitos actualizan versión/fecha.

## 2. Mi Ruta y perfil

### RF-SAVE-01 · Guardar y seguir · Must · U · UC-03
**Historia:** Como usuario quiero conservar una oportunidad para retomarla.
**Descripción:** Guardar/quitar y estados manuales: guardada, preparando, enviada, cerrada; «enviada» es declaración del usuario, no confirmación del oferente.
**Dependencias:** RF-CAT-01; RN-05/06.
**CA:** (1) Guardar repetidamente no duplica. (2) Estado persiste al recargar cuando almacenamiento está disponible. (3) Si no está disponible se informa y no se finge guardado. (4) Retirada de catálogo deja referencia histórica marcada, no ficha ficticiamente abierta. (5) Quitar permite deshacer mientras exista sesión de edición.

### RF-ROUTE-01 · Un objetivo, próximos pasos · Must · U · UC-04
**Historia:** Como usuario quiero convertir una oportunidad en pocas tareas para comenzar.
**Descripción:** Un objetivo activo y hasta tres tareas activas globales (pasos) editables, marcables y ordenables; creación manual siempre disponible y sugerencia IA opcional. Si ya existe objetivo, confirmar sustitución antes de sobrescribirlo.
**Dependencias:** RF-SAVE-01, RF-AI-01 para sugerencias; RN-04/05/06.
Los estados de tareas (pendiente/en curso/completada) son independientes del seguimiento de oportunidades (guardada/preparando/enviada/cerrada).
**CA:** (1) La IA nunca guarda ni completa pasos sin acción del usuario. (2) Editar/quitar/completar funciona sin IA. (3) Se rechaza paso vacío y se explican límites de longitud. (4) Sustituir objetivo no borra oportunidades guardadas. (5) Fechas sugeridas se identifican como personales, distintas de fechas oficiales. (6) Se conserva estado ante un fallo de IA. (7) Una cuarta tarea activa se rechaza sin borrar las tres existentes; completar una libera un cupo y reabrirla requiere cupo disponible. (8) Pendiente y en curso cuentan como activas; completada no.

### RF-PROFILE-01 · Preferencias mínimas · Must · U · UC-05
**Historia:** Como usuario quiero elegir idioma y preferencias de inferencia sin entregar información innecesaria.
**Descripción:** Idioma ES/EN, país de interés opcional, preferencia local/nube y controles de datos locales. Ningún campo sensible requerido.
**Dependencias:** RF-I18N-01, RF-AI-02; RN-06/07.
**CA:** (1) Explorar no exige registro. (2) No se solicita geolocalización. (3) Se puede restablecer preferencia. (4) Borrar datos exige confirmación clara del alcance local. (5) Una preferencia sólo local nunca se traduce en nube silenciosa.

### RF-SYNC-01 · Cuenta y sincronización opcional · Should · U · UC-08
**Historia:** Como usuario quiero recuperar mi ruta en otro dispositivo si decido crear cuenta.
**Descripción:** Authentication y almacenamiento privado por UID; sólo se añade si supera pruebas de aislamiento y manejo de conflictos.
**Dependencias:** RF-SAVE-01, RF-ROUTE-01, RNF-SEC-01/02; RN-06.
**CA:** (1) Invitado conserva funciones Must. (2) Antes de vincular datos locales se muestra qué se sincronizará. (3) Dos cuentas no pueden leer/escribir datos ajenos en pruebas negativas. (4) Conflicto de edición se detecta por versión y no se pierde silenciosamente contenido. (5) Cerrar sesión elimina caché privada de sesión sin borrar arbitrariamente cuenta remota.

## 3. IA, idiomas y onboarding

### RF-AI-01 · Asistencia contextual acotada · Must · U · UC-06
**Historia:** Como usuario quiero una explicación de los requisitos de la ficha actual, no una respuesta genérica.
**Descripción:** Sólo «Explicar requisitos» y «Preparar mis próximos pasos». Contexto limitado a campos de la ficha y texto voluntario mínimo; todas las inferencias mediante Firebase AI Logic.
**Dependencias:** RF-CAT-02, RF-AI-02/03; RN-04/07/08/09.
**CA:** (1) Respuesta separa requisitos sustentados y sugerencias. (2) Toda afirmación de requisito se vincula al campo/fuente suministrado. (3) Si falta información, lo indica; no crea enlaces, fechas ni admisión. (4) Salida se valida contra contrato y límites; inválida produce error recuperable, nunca HTML sin sanitizar. (5) No mantiene conversación abierta ni memoria de varios turnos como requisito de la ruta local. (6) Cancelación impide insertar una respuesta obsoleta.

### RF-AI-02 · Orquestación y control de destino · Must · U/S · UC-06
**Historia:** Como usuario quiero saber y controlar cuándo sale información de mi dispositivo.
**Descripción:** Comprobar capacidad/disponibilidad, tarea y configuración; soportar los cuatro modos de inferencia del proveedor según plataforma. No confundir detección con ejecución.
**Dependencias:** Matriz y contrato de HYBRID_AI_ARCHITECTURE; RN-07/08.
**CA:** (1) ONLY_ON_DEVICE falla de forma informativa si local no está disponible; nunca usa nube. (2) ONLY_IN_CLOUD no descarga modelo local. (3) Modos preferentes siguen semántica oficial comprobada, con política de privacidad visible. (4) Descarga o preparación requiere interacción cuando plataforma lo exige y no bloquea catálogo. (5) Error de autenticación/coste no se convierte en bucle de reintentos. (6) Entradas no compatibles se rechazan o enrutan con destino claro.

### RF-AI-03 · Evidencia del modo ejecutado · Must · U/S · UC-06
**Historia:** Como usuario y evaluador quiero distinguir IA local de nube de forma verificable.
**Descripción:** Estado solicitado, disponible y efectivamente ejecutado separados. Resultado con taskId, requestId, backend confirmado o desconocido, versión de esquema y fuente de evidencia.
**Dependencias:** RF-AI-02; RN-08.
**CA:** (1) La etiqueta final procede de evidencia del SDK/ejecución instrumentada, no de la preferencia elegida. (2) Si no se puede probar, muestra «no determinado», no «local». (3) Evidencia de demo excluye prompts personales y secretos. (4) Prueba de fallback muestra destino real y motivo resumido.

### RF-I18N-01 · Internacionalización · Must · V/U · UC-05
**Historia:** Como usuario quiero navegar en español o inglés sin perder datos ni significado.
**Descripción:** Strings externalizados, locales ES/EN, formatos de fecha/moneda y separación entre idioma UI, idioma fuente y traducción.
**Dependencias:** RN-02/03.
**CA:** (1) Cambio de idioma preserva ruta/filtros. (2) No aparecen claves sin traducir en flujos Must. (3) Moneda conserva código y no se convierte sin tasa/fuente. (4) Textos largos no rompen 320 px ni zoom 200%. (5) Zona horaria oficial se conserva y conversión se etiqueta cuando hora es inequívoca.

### RF-ONB-01 · Entrada y guía no bloqueantes · Must · V/U · UC-09
**Historia:** Como visitante quiero entender dónde empezar sin una introducción obligatoria.
**Descripción:** Logo centrado → animación breve → fondo → logo al encabezado → entorno → guía sobre elementos reales. Omitir y repetir; no reaparece cada visita.
**Dependencias:** ANIMATION_AND_ONBOARDING, RNF-A11Y-01/02; RN-11.
**CA:** (1) Omitir disponible mediante teclado. (2) Reduced motion elimina desplazamientos no esenciales. (3) Siguiente/progreso son accesibles. (4) Persistencia marca completado/omitido por versión de guía. (5) Target inexistente, orientación o scroll no dejan overlay atrapado. (6) Funciones principales no esperan fin de animación.

## 4. Casos de uso

| ID | Actor / precondición | Flujo principal | Alternativa / postcondición |
|---|---|---|---|
| UC-01 Explorar | V; catálogo cargado o caché | Seleccionar filtro, leer resultados, abrir ficha | Vacío/error explica recuperación; filtro conservado |
| UC-02 Revisar fuente | V; ficha existente | Revisar condiciones, activar enlace oficial | Ficha retirada/vencida advierte; no se postula automáticamente |
| UC-03 Guardar | U invitado o autenticado | Guardar, mostrar confirmación, editar estado | Almacenamiento bloqueado informa; no falso éxito |
| UC-04 Crear ruta | U; ficha o objetivo manual | Proponer/editar hasta 3 pasos, confirmar | Fallo IA permite manual; objetivo anterior no se sobrescribe sin confirmar |
| UC-05 Preferencias | U | Cambiar idioma/destino IA, persistir | Fallo de persistencia visible; sesión mantiene elección mientras pueda |
| UC-06 Explicar | U; contexto válido | Elegir tarea, evaluar capacidad, ejecutar, validar, mostrar evidencia | Offline/cancelación/fallo conserva ficha y ofrece acción manual |
| UC-07 Curar | E autorizado | Revisar fuente, validar esquema, publicar versión | Campos insuficientes impiden publicación |
| UC-08 Sincronizar | U; Should implementado | Iniciar sesión, confirmar vinculación, sincronizar | Conflicto requiere resolución; no pérdida silenciosa |
| UC-09 Guía | V/U | Resaltar elemento, avanzar, terminar | Omitir/restaurar foco; repetir desde Ayuda, accesible en Perfil/Ajustes |

## 5. Reglas de negocio

- **RN-01:** «Verificada» significa fuente primaria revisada editorialmente en fecha indicada; no aval institucional.
- **RN-02:** Ausencia de dato no equivale a «sin coste», «sin requisitos», «global» o «elegible».
- **RN-03:** Fechas se almacenan con precisión original; expiración automática sólo con instante inequívoco. Fecha sin hora requiere estado conservador «revisar cierre» al llegar el día.
- **RN-04:** Requisitos del oferente y recomendaciones de UMBRAL se presentan separados. El usuario decide y ejecuta solicitudes fuera de la app.
- **RN-05:** Guardado/estado de solicitud y pasos son propiedad de la persona; no se envían al oferente.
- **RN-06:** Cuenta opcional; tratamiento mínimo; ninguna ruta privada en colección pública.
- **RN-07:** Sólo local significa ninguna inferencia en nube. La política debe informar claramente qué datos usa nube antes de la primera activación.
- **RN-08:** Todas las inferencias usan Firebase AI Logic; ninguna llamada directa a APIs alternativas de modelos.
- **RN-09:** Datos del catálogo y texto del usuario se tratan como contenido no confiable; instrucciones embebidas no alteran permisos ni herramientas.
- **RN-10:** No republicar contenido completo sin comprobar permisos; priorizar metadatos, extractos necesarios y enlaces oficiales.
- **RN-11:** Onboarding ayuda, nunca constituye barrera de acceso ni sustituto de accesibilidad de la interfaz.

## 6. Fuentes y trazabilidad

Requisitos derivados de la misión del propietario, de [PRODUCT_VISION](PRODUCT_VISION.md) y [USER_PERSONAS_AND_JOURNEYS](USER_PERSONAS_AND_JOURNEYS.md). Matriz técnica: [HYBRID_AI_ARCHITECTURE](HYBRID_AI_ARCHITECTURE.md). Referencias externas de diseño de controles, elaboración 2026-11-12; verificación web en documentos especializados: [Firebase AI Logic](https://firebase.google.com/docs/ai-logic), [WCAG 2.2](https://www.w3.org/TR/WCAG22/). No se atribuyen las decisiones de negocio propias a estos organismos.

La matriz [REQUIREMENTS_TRACEABILITY](REQUIREMENTS_TRACEABILITY.md) vincula cada requisito a componente, decisión y casos de prueba. Todos los casos de producto siguen pendientes.
