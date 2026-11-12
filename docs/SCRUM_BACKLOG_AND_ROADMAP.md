# Product Backlog y calendario de entrega

Fecha base: 12 noviembre 2026. Plan propuesto, capacidad del equipo y acceso a dispositivos aún por confirmar. Esta fase entrega documentación; las fechas posteriores no autorizan por sí mismas implementación, despliegue ni candidatura.

## 1. Product Goal

Permitir que una persona encuentre una oportunidad verificable, comprenda sus requisitos y organice su siguiente paso mediante una experiencia web accesible con IA híbrida demostrable, sin prometer elegibilidad ni depender de un chatbot genérico.

MVP cerrado: Web responsive ES/EN; catálogo editorial acotado; filtros; detalle con fuente y vigencia; explicación contextual vía Firebase AI Logic; guardados y Mi Ruta local con un objetivo activo y hasta tres próximos pasos; guía accesible; origen de inferencia verificable. Android/iOS nativos, scraping masivo, postulación automática, pagos, CV inteligente, notificaciones y red social quedan fuera.

## 2. Roles y cadencia

El propietario ejerce Product Owner y decide alcance/aceptación. Developers son quienes implementen y prueben; identificar responsable de facilitación antes de comenzar. Una persona puede asumir varias responsabilidades, pero no se afirma tener un Scrum Team constituido por describir roles. Daily breve (15 min máximo), refinamiento cuando se requiera, Planning al iniciar cada Sprint, Review y Retrospective al cerrar. Revisiones con evidencia, no solo porcentajes de avance.

Se usan tres Sprints cortos de igual duración, cinco días calendario cada uno: 13–17, 18–22, 23–27 noviembre. El 12 se cierra discovery; 28–30 es contingencia y preparación de envío, no un cuarto Sprint disfrazado. Adaptación comprimida para hackathon, no garantía de Scrum completo si falta equipo/eventos. Fuente: [Scrum Guide 2020](https://scrumguides.org/scrum-guide.html), consultada 2026-11-12. Definition of Ready y MoSCoW son políticas añadidas, no elementos obligatorios de la guía.

## 3. Backlog ordenado y trazable

Tamaños S/M/L son relativos, no estimaciones firmes de horas. Dependencies indican orden técnico. El Product Owner puede reordenar según evidencia.

| PB | Historia | MoSCoW / tamaño | Aceptación resumida | Dependencias / Sprint |
|---|---|---|---|---|
| 01 | Como visitante quiero reconocer fuente y vigencia para evaluar confianza | Must M | RF-CAT-01/02; todo registro con fuente, fecha/revisión y campos desconocidos explícitos | Esquema/editorial / S1 |
| 02 | Como visitante quiero filtrar por objetivo/país para no revisar información irrelevante | Must M | RF-SEARCH-01; limpiar y vacío útil, navegación conserva filtros | PB01 / S1 |
| 03 | Como equipo quiero demostrar ejecución local y nube sin falsificar etiquetas | Must L | RF-AI-02/03; spike hardware real, todos los modos y evidencia de origen | Acceso Firebase y hardware / S1 |
| 04 | Como persona quiero entender requisitos de esta convocatoria | Must L | RF-AI-01; respuesta acotada con fuente y lagunas, sin invenciones en casos críticos | PB01,03 / S2 |
| 05 | Como visitante quiero guardar oportunidades sin entregar datos innecesarios | Must M | RF-SAVE-01; persistencia local, duplicado y deshacer | PB01 / S1 |
| 06 | Como persona quiero un objetivo y tres próximos pasos editables | Must M | RF-ROUTE-01; no equivale a postulación ni se envían datos | PB05 / S2 |
| 07 | Como visitante quiero usar ES/EN y fechas comprensibles | Must M | RF-I18N-01; UI traducida, zonas explícitas, textos largos | Shell / S1–2 |
| 08 | Como usuario de teclado quiero acceder a las mismas funciones | Must M | RNF-A11Y-01/02; teclado, foco, lector, reflow manual | Transversal / S1–3 |
| 09 | Como nuevo usuario quiero una entrada de marca y guía que pueda omitir | Must M | RF-ONB-01; storyboard, reduced motion, repetir, no bloquear | Shell, detalle / S2 |
| 10 | Como usuario quiero saber si la IA enviará datos a nube | Must M | Política visible; opción local-only sin fallback; errores seguros | PB03 / S2 |
| 11 | Como jurado quiero reproducir una demostración honesta | Must M | README EN, setup, limitaciones, datos demo rotulados, video ≤3 min sujeto a bases | PB01–10 / S3 |
| 12 | Como persona quiero mantener mis rutas entre dispositivos | Should L | Authentication y reglas Firestore probadas por UID | Core estable / solo si capacidad |
| 13 | Como usuario quiero descargar una lista de próximos pasos | Could S | Exportación local accesible sin datos ocultos | PB06 / después del core |
| 14 | Como usuario quiero app nativa Android/iOS | Won't para concurso MVP | Investigar compatibilidad, no construir ahora | Post-MVP |
| 15 | Como persona quiero que el sistema postule por mí | Won't | Excluido por riesgo, permisos y alcance | Sin fecha |

## 4. Sprint Goals y entregables

**S1 · 13–17 noviembre: riesgo técnico y recorrido básico.** Día 13: setup autorizado, SDK fijado, spike híbrido en equipo real. Días 14–15: catálogo pequeño revisado, shell y filtros; día 16 guardados/localización; día 17 pruebas y Review. Resultado: catálogo utilizable y evidencia de que el componente híbrido es viable o bloqueo documentado. Si no hay hardware local, no «simular» éxito: resolver acceso o aceptar riesgo competitivo explícito.

**S2 · 18–22 noviembre: valor humano de extremo a extremo.** Explicación contextual, normalización, privacidad/fallback, Mi Ruta, animación y guía. Ejecutar conjunto IA y primeras pruebas formativas. Review con una persona completando tarea realista sin ayuda. Recortar Should antes de aumentar horas o plataformas.

**S3 · 23–27 noviembre: calidad y relato demostrable.** Correcciones de accesibilidad y responsive, seguridad, rendimiento, catálogo, pruebas de regresión y documentos EN. Video y demo reproducible. Feature freeze al terminar 24 noviembre: solo defectos y cumplimiento. Review final 27 con checklist y candidatos de entrega.

## 5. Fecha límite y márgenes

La fecha suministrada por el propietario es **30 noviembre 2026, 14:00 PST (UTC−08:00)**. Conversión: **30 noviembre, 22:00 UTC = 17:00 hora de Perú (UTC−05:00)**. Son tres horas de diferencia. No confundir PST con PDT. La validez de la fecha de concurso debe cotejarse en HACKATHON_COMPLIANCE.md; la conversión no verifica la publicación de la convocatoria.

| Fecha Perú | Hito |
|---|---|
| 12 nov | Discovery, decisiones, riesgos y plan; no producción |
| 13–17 nov | S1 |
| 18–22 nov | S2 |
| 23–27 nov | S3 y preparación de entrega |
| 28 nov | Repetir comprobación de reglas, licencia, repositorio y enlaces |
| 29 nov, antes 17:00 | Paquete final y ensayo de envío, aprobación del propietario |
| 30 nov, antes 14:00 | Meta interna para completar envío autorizado (3 h de margen) |
| 30 nov, 17:00 | Límite suministrado; confirmar bases vigentes |

No programar una nueva función para el 30. Si las reglas oficiales difieren, registrar decisión y recalcular el plan, no ocultar discrepancia. Nadie queda autorizado a publicar la candidatura solo por este calendario.

## 6. Definition of Ready

Historia entendible, actor y valor; RF/RNF vinculados; criterios verificables; dependencias/responsable identificados; datos y fuentes permitidos; riesgos de privacidad y accesibilidad tratados; tamaño cabe en Sprint. Si falta API/hardware decisivo, abrir spike con tiempo límite y resultado esperado, no historia ambigua de implementación.

## 7. Definition of Done

Código revisado en repositorio nuevo; pruebas pertinentes ejecutadas y evidencia por commit; casos negativos cubiertos; errores/estados accesibles; ES/EN completos para función; sin credenciales o PII en logs/fixtures; documentación actualizada; origin IA verdadero; requisitos Must vinculados; no fallos críticos/altos ni bloqueos de recorrido; dependencia/versiones registradas. Una demo grabada no sustituye prueba. Un despliegue, si se solicita posteriormente, añade autorización y comprobación de entorno.

## 8. Capacidad y recorte

Hipótesis: 1–2 desarrolladores con disponibilidad sostenida y un dispositivo Chrome compatible. No se estima velocidad inexistente. Al día 13 calcular capacidad real y reservar al menos 30 % a calidad/contingencia. Si el equipo dispone de menos tiempo: quitar sincronización/cuenta, exportación, personalización visual y ampliación de catálogo. Nunca recortar fuentes, evidencia híbrida, controles de privacidad o accesibilidad crítica. Objetivo inicial de catálogo: 12–20 registros reales revisados entre categorías prioritarias y alcance geográfico explícito; el volumen se ajusta a la capacidad editorial, no se llena con oportunidades inventadas.

## 9. Seguimiento y riesgo

Daily: qué impide el Sprint Goal, próxima acción y dependencia; no inventar burndown con puntos no estimados. Backlog con estados Ready/In progress/Review/Done/Blocked y máximo una historia activa por persona. Riesgos de primer orden: bases cambiantes, acceso local, disponibilidad del SDK, tiempo, calidad de fuentes e IA factual. Cada bloqueo tiene dueño y fecha de reevaluación. Decisiones de recorte se registran en DECISION_LOG.md. Tras cada Review actualizar plan, no mover el deadline silenciosamente.
