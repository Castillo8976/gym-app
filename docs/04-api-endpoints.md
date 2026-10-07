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
| PATCH | `/api/users/me` | Actualizar nombre y/o peso corporal; al cambiar el peso, recalcular los rangos existentes |
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
| GET | `/api/leagues/:id/members` | Ranking de participantes por volumen almacenado |

## Reglas de negocio implementadas

- `POST /api/workout-sessions/:id/sets` valida `exerciseId`, `weightKg`, `reps` y `setOrder`.
- `weightKg` se almacena en kilogramos con dos decimales.
- Cada serie calcula el 1RM estimado con la fórmula de Epley y actualiza el mejor PR por ejercicio cuando aplica.
- Los rangos se recalculan ante un nuevo PR, al editar o borrar una serie, y al cambiar el peso corporal del perfil. El rango por grupo es el mayor rango vigente entre sus ejercicios ancla.
- Si no existen estándares para un ejercicio concreto, el backend usa una tabla de respaldo para resolver el rango.
- El leaderboard ordena por `totalVolumeKg`; el backend recalcula ese total desde las series elegibles al unirse y después de cada mutación de serie.

### Regla de volumen

- Sumar `weightKg * reps` para series `normal`, `failure` y `drop_set`; excluir `warmup`.
- Incluir sesiones con fecha dentro de la temporada, incluyendo ambos días límite.
- Al crear la membresía, inicializar el total desde el inicio de la temporada, incluso si el miembro se une tarde.
- Recalcular los totales afectados al unirse y después de crear, editar o borrar una serie.
- Desempatar por `userId` ascendente.

## Estado real de implementación

La funcionalidad siguiente ya está activada en backend y cliente:

- registro de entrenamientos y series
- historial y detalle de sesiones
- PRs y rangos con recálculo automático
- edición y eliminación de series con recalcularización de métricas
- plantillas de rutina
- ligas por temporada y ranking
- perfil editable con peso corporal
- recálculo de rangos tras cambiar el peso corporal del perfil
- verificación de salud del backend y conexión a la base de datos

## Siguiente bloque productivo

Puntos todavía pendientes para refinamiento real del producto:

- ampliar las pruebas automatizadas de integración contra MySQL/MariaDB a más rutas y escenarios
- ajuste de estándares con datos históricos de usuarios reales
- revisión UX de edición avanzada y limpieza de experiencia en móvil
- preparación para despliegue y publicación de tiendas
