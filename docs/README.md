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
| Frontend móvil | **React Native (Expo)** *(propuesto — pendiente de confirmar)* | Reutiliza el conocimiento previo en React; permite compilar para iOS y Android desde un solo código, y publicar en ambas tiendas vía EAS Build sin necesitar Mac propio |
| Backend | **Node.js + Express** | Stack ya dominado, API REST liviana |
| ORM | **Sequelize** | Mismo patrón ya usado en proyectos anteriores (LociónPro) |
| Base de datos | **MySQL / MariaDB** | Soporta bien las relaciones del modelo (usuarios, ejercicios, sets, rangos, ligas) y escala mejor que SQLite si la app crece con usuarios concurrentes |

> Nota: el frontend está marcado como "propuesto" porque entre React Native, Flutter y una PWA empaquetada con Capacitor se evaluaron opciones — falta confirmar cuál se usa antes de empezar a construir pantallas.

---

## Estructura de documentación

```
docs/
├── README.md                  # este archivo
├── DECISIONES.md              # decisiones técnicas y su justificación
├── 01-alcance-y-objetivo.md   # qué hace la app, qué NO hace, diferenciadores
├── 02-arquitectura.md         # cómo se conectan app / API / base de datos
├── 03-modelo-de-datos.md      # esquema SQL + fórmula del sistema de rangos
├── 04-api-endpoints.md        # especificación de la API REST
└── 05-pantallas-y-flujo.md    # flujo de usuario y pantallas principales
```

## Estructura de proyecto (propuesta, aún no construida)

```
gym-app/
├── backend/
│   ├── src/
│   │   ├── models/         # modelos Sequelize
│   │   ├── controllers/    # lógica de cada endpoint
│   │   ├── routes/         # definición de rutas Express
│   │   └── services/       # cálculo de rangos, 1RM, etc.
│   └── package.json
├── app/                     # React Native (Expo)
│   ├── screens/
│   ├── components/
│   └── package.json
└── docs/
```

## Cómo correr el proyecto

*(se completa cuando exista código funcional — por ahora el proyecto está en fase de diseño)*

---

## Publicación en tiendas

| Tienda | Costo | Notas |
|---|---|---|
| Google Play | $25 USD (pago único) | Revisión más rápida |
| Apple App Store | $99 USD/año | Revisión más estricta, requiere cuenta de desarrollador Apple |
