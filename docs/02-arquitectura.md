# Arquitectura

## Visión general

```
┌─────────────────────┐         ┌──────────────────────┐        ┌─────────────────┐
│   App móvil          │  HTTPS  │   Backend API         │        │   Base de datos   │
│   (React Native/Expo)│ ──────► │   Node.js + Express    │ ─────► │   MySQL/MariaDB    │
│                      │ ◄────── │   + Sequelize ORM      │ ◄───── │                   │
└─────────────────────┘  JSON   └──────────────────────┘        └─────────────────┘
```

- La app móvil no habla directo con la base de datos — todo pasa por la API REST.
- El cálculo de rangos, 1RM y estándares de fuerza vive en el backend (capa de servicios), no en el cliente — así la lógica es la misma sin importar desde qué dispositivo se use.
- Autenticación vía JWT (token en cada request tras login).

## Capas del backend

```
routes/        → define los endpoints (qué URL, qué método HTTP)
controllers/    → recibe el request, valida datos, llama al servicio
services/       → lógica de negocio (cálculo de 1RM, ratio, rango)
models/         → definición de tablas con Sequelize
```

Esta separación evita que la lógica de cálculo de rangos quede mezclada con el código que maneja HTTP — así se puede probar el cálculo de rangos de forma aislada (unit tests) sin necesitar levantar el servidor.

## Despliegue (propuesto)

- **Backend:** cualquier proveedor con soporte Node.js (Railway, Render, VPS propio)
- **Base de datos:** MySQL gestionado (PlanetScale, Railway, o el mismo VPS)
- **App móvil:** build vía EAS Build (Expo) → subida manual a Google Play Console y App Store Connect

*(Se define proveedor específico más adelante, cuando el MVP esté listo para desplegar)*
