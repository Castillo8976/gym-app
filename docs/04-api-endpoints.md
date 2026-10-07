# API Endpoints

Especificación actual del backend y del cliente móvil. La implementación ya cubre el flujo principal del MVP competitivo con rangos, PRs, rutinas y ligas.

## Estado general

La API responde bajo el prefijo `/api` y usa autenticación JWT para los endpoints de usuario, historial y configuración. Todas las respuestas usan JSON y los errores siguen la forma estándar:

```json
{
  "error": true,
  "message": "descripción legible del error"
}
```

## Auth

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta con nombre, email, password, género y peso corporal |
| POST | `/api/auth/login` | Login y devolución del JWT |
| GET | `/api/health` | Comprueba estado del backend y conexión a la base de datos |

## Usuarios y perfil

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users/me` | Obtener perfil del usuario autenticado |
| PATCH | `/api/users/me` | Actualizar nombre y/o peso corporal |
| GET | `/api/users/me/last-sets` | Última serie registrada por ejercicio |
| GET | `/api/users/me/rest-preferences` | Preferencias actuales de descanso |
| PATCH | `/api/users/me/rest-preferences` | Actualizar tiempos de descanso |
| GET | `/api/users/me/plate-config` | Configuración de discos disponibles |
| PUT | `/api/users/me/plate-config` | Reemplazar la lista de discos disponibles |
| POST | `/api/users/me/plate-config/suggest` | Sugerencia de combinación de discos para una carga |
| GET | `/api/users/me/ranks` | Rangos por grupo muscular |
| GET | `/api/users/me/records` | PRs por ejercicio |

## Ejercicios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/exercises` | Listar ejercicios disponibles con su grupo muscular |

## Sesiones de entrenamiento

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/workout-sessions` | Crear nueva sesión |
| GET | `/api/workout-sessions` | Listar sesiones del usuario (historial) |
| GET | `/api/workout-sessions/:id` | Detalle de una sesión con sus sets |
| POST | `/api/workout-sessions/:id/sets` | Registrar una serie |
| PATCH | `/api/workout-sessions/:sessionId/sets/:setId` | Editar una serie existente y recalcular PR/rango |
| DELETE | `/api/workout-sessions/:sessionId/sets/:setId` | Eliminar una serie y recalcular PR/rango |

## Rutinas y ligas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/routines` | Listar rutinas del usuario |
| POST | `/api/routines` | Crear una rutina con ejercicios y objetivos |
| GET | `/api/routines/:id` | Obtener detalle de una rutina |
| POST | `/api/routines/:id/apply` | Aplicar una rutina a una nueva sesión |
| GET | `/api/leagues` | Listar ligas abiertas y su estado |
| POST | `/api/leagues` | Crear una liga de temporada |
| POST | `/api/leagues/:id/join` | Inscribirse a una liga |
| GET | `/api/leagues/:id/members` | Ranking de participantes por volumen total |

## Reglas de negocio implementadas

- `POST /api/workout-sessions/:id/sets` valida `exerciseId`, `weightKg`, `reps` y `setOrder`.
- `weightKg` se almacena en kilogramos con dos decimales.
- Cada serie calcula el 1RM estimado con la fórmula de Epley y actualiza el mejor PR por ejercicio cuando aplica.
- El recálculo de rangos se dispara automáticamente tras guardar, editar o borrar una serie.
- Si no existen estándares para un ejercicio concreto, el backend usa una tabla de respaldo para resolver el rango.
- Las ligas calculan el ranking por volumen total y ordenan el leaderboard del usuario autenticado en función del mismo criterio.

## Estado real de implementación

La funcionalidad siguiente ya está activada en backend y cliente:

- registro de entrenamientos y series
- historial y detalle de sesiones
- PRs y rangos con recálculo automático
- edición y eliminación de series con recalcularización de métricas
- plantillas de rutina
- ligas por temporada y ranking
- perfil editable con peso corporal
- verificación de salud del backend y conexión a la base de datos

## Siguiente bloque productivo

Puntos todavía pendientes para refinamiento real del producto:

- validación con una base MySQL/MariaDB real en entorno local
- ajuste de estándares con datos históricos de usuarios reales
- revisión UX de edición avanzada y limpieza de experiencia en móvil
- preparación para despliegue y publicación de tiendas
