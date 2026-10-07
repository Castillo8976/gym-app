# Modelo de Datos y Sistema de Rangos

## 1. Fórmula del sistema de rangos

### Paso 1: Estimar el 1RM (una repetición máxima)
No siempre el usuario levanta a 1 repetición, así que estimamos con la fórmula de Epley:

```
1RM_estimado = peso_levantado * (1 + reps / 30)
```

Ejemplo: 80kg x 8 reps → 80 * (1 + 8/30) = 101.3 kg estimados a 1RM.

### Paso 2: Calcular el ratio de fuerza relativa
```
ratio = 1RM_estimado / peso_corporal_usuario
```

Este ratio es lo que se compara contra tablas de estándares, NO el peso absoluto — así alguien de 60kg y alguien de 100kg compiten de forma justa.

### Paso 3: Comparar contra los umbrales de rango
Cada ejercicio principal tiene su propia tabla de ratios por rango, separada por género (los estándares de fuerza relativa difieren biológicamente entre hombres y mujeres — esto no es opinable, está bien documentado en tablas de fuerza como ExRx/Strength Level).

**Ejemplo — Press de banca (ratio 1RM / peso corporal):**

| Rango     | Hombres | Mujeres |
|-----------|---------|---------|
| Bronce    | 0.50    | 0.30    |
| Plata     | 0.75    | 0.45    |
| Oro       | 1.00    | 0.60    |
| Platino   | 1.25    | 0.75    |
| Diamante  | 1.50    | 0.90    |

**Ejemplo — Sentadilla:**

| Rango     | Hombres | Mujeres |
|-----------|---------|---------|
| Bronce    | 0.75    | 0.50    |
| Plata     | 1.00    | 0.70    |
| Oro       | 1.50    | 1.00    |
| Platino   | 1.75    | 1.25    |
| Diamante  | 2.00    | 1.50    |

**Ejemplo — Peso muerto:**

| Rango     | Hombres | Mujeres |
|-----------|---------|---------|
| Bronce    | 1.00    | 0.60    |
| Plata     | 1.25    | 0.80    |
| Oro       | 1.75    | 1.10    |
| Platino   | 2.00    | 1.40    |
| Diamante  | 2.50    | 1.75    |

Estos números son un punto de partida razonable (basados en estándares de fuerza conocidos), pero conviene ajustarlos con feedback real de usuarios una vez tengas datos.

### Paso 4: Rango por grupo muscular (no solo por ejercicio)
Cada grupo muscular (pecho, espalda, piernas, hombros, brazos) toma el rango de su "ejercicio ancla":
- Pecho → Press de banca
- Piernas → Sentadilla
- Espalda/Posterior → Peso muerto
- Hombros → Press militar
- Brazos → Curl con barra

Así el usuario ve 5 barras de progreso, una por grupo muscular, y un rango "general" que puede ser el promedio o el mínimo de los 5 (recomiendo el mínimo — motiva a entrenar lo que se descuida).

---

## 2. Esquema de base de datos (MySQL / MariaDB)

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  birth_date DATE,
  bodyweight_kg DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE muscle_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL -- Pecho, Espalda, Piernas, Hombros, Brazos
);

CREATE TABLE exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  muscle_group_id INT NOT NULL,
  is_anchor BOOLEAN DEFAULT FALSE, -- true si es el ejercicio que define el rango del grupo
  FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id)
);

CREATE TABLE strength_standards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exercise_id INT NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  rank_level ENUM('bronce','plata','oro','platino','diamante') NOT NULL,
  bodyweight_ratio DECIMAL(4,2) NOT NULL,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE workout_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_date DATE NOT NULL,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE workout_sets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  exercise_id INT NOT NULL,
  weight_kg DECIMAL(6,2) NOT NULL,
  reps INT NOT NULL,
  set_order INT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES workout_sessions(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE personal_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  estimated_1rm DECIMAL(6,2) NOT NULL,
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE user_ranks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  muscle_group_id INT NOT NULL,
  current_rank ENUM('bronce','plata','oro','platino','diamante') NOT NULL DEFAULT 'bronce',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id)
);

CREATE TABLE leagues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  season_start DATE NOT NULL,
  season_end DATE NOT NULL
);

CREATE TABLE league_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  league_id INT NOT NULL,
  user_id INT NOT NULL,
  total_volume_kg DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (league_id) REFERENCES leagues(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Notas de diseño:**
- `is_anchor` en `exercises` marca los ejercicios que participan en el rango de su grupo muscular.
- `user_ranks` refleja el mayor rango actual entre los PRs de los ejercicios ancla del grupo. Se recalcula al conseguir un PR, editar o borrar una serie, y cambiar el peso corporal del perfil; no se recalcula en cada serie sin PR.
- `league_members.total_volume_kg` almacena la suma de carga por repeticiones de las series elegibles dentro de la temporada. La actualización al unirse y al crear, editar o borrar series está implementada según [Decisión #06](./DECISIONES.md#decisión-06).

### Volumen de liga

- Fórmula por serie: `weightKg * reps`; se suman los resultados y se redondean a dos decimales.
- Series incluidas: `normal`, `failure` y `drop_set`. `warmup` queda excluida.
- Período: `sessionDate >= seasonStart` y `sessionDate <= seasonEnd`.
- Al crear una membresía, calcular desde el inicio de la temporada e incluir las sesiones elegibles anteriores al ingreso.
- Crear, editar o borrar una serie actualiza el total de las membresías afectadas. El cálculo se hace desde las series persistidas, no mediante un trigger ni un job diario.
- En caso de empate, ordenar por `userId` ascendente como segundo criterio.

---

## 3. Lógica de cálculo (pseudocódigo en Node/Sequelize)

```javascript
function estimar1RM(peso, reps) {
  return peso * (1 + reps / 30);
}

async function recalcularRangoGrupo(userId, muscleGroupId) {
  const user = await User.findByPk(userId);
  const ejerciciosAncla = await Exercise.findAll({
    where: { muscleGroupId, isAnchor: true }
  });

  const rangos = [];
  for (const exercise of ejerciciosAncla) {
    const pr = await PersonalRecord.findOne({
      where: { userId, exerciseId: exercise.id },
      order: [['estimated_1rm', 'DESC']]
    });
    if (!pr) continue;

    const ratio = pr.estimated1rm / user.bodyweightKg;
    const estandares = await StrengthStandard.findAll({
      where: { exerciseId: exercise.id, gender: user.gender },
      order: [['bodyweight_ratio', 'ASC']]
    });
    rangos.push(resolverRango(ratio, estandares, exercise.name));
  }

  const nuevoRango = rangos.reduce((highest, rank) => (
    ordenRangos.indexOf(rank) > ordenRangos.indexOf(highest) ? rank : highest
  ), 'bronce');
  await UserRank.upsert({ userId, muscleGroupId, currentRank: nuevoRango });
}

async function recalcularRangosTrasCambiarPeso(userId) {
  const gruposConRangoOPr = await obtenerGruposAnclaConRangoOPr(userId);
  for (const muscleGroupId of gruposConRangoOPr) {
    await recalcularRangoGrupo(userId, muscleGroupId);
  }
}
```

## 4. Estado actual de implementación

La base de datos ya incluye la estructura principal para usuarios, sesiones, series, rangos, PRs, rutinas y ligas. El backend recalcula PRs y rangos al registrar, editar o borrar series; también recalcula los rangos existentes cuando cambia el peso corporal del perfil. Los grupos usan el mayor rango actual de sus ejercicios ancla y vuelven a bronce si ya no conservan un PR elegible.

## 5. Reglas pendientes para validación real

Las tablas de umbrales siguen siendo un punto de referencia útil, no una firma estadística definitiva para todos los ejercicios. El siguiente refinamiento real del producto requiere:

- validar la fuente y población de cada estándar con usuarios reales
- confirmar qué series son elegibles para cada ejercicio y variante
- validar con usuarios reales la fuente y sensibilidad de los estándares calculados con el peso actual del perfil; el esquema no conserva el peso histórico por sesión

La decisión de usar Epley ya está aplicada y validada en la lógica del backend. El ranking por temporadas forma parte del flujo activo de ligas, pero su ajuste final sigue siendo un punto de tunning con uso real.
