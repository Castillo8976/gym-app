# API REST

Referencia de la API tal como está implementada en el commit `fc370d5`.

- **Base:** `/api` (sin versionado). En local: `http://localhost:3000/api`.
- **Formato:** JSON en peticiones y respuestas.
- **Autenticación:** `Authorization: Bearer <token>`. 🔒 marca los endpoints que la exigen.
- **Unidades:** pesos en kg con máximo 2 decimales; fechas `YYYY-MM-DD`.

## Errores

```json
{ "error": true, "message": "descripción legible" }
```

| Código | Cuándo |
|---|---|
| 400 | Payload inválido (el `message` indica el campo) |
| 401 | `Token no provisto`, `Token inválido o expirado` o `Credenciales inválidas` |
| 404 | Recurso inexistente o que pertenece a otro usuario |
| 409 | Email ya registrado |
| 500 | `Error interno del servidor` |
| 503 | Solo `/api/health`, con forma `{ "ok": false, "database": "offline" }` |

## Resumen

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | — | Crear cuenta |
| POST | `/auth/login` | — | Iniciar sesión, devuelve JWT |
| GET | `/health` | — | Estado de la API y la base de datos |
| GET | `/exercises` | — | Catálogo de ejercicios |
| GET | `/users/me` | 🔒 | Perfil |
| PATCH | `/users/me` | 🔒 | Editar nombre y/o peso corporal |
| GET | `/users/me/ranks` | 🔒 | Rangos por grupo muscular |
| GET | `/users/me/records` | 🔒 | PRs |
| GET | `/users/me/last-sets` | 🔒 | Última serie por ejercicio |
| GET / PATCH | `/users/me/rest-preferences` | 🔒 | Tiempos de descanso |
| GET / PUT | `/users/me/plate-config` | 🔒 | Discos disponibles |
| POST | `/users/me/plate-config/suggest` | 🔒 | Sugerir combinación de discos |
| POST / GET | `/workout-sessions` | 🔒 | Crear / listar sesiones |
| GET | `/workout-sessions/:id` | 🔒 | Detalle con series |
| POST | `/workout-sessions/:id/sets` | 🔒 | Registrar serie |
| PATCH / DELETE | `/workout-sessions/:id/sets/:setId` | 🔒 | Editar / borrar serie |
| GET / POST | `/routines` | 🔒 | Listar / crear rutinas |
| GET | `/routines/:id` | 🔒 | Detalle de rutina |
| POST | `/routines/:id/apply` | 🔒 | Crear sesión desde una rutina |
| GET / POST | `/leagues` | 🔒 | Listar / crear ligas |
| POST | `/leagues/:id/join` | 🔒 | Unirse a una liga |
| GET | `/leagues/:id/members` | 🔒 | Clasificación de la liga |

> Las rutas de rutinas requieren autenticación y limitan todas las operaciones al usuario de `req.userId`.

---

## Auth

### `POST /auth/register`

| Campo | Regla |
|---|---|
| `name` | texto, 1–100 caracteres |
| `email` | válido, máx. 150; se normaliza a minúsculas |
| `password` | 8–72 bytes |
| `gender` | `male` o `female` |
| `bodyweightKg` | número > 0 y ≤ 999,99, máx. 2 decimales |
| `birthDate` | opcional, fecha válida |

```json
// petición
{ "name": "Ana", "email": "ana@correo.com", "password": "clave-segura-1", "gender": "female", "bodyweightKg": 62.5 }
// 201
{ "id": 1, "name": "Ana", "email": "ana@correo.com" }
```
Responde 409 si el email ya existe. **No devuelve token**: hay que llamar a `/auth/login`.

### `POST /auth/login`

```json
// petición
{ "email": "ana@correo.com", "password": "clave-segura-1" }
// 200
{ "token": "<jwt>", "user": { "id": 1, "name": "Ana", "email": "ana@correo.com" } }
```
El JWT contiene `{ userId }` y expira a los 7 días.

### `GET /health`

`200 { "ok": true, "database": "connected" }`

---

## Usuario 🔒

### `GET /users/me`
Devuelve el usuario sin `passwordHash`.

### `PATCH /users/me`
Cuerpo: `{ "name"?: string, "bodyweightKg"?: number }`; se debe proporcionar al menos uno de los campos y no se aceptan campos desconocidos.
- `name`: texto no vacío después de quitar espacios, máximo 100 caracteres.
- `bodyweightKg`: número > 0 y ≤ 999,99, con máximo 2 decimales.
Valores inválidos → `400`. Respuesta correcta: `200 { "id", "name", "bodyweightKg" }`.
Si cambia `bodyweightKg`, se recalculan los rangos existentes.

### `GET /users/me/ranks`
```json
[ { "id": 1, "userId": 1, "muscleGroupId": 1, "currentRank": "plata", "updated_at": "…",
    "MuscleGroup": { "id": 1, "name": "Pecho" } } ]
```
Solo aparecen los grupos donde el usuario ya tiene un PR de su ejercicio ancla.

### `GET /users/me/records`
```json
[ { "id": 7, "userId": 1, "exerciseId": 1, "estimated1rm": "101.33", "achieved_at": "…",
    "Exercise": { "id": 1, "name": "Press de banca" } } ]
```
Ordenado por `achieved_at` descendente (esta fecha y `updated_at` en rangos conservan el nombre de columna, no camelCase); puede haber varias filas por ejercicio.

### `GET /users/me/last-sets`
Última serie por ejercicio, ordenada por nombre:
`[ { "exerciseId", "exerciseName", "weightKg", "reps", "setType", "actualRestSeconds", "sessionDate" } ]`

### `GET` / `PATCH /users/me/rest-preferences`
`{ "defaultRestSeconds": 90, "defaultWarmupRestSeconds": 60 }` (valores por defecto). El PATCH acepta uno o ambos campos; cada valor debe ser un entero de 0 a 600 segundos. Un cuerpo vacío, tipo inválido o campo desconocido responde `400`.

### `GET` / `PUT /users/me/plate-config`
`{ "plates": [ … ] }` con los pesos de disco en kg. Por defecto: 2,5 · 5 · 10 · 20 · 25 · 45. El PUT reemplaza la lista (descarta valores no numéricos o ≤ 0 y duplicados).

### `POST /users/me/plate-config/suggest`
Cuerpo `{ "targetWeightKg": 100 }` →
```json
{ "targetWeightKg": 100, "totalWeightKg": 100, "remainingWeightKg": 0, "feasible": true,
  "stacks": [ { "plateKg": 45, "count": 2 }, { "plateKg": 10, "count": 1 } ] }
```
Algoritmo voraz sobre el **peso total**: no descuenta la barra ni divide por lado.

---

## Ejercicios

### `GET /exercises` (público)
`[ { "id", "name", "muscleGroupId", "isAnchor", "MuscleGroup": { "id", "name" } } ]`.
El seeder carga solo los 5 ejercicios ancla.

---

## Sesiones de entrenamiento 🔒

### `POST /workout-sessions`
Cuerpo opcional `{ "sessionDate"?: "YYYY-MM-DD", "notes"?: string }`. Si falta la fecha, usa la fecha del calendario local del servidor. → `201` sesión `{ id, userId, sessionDate, notes }`.

### `GET /workout-sessions`
Sesiones del usuario, más recientes primero.

### `GET /workout-sessions/:id`
Sesión con `WorkoutSets` ordenados por `setOrder`, cada uno con `Exercise { id, name, muscleGroupId }`. 404 si no es del usuario.

### `POST /workout-sessions/:id/sets`

| Campo | Regla |
|---|---|
| `exerciseId` | entero positivo; debe existir (si no, 400) |
| `weightKg` | número > 0 y ≤ 9999,99, máx. 2 decimales |
| `reps` | entero positivo; para 1RM se usa tope de 12 reps (Epley acotado) |
| `setOrder` | entero positivo |
| `setType` | opcional: `warmup`, `normal` (defecto), `failure`, `drop_set` |
| `restSeconds`, `actualRestSeconds` | opcionales, enteros 0–600 |
| `notes` | opcional, texto |

```json
// 201
{ "set": { "id": 12, "sessionId": 3, "exerciseId": 1, "weightKg": "80.00", "reps": 8, "setOrder": 1, "setType": "normal" },
  "calculations": { "status": "updated", "isNewPR": true, "estimated1rm": 101.33 } }
```
`status` es `updated` si hubo nuevo PR y `stable` en caso contrario.

### `PATCH /workout-sessions/:id/sets/:setId`
Mismas reglas y **todos los campos obligatorios** (`exerciseId`, `weightKg`, `reps`, `setOrder`): es un reemplazo completo, no parcial. → `200` con la serie. Recalcula PR, rangos y volumen de liga.

### `DELETE /workout-sessions/:id/sets/:setId`
→ `200 { "deleted": true, "setId": 12 }`. Recalcula PR, rangos y volumen.

---

## Rutinas 🔒 (ver aviso de bug arriba)

### `POST /routines`

| Campo | Regla |
|---|---|
| `name` | 1–100 caracteres; único por usuario |
| `description` | opcional |
| `routineType` | `single` (defecto), `superset`, `circuit` |
| `exercises` | arreglo con al menos 1 elemento |

Cada elemento de `exercises`: `exerciseId`, `position` (enteros positivos), `targetSets` (1–20), `targetReps` (1–30), `targetWeightKg` (0–9999,99), `restSeconds` (0–600) y `grouping` (`main` por defecto, `paired`, `circuit`).

### `GET /routines` · `GET /routines/:id`
Rutinas del usuario con sus ejercicios y grupo muscular. 404 si no existe.

### `POST /routines/:id/apply`
Cuerpo opcional `{ "sessionDate"?, "notes"? }` → `201 { "session", "createdSets", "routine": { "id", "name", "routineType" } }`.
Crea una sesión con `targetSets` series por ejercicio (tipo `normal`, con el peso y repeticiones objetivo), y recalcula PR, rangos y volumen de liga. La sesión, las series y esos cálculos se confirman en una única transacción; si falla cualquier paso, se revierten todos.

---

## Ligas 🔒

### `GET /leagues`
Solo las ligas a las que el usuario ya pertenece, de más reciente a más antigua, con resumen seguro: `memberCount`, `isJoined` y `myVolumeKg`.

### `POST /leagues`
`{ "name": "Liga Octubre", "seasonStart": "2026-10-01", "seasonEnd": "2026-10-31" }` → `201`. Solo usuarios con email incluido en `LEAGUE_CREATOR_EMAILS` pueden crear ligas. `seasonEnd` debe ser ≥ `seasonStart`.
El nombre debe tener entre 1 y 100 caracteres. Ambas fechas deben existir en el calendario y tener formato `YYYY-MM-DD`; fechas imposibles o intervalos invertidos responden `400`.

### `POST /leagues/:id/join`
→ `201` con la membresía. Calcula el volumen desde el inicio de la temporada. Responde 201 incluso si el usuario ya era miembro. 404 si la liga no existe.

### `GET /leagues/:id/members`
Clasificación ordenada por `totalVolumeKg` descendente, con `position` (1, 2, 3…); los empates se resuelven por `userId`. Requiere pertenecer a la liga (`403` si no).

---

## Reglas de negocio relevantes

- 1RM estimado con Epley y rangos por ratio: ver [`03-modelo-de-datos.md`](./03-modelo-de-datos.md).
- Las series `warmup` no cuentan para el volumen de liga, pero **sí** cuentan para PR.
- Sesiones, series, rutinas y perfil solo se devuelven a su dueño; la clasificación de miembros solo se expone a usuarios que ya pertenecen a esa liga.

## Pendiente

- Contrato OpenAPI/Swagger y versionado `/api/v1`.
- Más pruebas de integración contra MySQL/MariaDB.
