# Registro de riesgos

Estado de evaluación inicial: 12-11-2026. Probabilidad e impacto son estimaciones cualitativas, no mediciones.

| ID | Riesgo | P/I | Prevención y respuesta | Responsable propuesto |
|---|---|---|---|---|
| R01 | Reglas/fechas o elegibilidad diferentes a lo supuesto | M/Alto | Revisar reglas oficiales antes de comprometer trabajo y antes de enviar; mantener evidencia y cuestiones abiertas. | Product owner |
| R02 | La señal de procedencia documentada no funciona en la combinación real | M/Alto | Validar `inferenceSource` en el spike; no usar preferencia como prueba; mostrar desconocido si falta evidencia. | Ingeniería IA |
| R03 | Modelo local no disponible en dispositivo o aún descargando | Alta/Alto | Detectar disponibilidad; fallback autorizado a nube, o información clara si no hay red; pruebas en hardware real. | Ingeniería IA |
| R04 | Información de oportunidad caducada o falsa | M/Alto | Curación manual, URL primaria, fecha de revisión y expiración, revisión antes de demo; nunca garantizar elegibilidad. | Curación |
| R05 | Modelo inventa requisitos o fechas | Alta/Alto | Limitar contexto a fuente, validar estructura, citas visibles y aviso, no permitir decisiones automáticas; pruebas adversariales. | Calidad |
| R06 | Exposición de datos personales o costos inesperados | M/Alto | Minimización, consentimiento contextual, App Check, reglas, cuotas, presupuestos y monitoreo sin contenido sensible. | Seguridad |
| R07 | Inaccesibilidad de spotlight, movimiento o pantallas pequeñas | M/Alto | Control por teclado, foco y reduced motion; QA 320px/zoom y lector, permitir omitir. | UX/QA |
| R08 | Alcance excede tiempo o personal disponible | Alta/Alto | Web primero, congelación por hitos, recortar sincronización y categorías antes que fiabilidad. | Product owner |
| R09 | Catálogo carece de datos reales y licencia adecuada | M/Alto | Recopilar vínculos y verificar condiciones de uso de fuentes; no hacer scraping no autorizado ni presentar datos ficticios como reales. | Curación |
| R10 | Rama nueva en repositorio vacío no se puede crear con las herramientas | M/Medio | Crear primer commit directamente en rama indicada, sin alterar original ni crear rama main; si es imposible, documentar bloqueo y entregar archivos. | Ingeniería |
| R11 | Reutilización o material anterior viola reglas del concurso | M/Alto | Verificar bases, procedencia y licencias antes de reutilizar código, datos y activos; registrar decisión. | Product owner |
| R12 | Accesibilidad, compatibilidad y seguridad se afirman sin evidencia | M/Alto | Matriz de pruebas por dispositivo y evidencia; reportar no probado, no afirmar certificación. | QA |
