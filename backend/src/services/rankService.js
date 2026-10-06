const { Exercise, StrengthStandard, PersonalRecord, UserRank, User, WorkoutSet, WorkoutSession } = require('../models');

const RANK_ORDER = ['bronce', 'plata', 'oro', 'platino', 'diamante'];

const DEFAULT_STANDARDS = {
  'press de banca': {
    male: { bronce: 0.5, plata: 0.75, oro: 1, platino: 1.25, diamante: 1.5 },
    female: { bronce: 0.3, plata: 0.45, oro: 0.6, platino: 0.75, diamante: 0.9 },
  },
  sentadilla: {
    male: { bronce: 0.75, plata: 1, oro: 1.5, platino: 1.75, diamante: 2 },
    female: { bronce: 0.5, plata: 0.7, oro: 1, platino: 1.25, diamante: 1.5 },
  },
  'peso muerto': {
    male: { bronce: 1, plata: 1.25, oro: 1.75, platino: 2, diamante: 2.5 },
    female: { bronce: 0.6, plata: 0.8, oro: 1.1, platino: 1.4, diamante: 1.75 },
  },
  'press militar': {
    male: { bronce: 0.45, plata: 0.65, oro: 0.85, platino: 1.05, diamante: 1.2 },
    female: { bronce: 0.25, plata: 0.4, oro: 0.55, platino: 0.7, diamante: 0.85 },
  },
  'curl con barra': {
    male: { bronce: 0.35, plata: 0.55, oro: 0.75, platino: 0.9, diamante: 1.1 },
    female: { bronce: 0.2, plata: 0.35, oro: 0.5, platino: 0.65, diamante: 0.8 },
  },
};

function normalizeExerciseName(value) {
  return String(value || '').trim().toLowerCase();
}

function getExerciseStandardThresholds(exerciseName, gender) {
  const normalized = normalizeExerciseName(exerciseName);
  const table = DEFAULT_STANDARDS[normalized] || DEFAULT_STANDARDS['press de banca'];
  const normalizedGender = gender === 'female' ? 'female' : 'male';
  const mapping = table[normalizedGender] || table.male;

  return {
    bronce: Number(mapping.bronce),
    plata: Number(mapping.plata),
    oro: Number(mapping.oro),
    platino: Number(mapping.platino),
    diamante: Number(mapping.diamante),
  };
}

function resolveRankForRatio(ratio, gender, exerciseName = 'Press de banca') {
  const thresholds = getExerciseStandardThresholds(exerciseName, gender);
  const orderedRanks = Object.entries(thresholds).sort((a, b) => Number(a[1]) - Number(b[1]));
  let result = 'bronce';
  for (const [rank, threshold] of orderedRanks) {
    if (Number(ratio) >= Number(threshold)) {
      result = rank;
    }
  }
  return result;
}

function summarizeBestPRsFromSets(sets = []) {
  const bestByExercise = new Map();

  for (const set of sets) {
    if (!set || !set.exerciseId) continue;

    const weightKg = Number(set.weightKg ?? set.weight_kg ?? 0);
    const reps = Number(set.reps ?? 0);
    if (!Number.isFinite(weightKg) || !Number.isFinite(reps) || weightKg <= 0 || reps <= 0) continue;

    const exerciseId = Number(set.exerciseId);
    const estimated1rm = Number((weightKg * (1 + reps / 30)).toFixed(2));
    const previous = bestByExercise.get(exerciseId) || 0;
    if (estimated1rm > previous) {
      bestByExercise.set(exerciseId, estimated1rm);
    }
  }

  return [...bestByExercise.entries()]
    .sort((left, right) => Number(left[0]) - Number(right[0]))
    .map(([exerciseId, estimated1rm]) => ({ exerciseId, estimated1rm }));
}

/**
 * Decisión #04 (DECISIONES.md): fórmula de Epley para estimar 1RM
 * a partir de una serie de peso x repeticiones.
 */
function estimar1RM(pesoKg, reps) {
  return pesoKg * (1 + reps / 30);
}

/**
 * Decisión #01: el ratio (1RM estimado / peso corporal) es lo que se
 * compara contra los estándares — no el peso absoluto.
 */
async function calcularRatio(userId, exerciseId) {
  const user = await User.findByPk(userId);
  const mejorPR = await PersonalRecord.findOne({
    where: { userId, exerciseId },
    order: [['estimated1rm', 'DESC']],
  });

  if (!user || !mejorPR) return null;

  return Number(mejorPR.estimated1rm) / Number(user.bodyweightKg);
}

/**
 * Compara el ratio contra la tabla de estándares del ejercicio (por género)
 * y devuelve el rango más alto alcanzado.
 */
async function calcularRangoPorRatio(exerciseId, gender, ratio) {
  const exercise = await Exercise.findByPk(exerciseId);
  const estandares = await StrengthStandard.findAll({
    where: { exerciseId, gender },
    order: [['bodyweightRatio', 'ASC']],
  });

  if (!estandares.length) {
    return resolveRankForRatio(ratio, gender, exercise?.name || 'Press de banca');
  }

  let rango = 'bronce';
  for (const estandar of estandares) {
    if (ratio >= Number(estandar.bodyweightRatio)) {
      rango = estandar.rankLevel;
    }
  }
  return rango;
}

/**
 * Decisión #03: el rango solo se recalcula cuando se registra un nuevo PR,
 * no en cada set — y solo si el ejercicio es "ancla" de su grupo muscular
 * (Decisión #02: rango por grupo muscular, no un rango general único).
 */
async function actualizarRangoSiAplica(userId, exerciseId) {
  const exercise = await Exercise.findByPk(exerciseId);
  if (!exercise || !exercise.isAnchor) return null;

  const user = await User.findByPk(userId);
  const ratio = await calcularRatio(userId, exerciseId);
  if (ratio === null || !user) return null;

  const nuevoRango = await calcularRangoPorRatio(exerciseId, user.gender, ratio);

  const [userRank] = await UserRank.findOrCreate({
    where: { userId, muscleGroupId: exercise.muscleGroupId },
    defaults: { currentRank: nuevoRango },
  });

  const rankActualIndex = RANK_ORDER.indexOf(userRank.currentRank);
  const rankNuevoIndex = RANK_ORDER.indexOf(nuevoRango);
  if (rankNuevoIndex > rankActualIndex) {
    userRank.currentRank = nuevoRango;
    await userRank.save();
  }

  return userRank;
}

/**
 * Registra un nuevo set y, si supera el PR anterior, crea el PersonalRecord
 * y dispara el recálculo de rango.
 */
async function registrarSetYActualizarPR(userId, exerciseId, pesoKg, reps) {
  const nuevoEstimado = estimar1RM(pesoKg, reps);

  const mejorPRActual = await PersonalRecord.findOne({
    where: { userId, exerciseId },
    order: [['estimated1rm', 'DESC']],
  });

  const esNuevoPR = !mejorPRActual || nuevoEstimado > Number(mejorPRActual.estimated1rm);

  if (esNuevoPR) {
    await PersonalRecord.create({ userId, exerciseId, estimated1rm: nuevoEstimado });
    await actualizarRangoSiAplica(userId, exerciseId);
  }

  return { estimated1rm: Number(nuevoEstimado.toFixed(2)), esNuevoPR };
}

async function recalcUserPersonalRecords(userId, exerciseId = null) {
  const where = exerciseId ? { exerciseId } : {};
  const sets = await WorkoutSet.findAll({
    where,
    include: [{
      model: WorkoutSession,
      where: { userId },
      attributes: ['id', 'userId'],
      required: true,
    }],
  });

  const targets = new Set();
  for (const set of sets) {
    targets.add(Number(set.exerciseId));
  }

  if (exerciseId) {
    targets.add(Number(exerciseId));
  }

  for (const targetExerciseId of [...targets].sort((left, right) => left - right)) {
    const exerciseSets = sets.filter((set) => Number(set.exerciseId) === Number(targetExerciseId));
    const summary = summarizeBestPRsFromSets(exerciseSets);
    const bestEntry = summary[0] || null;

    await PersonalRecord.destroy({ where: { userId, exerciseId: targetExerciseId } });
    if (bestEntry) {
      await PersonalRecord.create({
        userId,
        exerciseId: targetExerciseId,
        estimated1rm: Number(bestEntry.estimated1rm),
      });
      await actualizarRangoSiAplica(userId, targetExerciseId);
    }
  }

  return true;
}

module.exports = {
  DEFAULT_STANDARDS,
  getExerciseStandardThresholds,
  resolveRankForRatio,
  estimar1RM,
  calcularRatio,
  calcularRangoPorRatio,
  actualizarRangoSiAplica,
  registrarSetYActualizarPR,
  summarizeBestPRsFromSets,
  recalcUserPersonalRecords,
};
