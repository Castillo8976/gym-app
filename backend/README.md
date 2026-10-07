# Backend — Gym App

API REST en Node.js + Express + Sequelize (MySQL), siguiendo el modelo de datos y la especificación de endpoints de la app de entrenamiento con rangos, PRs, rutinas y ligas.

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

Puedes comprobar el estado con:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Ejecuta las pruebas unitarias desde `backend/`:

```bash
npm test
```

## Estructura

```
src/
├── app.js
├── server.js
├── config/database.js
├── models/
├── services/
│   ├── rankService.js
│   └── authService.js
├── controllers/
├── routes/
├── middleware/auth.js
├── seeders/seedData.js
└── validators/
```

## Estado actual

- Registro de usuarios y autenticación JWT funcionando
- Sesiones y series con recálculo automático de PR y rangos
- Edición y borrado de series con recalculación de métricas
- Rutas de rutinas implementadas en backend + app
- Ligas por temporada y ranking por volumen total
- Perfil de usuario editable con peso corporal
- Validación de salud de backend con `/api/health`

## Siguiente refinamiento

- validación de estándares con datos históricos reales
- ajustes de rangos con usuarios reales y métricas de uso
- preparación para despliegue/tiendas y entornos de producción real
