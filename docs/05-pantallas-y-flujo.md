# Pantallas y Flujo de Usuario

Borrador inicial — stack confirmado: React Native con Expo (ver `DECISIONES.md`, Decisión #05). El primer recorrido móvil conectado cubre registro/inicio de sesión, registro de sesión y series, y consulta de historial; los rangos no se muestran hasta aprobar sus reglas.

## Flujo principal

```
Registro/Login
      │
      ▼
Onboarding (peso corporal, género, edad)
      │
      ▼
  Dashboard ──────────────┬─────────────────┬──────────────┐
      │                   │                 │              │
      ▼                   ▼                 ▼              ▼
Registrar sesión    Ver rangos por    Historial /      Perfil /
(elegir ejercicio,   grupo muscular   PRs por          configuración
 peso, reps)          (5 barras)      ejercicio
```

## Pantallas del MVP

1. **Registro / Login** — email + password
2. **Onboarding** — peso corporal, género, edad (necesarios para calcular el ratio de fuerza)
3. **Dashboard** — resumen de los 5 rangos por grupo muscular, acceso rápido a "Registrar sesión"
4. **Registrar sesión** — seleccionar ejercicio, ingresar peso/reps por serie, guardar
5. **Detalle de rango por grupo muscular** — muestra el rango actual, cuánto falta para el siguiente, y el ejercicio ancla que lo determina
6. **Historial** — lista de sesiones pasadas, con filtro por ejercicio
7. **Perfil** — editar peso corporal, cerrar sesión

## Fuera del MVP

- Pantalla de ligas/ranking social
- Pantalla de rutinas predefinidas
- Notificaciones push de estancamiento
