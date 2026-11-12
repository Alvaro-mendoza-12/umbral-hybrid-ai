# Personas hipotéticas y recorridos

Fecha: 2026-11-12. **No son entrevistas, estadísticas ni perfiles de personas reales.** Sirven para diseñar pruebas; no justifican por sí solos decisiones de mercado.

## 1. Proto-personas

| ID | Contexto hipotético | Necesidad | Barrera que investigar | Riesgo de diseño |
|---|---|---|---|---|
| P-01 Transición laboral | Adulto con móvil y tiempo limitado | Saber qué requisito falta y cómo avanzar | Convocatorias fragmentadas, vocabulario formal | Formularios largos y ranking incomprensible |
| P-02 Estudiante/egresado | Busca beca o formación compatible con recursos | Comprender coste, documentos y fechas | Confundir beca parcial con gratuita; elegibilidad internacional | Ocultar condiciones importantes tras resúmenes |
| P-03 Trabajador | Busca una capacitación concreta | Comparar modalidad y dedicación | Costes y horarios no claramente publicados | Presuponer disponibilidad de tiempo |
| P-04 Emprendedor | Busca formación o convocatoria de apoyo | Identificar tipo de apoyo y condiciones | Confundir formación, financiación y concurso | Presentar asesoramiento como garantía económica |

No recopilar edad exacta, ingresos, discapacidad, documento de identidad ni historial de salud en el MVP. País de interés es un filtro voluntario, no geolocalización obligatoria.

## 2. Journey principal

| Etapa | Pregunta de la persona | Interfaz / acción | Estado y fallo previstos | Evidencia a recoger |
|---|---|---|---|---|
| Entrar | ¿Me sirve? | Propuesta breve; acceso directo a Explorar; guía opcional | Reduced motion, omisión, no registro forzado | Comprensión espontánea en 10–15 segundos |
| Descubrir | ¿Qué opciones tengo? | Categoría/filtros visibles, resultados acotados | Vacío explica cómo ampliar filtros | Primera opción pertinente encontrada |
| Entender | ¿Qué me piden? | Ficha con fuente y «Explicar requisitos» | IA indisponible: requisitos originales siguen visibles | Repetir correctamente dos requisitos críticos |
| Decidir | ¿Qué puedo hacer ahora? | Guardar y elegir objetivo | Sin promesa de admisión; fecha vencida advertida | Distinción entre requisito y recomendación |
| Actuar | ¿Cuál es mi siguiente paso? | Hasta tres pasos editables | Acción externa se abre sólo por decisión del usuario | Primer paso definido sin ayuda |
| Volver | ¿Qué dejé pendiente? | Mi Ruta con estado y fecha de revisión | Datos locales ausentes explicados, no culpa al usuario | Retomar tarea y corregir un paso |

## 3. Contrato de medición de «tres interacciones»

Una interacción es una activación intencional (clic, tap, Enter o selección). Escribir texto se registra aparte, junto con tiempo, errores y pasos de teclado; no se oculta esfuerzo agrupando formularios. Punto inicial: Explorar cargado, sin overlay de onboarding. Navegación del navegador, login y permisos no se borran del resultado: se informan como recorridos alternativos.

| ID | Tarea | Recorrido objetivo | Activaciones mínimas | Condiciones |
|---|---|---|---:|---|
| J-01 | Guardar una oportunidad visible | Abrir ficha → Guardar | 2 (o 1 si Guardar está directamente en la lista) | Usuario invitado; persistencia local disponible |
| J-02 | Comprender requisitos | Abrir ficha → Explicar requisitos | 2 | La explicación puede pedir consentimiento de nube; entonces 3 |
| J-03 | Abrir fuente oficial | Abrir ficha → Ver convocatoria oficial | 2 | Se anuncia salida a sitio externo |
| J-04 | Retomar una tarea | Mi Ruta → paso pendiente | 2 | Existe una ruta guardada |
| J-05 | Acotar categoría | Abrir selector de categoría → seleccionar | 2 | Si categoría está como control directo, 1 |
| J-06 | Crear ruta desde una ficha | Abrir ficha → Preparar pasos → Confirmar ruta | 3 | Sin editar texto; si falta consentimiento o datos, se registra >3 y no se afirma cumplimiento |

La meta de tres activaciones no aplica artificialmente a alta de cuenta, edición compleja, consentimiento o reanudación de errores. Se prioriza comprensión y control sobre minimizar clics.

## 4. Recorridos alternativos y accesibilidad

- **Teclado:** omitir al contenido, foco visible, orden lógico, abrir ficha, activar IA y regresar al desencadenante. La guía no debe atrapar el foco sin salida.
- **Lector de pantalla:** título de página, región de resultados, actualización breve del número de resultados, estado de IA en región live moderada. No leer tokens de respuesta uno a uno.
- **Conexión débil:** catálogo en caché claramente fechado; botón manual de reintento; ninguna petición de nube silenciosa cuando la preferencia sea sólo local.
- **Local no soportado:** explicar «IA local no disponible en este dispositivo» y presentar nube conforme a elección. No llamar al móvil «incompatible» con toda la aplicación.
- **Oportunidad vencida:** mantener la ficha guardada para historial, impedir que se presente como abierta, enlazar a la fuente para comprobar posibles cambios.
- **Idioma distinto en la fuente:** mostrar idioma original; diferenciar traducción/resumen de texto oficial.

## 5. Plan de investigación real

Separar dos etapas: investigación exploratoria con 8–12 adultos de los dos segmentos prioritarios y prueba formativa del MVP con 5 participantes. Reclutar procurando diversidad de familiaridad digital y al menos una persona que utilice tecnología asistiva si es posible. Consentimiento, explicación de que no se evalúa a la persona, tareas sin datos privados, posibilidad de parar y eliminación de notas identificables. No grabar sin autorización específica.

Preguntas no dirigidas: «Cuéntame la última vez que buscaste una oportunidad»; «¿Cómo comprobaste que podías postular?»; «Muéstrame qué harías a continuación». Evitar «¿Te gustaría una IA que…?». Observar búsqueda, lectura de requisitos, guardado y definición del paso siguiente. Separar lo observado de lo dicho y de la interpretación del investigador.

Registrar versión del prototipo, dispositivo/ancho, idioma, éxito sin ayuda/con ayuda/fallo, tiempo, activaciones, errores y citas consentidas anonimizadas. No publicar porcentajes sin denominador. Clasificar hallazgos por gravedad: bloquea, provoca interpretación incorrecta, aumenta esfuerzo, preferencia estética. Repetir las tareas afectadas después de corregir.

## 6. Trazabilidad y fuentes

P-01/P-02 → J-01/J-02/J-06 → RF-CAT-01, RF-AI-01, RF-ROUTE-01. P-03/P-04 → filtros y transparencia de condiciones → RF-SEARCH-01, RF-CAT-02. Journey accesible → RNF-A11Y-01/02.

Referencias primarias para el método y controles, fecha de elaboración 2026-11-12; verificación web en documentos especializados: [ISO 9241-210](https://www.iso.org/standard/77520.html), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI involucrar usuarios](https://www.w3.org/WAI/planning/involving-users/). Estas referencias no acreditan que se haya ejecutado el estudio.

### Relación entre investigación y prueba de interfaz

Una exploración inicial propuesta de 8–12 personas en cuatro segmentos puede complementar una prueba formativa posterior del MVP con cinco participantes; tienen fines distintos y no son muestras representativas. Si se realiza una sesión preliminar de 5–8 con menos segmentos, será piloto y se documentará su alcance; ninguna de estas actividades se ha ejecutado. En Explorar se puede guardar directamente desde el resultado (una activación) o abrir primero la ficha y guardar allí (dos); ambas rutas conservan la posibilidad de revisar la fuente.
