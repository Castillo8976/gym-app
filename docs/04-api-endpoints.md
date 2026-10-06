# API Endpoints

Especificación planeada para el MVP. Se ajusta a medida que se construye el backend.

## Auth

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta (nombre, email, password, género, peso corporal) |
| POST | `/api/auth/login` | Login, devuelve JWT |

## Usuarios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users/me` | Obtener perfil del usuario autenticado |
| PATCH | `/api/users/me` | Actualizar peso corporal u otros datos |

## Ejercicios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/exercises` | Listar ejercicios disponibles (con su grupo muscular) |

## Sesiones de entrenamiento

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/workout-sessions` | Crear nueva sesión |
| GET | `/api/workout-sessions` | Listar sesiones del usuario (historial) |
| GET | `/api/workout-sessions/:id` | Detalle de una sesión con sus sets |

## Sets (series)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/workout-sessions/:id/sets` | Registrar una serie (carga en kg, reps y ejercicio). Tras guardar la serie se recalcula el PR y el rango asociado cuando aplica |

## Progreso y rangos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users/me/ranks` | Rango actual por grupo muscular |
| GET | `/api/users/me/records` | Lista de PRs por ejercicio |
| GET | `/api/exercises/:id/progress` | Pendiente: historial de 1RM estimado (requiere habilitar y validar primero el cálculo) |

## Rutinas y ligas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/routines` | Listar rutinas del usuario |
| POST | `/api/routines` | Crear una rutina con ejercicios y objetivos |
| POST | `/api/routines/:id/apply` | Aplicar una rutina a una nueva sesión |
| GET | `/api/leagues` | Listar ligas abiertas y su estado |
| POST | `/api/leagues` | Crear una liga de temporada |
| POST | `/api/leagues/:id/join` | Inscribirse a una liga |
| GET | `/api/leagues/:id/members` | Ranking de participantes por volumen total |

## Formato de respuesta

Todas las respuestas en JSON. Errores con estructura consistente:

```json
{
  "error": true,
  "message": "descripción legible del error"
}
```

### Estado implementado del registro

`POST /api/workout-sessions/:id/sets` requiere autenticación y solo acepta una sesión del usuario autenticado. Valida un `exerciseId` existente, `weightKg` positivo con máximo dos decimales, `reps` y `setOrder` como enteros positivos. `weightKg` representa kilogramos; el historial incluye el ejercicio de cada serie.

La respuesta satisfactoria incluye el estado de recálculo del sistema de rangos y PR con `calculations.status`, `isNewPR` y `estimated1rm` cuando se produce un registro válido. El backend actual aplica la fórmula de Epley y resuelve el rango del ejercicio/ grupo a partir del ratio resultante, con respaldo a tablas de baja si no existen estándares típicos en BD.

Las tablas de `03-modelo-de-datos.md` siguen siendo un punto de referencia de fuerza, no una fuente oficial de validación estadística para todos los ejercicios. El flujo de ligas y plantillas queda ya activado en backend y cliente según la dinámica aprobada para la fase 2.

## Pendiente / siguiente bloque

- Historias de usuario para edición y borrado de series con recalculación de PR/rango
- Historial detallado de 1RM por ejercicio
- Revisión de estándares por sexo y ejercicio con datos reales de usuarios
- Endpoints sociales si se agregan más adelante
