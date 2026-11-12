# Matriz de trazabilidad de requisitos

Fecha: 12-11-2026. Baseline: documentos de discovery, no software. **31/31 requisitos definidos tienen vinculación documental**: 13 RF y 18 RNF. Esto no equivale a 100 % de implementación, cobertura de código o pruebas aprobadas. Estado de todas las pruebas de producto: **PENDIENTE**. Sincronización es Should; si se difiere, marcar sus pruebas «no ejecutadas: fuera del incremento», nunca «aprobadas».

Fuentes canónicas: [RF](FUNCTIONAL_REQUIREMENTS.md), [RNF](NON_FUNCTIONAL_REQUIREMENTS.md), [arquitectura](SOFTWARE_ARCHITECTURE.md), [decisiones ADR](DECISION_LOG.md), [plan de pruebas](QUALITY_AND_TEST_STRATEGY.md). Los IDs T-* están definidos en el plan de calidad; los TR-* complementarios se definen abajo. La columna de prueba es el conjunto mínimo: cada criterio numerado del requisito se convierte en una aserción o paso comprobable, no se acepta una sola captura como cobertura completa.

## Componentes y responsabilidades

- **CAT**: dominio de oportunidad, esquema/importación editorial y repositorio de catálogo.
- **EXP**: búsqueda, filtros, lista y ficha; enlace externo sin postulación automática.
- **ROUTE**: objetivo, seguimiento de oportunidades y tareas; almacenamiento local versionado.
- **PREF**: idioma, preferencia de inferencia, controles de datos y Ayuda.
- **AI**: casos de uso contextuales, política/orquestador y adaptador Firebase AI Logic.
- **SYNC**: adaptadores opcionales Authentication/Firestore, reglas y resolución de conflictos.
- **UI**: shell, componentes, estados, navegación, i18n y guía.
- **OPS**: configuración, límites, observabilidad minimizada y proceso de revisión/CI.

## Requisitos funcionales

| ID | Componente | Decisión | Casos mínimos | Dependencia/puerta pendiente |
|---|---|---|---|---|
| RF-CAT-01 | CAT + EXP | ADR-04, ADR-10 | T-CAT-01; TR-01 | Fuentes reales, permisos editoriales y datos obligatorios |
| RF-CAT-02 | EXP + CAT | ADR-04, ADR-12 | T-CAT-01/02; T-I18N-01; TR-01 | Campos desconocidos, versiones y precisión de cierre |
| RF-SEARCH-01 | EXP + CAT | ADR-03, ADR-04 | T-SEARCH-01; TR-01 | AND/OR, orden explicable, cero resultados y retorno |
| RF-ADMIN-01 | CAT + OPS | ADR-04, ADR-10 | TR-01; TR-07 | Editor autorizado, validación previa y retiro sin borrar guardados |
| RF-SAVE-01 | ROUTE | ADR-07, ADR-10 | T-SAVE-01; TR-06 | Almacenamiento denegado, duplicados, retirada y deshacer |
| RF-ROUTE-01 | ROUTE + AI opcional para sugerir | ADR-05, ADR-07, ADR-10 | T-ROUTE-01; TR-18 | Tres tareas activas, estados separados, sustitución confirmada |
| RF-PROFILE-01 | PREF + UI | ADR-07, ADR-12 | TR-02; TR-10/11 | Sin registro/geolocalización; elección local/nube y borrado |
| RF-SYNC-01 | SYNC + ROUTE | ADR-07 | TR-03; TR-07/11 | Should; cuenta autorizada, aislamiento y conflictos resueltos |
| RF-AI-01 | AI + EXP | ADR-05, ADR-06 | T-AI-01/05; TR-09/12 | 30 casos, contexto/fuentes, cancelación y contrato de salida |
| RF-AI-02 | AI + PREF + OPS | ADR-05, ADR-06 | T-AI-02/04/05; TR-08/10/17 | SDK, hardware y servicios autorizados; cuatro modos reales |
| RF-AI-03 | AI + UI + OPS | ADR-06, ADR-11 | T-AI-03; TR-15 | Señal SDK real; nunca sustituirla por preferencia o disponibilidad |
| RF-I18N-01 | UI + PREF + CAT | ADR-12 | T-I18N-01; T-A11Y-01 | ES/EN revisados; fuentes, precisión monetaria/horaria |
| RF-ONB-01 | UI + PREF | ADR-08, ADR-12 | T-ONB-01; TR-19 | Logo autorizado; cuatro pasos máximo; foco/omisión/repetición |

## Requisitos no funcionales

| ID | Componente | Decisión | Casos mínimos | Evidencia exigida, aún pendiente |
|---|---|---|---|---|
| RNF-A11Y-01 | UI + EXP + ROUTE | ADR-08, ADR-11, ADR-12 | T-A11Y-01; TR-19 | Matriz de criterios A/AA aplicables, teclado, lector y contraste real |
| RNF-A11Y-02 | UI | ADR-08, ADR-12 | T-A11Y-01; T-ONB-01; TR-19 | Viewports 320–1440, orientación, zoom/reflow, movimiento reducido |
| RNF-PERF-01 | UI + CAT + OPS | ADR-03, ADR-11 | TR-04 | Equipo/red, visita fría/caliente; laboratorio separado de campo |
| RNF-PERF-02 | AI + UI | ADR-05, ADR-11 | TR-05; T-AI-05 | ≥20 ejecuciones por ruta, p50/p95; descarga separada |
| RNF-RES-01 | ROUTE + CAT + UI | ADR-07 | TR-06; T-AI-05 | Caché/ausencia de caché, recarga, errores sin pérdida |
| RNF-SEC-01 | CAT + SYNC + OPS | ADR-03, ADR-07 | TR-07; TR-03 | Escritura editorial autorizada; UID si sync; revisión de secretos |
| RNF-SEC-02 | AI + OPS | ADR-05, ADR-11 | TR-08; TR-16 | App Check, restricciones, cuotas; no confundir alerta con corte |
| RNF-SEC-03 | EXP + AI + UI | ADR-04, ADR-05 | TR-09 | XSS, URL no HTTPS/inyección; ninguna ejecución ni privilegio nuevo |
| RNF-PRIV-01 | AI + PREF + OPS | ADR-05, ADR-07 | TR-10; TR-15 | Payload real y logs minimizados; no transmisión local-only |
| RNF-PRIV-02 | PREF + ROUTE + SYNC opcional | ADR-07 | TR-11 | Borrado local y, si aplica, remoto; límites de proveedor/backups |
| RNF-AI-01 | AI + CAT | ADR-04, ADR-05, ADR-11 | TR-12; T-AI-01 | 30 casos revisados por humanos, cero invenciones críticas |
| RNF-AI-02 | AI + OPS | ADR-06, ADR-11 | T-AI-02/03/04; TR-17 | Versiones/dispositivo, cuatro modos, fallback y origen observado |
| RNF-I18N-01 | UI + CAT + PREF | ADR-12 | T-I18N-01; TR-19 | Strings ES/EN completos, lang, expansión textual, datos originales |
| RNF-DATA-01 | CAT + OPS | ADR-04, ADR-10 | TR-01; T-CAT-02 | Revisión de todas las fichas, duplicados y fecha de verificación |
| RNF-MAINT-01 | Todos + OPS | ADR-03, ADR-11 | TR-14 | Contratos, dependencias, typecheck/lint/tests en commit real |
| RNF-OBS-01 | AI + OPS | ADR-06, ADR-11 | TR-15 | Evento sin datos privados, política de retención y errores útiles |
| RNF-COST-01 | AI + OPS | ADR-05, ADR-11 | TR-16; TR-08 | Precios/volumen supuesto, autorización de gasto y límites revisados |
| RNF-COMP-01 | UI + AI | ADR-02, ADR-12 | TR-17; T-A11Y-01 | Navegadores/versiones físicos; móvil no prueba inferencia nativa |

## Casos complementarios ejecutables en la fase de implementación

Todos son especificaciones, no resultados. El ejecutor conserva fecha, commit, versión, precondición, datos sintéticos o públicos permitidos, observado, esperado y evidencia. No incluir secretos ni texto personal.

| ID | Nivel y preparación | Acción y resultado esperado |
|---|---|---|
| TR-01 | Unidad/integración editorial; fixtures completa, incompleta, duplicada, vencida, retirada y revisión caducada | Validar e importar: sin título/entidad/fuente/fecha no se publica; dato opcional ausente se etiqueta; cierre ambiguo no crea instante inventado; duplicados se detectan; retirada conserva referencia privada; cambios incrementan sourceVersion; revisión vencida no se muestra como abierta verificada. El orden/filtros preservan estas distinciones. |
| TR-02 | E2E preferencias; invitado con almacenamiento disponible y bloqueado | Explorar/guardar sin login, cambiar ES/EN y preferencia IA, recargar; sin geolocalización ni datos sensibles. Si no persiste, informar; restablecer no activa nube por sí solo. |
| TR-03 | Integración/E2E, sólo si se incluye sync; dos cuentas y dos clientes | Confirmar vinculación local, editar la misma versión simultáneamente: conflicto visible con elección de conservar/combinar; no pérdida silenciosa. Invitado conserva Must. Logout limpia caché privada de sesión, no borra cuenta remota. |
| TR-04 | Rendimiento; build y hardware/red fijados | Medir frío/caliente en móvil modesto/escritorio, LCP/INP/CLS con metodología declarada; contrastar metas RNF. Interactuar durante descarga local: UI no bloqueada. No presentar métricas de laboratorio como p75 de usuarios reales. |
| TR-05 | SDK real; rutas compatibles y corpus sintético | Ejecutar ≥20 solicitudes por ruta; registrar inicio visible ≤200 ms en equipo de referencia, p50/p95 y cancelación/timeout; separar adquisición del modelo, inicialización y generación. Incumplimiento se informa, no se oculta en promedio. |
| TR-06 | Integración/E2E con caché previa y navegador limpio | Cortar red, recargar y editar ruta: caché fechada y guardados disponibles cuando existen; primer acceso sin caché informa. Inducir error de almacenamiento/429/5xx: no falso guardado ni borrado, reintento acotado y alternativa manual. |
| TR-07 | Revisión/integración de seguridad; rama y build, reglas si sync | Escanear secretos y revisar permisos. Editor no autorizado no publica. Con Firestore, A no lee/escribe B, anónimo no accede a privados, campos extra y escalada de rol se rechazan; servidor usa IAM mínimo. No exigir UID para el guardado exclusivamente local. |
| TR-08 | Integración real autorizada; App Check válido/inválido y límites controlados | Verificar rechazo y recuperación seguros, sin reintento infinito ni token debug expuesto. Inspeccionar restricciones, cuota y alarma sin provocar gasto no autorizado. Documentar que alarmas no son corte y App Check no reemplaza autorización. |
| TR-09 | Unidad/E2E; payloads XSS, URL javascript/http y prompt injection en ficha | Renderizar texto seguro, enlaces activos sólo HTTPS oficial verificado; sin script ni exfiltración. Instrucciones incrustadas no cambian destino, permisos, herramientas ni fuente; salida inválida se rechaza con alternativa legible. |
| TR-10 | Integración de privacidad; inspección de solicitudes antes/después de consentir | LOCAL_ONLY no envía inferencia a nube. En CLOUD_ALLOWED se transmite sólo contexto mostrado/autorizado, no perfil oculto; no llamada IA al abrir guía; cambiar política afecta solicitudes posteriores. Conexiones no-modelo se explican aparte. |
| TR-11 | E2E de borrado, sólo datos sintéticos | Cancelar confirmación conserva datos; aceptar borra exactamente el alcance local comunicado. Si hay cuenta, comprobar documentos y cuenta remotos según política, cachés y límites de backup; un botón de éxito no prueba borrado. |
| TR-12 | Evaluación humana de 30 casos, cada ruta real disponible | Ejecutar distribución del plan de calidad: 10 claros, 5 incompletos, 5 contradictorios/vencidos, 5 maliciosos y 5 ES/EN/límites. Comparar con hechos esperados/prohibidos y sourceVersion. Cero requisitos o fechas críticos inventados para release; fixtures no son oportunidades de demo verificadas. |
| TR-14 | Revisión/CI sobre commit concreto | Instalar desde lockfile, ejecutar lint/typecheck/unidad/integración; verificar dominio sin dependencia de UI, límites/adaptadores tipados y validación de esquema. Guardar comandos/salidas; no marcar CI aprobada si no existe ejecución. |
| TR-15 | Integración de observabilidad con datos de prueba | Capturar evento éxito/error/fallback: requestId, tarea, fuente confirmada/desconocida y latencia, sin prompts, respuestas, correos ni perfil. Verificar retención configurada; evidencia SDK asignada por aplicación, no por texto del modelo. |
| TR-16 | Revisión operativa, sin compra ni habilitación | Registrar tarifa oficial/fecha/modelo, volumen y tokens supuestos, cuota y escenarios de exceso; confirmar presupuesto con propietario antes de facturación. Verificar límites de entrada/salida y frecuencia; no prometer techo a partir de alertas. |
| TR-17 | Matriz real Chrome/Edge/Firefox/Safari objetivo + móvil | UI funciona sin local; verificar compatibilidad con detección y ejecución separadas. En Chrome compatible probar modelo ausente/descargando/listo, offline y los cuatro modos con señal real. Registrar no disponible/no probado; emular viewport no prueba hardware. |
| TR-18 | Unidad/E2E de ruta y límites | Objetivo vacío/121 caracteres y tarea vacía/201 se rechazan; límites válidos se aceptan. Tres pendientes/en curso consumen cupo; cuarta se rechaza sin pérdida; completar libera y reabrir exige cupo. Sustituir objetivo pide confirmación y conserva guardados. |
| TR-19 | Manual + automatizada de UI, guía y procesos completos | Matriz WCAG A/AA aplicable con justificación de N/A; teclado/lector/foco, mensajes, contraste real, zoom/reflow y todas las orientaciones/anchos. Guía ≤4 pasos, target inexistente, resize, Escape/Omitir y repetir desde Ayuda; ningún overlay atrapa usuario ni oculta controles; reduced motion sin viaje del logo. |

## Evidencia y control de cambios

- **Verificado documentalmente:** existencia de los 31 IDs y vinculación a decisión, componente y caso definido. Los valores de contraste de tokens son cálculo de diseño, no UI probada.
- **Implementado:** ningún componente del producto en esta fase.
- **Probado en producto:** nada; todas las filas requieren ejecución posterior.
- **Simulado:** ningún resultado se presenta como simulación realizada. Mocks futuros sólo validarán lógica, nunca procedencia real de inferencia.
- **Pendiente/bloqueado:** hardware compatible, proyecto/servicios autorizados, reglas legales, fuentes vigentes, presupuesto y capacidad del equipo.

Al cambiar un RF/RNF, actualizar su fila, pruebas afectadas, ADR si cambia una decisión y backlog. Un caso puede cubrir varios requisitos, pero el reporte debe indicar cuáles criterios pasó y cuáles no. Antes de liberar un incremento, comprobar criterios uno a uno; la mera presencia de esta tabla no satisface Definition of Done.
