# Pantallas y Flujo de Usuario

El recorrido actual del producto ya cubre la base funcional del entrenamiento con métricas, rutinas, ligas y perfil personal. La app usa React Native + Expo, la API autenticada y la base de datos relacional con MySQL/MariaDB.

## Flujo principal

```
Registro / Login
      │
      ▼
Dashboard
      │
      ├── Entrenar
      │      ├── iniciar sesión
      │      ├── seleccionar ejercicio
      │      ├── registrar serie
      │      └── finalizar entrenamiento
      │
      ├── Historial
      │      ├── lista de sesiones
      │      └── detalle con series y eliminación
      │
      ├── Perfil
      │      ├── editar nombre y peso corporal
      │      ├── ver estado del backend
      │      └── consultar rangos y PRs
      │
      ├── Rutinas
      │      ├── crear plantilla
      │      └── aplicarla a una sesión
      │
      └── Ligas
             ├── crear temporada
             ├── unirse a liga
             └── ver ranking
```

## Pantallas actuales

1. **Registro / Login** — registro con email, contraseña, género, peso y creación de cuenta.
2. **Dashboard / Inicio** — resumen de la sesión actual, accesos a entrenamiento, historial, perfil, ligas y rutinas.
3. **Entrenar** — seleccionar ejercicio, ingresar carga, repeticiones, tipo de serie, descanso y guardar cada una.
4. **Historial** — listar sesiones pasadas y consultar el detalle de series con acción de borrado.
5. **Perfil** — editar nombre y peso corporal, consultar resumen de rangos y PRs, validar estado de conexión con la API.
6. **Rutinas** — crear plantillas con ejercicios, objetivos y aplicarlas a una nueva sesión.
7. **Ligas** — crear temporadas, unirse a una liga y consultar el ranking por volumen total.

## Estados del producto

- El flujo principal ya queda operativo en la app y en la API.
- La interfaz resuelve una base funcional que puede ser validada con usuarios reales.
- Los componentes sociales y de gamificación se mantienen dentro del alcance competitivo del proyecto, no como red social genérica.

## Ampliaciones futuras

- notificaciones push y recordatorios de entrenamiento
- panel de progreso más visual con tendencias históricas
- validación de estándares por sexo y ejercicio con usuarios reales
- preparación para despliegue en tiendas y EAS build
