# Alcance y Objetivo

## Objetivo general

Crear una app móvil de registro de entrenamiento que motive la constancia mediante un sistema de rangos basado en estándares reales de fuerza, publicable en Google Play Store y Apple App Store.

## Problema que resuelve

Las apps de tracking de gym existentes (Strong, Hevy, JEFIT, Fitbod, StrongLifts) cubren bien el registro de series/reps/peso y los PRs, pero fallan en:
- Gamificación real más allá de gráficas de progreso
- Comparación social sana (o no hay nada social, o es un feed sin contexto de fuerza)
- Motivación a largo plazo — mucha gente abandona estas apps a los 2-3 meses

## Diferenciadores de esta app

| # | Diferenciador | Estado |
|---|---|---|
| 1 | **Rangos basados en estándares reales de fuerza** (ratio 1RM/peso corporal), no solo en constancia de uso | Implementado |
| 2 | **Rangos por grupo muscular**, no un solo nivel general | Implementado (5 grupos) |
| 3 | **Ligas o temporadas** (estilo Duolingo) | Parcial: hay temporadas y clasificación por volumen; **no hay ascensos/descensos** |
| 4 | **Progreso sin comparación física**: el ranking es sobre números de fuerza, no fotos | Implementado |
| 5 | **Detección de estancamiento**: alertar cuando un ejercicio lleva 3+ semanas sin progreso | Fuera del alcance actual |

## Alcance del MVP (versión mínima)

**Incluye (estado actual):**
- Registro de usuario (peso corporal, género y fecha de nacimiento opcional)
- Registro de sesiones de entrenamiento (ejercicio, peso, reps, tipo de serie, descanso, notas)
- Cálculo automático de 1RM estimado y ratio de fuerza
- Sistema de rangos por grupo muscular (5 grupos, 5 rangos cada uno)
- Historial de progreso y PRs
- Plantillas de entrenamiento / rutinas reutilizables
- Ligas de temporada y ranking por volumen acumulado

**Queda fuera del MVP actual y del alcance de fase 2 del proyecto:**
- Detección automática de estancamiento con recomendaciones
- Integración con wearables
- Funciones sociales adicionales (seguir amigos, comentarios)
- Publicación en tiendas y soporte multi-usuario masivo

## Público objetivo

Personas que ya entrenan con pesas de forma regular (no principiantes absolutos) y quieren una forma más motivadora de medir su progreso que una simple gráfica.

## Dónde seguir leyendo

- Arquitectura: [`02-arquitectura.md`](./02-arquitectura.md)
- Fórmula de rangos y datos: [`03-modelo-de-datos.md`](./03-modelo-de-datos.md)
- Estado real y pendientes: [`06-estado-y-limitaciones.md`](./06-estado-y-limitaciones.md)
