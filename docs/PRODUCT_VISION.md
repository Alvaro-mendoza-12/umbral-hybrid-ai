# Visión de producto: UMBRAL Hybrid AI

Estado: propuesta de producto para discovery; no describe una aplicación implementada. Fecha: 2026-11-12.

## 1. Problema y posición

**Problema humano propuesto:** una persona puede encontrar convocatorias, pero no sabe cuáles son pertinentes, si entiende correctamente sus requisitos ni qué hacer primero. La hipótesis central no es «faltan ofertas», sino «falta convertir información verificable en una decisión y una próxima acción».

**Propuesta de valor:** UMBRAL reúne una selección acotada de oportunidades con origen trazable, explica requisitos en lenguaje claro y ayuda a construir una ruta personal corta, con IA contextual que puede resolver tareas compatibles en el dispositivo o recurrir a la nube mediante Firebase AI Logic.

**Frase para el jurado:** “From a verified opportunity to a clear next step, with hybrid AI that makes its execution path visible.”

No se garantiza admisión, contratación, financiación, elegibilidad definitiva ni funcionamiento local universal. UMBRAL no es intermediario de selección ni presenta solicitudes en nombre del usuario.

## 2. Público y trabajo por resolver

Prioridad inicial: personas adultas hispanohablantes que buscan empleo o formación y necesitan comprender una oportunidad concreta. Interfaz ES/EN y esquema de datos internacional desde el principio; catálogo piloto con foco latinoamericano y oportunidades internacionales cuya elegibilidad pueda documentarse.

| Segmento | Trabajo por resolver | Prioridad |
|---|---|---|
| Persona en transición laboral | Encontrar una opción pertinente y un paso realizable | Principal |
| Estudiante adulto o egresado | Entender becas/cursos y documentos requeridos | Principal |
| Trabajador que busca mejorar capacidades | Comparar coste, modalidad y dedicación | Secundario |
| Emprendedor | Comprender programas y formación empresarial | Secundario, colección pequeña |

Son segmentos hipotéticos, no personas entrevistadas. La investigación deberá comprobar si comparten un mismo flujo antes de ampliar personalización.

## 3. Modelo operativo

1. Un editor selecciona una oportunidad en una fuente primaria autorizada.
2. Registra fecha de revisión, URL, organizador, fechas, país/elegibilidad, coste, modalidad y requisitos citados.
3. La oportunidad se publica sólo al superar controles de integridad; «verificada» significa revisión editorial de la fuente, no garantía del oferente ni auditoría antifraude.
4. La persona explora sin registro; filtros explícitos reducen el conjunto.
5. En la ficha, una acción contextual explica requisitos o propone una lista de pasos a partir de información suministrada. Los datos faltantes permanecen desconocidos.
6. La persona guarda una opción y confirma hasta tres próximos pasos en Mi Ruta.
7. La solicitud real ocurre en el sitio oficial, al que se sale con una indicación visible.

No hay scraping masivo, ranking opaco de personas, mensajería entre usuarios, bolsa de CV ni marketplace transaccional en el MVP.

## 4. MVP exacto propuesto

- Web responsive ES/EN. Navegación: Explorar, Mi Ruta y ajustes accesibles.
- Catálogo editorial de **12–20 oportunidades reales** como objetivo de preparación, no inventario ya conseguido. Cuatro categorías: empleo, becas, cursos y emprendimiento. Antes de ampliar volumen, asegurar fuentes vigentes y diversidad de elegibilidad; mostrar explícitamente países de alcance.
- Buscar por texto y filtrar por categoría, país/elegibilidad declarada y modalidad. Orden comprensible, sin prometer un porcentaje de compatibilidad.
- Ficha con requisitos, fecha límite/zona horaria cuando exista, coste conocido o «no informado», fuente y última revisión.
- Acciones de IA acotadas: «Explicar requisitos» y «Preparar mis próximos pasos». Sin conversación abierta persistente. Ninguna respuesta sustituye la fuente.
- Un solo objetivo activo y hasta tres próximos pasos editables en Mi Ruta; guardar oportunidades y cambiar su estado manualmente.
- Continuidad local para guardados/ruta con advertencia sobre dispositivo compartido. Autenticación y sincronización son **Should**, recortables si amenazan validación híbrida.
- Entrada animada no bloqueante y guía de 3–4 pasos repetible; reduced motion y omisión accesible.
- Comprobación de capacidad, modo de inferencia visible y evidencia técnica de ejecución. Si no hay IA disponible, catálogo y acciones manuales siguen siendo utilizables.

### Must / Should / Could / Won't

| Nivel | Alcance |
|---|---|
| Must | Catálogo trazable, filtros, ficha, guardados/ruta local, dos tareas IA, local/nube verificables cuando soportadas, ES/EN, accesibilidad, onboarding |
| Should | Cuenta opcional y sincronización, revisión editorial automatizada de enlaces |
| Could | Un segundo país de curación con revisión completa, comparación de dos fichas |
| Won't (esta entrega) | Apps nativas, pagos, postulaciones automáticas, scraping masivo, CV/documentos personales, recomendaciones financieras, chat social, agentes autónomos |

## 5. Diferenciación y alternativas

- **Catálogo agregador:** barato de construir, pero competiría en volumen con plataformas consolidadas. Descartado como diferenciador principal.
- **Chatbot orientador:** flexible, pero exige formular bien preguntas y dificulta auditar fuentes y acciones. Descartado como interfaz dominante.
- **Acompañante centrado en la oportunidad (recomendado):** ficha verificable, explicación focalizada y ruta corta. Reduce ambición y vuelve la inferencia híbrida observable.

Las ventajas de comprensión, confianza o finalización son hipótesis a medir, no superioridad competitiva demostrada.

## 6. Metas y criterios de decisión

| Hipótesis | Evidencia necesaria | Umbral exploratorio propuesto |
|---|---|---|
| Se entiende qué hacer a continuación | Prueba moderada con tarea real | 4 de 5 participantes completan una ruta sin ayuda |
| IA añade claridad sin inventar | Revisión de al menos 30 casos con fuente | Cero fechas/requisitos críticos inventados; errores bloquean release |
| Diseño reduce fricción | Medición de recorridos predefinidos | Guardar y abrir explicación en ≤3 activaciones desde Explorar |
| Es realmente híbrida | Registro reproducible de dos ejecuciones | Caso local y caso nube con evidencia del proveedor, no sólo etiqueta UI |
| Conserva utilidad sin IA | Prueba offline y fallo del proveedor | Guardar, leer caché y editar ruta manual no quedan bloqueados |

Muestras pequeñas sirven para encontrar problemas, no para inferir porcentajes poblacionales. Métricas de impacto futuro: comprensión de requisitos, pasos completados, regreso voluntario y solicitudes realizadas por declaración del usuario. No usar tiempo en pantalla como objetivo principal.

## 7. Evolución después de la competición

Primero validar comprensión, costes y calidad editorial; después ampliar catálogo/idiomas, sincronización y colaboración con fuentes públicas. Evaluar Android/iOS sólo tras una prueba de compatibilidad nativa y demanda real. Personalización futura debe ser explicable, corregible y no usar atributos sensibles para excluir personas.

## 8. Evidencia, restricciones y enlaces

Las obligaciones provienen de la misión del propietario. La comparación externa se documenta en [MARKET_RESEARCH](MARKET_RESEARCH.md); las capacidades del proveedor en [HYBRID_AI_ARCHITECTURE](HYBRID_AI_ARCHITECTURE.md). No se han realizado entrevistas, experimentos, pruebas funcionales ni mediciones de conversión en esta fase.

Referencias para futura validación (fecha de elaboración: 2026-11-12; verificación web en documentos especializados): [Firebase AI Logic](https://firebase.google.com/docs/ai-logic), [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/). Los hallazgos técnicos concretos deben remitirse al documento especializado, sin inferir compatibilidad a partir de esta visión.

La exportación local de la ruta es **Could**, después del flujo esencial.
