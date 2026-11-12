# Investigación de mercado y evidencia humana

Fecha de consulta: **12 de noviembre de 2026**. Fase: investigación documental, no validación de mercado. Este documento distingue **E: evidencia publicada**, **I: inferencia de diseño** y **H: hipótesis pendiente**. No se realizaron entrevistas, encuestas ni pruebas con usuarios. Las fichas de competidores se basan en documentación pública, no en una auditoría exhaustiva de sus interfaces autenticadas.

## 1. Problema y oportunidad

**E1.** La OIT informó que el 20,4 % de jóvenes de 15–24 años del mundo no estaba empleado ni estudiando ni formándose en **2023**. No es una medición de 2026, del Perú ni del mercado alcanzable de UMBRAL. El informe también señala desigualdades regionales y de género y acceso insuficiente a trabajo decente [S1].

**E2.** Las plataformas revisadas ya ofrecen búsqueda, filtros, recomendaciones, formación o financiación. Indeed documenta incluso búsqueda en lenguaje natural. Por tanto, «tener IA» y «reunir oportunidades» no constituyen por sí solos diferenciación [S2–S9].

**I1.** La oportunidad es reducir la distancia entre descubrir una opción y saber qué hacer: una ficha confiable, requisitos comprensibles, incertidumbres visibles y una siguiente acción guardable. UMBRAL debe complementar los portales, no sustituir a las entidades que admiten postulaciones.

**H1.** Una ruta breve entre categorías (empleo → formación necesaria, beca → preparación de requisitos) puede ser más útil que un catálogo general. Debe probarse; las fuentes no demuestran disposición a usar o pagar UMBRAL.

## 2. Matriz competitiva

| Solución | Capacidad documentada | Fricción o límite documentado | Oportunidad para UMBRAL (inferencia, no defecto probado) |
|---|---|---|---|
| LinkedIn | Filtros de ubicación, fecha, experiencia, contratación y Easy Apply; orden personalizado [S2] | Diversidad de criterios; la ayuda indica hasta 1.000 resultados por búsqueda. No demuestra saturación subjetiva | Priorizar pocas opciones explicando por qué aparecen y qué falta; no competir por red profesional |
| Indeed | Búsqueda y filtros, preferencias, salarios, Career Scout en lenguaje natural [S3] | Disponibilidad del filtro de idioma depende del sitio; puede mostrar zonas cercanas si hay poca oferta local | No cambiar silenciosamente país o alcance; separar coincidencias estrictas de alternativas |
| Google Jobs | Descubrimiento transversal, filtros, guardar y acceder al sitio de postulación [S4] | Algunas funciones se limitan a EE. UU.; la postulación remite a terceros | Hacer explícita elegibilidad geográfica y conservar seguimiento después de salir al proveedor |
| Coursera | Certificados profesionales, itinerarios y formación orientada al trabajo [S5] | Oferta de pago; programas y ayudas tienen condiciones. El certificado no equivale a empleo garantizado | Mostrar costo conocido/desconocido, duración y relación con un objetivo; nunca etiquetar todo como gratuito |
| PRONABEC | Convocatorias, modalidades, cronograma, bases y modificaciones [S6] | Requisitos y fechas dependen de convocatoria y modalidad; la página vigente contiene bases y resoluciones modificatorias | Presentar versión y fecha de verificación; no mezclar requisitos entre convocatorias |
| DAAD | Becas internacionales con requisitos académicos y lingüísticos [S7] | En el programa revisado la admisión universitaria tiene requisitos y plazos propios; beca no sustituye admisión | Separar «postular a beca» de «postular a universidad» como pasos distintos |
| Empleos Perú / MTPE | Servicio oficial de intermediación y Certificado Único Laboral gratuito [S8] | Para obtener CUL se requiere registro; el servicio gestiona documentación personal | Explicar el trámite y enlazar al organismo; UMBRAL no necesita almacenar certificados ni identidad oficial |
| Startup Perú / ProInnóvate | Capital semilla y acompañamiento para startups con PMV y tracción [S9] | No está orientado indistintamente a toda idea de negocio; la página revisada indica convocatoria cerrada | Mostrar etapa del emprendimiento y estado cerrado; no recomendarla como convocatoria abierta |

No se concluye que los competidores carezcan de asistentes, rutas o accesibilidad. Tampoco se presentan sus funcionalidades como exclusivas de UMBRAL. Esta revisión no incluye acuerdos de API ni autorización para reutilizar anuncios: enlazar una fuente no concede permiso de extracción o republicación masiva.

## 3. Hallazgos verificables que afectan al catálogo

- **PRONABEC:** la página consultada muestra convocatoria 2027, inscripción al ENP en octubre de 2026, publicación de aptos el 11/11 y examen el 22/11. No debe presentarse como inscripción abierta el 12/11. Bases y modificaciones son la fuente de requisitos, no un resumen de IA [S6].
- **Startup Perú:** la ficha revisada declara «Convocatoria Cerrada». Puede servir como referencia histórica, nunca como oportunidad vigente sin una nueva fuente [S9].
- **DAAD:** la admisión de la universidad y la beca son procesos diferentes; hay requisitos de idioma y restricciones temporales [S7].
- **Indeed:** búsqueda conversacional ya existe [S3]. La propuesta debe centrarse en trazabilidad y ejecución, no afirmar novedad por usar un modelo.

### Política de investigación y actualización propuesta

Cada oportunidad debe contener `sourceUrl`, `provider`, `countryEligibility`, `language`, `deadline`, `timezone`, `status`, `verifiedAt`, `verificationMethod`, `requirementsVersion` y responsable de revisión. «Verificada» significa que se contrastó la información con una fuente identificada en una fecha; no garantiza admisión, ausencia absoluta de fraude ni disponibilidad futura. Fechas ambiguas permanecen como desconocidas y bloquean recomendaciones urgentes. El registro conserva originales y traducciones separados. El MVP utiliza curación manual, no rastreo indiscriminado.

## 4. Segmentos y necesidades: hipótesis de trabajo

| Segmento | Trabajo que quiere resolver | Barrera hipotética | Diseño a validar |
|---|---|---|---|
| Estudiante adulto que busca beca | Entender si puede postular y reunir requisitos | Lenguaje administrativo, varias fechas y fuentes | Checklist con evidencia y «falta confirmar», sin puntaje inventado de elegibilidad |
| Persona que busca empleo | Encontrar opciones compatibles y decidir dónde concentrarse | Anuncios irrelevantes, poca claridad sobre experiencia | Filtros explícitos y tres sugerencias justificadas, más «ver todas» |
| Trabajador que quiere cambiar o mejorar | Identificar formación viable con su tiempo y presupuesto | Costos/duración poco comparables, exceso de opciones | Comparar costo y dedicación, guardar un siguiente paso |
| Emprendedor inicial | Distinguir capacitación de financiación apropiada a su etapa | Confundir idea, PMV y tracción; convocatorias cerradas | Filtro por etapa y explicación del requisito con enlace |

Prioridad propuesta: adultos estudiantes y buscadores de empleo, con cursos como puente. Emprendimiento debe ser una categoría pequeña y curada, no otro producto completo. Internacionalización de interfaz no equivale a cobertura mundial del catálogo. Empezar con Perú y oportunidades internacionales cuya elegibilidad incluya explícitamente al segmento; no asumirla por estar en español.

No construir perfiles psicológicos ni inferir pobreza, discapacidad, etnia o salud. Si una convocatoria depende de una condición sensible, mostrarla como requisito para autoevaluación, sin exigir almacenar la respuesta en el MVP.

## 5. Validación con personas reales pendiente

Plan propuesto, no ejecutado: 8–12 adultos, distribuidos entre los cuatro segmentos, con distinta familiaridad digital; al menos dos sesiones con tecnologías de apoyo o necesidades de accesibilidad, mediante reclutamiento voluntario y consentimiento. Muestra cualitativa de conveniencia: no estimará prevalencias ni representará a todos los países. Evitar menores en esta primera ronda.

### Entrevista breve (20 minutos)

1. «Cuéntame la última vez que buscaste una oportunidad y qué hiciste después».
2. Pedir que muestre, si desea, fuentes utilizadas sin revelar datos privados.
3. «¿Qué requisito te resultó difícil de entender? ¿Cómo lo comprobaste?».
4. «¿Qué te hizo abandonar o continuar?».
5. «¿Cómo recuerdas fechas y pasos pendientes?».
6. «¿Qué información no compartirías con un asistente?».

No preguntar «¿te gustaría una app que resuelva todo?» ni presentar aprobación verbal como validación.

### Pruebas de tareas

A. Encontrar una opción compatible con país y objetivo. B. Identificar dos requisitos y una incertidumbre. C. Guardarla y añadir un siguiente paso. D. Reanudar ese paso en otra visita. E. Entender la diferencia entre procesamiento local y nube. Usar oportunidades de prueba claramente marcadas o fichas actuales verificadas; nunca realizar postulaciones reales.

Registrar éxito sin ayuda, acciones, tiempo, errores, abandono, comprensión de fuente/fecha y confianza calibrada. Metas iniciales: ≥80 % de tareas principales sin ayuda; 100 % de participantes deben poder distinguir un requisito confirmado de uno desconocido tras la explicación. Son criterios de producto, no resultados. Un único error grave de elegibilidad obliga a corregir antes de demo. No optimizar solo clics: tres interacciones rápidas sin comprensión no son éxito.

## 6. Psicología aplicada y consecuencias de diseño

| Base | Decisión concreta de UMBRAL | Comprobación propuesta |
|---|---|---|
| Carga cognitiva y claridad [S10] | Formulario inicial mínimo: objetivo y país; perfil opcional progresivo; resumen con costo, cierre y requisitos antes de detalle | Medir dudas, retrocesos y abandono; no ocultar información crítica por minimalismo |
| Reconocimiento frente a recuerdo [S11] | Etiquetas visibles «Explorar», «Mi Ruta», «Guardados»; filtros activos legibles; siguiente paso persistente | Reanudar tarea tras interrupción sin recordar comandos ni conversaciones |
| Divulgación progresiva [S12] | Resumen primero y requisitos completos bajo expansión; filtros avanzados en panel | Encontrar fuente y exclusiones sin ayuda; no esconderlas tras múltiples capas |
| Atención y accesibilidad cognitiva [S13–S15] | Sin carruseles automáticos, banners pulsantes ni interrupciones; ruta corta con estado actual y pasos pendientes | Sesiones interrumpidas, teclado y lectura; confirmar que el usuario puede volver al punto previo |
| Ley de Hick, evidencia experimental [S16] | Agrupar decisiones por objetivo y ofrecer una acción principal por contexto | Comparar tiempo y errores con prototipo; no convertir la ley en la falsa regla «menos opciones siempre es mejor» |
| Ley de Fitts, evidencia experimental [S17] | Objetivos de pulsación amplios y separados; acciones frecuentes próximas al contenido; sin controles diminutos | Medir toques erróneos en 320/360 px, orientación horizontal y uso con una mano |
| Microinteracciones como comunicación | «Guardado» con texto y estado persistente; error explica recuperación; no depender solo de color | Lector de pantalla recibe actualización; estado sigue claro sin animación |

Las leyes experimentales no predicen por sí solas segundos de uso de UMBRAL ni sustituyen pruebas. Las guías cognitivas W3C citadas son suplementarias: aplicarlas no certifica conformidad WCAG.

## 7. Diez heurísticas de Nielsen traducidas al producto

Adaptación propuesta [S18], no evaluación superada:

1. Estado visible: carga, resultado, origen de inferencia y verificación.
2. Lenguaje del usuario: «Qué necesitas» antes que jerga técnica.
3. Control: cancelar, omitir guía y deshacer guardado.
4. Consistencia: mismos nombres y controles en todas las pantallas.
5. Prevención: aviso de cierre y validación antes de guardar pasos.
6. Reconocimiento: filtros y próximos pasos visibles.
7. Eficiencia: repetir búsquedas sin repetir configuración.
8. Minimalismo: priorizar lo pertinente sin esconder exclusiones.
9. Recuperación: error comprensible con reintento o alternativa sin IA.
10. Ayuda contextual: explicaciones breves y guía repetible.

## 8. Decisión estratégica

Diferenciación propuesta: **«Comprende una oportunidad confiable y convierte la intención en tu próximo paso»**. Su defensa proviene de curación, requisitos trazables, continuidad entre descubrimiento y Mi Ruta y transparencia de IA híbrida. Debe demostrarse en una tarea concreta, no en un catálogo extenso. No se estiman TAM/SAM/SOM, tasas de conversión o ingresos sin datos suficientes. El primer indicador es una acción útil comprendida y guardada, no mensajes enviados al chatbot ni tiempo de pantalla.

## Fuentes

Todas consultadas el 12/11/2026. Se accedió al contenido de las páginas de producto y guías. S16 y S17 se verificaron mediante registros bibliográficos y resúmenes, no mediante revisión íntegra de los artículos. El acceso directo a S8 devolvió error y solo pudo contrastarse su ficha indexada oficial; no se usa como base de requisitos operativos detallados. En fuentes dinámicas, revalidar antes de implementar catálogos.

- **S1. OIT**, noticia del informe Global Employment Trends for Youth 2024, datos 2023: https://www.ilo.org/resource/news/number-youth-not-employment-education-or-training-neet-cause-concern
- **S2. LinkedIn Help**, Filter and sort job search results: https://www.linkedin.com/help/linkedin/answer/a507441/filter-and-sort-job-search-results?lang=en
- **S3. Indeed Help**, Improving Your Job Searches: https://www.indeed.com/help/job-seekers/articles/204488950-improving-your-job-searches-tips-and-help?co=US&hl=en
- **S4. Google Search Help**, Search for jobs on Google: https://support.google.com/websearch/answer/7498276?hl=en
- **S5. Coursera**, Professional Certificates: https://www.coursera.org/professional-certificates
- **S6. PRONABEC**, Beca 18, convocatoria vigente y enlaces a bases/modificaciones: https://www.pronabec.gob.pe/beca-18/
- **S7. DAAD**, Study Scholarships – Master Studies for All Academic Disciplines: https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database?detail=50026200
- **S8. MTPE**, Obtener tu Certificado Único Laboral (ficha oficial indexada, acceso directo incompleto): https://www.gob.pe/47089-obtener-tu-certificado-unico-laboral
- **S9. Startup Perú / ProInnóvate**, Emprendimientos Innovadores: https://startup.proinnovate.gob.pe/concursos/emprendimientos-innovadores/
- **S10. NN/g**, Four Principles to Reduce Cognitive Load in Forms: https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/
- **S11. NN/g**, Memory Recognition and Recall in User Interfaces: https://www.nngroup.com/articles/recognition-and-recall/
- **S12. NN/g**, Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- **S13. W3C WAI**, Make Each Step Clear: https://www.w3.org/WAI/WCAG2/supplemental/patterns/o1p04-clear-steps/
- **S14. W3C WAI**, Limit Interruptions: https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p01-minimal-interruptions/
- **S15. W3C WAI**, Make Short Critical Paths: https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p02-short-paths/
- **S16. Hick, W. E. (1952)**, On the Rate of Gain of Information, fuente editorial/abstract: https://doi.org/10.1080/17470215208416600
- **S17. Fitts, P. M. (1954)**, The information capacity of the human motor system in controlling the amplitude of movement, registro bibliográfico primario: https://pubmed.ncbi.nlm.nih.gov/13174710/ ; DOI: https://doi.org/10.1037/h0055392
- **S18. Nielsen, J. / NN/g**, 10 Usability Heuristics for User Interface Design: https://www.nngroup.com/articles/ten-usability-heuristics/

### Relación entre rondas de investigación propuestas

La exploración inicial de 8–12 personas de cuatro segmentos y la prueba formativa de cinco participantes del MVP son actividades distintas: la primera investiga necesidades; la segunda observa tareas concretas. Son propuestas sujetas a disponibilidad, no investigaciones realizadas ni tamaños representativos. El objetivo de incluir personas con necesidades de accesibilidad se aplica de forma explícita al reclutamiento; documentar las limitaciones si no se consigue.
