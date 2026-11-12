# Registro de decisiones

12-11-2026. Las propuestas no equivalen a aprobación del jurado ni a validación de usuarios.

| ID | Decisión | Razón / reversibilidad |
|---|---|---|
| ADR-01 | Mantener proyecto original intacto; nuevo repositorio y rama de documentación | Protege participación previa. Reutilización futura requiere revisar bases y licencias. |
| ADR-02 | Web responsive primero; Android/iOS posteriores | Plazo limitado y objetivo Web/Chrome; IA local web no equivale a compatibilidad móvil. Revisar tras prueba técnica. |
| ADR-03 | Monolito modular con puertos selectivos | Entrega sencilla y separación de dominio; extraer servicios solo con evidencia. |
| ADR-04 | Catálogo curado, fuente primaria, fecha de verificación y revisión | Confianza y trazabilidad antes que cantidad; revisión editorial obligatoria. |
| ADR-05 | Tareas contextuales de IA, no chatbot genérico | Reduce carga, alcance y respuestas sin fuente; nube solo conforme a privacidad y configuración. |
| ADR-06 | No afirmar local/nube sin señal verificable | Preferencia no demuestra ejecución real; fallback puede producir otro modo. |
| ADR-07 | Acceso sin cuenta y ruta local; sincronización opcional condicionada al plazo | Menos fricción; advertir pérdida por borrado de datos locales. |
| ADR-08 | Onboarding omitible, reproducible y reduced motion | Acceso inmediato y accesibilidad; guía anclada a elementos reales. |
| ADR-09 | No implementar ni desplegar en fase discovery | Encargo explícito. |

## Pendientes del propietario/equipo

Confirmar elegibilidad con bases reales y titularidad; composición/disponibilidad del equipo; lista y licencias de fuentes de oportunidades; idiomas y países concretos del piloto; criterios de consentimientos y política de retención; elección de licencia abierta tras comprobar dependencias y reglas; dispositivos físicos para prueba; presupuesto y cuenta Firebase. Estas decisiones no bloquean los documentos, pero sí pueden bloquear implementación o candidatura.

## Revisión del UMBRAL original en modo lectura

Referencia inspeccionada: [original, README](https://github.com/Alvaro-mendoza-12/Umbral/blob/5c77941542c1b498c37639a2d03a26dd8fbfee42/README.md), [modelo](https://github.com/Alvaro-mendoza-12/Umbral/blob/5c77941542c1b498c37639a2d03a26dd8fbfee42/src/features/opportunities/domain/types.ts), [Mi Ruta](https://github.com/Alvaro-mendoza-12/Umbral/blob/5c77941542c1b498c37639a2d03a26dd8fbfee42/src/features/opportunities/domain/myRoute.ts). Observación de código y README, no pruebas ejecutadas: stack React/Vite/TypeScript, i18next y almacenamiento local; el paquete inspeccionado no declara Firebase ni IA. El README declara 31 oportunidades, cuya vigencia no se ha verificado una por una.

- **Conservar como ideas:** fuente por requisito, fechas de verificación/revisión, país separado del idioma, ruta y tareas, transparencia sobre información no publicada.
- **Simplificar:** categorías y audiencias para el piloto; evitar convertir la guía CSE en el flujo central internacional.
- **Transformar:** catálogo estático a catálogo editorial versionado; ruta local a almacenamiento local primero y sincronización solo si es segura y viable; incorporar asistencia contextual nueva.
- **Descartar de este MVP:** informes históricos de QA, despliegues/configuraciones heredadas, copia masiva de catálogo no revalidado y el árbol CSE completo.

Cualquier reutilización concreta de código, datos o activos requiere comprobar bases de la competencia y licencias. Esta revisión no implica transferencia de código ni modificación del original.
