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
| POST | `/api/workout-sessions/:id/sets` | Registrar una serie (peso, reps, ejercicio) — dispara el recálculo de PR/rango si aplica |

## Progreso y rangos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users/me/ranks` | Rango actual por grupo muscular |
| GET | `/api/users/me/records` | Lista de PRs por ejercicio |
| GET | `/api/exercises/:id/progress` | Historial de 1RM estimado a lo largo del tiempo (para gráfica) |

## Formato de respuesta

Todas las respuestas en JSON. Errores con estructura consistente:

```json
{
  "error": true,
  "message": "descripción legible del error"
}
```

## Pendiente para fase 2

- Endpoints de ligas (`/api/leagues`, `/api/leagues/:id/members`)
- Endpoints sociales si se agregan más adelante
