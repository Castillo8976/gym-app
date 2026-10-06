# App de Gym con Sistema de Rangos

**Autor:** Juan David Castillo Mena (Silver)
**Tipo:** Proyecto personal/freelance — destino: Google Play Store y Apple App Store

---

## ¿Qué es?

App móvil de registro de entrenamiento (pesos, series, repeticiones) con un sistema de **rangos por grupo muscular** basado en estándares reales de fuerza relativa al peso corporal — no en gráficas planas ni en "días entrenados". El diferenciador frente a apps como Strong, Hevy o JEFIT es la gamificación real: rangos por grupo muscular, ligas por temporada, y progreso medido de forma justa entre usuarios de distinto peso corporal.

Ver el detalle competitivo y los diferenciadores en [`01-alcance-y-objetivo.md`](./01-alcance-y-objetivo.md).

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend móvil | **React Native con Expo** *(confirmado en Decisión #05)* | Un cliente móvil para Android e iOS; se usarán development builds con `expo-dev-client` para validar módulos nativos |
| Backend | **Node.js + Express** | Stack ya dominado, API REST liviana |
| ORM | **Sequelize** | Mismo patrón ya usado en proyectos anteriores (LociónPro) |
| Base de datos | **MySQL / MariaDB** | Soporta bien las relaciones del modelo (usuarios, ejercicios, sets, rangos, ligas) y escala mejor que SQLite si la app crece con usuarios concurrentes |

El stack móvil está confirmado. Expo Go puede servir para comprobaciones iniciales, pero el desarrollo y la validación incluyen development builds. La configuración de EAS y cualquier publicación en tiendas se decidirán y autorizarán por separado.

---

## Estructura de documentación

```
docs/
├── README.md                  # este archivo
├── DECISIONES.md              # decisiones técnicas y su justificación
├── 01-alcance-y-objetivo.md   # qué hace la app, qué NO hace, diferenciadores
├── 02-arquitectura.md         # cómo se conectan app / API / base de datos
├── 03-modelo-de-datos.md      # esquema SQL + fórmula del sistema de rangos
├── 04-api-endpoints.md        # especificación de la API REST y fase 2 actual
├── 05-pantallas-y-flujo.md    # flujo de usuario y pantallas principales
└── ...
```

## Estado actual del proyecto

- Fase 1: registro de entrenamiento, PRs y rangos por grupo muscular validados en backend
- Fase 2: plantillas de rutina y ligas/temporadas implementadas en backend + aplicación
- Bloque siguiente: validación de datos históricos, ajustes de estándares y revisión UX con pasos de edición/eliminación de series

## Estructura de proyecto

```
gym-app/
├── backend/
│   ├── src/
│   │   ├── models/         # modelos Sequelize
│   │   ├── controllers/    # lógica de cada endpoint
│   │   ├── routes/         # definición de rutas Express
│   │   └── services/       # cálculo de rangos, 1RM, etc.
│   └── package.json
├── app/                     # React Native (Expo, JavaScript)
│   ├── screens/
│   ├── components/
│   └── package.json
└── docs/
```

## Cómo correr el proyecto

El cliente Expo está en `app/`. Sus comandos de instalación, configuración de API y desarrollo están documentados en [`app/README.md`](../app/README.md). El recorrido móvil inicial registra entrenamientos y consulta el historial; no presenta cálculos de rangos pendientes.

---

## Publicación en tiendas

| Tienda | Costo | Notas |
|---|---|---|
| Google Play | $25 USD (pago único) | Revisión más rápida |
| Apple App Store | $99 USD/año | Revisión más estricta, requiere cuenta de desarrollador Apple |
