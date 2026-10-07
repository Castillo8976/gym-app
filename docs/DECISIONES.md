# DECISIONES TÉCNICAS

**Proyecto:** App de Gym con Sistema de Rangos
**Autor:** Juan David Castillo Mena (Silver)

---

## Decisión #01

**¿Qué decidí?**
Calcular el rango del usuario con base en el **ratio de fuerza relativa** (1RM estimado / peso corporal), no en el peso absoluto levantado.

**¿Por qué?**
Comparar peso absoluto entre usuarios es injusto: alguien de 60kg y alguien de 100kg no compiten en igualdad de condiciones. El ratio normaliza la comparación y permite tablas de estándares de fuerza reconocidas (tipo ExRx/Strength Level), separadas por género porque los estándares de fuerza relativa difieren biológicamente entre hombres y mujeres.

**Alternativa descartada:** Rango basado solo en peso absoluto o en frecuencia de entrenamiento — más simple de calcular, pero no refleja progreso real ni permite comparación justa entre usuarios.

---

## Decisión #02

**¿Qué decidí?**
El sistema de rangos se calcula **por grupo muscular** (5 rangos independientes: pecho, espalda, piernas, hombros, brazos), no un solo rango general para toda la app.

**¿Por qué?**
Un rango único esconde desequilibrios (alguien fuerte de piernas pero débil de espalda no lo nota). Rangos separados por grupo muscular hacen visible dónde entrenar más, y dan 5 barras de progreso en vez de una sola — más superficie para la gamificación.

**Alternativa descartada:** Rango general único (promedio de todos los ejercicios) — más simple de mostrar en UI, pero oculta información útil para el usuario.

---

## Decisión #03

**¿Qué decidí?**
Al registrar series, el rango se recalcula cuando aparece un nuevo PR, no en cada serie. También se recalcula después de editar o borrar series y al cambiar el peso corporal del perfil. El rango de cada grupo es el mayor rango actual de sus ejercicios ancla.

**¿Por qué?**
Recalcular en cada set sin un nuevo PR sería costoso y no aporta valor. Las ediciones, eliminaciones y cambios de peso sí pueden invalidar un rango previo, por lo que esos cambios reconstruyen el resultado desde los PRs actuales. Los PR históricos se comparan con el peso actual del perfil; no se conserva el peso corporal por sesión.

**Alternativa descartada:** Recalcular en cada serie guardada — innecesario y más caro en llamadas a base de datos.

---

## Decisión #04

**¿Qué decidí?**
Usar la **fórmula de Epley** para estimar el 1RM (`peso * (1 + reps/30)`) en vez de exigir que el usuario siempre reporte una repetición máxima real.

**¿Por qué?**
Casi nadie entrena a 1RM real en el día a día (es riesgoso y poco práctico). Epley es la fórmula más usada en la industria fitness para estimar 1RM a partir de series de varias repeticiones, con buen balance entre precisión y simplicidad de cálculo.

**Alternativa descartada:** Fórmula de Brzycki — similarmente válida, pero Epley es más simple y suficientemente precisa para el rango de reps típico (1-10) que se usa en esta app.

---

## Decisión #05

**¿Qué decidí?**
Usar **React Native con Expo** para la aplicación móvil de Android e iOS.

**¿Por qué?**
Permite mantener un único cliente móvil para ambas plataformas y utilizar development builds para probar módulos nativos. Expo Go puede apoyar pruebas iniciales, pero no será la única validación del proyecto.

**Implementación:** JavaScript con Expo SDK `57.0.27` y React Native `0.86.3`. `expo-dev-client` (`57.0.19`), `expo-secure-store` (`57.0.4`) y `expo-system-ui` (`57.0.4`) son compatibles con ese SDK. La vista web usa `react-dom` (`19.2.3`) y `react-native-web` (`0.21.2`). Las dependencias se instalan con `npx expo install` y quedan bloqueadas en `app/package-lock.json`. El cliente se comunica exclusivamente con la API REST documentada.

**Alcance de esta decisión:** no selecciona todavía un proveedor de despliegue, configura EAS en una cuenta ni autoriza builds de tienda, despliegues o publicaciones.

---

## Decisión #06

**¿Qué decidí?**
El volumen de liga será la suma de `weightKg * reps` de las series de trabajo de cada miembro. Se cuentan las series `normal`, `failure` y `drop_set`; se excluyen las `warmup`. Solo cuentan sesiones cuya `sessionDate` esté entre `seasonStart` y `seasonEnd`, ambos inclusive.

Al crear la membresía, el volumen inicial se calcula con todas las sesiones elegibles del miembro desde el inicio de la temporada, aunque se una tarde. Así el resultado depende del período deportivo, no de cuándo se creó la membresía. El total se guarda con dos decimales en `league_members.total_volume_kg` y se actualiza al crear, editar o borrar series. Si dos miembros empatan, el ID de usuario ascendente define el orden estable.

**¿Por qué?**
La fecha de sesión y el tipo de serie ya existen en el modelo; la tabla de membresías no guarda fecha de ingreso. Contar retroactivamente evita agregar una migración solo para reconstruir el total de una persona que se une tarde y mantiene el criterio igual para toda la temporada.

**Alternativa descartada:** contar solo desde el ingreso del usuario — requeriría persistir `joinedAt` y tratar de forma distinta a miembros de una misma temporada.
