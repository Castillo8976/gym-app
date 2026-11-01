# Backend — Gym App

API REST en Node.js + Express + Sequelize (MySQL/MariaDB) para la app de entrenamiento con rangos, PRs, rutinas y ligas.

- Referencia de endpoints: [`docs/04-api-endpoints.md`](../docs/04-api-endpoints.md)
- Arquitectura: [`docs/02-arquitectura.md`](../docs/02-arquitectura.md)
- Modelo de datos y fórmula de rangos: [`docs/03-modelo-de-datos.md`](../docs/03-modelo-de-datos.md)
- Estado real y bugs conocidos: [`docs/06-estado-y-limitaciones.md`](../docs/06-estado-y-limitaciones.md)

## Requisitos

- Node.js LTS y npm.
- MySQL o MariaDB local.

Para levantar MariaDB y la API de forma reproducible desde la raíz del repositorio,
usa `docker compose up --build`. El Compose crea la base, espera a que esté lista,
aplica las migraciones, carga el catálogo y publica la API en
`http://localhost:3000`. Define `JWT_SECRET` en un archivo `.env` de la raíz antes
de ejecutarlo; nunca uses los valores de ejemplo en producción.

## Instalación

Desde `backend/`:

```bash
npm install
```

Crea el archivo de entorno solo si aún no existe.

```bash
# bash / zsh
[ -f .env ] || cp .env.example .env
```
```powershell
# PowerShell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Edita `.env` con tus credenciales y un `JWT_SECRET` propio. Para generar uno:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DB_HOST` | Sí | Host de MySQL/MariaDB (p. ej. `localhost`) |
| `DB_PORT` | Sí | Puerto (p. ej. `3306`) |
| `DB_NAME` | Sí | Nombre de la base (p. ej. `gym_app`) |
| `DB_USER` / `DB_PASSWORD` | Sí | Credenciales |
| `JWT_SECRET` | Sí | Mínimo 32 caracteres aleatorios; el servidor no arranca si falta, es corto o es el valor de ejemplo |
| `PORT` | No | Puerto de la API (por defecto `3000`) |
| `NODE_ENV` | No | Está en `.env.example` pero el código actual no la usa |
| `CORS_ALLOWED_ORIGINS` | Sí (recomendado) | Lista separada por comas de orígenes permitidos para CORS (si está vacía, solo peticiones sin header `Origin`) |
| `LEAGUE_CREATOR_EMAILS` | Sí (recomendado) | Lista separada por comas de emails autorizados para crear ligas |
| `RUN_DB_INTEGRATION` | No | `1` activa la prueba de integración con base de datos (solo para tests) |
| `REFRESH_TOKEN_DAYS` | No | Duración de refresh tokens (por defecto 30 días) |
| `EMAIL_VERIFICATION_DAYS` | No | Duración de tokens de verificación |
| `PASSWORD_RESET_HOURS` | No | Duración de tokens de recuperación |
| `AUTH_EXPOSE_TOKENS` | No | Solo desarrollo: devuelve tokens para integrar correo; debe ser `false` en producción |

## Base de datos y migraciones

Crea una base vacía:

```sql
CREATE DATABASE gym_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Aplica el esquema y carga el catálogo:

```bash
npm run db:migrate   # aplica las migraciones pendientes y las registra en SequelizeMeta
npm run seed         # grupos musculares, ejercicios ancla y estándares de fuerza (se puede repetir)
```

- Las migraciones **no** se ejecutan al arrancar la API; el servidor solo comprueba que no haya pendientes y, si las hay, se detiene indicando cuáles.
- La migración inicial es para una base vacía. No la ejecutes contra una base remota o existente sin una copia de seguridad y un plan de adopción.
- Para cambiar el esquema, añade un archivo nuevo en `src/migrations/` con prefijo de fecha (se ejecutan en orden alfabético) que exporte `up(queryInterface, Sequelize)`; añade `down` cuando sea posible para rollback manual.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | API con recarga automática (nodemon) |
| `npm start` | API sin recarga |
| `npm run db:migrate` | Aplica migraciones pendientes |
| `npm run seed` | Carga el catálogo inicial |
| `npm test` | Ejecuta las pruebas con el runner nativo de Node (`node --test`) |

La autenticación incluye refresh tokens rotatorios (`/api/auth/refresh`, `/api/auth/logout`),
recuperación de contraseña y verificación de email. Los tokens se almacenan únicamente
como hashes. En producción hay que conectar un proveedor de correo y mantener
`AUTH_EXPOSE_TOKENS=false`.

La cuenta se puede eliminar con `DELETE /api/users/me`; la operación borra los datos
asociados dentro de una transacción.

## Comprobar que funciona

Con la API iniciada:

```bash
curl http://localhost:3000/api/health
# {"ok":true,"database":"connected"}
```
```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Prueba rápida del flujo de autenticación:

```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@correo.com","password":"clave-segura-1","gender":"female","bodyweightKg":62.5}'

curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"ana@correo.com","password":"clave-segura-1"}'
```

## Pruebas

```bash
npm test
```

Cubre validadores, `rankService`, `leagueService` y el ciclo de series. La prueba de integración del volumen de ligas (`tests/leagueVolume.integration.test.js`) se omite por defecto; para ejecutarla necesitas una base migrada y un usuario con permisos para insertar y borrar:

```bash
RUN_DB_INTEGRATION=1 node --test tests/leagueVolume.integration.test.js
```
```powershell
$env:RUN_DB_INTEGRATION = '1'
node --test tests/leagueVolume.integration.test.js
Remove-Item Env:RUN_DB_INTEGRATION
```

La prueba crea y elimina sus propios datos temporales.

## Estructura

```
src/
├── app.js                 # Express, rutas y manejador de errores (se exporta sin escuchar)
├── server.js              # arranque: valida JWT_SECRET, conecta y comprueba migraciones
├── migrate.js             # ejecutor de migraciones
├── config/database.js     # conexión Sequelize
├── middleware/auth.js     # JWT → req.userId
├── routes/                # auth, users, exercises, workout-sessions, routines, leagues
├── controllers/
├── validators/
├── services/              # rankService, authService, leagueService, leagueVolumeService
├── models/                # modelos Sequelize y asociaciones (index.js)
├── migrations/
└── seeders/seedData.js
tests/
```

> Convención: dentro de un controlador el usuario autenticado es `req.userId`.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `Configura JWT_SECRET con un valor aleatorio de al menos 32 caracteres.` | Falta `JWT_SECRET`, es corto o es el valor de ejemplo. Genera uno (ver arriba) |
| `Falta el esquema. Ejecuta "npm run db:migrate"…` | La base está vacía: ejecuta las migraciones |
| `Hay migraciones pendientes…` | Ejecuta `npm run db:migrate` |
| `ECONNREFUSED` / `Access denied` al iniciar | MySQL/MariaDB apagado o credenciales de `.env` incorrectas |
| `/api/health` responde 503 | La API corre pero no conecta con la base; revisa `DB_*` |
| La app no conecta | Revisa `EXPO_PUBLIC_API_URL` en [`app/README.md`](../app/README.md) |
| Los endpoints `/api/routines` responden 500 | Bug conocido, ver [`docs/06`](../docs/06-estado-y-limitaciones.md#bugs-conocidos) |

## Estado actual

- Registro, login y JWT funcionando.
- Sesiones y series con recálculo de PR y rangos; edición y borrado con recálculo.
- Perfil editable con recálculo de rangos al cambiar el peso.
- Ligas por temporada con volumen automático y clasificación estable.
- Rutinas implementadas y cubiertas por pruebas de alcance de usuario.

## Siguiente refinamiento

Ver la lista priorizada en [`docs/06-estado-y-limitaciones.md`](../docs/06-estado-y-limitaciones.md#camino-a-producción-y-tiendas).
