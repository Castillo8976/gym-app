# Estado real, bugs conocidos y camino a producción

Este documento resume lo que se **verificó leyendo el código** del commit `fc370d5` y ejecutando las pruebas del backend. Su objetivo es que la documentación no prometa más de lo que el código hace. Cuando corrijas algo de esta lista, bórralo de aquí.

## Qué se verificó

- Pruebas del backend (`npm test`): 39 pruebas pasan cuando se ejecutan con la base Docker disponible; sin `RUN_DB_INTEGRATION=1`, la integración se omite a propósito.
- No se ejecutó el backend contra una base de datos real ni la app en un dispositivo en este entorno.
- `app/App.js` contiene la interfaz principal y se valida con exportación web y diagnósticos de VS Code.

## Bugs funcionales conocidos

### Estado de rutas de rutinas

Corregido: los controladores usan `req.userId`, que es la propiedad expuesta por el middleware de autenticación. El alcance del usuario está cubierto por pruebas.

### Fecha por defecto de una sesión

Corregido: el validador calcula la fecha del calendario local cuando no se recibe `sessionDate`, por lo que no depende de la fecha UTC del servidor.

## Limitaciones de diseño

| Tema | Detalle |
|---|---|
| Repeticiones largas | `reps` admite series largas para conservar el volumen real de liga, pero el cálculo de 1RM limita Epley a 12 repeticiones |
| Calentamientos y PR | Las series `warmup` cuentan para PR, pero no para el volumen de liga |
| Historial de PR | Editar o borrar una serie borra y recrea el PR del ejercicio, perdiendo `achieved_at` |
| Edición de series | El historial permite editar carga, repeticiones y tipo de serie; el progreso se recalcula después de guardar |
| Transacciones | Las mutaciones de series y sus recálculos, además de crear/aplicar rutinas, se ejecutan en una sola transacción |
| Estándares duplicados | Los umbrales están en `rankService.js`, en `seedData.js` y en la tabla `strength_standards` |
| Ejercicio desconocido | Si faltan estándares de un ejercicio para cálculo de rango, el backend responde error explícito (sin fallback silencioso) |
| Catálogo | Solo hay 5 ejercicios (los ancla); no hay ejercicios de acompañamiento |
| Búsqueda | El selector de ejercicios permite filtrar por nombre y grupo muscular, pero no amplía el catálogo inicial |
| Rangos | Solo hay fila de rango en los grupos con PR; no existe rango general |
| Ligas | Clasifican por volumen absoluto, no por fuerza relativa; no hay ascensos/descensos; crear ligas está restringido por allow-list y la clasificación solo es visible para miembros |
| Sugerencia de discos | Calcula sobre el peso total, sin descontar barra ni dividir por lado |
| Rendimiento | `GET /users/me/last-sets` carga todo el historial y filtra en memoria; `GET /leagues` carga todos los miembros de todas las ligas |
| Actualización de UI | Tras guardar o borrar una serie, historial, rangos, PRs y referencias recientes se actualizan en pantalla |
| Racha | La racha usa fechas del calendario local del dispositivo para evitar desplazamientos por conversión UTC |
| Género | Solo `male`/`female` en el modelo y los estándares |
| `App.js` | Un único componente con unos 60 `useState`; navegación manual por pestañas |

## Seguridad: lo que existe y lo que falta

Existe: bcrypt, validación de `JWT_SECRET` al arrancar, JWT con expiración, filtrado de datos por usuario, comparación de contraseña aun cuando el email no existe (mitigación de timing), `helmet`, rate limiting en `/auth`, CORS por allow-list, token en `expo-secure-store`.

Implementado: refresh tokens rotatorios/revocables, persistencia del refresh token en el cliente y recuperación automática al restaurar la sesión. Recuperación de contraseña y verificación de email están disponibles en la API.
Falta conectar un proveedor de correo transaccional y definir un sistema de roles persistente.

## Camino a producción y tiendas

Estado de la lista previa a publicar:

- [x] Corregir el alcance de usuario en rutinas y añadir cobertura del controlador.
- [x] Validar `PATCH /users/me`, preferencias de descanso y fechas de temporada.
- [x] Limitar `reps` para evitar estimaciones Epley poco fiables con series largas.
- [x] Envolver `addSet`/`updateSet`/`deleteSet` y operaciones de creación/aplicación de rutinas en transacciones.
- [x] Unificar y completar los estándares en la base de datos mediante migración.
- [x] Rate limiting, `helmet` y CORS por dominio.
- [x] Pruebas HTTP básicas con `supertest` y prueba de integración del volumen de ligas con MariaDB.
- [x] Dockerfile, CI (instalar, probar) y variables de entorno de producción.
- [ ] Backend desplegado con **HTTPS**; la URL por defecto del cliente es `http://`.
- [x] Scripts de copias de seguridad/restauración; falta automatizar retención y almacenamiento externo.
- [ ] Logs estructurados, métricas y alertas (hoy solo hay `console.error`).
- [x] **Eliminación de cuenta dentro de la app** mediante `DELETE /api/users/me`, dentro de una transacción.
- [ ] Política de privacidad y tratamiento de datos personales (peso corporal y rendimiento), incluida la normativa colombiana de protección de datos.
- [ ] Configurar EAS Build, firma y cuentas de desarrollador.
- [x] Contrato OpenAPI inicial; falta versionar `/api/v1`.
- [x] Especificación inicial OpenAPI en `docs/openapi.yaml`.
- [x] Imagen Docker y pipeline de pruebas en `.github/workflows/backend.yml`.
- [x] Scripts de backup y restore para MySQL/MariaDB.
