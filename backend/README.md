# Backend — Gym App

API REST en Node.js + Express + Sequelize (MySQL), siguiendo el modelo de datos
y la especificación de endpoints definidos en `docs/03-modelo-de-datos.md` y
`docs/04-api-endpoints.md`.

## Instalación

```bash
npm install
```

En PowerShell, crea `.env` desde el ejemplo solo si aún no existe, para preservar una configuración local previa:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Configura `.env` con la conexión local de MySQL/MariaDB y un `JWT_SECRET` aleatorio propio. No reutilices el valor de ejemplo.

## Base de datos y migraciones

Crea una base vacía en una instancia local de MySQL/MariaDB:

```sql
CREATE DATABASE gym_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Desde `backend/`, aplica el esquema versionado y carga el catálogo:

```bash
npm run db:migrate
npm run seed
```

Las migraciones no se ejecutan al arrancar la API y no alteran automáticamente tablas existentes. La migración inicial está prevista para una base vacía; no la ejecutes contra una base remota ni sobre una base existente sin un plan de adopción y una copia de seguridad.

## Ejecutar y probar el recorrido

Inicia la API desde `backend/`:

```powershell
npm run dev
```

En otra terminal PowerShell, registra una cuenta, inicia sesión y crea una sesión con una serie. Sustituye los datos por los tuyos:

```powershell
$baseUrl = 'http://localhost:3000/api'
$register = @{ name = 'Silver'; email = 'silver@example.com'; password = 'cambia-esta-clave'; gender = 'male'; bodyweightKg = 75 } | ConvertTo-Json
Invoke-RestMethod "$baseUrl/auth/register" -Method Post -ContentType 'application/json' -Body $register

$loginBody = @{ email = 'silver@example.com'; password = 'cambia-esta-clave' } | ConvertTo-Json
$login = Invoke-RestMethod "$baseUrl/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.token)" }

$exercises = Invoke-RestMethod "$baseUrl/exercises"
$exercises | Select-Object id, name
$sessionBody = @{ sessionDate = (Get-Date -Format 'yyyy-MM-dd'); notes = 'Sesión de prueba' } | ConvertTo-Json
$session = Invoke-RestMethod "$baseUrl/workout-sessions" -Method Post -Headers $headers -ContentType 'application/json' -Body $sessionBody

$setBody = @{ exerciseId = $exercises[0].id; weightKg = 40; reps = 10; setOrder = 1 } | ConvertTo-Json
Invoke-RestMethod "$baseUrl/workout-sessions/$($session.id)/sets" -Method Post -Headers $headers -ContentType 'application/json' -Body $setBody
Invoke-RestMethod "$baseUrl/workout-sessions" -Headers $headers
Invoke-RestMethod "$baseUrl/workout-sessions/$($session.id)" -Headers $headers
```

`weightKg` se almacena en kilogramos con dos decimales (`DECIMAL(6,2)`); el peso corporal del perfil también se almacena en kg. La respuesta de registro devuelve el cálculo de 1RM estimado y el estado del rango cuando aplica, y ahora se recalcula de forma automática el PR del ejercicio.

Ejecuta las pruebas unitarias del validador desde `backend/`:

```bash
npm test
```

La prueba de punta a punta requiere una base MySQL/MariaDB local migrada y el servidor ejecutándose. `/api/health` confirma que Express está activo.

## Estructura

```
src/
├── app.js              # configuración de Express y montaje de rutas
├── server.js            # arranque del servidor + conexión a BD
├── config/database.js   # conexión Sequelize
├── models/               # un archivo por tabla + index.js con las relaciones
├── services/
│   ├── rankService.js    # cálculo de 1RM, ratio y rango (el core del negocio)
│   └── authService.js    # registro y login
├── controllers/          # reciben el request, llaman a los servicios
├── routes/                # definición de endpoints por recurso
├── middleware/auth.js     # verificación de JWT
└── seeders/seedData.js    # datos base para poder probar la API
```

## Estado actual

- Endpoints de ligas (`/api/leagues`) implementados y documentados
- Plantillas de entrenamiento implementadas en backend + app
- Criterios para elegibilidad de series y reflejo del cambio de peso corporal siguen siendo un punto de mejora para datos históricos reales
- Estándares verificables para cada ejercicio ancla requieren validación de producto con usuarios reales
- Pruebas automatizadas de integración con base de datos siguen pendientes
- El frontend usa React Native con Expo (Decisión #05); su guía de desarrollo está en `app/README.md`

El backend ya sirve de base funcional para la fase actual de producto, aunque todavía no está preparado para producción pública ni publicación en tiendas.
