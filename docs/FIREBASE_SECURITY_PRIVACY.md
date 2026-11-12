# Firebase, seguridad y privacidad

Estado: controles propuestos, no desplegados. Fuentes oficiales consultadas **2026-11-12**. No se creó ningún proyecto, clave, regla ni recurso facturable.

## 1. Servicios realmente necesarios

| Servicio | Decisión para MVP | Justificación y límite |
|---|---|---|
| Firebase AI Logic | Obligatorio | Única vía de inferencia del producto concursante |
| App Check | Obligatorio antes de demo pública | Atestación del cliente; no sustituye autorización |
| Firestore | Opcional para catálogo dinámico y sincronización | El MVP puede servir catálogo curado versionado y guardar localmente; si se usa, aplicar reglas y no almacenar conversación abierta |
| Authentication | Solo si se implementa sincronización | Identidad estable y aislamiento por UID; explorar y guardar localmente no requieren cuenta |
| Remote Config | Opcional | Facilita modelo, apagado de IA y límites; mantener defaults locales seguros si se omite |
| Cloud Storage | No inicialmente | Sin subida de CV/documentos en MVP |
| Cloud Functions | Solo operación privilegiada necesaria | Curación/importación o borrado coordinado; evitar backend de IA redundante |
| Analytics | No requerido | No añadir rastreo por defecto |

Firebase Authentication soporta proveedores de identidad y autenticación; UMBRAL debe evitar obligar a registro para explorar. Firestore Rules permite condiciones por autenticación y campos, pero las bibliotecas de servidor eluden Rules y requieren IAM apropiado. Remote Config distribuye configuración, no secretos ni autorización. [Authentication](https://firebase.google.com/docs/auth), [condiciones de Firestore Rules](https://firebase.google.com/docs/firestore/security/rules-conditions), [Remote Config](https://firebase.google.com/docs/remote-config).

## 2. Cambios vigentes relevantes

Firebase documenta autoenforcement de App Check desde **2 de noviembre de 2026** y bloqueo de peticiones sin token válido. La FAQ describe un aplazamiento temporal para aplicaciones existentes hasta enero de 2027; no es la estrategia propuesta para este proyecto nuevo. Usar proveedor de producción para la demo pública y debug únicamente en desarrollo, sin publicar tokens. [FAQ App Check](https://firebase.google.com/docs/ai-logic/faq-and-troubleshooting).

La checklist recomienda restricciones de claves, límites/cuotas, versiones estables y configuración remota. El default de nube puede cambiar: seleccionar un modelo actual verificado; no heredar Gemini 2.5 de una implementación anterior sin revisar su retirada. App Check de Web usa reCAPTCHA Enterprise; revisar también coste y requisitos de dominios antes de habilitar. [Preparación para producción](https://firebase.google.com/docs/ai-logic/production-checklist).

## 3. Flujo y minimización de datos

| Dato | Ubicación propuesta | Uso | Retención propuesta |
|---|---|---|---|
| Oportunidad pública y fuente | Catálogo versionado local o Firestore público de solo lectura | Explorar y explicar | Hasta archivo; conservar trazabilidad sin datos personales |
| País, idioma, áreas de interés | Local; perfil por UID solo si hay sincronización | Filtros y preferencias | Hasta modificación/borrado |
| Guardados, estado y tareas | Local; espacio privado por UID solo si hay sincronización | Mi Ruta | Hasta eliminación del usuario |
| Texto para IA | Memoria transitoria del cliente y proveedor si se elige nube | Acción contextual | Sin historial propio de prompts por defecto |
| Métricas operativas | Eventos sin contenido | Diagnóstico | Objetivo 30 días; configurar y verificar |
| Credenciales de servicio | Solo entorno autorizado de servidor | Operación privilegiada | Rotación según incidente/política |

Estas retenciones son decisiones propuestas, no garantías sobre proveedores. Revisar contrato, tratamiento y retención del proveedor Gemini elegido antes de aceptar información personal real. No afirmar cumplimiento global, residencia peruana ni «cero retención» sin evidencia contractual. La ubicación del modelo y la de Firestore son decisiones diferentes; disponibilidad regional depende del proveedor. [Ubicación de inferencia](https://firebase.google.com/docs/ai-logic/locations).

No recolectar DNI, pasaporte, fecha exacta de nacimiento, discapacidad, salud, finanzas, CV completo ni datos de menores. La personalización no necesita esos campos para el MVP. Si una oportunidad los requiere, mostrar la fuente oficial y dejar el trámite fuera de UMBRAL.

## 4. Política explícita de procesamiento

- Navegar y guardar no implica consentir envío del perfil completo al modelo.
- Antes de la primera inferencia en nube, explicar qué fragmentos se enviarán, a qué proveedor y para qué; opción de continuar sin IA.
- «Solo local» es una restricción dura: un error no permite cambiar a nube. Si el modelo local no está disponible, ofrecer información original y acciones deterministas.
- En modo híbrido autorizado, informar la ruta realmente utilizada. Una ejecución local no significa que toda la aplicación sea offline o que sincronización/atestación no use red.
- Revisar configuración de logs y monitoring antes de activar trazas: no enviar prompts, resultados, correos ni identificadores de perfil a telemetría.
- Borrado de cuenta debe borrar también los documentos de usuario y caché propia; borrar Authentication por sí solo no prueba ese resultado. La exportación sencilla de Mi Ruta es Could, no condición del MVP; si se incorpora, verificar alcance y ausencia de datos ocultos.

## 5. Autorización propuesta

Si se adopta Firestore, modelo `opportunities/{id}`: lectura de oportunidades publicadas; escritura únicamente por rol de curación administrado fuera del cliente. Modelo `users/{uid}` y subcolecciones: dueño autenticado; no confiar en un `ownerId` enviado como prueba de propiedad. Lista permitida de campos, tipos y tamaños. Evitar listas públicas de perfiles.

Casos negativos obligatorios en Emulator Suite: usuario A no lee/escribe B; anónimo no escribe; cliente no publica oportunidades ni se asigna rol; campos extra/URLs peligrosas rechazados; documentos sobredimensionados rechazados; consultas no autorizadas denegadas. Las reglas no son filtros: diseñar consultas que satisfagan la política. Acceso de servidor con IAM mínimo y pruebas separadas.

Las claves de configuración Firebase identifican el proyecto; no son autorización. No confundirlas con claves Gemini ni credenciales privadas. La FAQ vigente indica que desde mediados de 2026 la autorización usa una cuenta de servicio gestionada por Google (P4SA), no claves Gemini estándar. No generar una clave Gemini como paso del MVP; cualquier credencial heredada o de servicio debe quedar fuera de frontend y repositorio. Restringir API y aplicación, establecer cuotas y revisar permisos del proyecto. [Checklist de seguridad AI Logic](https://firebase.google.com/docs/ai-logic/security-checklist).

## 6. Amenazas y mitigaciones verificables

| Amenaza | Control propuesto | Evidencia exigida |
|---|---|---|
| Prompt injection en una convocatoria | Tratar texto como datos; no herramientas; fuentes delimitadas; salida validada | Corpus adversarial con instrucciones incrustadas |
| Requisito inventado | Referencias a fragmentos existentes, incertidumbres, fuente visible | Revisión de exactitud frente al texto original |
| Fuga entre usuarios | UID en reglas, IAM mínimo, pruebas negativas | Reporte de emulator con casos aislados |
| Denial-of-wallet | App Check, cuota conservadora, rate limit, apagado remoto | Rechazo controlado y ensayo de límite |
| XSS/URL maliciosa | Texto escapado, CSP, URLs HTTPS permitidas, sin HTML de IA | Pruebas con payloads y enlaces manipulados |
| Oportunidad falsa o expirada | Curación humana, dominio oficial, fecha de revisión y caducidad | Registro de publicación y revisión |
| Dependencia comprometida | Lockfile, escaneo, versiones mantenidas | Informe de dependencias y licencia |
| Caché en equipo compartido | Cierre de sesión limpia datos privados; aviso de dispositivo | Prueba de segundo usuario tras logout |
| Confusión sobre ejecución local | `inferenceSource` y estados honestos | Traza real, no etiqueta deducida del modo |

No implementar postulaciones, mensajes a empleadores ni decisiones sobre personas. El modelo no concede acceso, clasifica beneficiarios ni sustituye al organismo convocante.

## 7. Operación y puertas de salida

Antes de exposición pública: propietario confirma proyecto/proveedor/región/presupuesto; App Check probado y, si se usa Firestore, reglas probadas; ningún secreto en historia git; modo debug excluido; política de privacidad breve visible; borrado local ejercitado, borrado de cuenta si existe y exportación probada solo si se incorpora; fallback sin IA probado; enlaces de fuente revisados; consultas limitadas/paginadas; configuración versionada con rollback.

Ante incidente: desactivar IA y escritura no esencial mediante configuración/controles del servicio; conservar evidencia minimizada; revocar credenciales afectadas; identificar datos y usuarios alcanzados; definir comunicación conforme a obligaciones reales. No confiar únicamente en un flag del cliente para frenar abuso. Un aviso presupuestario no sustituye un límite técnico.

Pendientes: elección formal del proveedor y sus condiciones; presupuesto; revisión jurídica de política internacional; ensayo de consentimiento y borrado; evaluación de privacidad de las trazas del proveedor. No se afirma certificación ISO, cumplimiento normativo integral ni prueba de penetración realizada.

## 8. Costos, cuotas y datos de la solicitud: cierre de auditoría

Reverificado el **12-11-2026**. AI Logic no añade cargo por su uso, pero el proveedor/modelo/función puede facturar. Gemini Developer API ofrece acceso limitado sin facturación en Spark; al vincular facturación, su uso pasa a pago por consumo y puede requerir prepago. Agent Platform Gemini API requiere Blaze. No se ha elegido ni habilitado proveedor, proyecto, facturación o cuota. El presupuesto exacto necesita modelo, volumen y tarifas vigentes: no existe aquí una promesa de costo cero. [Precios oficiales](https://firebase.google.com/docs/ai-logic/pricing).

Las cuotas dependen de modelo/proveedor/proyecto. La documentación indica límite AI Logic inicial de 100 solicitudes/minuto por usuario; no es un presupuesto recomendado ni garantiza capacidad. Un 429 puede significar cuota o capacidad agotada. Ajustar límites requiere permiso `serviceusage.quotas.update`; no otorgar Owner/Editor únicamente por comodidad. Proponer límites conservadores después de medir demanda, con espera/cancelación y máximo un reintento controlado, nunca bucle. [Cuotas](https://firebase.google.com/docs/ai-logic/quotas).

Contrato de minimización UMBRAL: cuando se autoriza nube, enviar únicamente los fragmentos públicos seleccionados, idioma, instrucción de tarea y esquema/configuración necesarios. No enviar el perfil, otras oportunidades guardadas ni historial. El transporte del servicio también puede incluir configuración del proyecto, token App Check y metadatos técnicos; verificar tráfico y documentación de privacidad antes de publicar. `LOCAL_ONLY` impide el envío del prompt al modelo remoto, pero no equivale a cero conexiones de la aplicación. Esta es una política propuesta, no una captura de red realizada.

La checklist general recomienda controles que no son todos aplicables al MVP: las plantillas de servidor no están soportadas en el flujo híbrido; no adoptarlas como mitigación ficticia. El modo de usuarios autenticados es opcional y de alcance de proyecto; activarlo cambiaría la decisión de asistencia sin cuenta y debe registrarse antes de implementarlo. App Check no valida que el prompt sea benigno ni sustituye Rules/IAM. [Checklist de seguridad](https://firebase.google.com/docs/ai-logic/security-checklist), [FAQ de autorización y App Check](https://firebase.google.com/docs/ai-logic/faq-and-troubleshooting).
