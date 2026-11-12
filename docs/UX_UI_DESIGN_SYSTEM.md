# UMBRAL HYBRID AI · Sistema UX/UI

Estado: especificación propuesta, no interfaz implementada ni validada con usuarios. Fecha: 2026-11-12. Los valores visuales siguientes son decisiones de diseño del nuevo producto; no se afirma que sean colores heredados del original.

## 1. Dirección y alternativas

Se compararon tres modelos: catálogo con muchas tarjetas (fácil de construir, difícil priorización), conversación como pantalla principal (flexible pero oculta acciones y depende de prompts), y espacio orientado a una próxima acción. Se recomienda el tercero: una lista editorial de oportunidades, explicación contextual y una ruta personal. La IA está detrás de acciones explícitas, no de una caja de chat vacía.

La promesa visual es «claridad para dar tu siguiente paso», no una estética de terminal ni un panel de indicadores. Una pantalla responde a una pregunta principal. El producto no promete empleo, admisión o financiamiento. «Verificada» significa revisión editorial de origen y vigencia, nunca garantía del resultado.

## 2. Estructura de la experiencia

- **Explorar:** objetivo activo, país/alcance geográfico, lista de resultados y filtros. Arranque útil sin cuenta. No carrusel de categorías ni muro de tarjetas.
- **Detalle:** título, entidad, localización/modalidad, fecha límite y zona, requisitos esenciales, fuente y fecha de revisión. Acciones: «Guardar en Mi Ruta», «Entender requisitos», «Ver convocatoria oficial».
- **Mi Ruta:** oportunidades guardadas, un objetivo activo y hasta tres tareas activas globales editables, que pueden vincularse a oportunidades. No gamificación de ansiedad ni rachas.
- **Perfil:** idioma, país de interés y objetivo voluntario. No pedir documento de identidad, CV completo, ingresos, salud o fecha de nacimiento para explorar.
- **Asistente contextual:** panel de tarea junto al detalle en escritorio; vista completa en móvil. Devuelve resumen, requisitos explícitos y puntos no confirmados. No acumula una conversación como producto principal.

## 3. Tokens propuestos

| Token | Valor propuesto | Regla |
|---|---|---|
| `color.canvas` | `#F7F8FA` | Fondo general claro |
| `color.surface` | `#FFFFFF` | Superficies, campos |
| `color.text` | `#172033` | Texto principal |
| `color.textMuted` | `#475569` | Secundario; nunca menor contraste por opacidad |
| `color.primary` | `#174C3C` | Acción principal, texto blanco |
| `color.primarySoft` | `#E4F0E9` | Selección con icono/etiqueta además del color |
| `color.accent` | `#D5EA77` | Identidad decorativa, texto oscuro; no texto sobre blanco |
| `color.error` | `#A82222` | Error con mensaje e icono |
| `color.focus` | `#1D4ED8` | Anillo visible de 3 px con separación |
| `radius` | 8 / 12 / 20 px | Campos / paneles / contenedores destacados |
| `space` | 4, 8, 12, 16, 24, 32, 48, 64 px | Sin valores arbitrarios salvo ajustes ópticos documentados |
| `type` | Sistema, fallback sans-serif | Evitar descarga tipográfica bloqueante |
| `fontSize` | 14, 16, 18, 24, 32, 40 px | Cuerpo 16; auxiliares 14 mínimo propuesto |
| `lineHeight` | 1.5 cuerpo / 1.15 títulos | Respetar ajustes del navegador |
| `measure` | 65 caracteres | Límite orientativo de párrafo |
| `motion` | 120 / 180 / 240 ms | Interacciones, paneles, navegación |

Estos pares deben comprobarse sobre la interfaz real antes de aceptación; no se declara conformidad por definir una paleta. No introducir modo oscuro en el MVP si duplica la matriz de pruebas sin aportar evidencia de necesidad.

## 4. Componentes y estados

**OpportunityRow:** organización, título, categoría, modalidad/localización, fecha límite y estado editorial. Máximo dos líneas para descripción; título puede crecer sin cortar información crítica. Área de enlace definida, guardar como botón separado; no botones anidados en enlaces.

**PrimaryAction:** etiqueta con verbo y objeto; un estilo primario por contexto. Área interactiva objetivo 44 × 44 px o mayor. Estados normal, hover, foco, activo, ocupado y deshabilitado. Una acción deshabilitada explica el requisito faltante cerca de ella.

**FilterBar:** dos filtros frecuentes visibles (tipo, país) y «Más filtros». Aplicar y limpiar explícitos en móvil. Persistir selección al volver del detalle. Chips removibles con nombre accesible, no solo una x.

**AIResult:** título de tarea, modo realmente observado («En este dispositivo», «En la nube» o «Origen no confirmado»), fecha, fuentes de contenido, incertidumbres y acciones. Separar fuente del contenido de lugar de ejecución. La UI no puede inferir el origen a partir del modo solicitado. «Reintentar» no borra la información previa útil.

**SourceEvidence:** enlace oficial, revisión editorial y estado. Si falta un dato, mostrar «No informado por la fuente». No completar con IA salarios, fechas, elegibilidad ni condiciones que no estén documentadas.

**Task:** acción, fecha voluntaria y estado pendiente/en curso/completada. El seguimiento de cada oportunidad tiene estado independiente: guardada/preparando/enviada/cerrada. Deshacer tras completar o quitar. «Abrir fuente» nunca equivale a «Postulación enviada».

Estados mínimos por vista: cargando, lista útil, vacío inicial, sin coincidencias, sin conexión, fallo recuperable, contenido desactualizado, acceso restringido. El catálogo sigue siendo útil si la IA falla. Sin conexión se muestra fecha de caché; no se simula una actualización.

## 5. Responsive y reflow

| Ancho CSS | Composición | Comportamiento |
|---|---|---|
| 320 | Una columna, margen 16 | Navegación inferior Explorar/Mi Ruta; ajustes en cabecera; filtros en panel; títulos multilínea |
| 360 / 390 | Una columna, margen 16–20 | Lista, detalle y explicación como vistas separadas |
| 768 | Una columna principal amplia, margen 24 | Barra superior; panel de filtros lateral solo si cabe |
| 1024 | Navegación + contenido | Detalle y explicación pueden dividirse sin estrechar lectura |
| 1280 / 1440 | Contenedor máximo 1200, margen automático | Dos áreas, nunca estirar párrafos para llenar pantalla |
| >1440 | Mismo máximo de lectura | Espacio respirable, no añadir más tarjetas |

La condición real es espacio disponible, no detección por dispositivo. En horizontal con altura reducida, navegación compacta y diálogos con scroll interno accesible. Aplicar `min-width:0`, envoltura de textos/URLs, áreas de scroll explícitas y respeto a safe-area. No ocultar acciones esenciales por media query. A 200 % de zoom no superponer cabeceras, tooltips ni banners; probar reflow de 320 CSS px y 400 % cuando corresponda a WCAG, además de los 200 % pedidos. No bloquear orientación.

## 6. Recorridos medibles

Una interacción es una activación de control (clic, toque o teclado); escribir texto y decisiones cognitivas se registran por separado. El objetivo de tres acciones no justifica saltarse consentimiento, autenticación o comprobaciones.

| Tarea desde Explorar | Trayecto | Objetivo |
|---|---|---|
| Comprender una oportunidad visible | Abrir detalle → Entender requisitos | 2 activaciones; lectura aparte |
| Guardar una oportunidad visible | Guardar | 1, sin cuenta; sincronización posterior opcional |
| Continuar una tarea guardada | Mi Ruta → abrir tarea → completar | 3 |
| Visitar convocatoria visible | Abrir detalle → Ver convocatoria oficial | 2 |
| Cambiar tipo de oportunidad | Tipo → seleccionar | 2 si actualización inmediata explícita |
| Filtrado complejo | Más filtros → editar → Aplicar | ≥3 más las selecciones; excepción documentada |

Medir éxito sin ayuda, tiempo, errores, retrocesos y comprensión de requisitos. Objetivo de investigación: ≥80 % de éxito en tareas principales en una prueba formativa pequeña; no interpretar como estimación poblacional. No hay resultados medidos en esta fase.

## 7. Heurísticas de Nielsen aplicadas

La fuente [Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/) sustenta la revisión heurística, no una certificación. Consulta: 2026-11-12.

| Heurística | Decisión UMBRAL | Evidencia a exigir |
|---|---|---|
| Estado visible | Guardado, descarga local y origen IA explícitos | Capturas de estados y pruebas de errores |
| Lenguaje del mundo real | «Requisitos», «Mi Ruta», «Próximo paso» | Comprensión sin explicación del facilitador |
| Control y libertad | Omitir guía, cancelar generación, deshacer | Recorrido por teclado |
| Consistencia | Misma posición de guardar y fuente | Inventario de componentes |
| Prevención | Advertir vencimiento y datos faltantes | Fixtures vencidas/incompletas |
| Reconocimiento | Mostrar selección y requisitos junto a tarea | No requerir memorizar otro panel |
| Flexibilidad | URL profunda y filtros persistentes | Back/forward y recarga |
| Minimalismo | Una prioridad, detalles progresivos | Revisión de jerarquía |
| Recuperación | Error concreto con siguiente paso | Fallo de red/modelo inducido |
| Ayuda | Explicación breve contextual y guía repetible | Acceso desde Perfil/Ayuda |

## 8. Psicología convertida en decisiones

Hipótesis de diseño, pendientes de validación: reducir la carga de elección con filtros progresivos; aprovechar reconocimiento con estados y requisitos siempre visibles; acercar acciones frecuentes al contenido y ampliar áreas táctiles; presentar primero fecha, elegibilidad y fuente para atención selectiva. Leyes de Hick y Fitts orientan alternativas y tamaños, pero no autorizan predecir porcentajes de mejora sin medición. No ocultar opciones críticas ni usar cuenta regresiva artificial. El usuario mantiene control sobre su objetivo y sus datos.

## 9. Accesibilidad y lenguaje

Objetivo WCAG 2.2 AA; revisar manualmente semántica, foco, lector de pantalla, errores, zoom y contraste. El análisis automático no demuestra conformidad. Usar `lang`, encabezados jerárquicos, landmarks, etiquetas visibles, estados mediante texto y aria-live moderado. ES/EN en UI y contenido curado donde exista traducción revisada; no alterar silenciosamente términos legales del origen. Fechas localizadas con zona explícita; evitar banderas como selector de idioma. Iconos siempre con texto en navegación primaria.

Referencia normativa consultada 2026-11-12: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), recomendación publicada mostrada por W3C: 12 diciembre 2024. Aplicación al producto y pruebas se detallan en QUALITY_AND_TEST_STRATEGY.md.

## 10. Comprobación documental de pares de color

Cálculo sRGB de luminancia relativa WCAG realizado el 12-11-2026 sobre valores hexadecimales, sin transparencias ni imagen de fondo. Es comprobación de tokens, **no** prueba de una interfaz ni declaración WCAG. Pares no enumerados, estados hover/disabled y superficies reales deben verificarse al implementar.

| Primer plano / fondo | Ratio calculado |
|---|---:|
| #172033 / #FFFFFF | 16.27:1 |
| #172033 / #F7F8FA | 15.31:1 |
| #475569 / #FFFFFF | 7.58:1 |
| #475569 / #F7F8FA | 7.13:1 |
| #FFFFFF / #174C3C | 9.83:1 |
| #172033 / #E4F0E9 | 13.90:1 |
| #172033 / #D5EA77 | 12.29:1 |
| #A82222 / #FFFFFF | 7.20:1 |
| #1D4ED8 / #FFFFFF | 6.70:1 |

El anillo de foco mantiene separación blanca; verificar también el contraste contra cada color adyacente y que no quede cubierto. No utilizar el acento claro como texto o borde funcional sobre blanco.
