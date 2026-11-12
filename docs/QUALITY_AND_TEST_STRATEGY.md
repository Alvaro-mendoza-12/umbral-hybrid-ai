# Estrategia de calidad, accesibilidad y pruebas

Fecha: 2026-11-12. Estado: plan, no informe de ejecución. Ninguna prueba de producto se declara aprobada en esta fase documental. Las metas son umbrales propuestos que deben validarse en el spike y ajustarse por decisión registrada.

## 1. Referencias vigentes y aplicación proporcionada

Investigación de fuentes oficiales consultadas 2026-11-12. Los catálogos públicos verifican edición y alcance; no se afirma haber adquirido ni auditado cláusulas completas de estándares de pago. Aplicación orientativa, no certificación.

| Referencia | Edición identificada | Aplicación concreta / evidencia |
|---|---|---|
| [ISO/IEC/IEEE 12207](https://standards.ieee.org/ieee/12207/11416/) | 2026 | Trazar necesidad → requisito → decisión → implementación → prueba; revisión de cambios y riesgos. No implantar burocracia de ciclo de vida completa para una demo |
| [ISO/IEC 25010](https://www.iso.org/standard/78176.html) | 2023 | Modelo para revisar calidad: adecuación funcional, desempeño, compatibilidad, interacción, fiabilidad, seguridad, mantenibilidad, flexibilidad y seguridad frente a daño. Matriz de objetivos observables, no «puntuación ISO» inventada |
| [ISO 9241-210](https://www.iso.org/standard/77520.html) | 2019 | Contexto de uso, necesidades, alternativas y evaluación iterativa con personas; distinguir hipótesis de hallazgos reales |
| [ISO/IEC 20000-1](https://www.iso.org/standard/70636.html) y [enmienda](https://www.iso.org/standard/88434.html) | 2018 + Amd 1:2024 | Responsable de incidentes, soporte, gestión de cambios, respaldo y disponibilidad. La enmienda se registra; no se presume conformidad de un sistema de gestión |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Recomendación mostrada: 12-12-2024 | Objetivo AA en recorridos principales; auditoría automática y manual; declaración limitada al alcance realmente evaluado |
| [OWASP Top 10](https://top10.owasp.org/2025/) | 2025 | Modelo de amenazas, pruebas de autorización, configuración, cadena de suministro, inyección, autenticación, criptografía, integridad, registros y manejo de excepciones. No sustituye una auditoría exhaustiva |
| [Scrum Guide](https://scrumguides.org/download.html) | Noviembre 2020 | Goal, backlog ordenado, incremento inspeccionable y adaptación; DoR es política propia, no compromiso obligatorio de Scrum |
| [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/) | Artículo revisado enero 2024 | Revisión de las diez heurísticas con evidencia por pantalla; errores priorizados y verificados tras corrección |

## 2. Modelo de calidad medible

| Dimensión | Meta propuesta | Medición / condición |
|---|---|---|
| Funcionalidad | 100 % de escenarios Must críticos aprobados | Casos trazados a RF, fixtures deterministas |
| Seguridad | 0 hallazgos críticos/altos abiertos | Revisión manual y pruebas; «sin hallazgos» no significa ausencia de vulnerabilidades |
| Accesibilidad | 0 barreras bloqueantes en recorridos esenciales | Teclado + lector + zoom + revisión WCAG; escáner complementario |
| Rendimiento UI | LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 como objetivos | Datos de campo si existen; laboratorio por separado, no simular p75 de usuarios con Lighthouse |
| IA local | Medir p50/p95, arranque frío/caliente y disponibilidad | Hardware/versiones reales; no fijar promesa universal antes del spike |
| IA nube | Timeout visible y recuperación; latencia registrada | Red y región documentadas; sin ocultar reintentos |
| Calidad IA | Cero requisitos inventados en conjunto crítico de 30 casos | Revisión humana contra fuente; un conjunto pequeño no prueba seguridad universal |
| Recuperación | Catálogo utilizable tras fallo IA | Inyectar error/timeout y verificar acciones no IA |
| Internacionalización | ES/EN sin claves crudas ni truncamiento crítico | Fechas, zonas, pluralización, texto largo |

Los valores Web Vitals son objetivos adoptados, no resultados alcanzados. Antes de incluirlos como afirmación externa, cotejar criterios vigentes de [web.dev/vitals](https://web.dev/articles/vitals) y registrar fecha de consulta específica; esta fase no aporta mediciones de campo.

## 3. Pirámide de pruebas y ambientes

- **Unitarias:** filtros, expiración, reglas de ruta, estados del orquestador, normalización y validación de respuesta; reloj y capacidades inyectables.
- **Contrato:** respuestas reales de adaptadores Firebase sobre formato común; no confundir mocks con prueba de SDK.
- **Integración:** repositorio de catálogo, persistencia local y, si se incorpora, reglas de Firestore con emulador. Sin credenciales reales en fixtures.
- **E2E:** explorar → detalle → explicar → guardar → Mi Ruta; navegación Back/forward, recarga y cambio ES/EN.
- **Manual:** disponibilidad local en hardware compatible, descarga del modelo, accesibilidad y calidad factual; no reemplazable por navegador headless.

Separar fixtures de demo, pruebas locales/emuladores y entorno de demostración. No crear proyectos Firebase ni despliegues en esta misión. La habilitación de un entorno real se resuelve en la fase autorizada de implementación.

## 4. Matriz funcional y negativa

| ID prueba | Requisito | Caso / resultado esperado |
|---|---|---|
| T-CAT-01 | RF-CAT-01/02 | Convocatoria válida con fuente/revisión; incompleta muestra dato desconocido |
| T-CAT-02 | RF-CAT-02 | Vencimiento y zona; no recomendar como abierta tras cierre |
| T-SEARCH-01 | RF-SEARCH-01 | Filtros combinados, limpiar, cero resultados; selección persiste al regresar |
| T-AI-01 | RF-AI-01 | Texto válido → explicación con límites y fuente; datos no presentes no se inventan |
| T-AI-02 | RF-AI-02 | Local disponible/descargable/no compatible; ruta coherente con política |
| T-AI-03 | RF-AI-03 | Modo solicitado distinto del efectivo; etiqueta refleja evidencia real o desconocido |
| T-AI-04 | RF-AI-02 | ONLY_ON_DEVICE falla → no red de modelo; PREFER_ON_DEVICE puede fallback permitido; ONLY_IN_CLOUD falla sin fallback local; PREFER_IN_CLOUD ante fallo de nube puede pasar a local compatible |
| T-AI-05 | RF-AI-02 | Cuota/timeout/cancelación → estado recuperable, sin duplicar petición |
| T-SAVE-01 | RF-SAVE-01 | Guardar, duplicado, quitar/deshacer, recarga, almacenamiento denegado |
| T-ROUTE-01 | RF-ROUTE-01 | Un objetivo y hasta tres pasos editables; ningún envío externo automático |
| T-I18N-01 | RF-I18N-01 | ES/EN, fechas/zona, textos largos; fuente original conserva significado |
| T-ONB-01 | RF-ONB-01 | Primer uso, omitir/repetir, reduced motion, target ausente, storage fallido |
| T-A11Y-01 | RNF-A11Y-01/02 | Teclado, foco, lector, contraste, zoom y orientación |

## 5. Evaluación de IA y amenazas

Preparar 30 casos curados: 10 textos claros; 5 incompletos; 5 contradictorios o vencidos; 5 maliciosos (instrucciones dentro de la convocatoria); 5 en ES/EN con límites de longitud. Cada caso contiene texto fuente permitido, hechos esperados y hechos prohibidos. Etiquetar manualmente fidelidad, cobertura, incertidumbre y siguiente paso; ejecutar contra cada ruta disponible y modelo/SDK fijado. Registrar fallos y discrepancias locales/nube; no presentar como benchmark científico.

Amenazas principales: inyección desde contenido, enlaces maliciosos, suplantación de convocatoria, exposición de perfil a nube no consentida, lectura de rutas de otro usuario, abuso de cuota, logs con datos y dependencias comprometidas. Mitigaciones verificables: texto fuente como datos no instrucciones; allowlist editorial de enlaces; validación de esquemas; políticas de nube explícitas; reglas por UID si hay sincronización; App Check y límites; logs minimizados; lockfile y revisión de dependencias. No otorgar al modelo herramientas para postular, enviar datos o modificar elegibilidad.

## 6. Matriz visual y de accesibilidad

Ejecutar 320, 360, 390, 768, 1024, 1280, 1440 CSS px; vertical y horizontal, zoom 100 %/200 %, reflow a 320 CSS px y casos de 400 % aplicables. Probar Chrome compatible con local y navegador sin local. Móvil real verifica UI/fallback nube, no demuestra IA local.

Revisar WCAG: contraste normal 4.5:1 y grande 3:1; no-texto 3:1 cuando corresponda; foco visible y no oculto; reflow; nombre/rol/valor; errores asociados; mensajes de estado; navegación por teclado; reducción de movimiento. Objetivo de producto de 44 px para controles, sin confundirlo con el mínimo AA de 24 px y sus excepciones en WCAG 2.2. Probar NVDA+Chrome y VoiceOver+Safari si disponibles, declarar combinaciones no probadas.

## 7. Investigación formativa y criterios de salida

Reclutar, con consentimiento, cinco participantes de perfiles prioritarios para prueba formativa del MVP (distinta de la exploración propuesta de 8–12); no se han realizado entrevistas. Tareas sin instrucción de navegación: encontrar oportunidad relevante, explicar requisito, guardar y definir siguiente paso. Registrar ayudas, errores, comprensión y percepción de confianza. Evitar inferencias poblacionales. Si no se logra reclutar, reportar solo evaluación experta y riesgo residual.

Salida a demo: Must aprobados, sin bloqueo de seguridad/accesibilidad, catálogo revisado, origen IA verificable, documentación de limitaciones y respaldo de demo. Toda prueba usa registro: fecha UTC, commit, SDK/modelo, dispositivo, navegador, precondición, entrada sintética, esperado, observado, evidencia, responsable y estado. Los fallos permanecen visibles. No marcar «Done» por existir un test que no se ejecutó.
