# Gym App — App de gimnasio con sistema de rangos

**Autor:** Juan David Castillo Mena (Silver)
**Tipo:** proyecto personal/freelance, con destino Google Play Store y Apple App Store.
**Última revisión de esta documentación:** contrastada con el código del commit `fc370d5` (octubre de 2026).

---

## ¿Qué es?

App móvil de registro de entrenamiento (peso, series, repeticiones) con un sistema de **rangos por grupo muscular** basado en estándares de fuerza **relativa al peso corporal**. El diferenciador frente a apps como Strong, Hevy o JEFIT es la gamificación: rangos por grupo muscular, ligas por temporada y progreso comparable entre usuarios de distinto peso.

Detalle competitivo y diferenciadores: [`01-alcance-y-objetivo.md`](./01-alcance-y-objetivo.md).

## Inicio rápido (desarrollo local)

Necesitas Node.js LTS, npm y una instancia local de MySQL o MariaDB.

1. **Base de datos.** Crea una base vacía:
   ```sql
   CREATE DATABASE gym_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. **Backend** (desde `backend/`):
   ```bash
   npm install
   cp .env.example .env        # PowerShell: Copy-Item .env.example .env
   # edita .env: credenciales de DB y un JWT_SECRET aleatorio de 32+ caracteres
   npm run db:migrate          # crea el esquema
   npm run seed                # carga grupos musculares, ejercicios ancla y estándares
   npm run dev                 # API en http://localhost:3000
   ```
3. **Comprobar:** `GET http://localhost:3000/api/health` debe responder `{"ok":true,"database":"connected"}`.
4. **App móvil** (desde `app/`): sigue [`app/README.md`](../app/README.md) (development build de Expo).

Si algo falla, revisa la sección de problemas frecuentes de [`backend/README.md`](../backend/README.md#problemas-frecuentes).

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| App móvil | React Native + Expo (SDK 57) | Un solo cliente para Android e iOS; development builds con `expo-dev-client` (Decisión #05) |
| Backend | Node.js + Express 4 | API REST liviana, stack ya dominado |
| ORM | Sequelize 6 | Mismo patrón usado en proyectos anteriores (LociónPro) |
| Base de datos | MySQL / MariaDB | Modelo relacional claro y escalable |
| Auth | JWT (7 días) + bcrypt | Sin estado en el servidor |

## Mapa de la documentación

| Documento | Contenido |
|---|---|
| [`01-alcance-y-objetivo.md`](./01-alcance-y-objetivo.md) | Qué hace la app, qué no, diferenciadores, público objetivo |
| [`02-arquitectura.md`](./02-arquitectura.md) | Componentes, capas, flujo de una petición, configuración y despliegue |
| [`03-modelo-de-datos.md`](./03-modelo-de-datos.md) | Fórmula de rangos, diagrama entidad-relación y diccionario de datos |
| [`04-api-endpoints.md`](./04-api-endpoints.md) | Referencia de la API REST con ejemplos, validaciones y errores |
| [`05-pantallas-y-flujo.md`](./05-pantallas-y-flujo.md) | Pantallas reales de la app y flujo de usuario |
| [`06-estado-y-limitaciones.md`](./06-estado-y-limitaciones.md) | Estado real, bugs conocidos, limitaciones y camino a producción |
| [`07-produccion-y-tiendas.md`](./07-produccion-y-tiendas.md) | Checklist operativo, privacidad y publicación |
| [`DECISIONES.md`](./DECISIONES.md) | Decisiones técnicas y su justificación |

Documentación por paquete: [`backend/README.md`](../backend/README.md) y [`app/README.md`](../app/README.md).

## Estado actual

| Área | Estado |
|---|---|
| Registro/login con JWT | Implementado |
| Sesiones y series (crear, editar, borrar) con recálculo de PR y rangos | Implementado |
| Rangos por grupo muscular (5 grupos × 5 rangos) | Implementado |
| Ligas por temporada con volumen automático | Implementado |
| Perfil editable con recálculo de rangos al cambiar el peso | Implementado |
| Rutinas (plantillas) | Implementado y cubierto por pruebas |
| Pruebas de integración contra base de datos | Una prueba, opt-in |
| Despliegue, CI/CD, monitoreo | No definido todavía |
| Publicación en tiendas | No iniciada |

## Estructura del repositorio

```
gym-app/
├── app/                      # cliente React Native (Expo)
│   ├── App.js                # toda la UI en un solo componente
│   ├── src/api.js            # cliente HTTP de la API
│   └── assets/
├── backend/
│   ├── src/
│   │   ├── app.js            # Express: middlewares, rutas, manejo de errores
│   │   ├── server.js         # arranque: valida JWT_SECRET, DB y migraciones
│   │   ├── migrate.js        # ejecutor de migraciones propio
│   │   ├── config/           # conexión Sequelize
│   │   ├── middleware/       # auth JWT
│   │   ├── routes/ controllers/ services/ validators/ models/
│   │   ├── migrations/       # esquema versionado
│   │   └── seeders/          # catálogo inicial
│   └── tests/                # node:test
└── docs/
```

## Publicación en tiendas

| Tienda | Costo (verifica el precio vigente) | Notas |
|---|---|---|
| Google Play | ~25 USD, pago único | Revisión más rápida |
| Apple App Store | ~99 USD/año | Revisión más estricta; requiere macOS/cuenta de desarrollador |

Requisitos previos que hoy **no** están cubiertos: ver la lista en [`06-estado-y-limitaciones.md`](./06-estado-y-limitaciones.md#camino-a-producción-y-tiendas).
