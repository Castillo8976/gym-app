# Estado real, bugs conocidos y camino a producción

Este documento resume lo que se **verificó leyendo el código** del commit `fc370d5` y ejecutando las pruebas del backend. Su objetivo es que la documentación no prometa más de lo que el código hace. Cuando corrijas algo de esta lista, bórralo de aquí.

## Qué se verificó

- Pruebas del backend (`npm test`): 34 pruebas, 33 pasan y 1 se omite a propósito (la de integración con base de datos, que es opt-in con `RUN_DB_INTEGRATION=1`).
- No se ejecutó el backend contra una base de datos real ni la app en un dispositivo.
- `app/App.js` (1.281 líneas) se revisó por estructura y por las pantallas principales, no línea por línea.

## Bugs funcionales conocidos

### Estado de rutas de rutinas

`routineController.js` lee `req.user.id` (4 veces: listar, detalle, crear y aplicar), pero el middleware de autenticación solo asigna `req.userId`. `req.user` nunca existe, así que cada petición autenticada a `/api/routines…` lanza `Cannot read properties of undefined (reading 'id')` y responde `500 Error interno del servidor`.

Reproducción sin base de datos, desde `backend/`:

```bash
node -e "
const c = require('./src/controllers/routineController');
c.listRoutines({ userId: 1, params: {}, body: {} }, { json() {} },
  (e) => console.log('next(err):', e && e.message));"
# → next(err): Cannot read properties of undefined (reading 'id')
```

El controlador usa `req.userId`, que es la propiedad expuesta por el middleware de autenticación, y el alcance está cubierto por pruebas.

### Fecha por defecto de una sesión

Cuando el cliente no envía `sessionDate`, `POST /workout-sessions` (y `/routines/:id/apply`) usan `new Date().toISOString().slice(0, 10)`, es decir, la fecha UTC. En Colombia (UTC−5), después de las 19:00 esa fecha es la del día siguiente, y eso también decide qué temporada de liga cuenta la sesión.

El validador calcula la fecha del calendario local cuando no se recibe `sessionDate`, por lo que no depende de la fecha UTC del servidor.

## Limitaciones de diseño

| Tema | Detalle |
|---|---|
| Repeticiones largas | `reps` admite series largas para conservar el volumen real de liga, pero el cálculo de 1RM limita Epley a 12 repeticiones |
| Calentamientos y PR | Las series `warmup` cuentan para PR, pero no para el volumen de liga |
| Historial de PR | Editar o borrar una serie borra y recrea el PR del ejercicio, perdiendo `achieved_at` |
| Transacciones | Las mutaciones de series y sus recálculos, además de crear/aplicar rutinas, se ejecutan en una sola transacción |
| Estándares duplicados | Los umbrales están en `rankService.js`, en `seedData.js` y en la tabla `strength_standards` |
| Ejercicio desconocido | Si faltan estándares de un ejercicio para cálculo de rango, el backend responde error explícito (sin fallback silencioso) |
| Catálogo | Solo hay 5 ejercicios (los ancla); no hay ejercicios de acompañamiento |
| Rangos | Solo hay fila de rango en los grupos con PR; no existe rango general |
| Ligas | Clasifican por volumen absoluto, no por fuerza relativa; no hay ascensos/descensos; crear ligas está restringido por allow-list y la clasificación solo es visible para miembros |
| Sugerencia de discos | Calcula sobre el peso total, sin descontar barra ni dividir por lado |
| Rendimiento | `GET /users/me/last-sets` carga todo el historial y filtra en memoria; `GET /leagues` carga todos los miembros de todas las ligas |
| Actualización de UI | Tras guardar una serie, Rangos y PRs no se recargan en pantalla |
| Género | Solo `male`/`female` en el modelo y los estándares |
| `App.js` | Un único componente con unos 60 `useState`; navegación manual por pestañas |

## Seguridad: lo que existe y lo que falta

Existe: bcrypt, validación de `JWT_SECRET` al arrancar, JWT con expiración, filtrado de datos por usuario, comparación de contraseña aun cuando el email no existe (mitigación de timing), `helmet`, rate limiting en `/auth`, CORS por allow-list, token en `expo-secure-store`.

Falta: refresh/revocación de tokens, recuperación de contraseña, verificación de email y un sistema de roles persistente.

## Camino a producción y tiendas

Estado de la lista previa a publicar (nada de esto está hecho todavía):

- [x] Corregir el alcance de usuario en rutinas y añadir cobertura del controlador.
- [x] Validar `PATCH /users/me`, preferencias de descanso y fechas de temporada.
- [x] Limitar `reps` para evitar estimaciones Epley poco fiables con series largas.
- [x] Envolver `addSet`/`updateSet`/`deleteSet` y operaciones de creación/aplicación de rutinas en transacciones.
- [ ] Unificar los estándares en la base de datos.
- [x] Rate limiting, `helmet` y CORS por dominio.
- [ ] Pruebas de API con `supertest` (`app.js` ya se exporta sin levantar el servidor) y más pruebas de integración con MySQL.
- [ ] Dockerfile, CI (instalar, migrar, probar) y variables de entorno de producción.
- [ ] Backend desplegado con **HTTPS**; la URL por defecto del cliente es `http://`.
- [ ] Copias de seguridad de la base y plan de migraciones/rollback (la migración inicial es solo para base vacía).
- [ ] Logs estructurados, métricas y alertas (hoy solo hay `console.error`).
- [ ] **Eliminación de cuenta dentro de la app** (requisito de las tiendas); hoy las claves foráneas `RESTRICT` impiden borrar un usuario con datos.
- [ ] Política de privacidad y tratamiento de datos personales (peso corporal y rendimiento), incluida la normativa colombiana de protección de datos.
- [ ] Configurar EAS Build, firma y cuentas de desarrollador.
- [ ] Contrato OpenAPI y versionado `/api/v1`.
