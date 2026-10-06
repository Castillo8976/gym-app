const { User, WorkoutSession, WorkoutSet, Exercise, UserRestPreference, ExercisePlateConfig } = require('../models');

const DEFAULT_REST_SECONDS = 90;
const DEFAULT_WARMUP_REST_SECONDS = 60;
const DEFAULT_PLATES = [2.5, 5, 10, 20, 25, 45];

function parsePlateList(rawPlates) {
  if (!Array.isArray(rawPlates) || rawPlates.length === 0) return DEFAULT_PLATES;
  return [...new Set(rawPlates
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b - a))];
}

function buildPlateSuggestion(targetWeightKg, rawPlates) {
  const sanitizedTarget = Number(targetWeightKg);
  if (!Number.isFinite(sanitizedTarget) || sanitizedTarget <= 0) {
    const error = new Error('targetWeightKg debe ser un número mayor que 0');
    error.status = 400;
    throw error;
  }

  const availablePlates = parsePlateList(rawPlates);
  let remaining = sanitizedTarget;
  const stacks = [];

  for (const plate of availablePlates) {
    const count = Math.floor(remaining / plate);
    if (count <= 0) continue;
    stacks.push({ plateKg: Number(plate), count });
    remaining -= plate * count;
  }

  return {
    targetWeightKg: Number(sanitizedTarget.toFixed(2)),
    totalWeightKg: Number((sanitizedTarget - remaining).toFixed(2)),
    remainingWeightKg: Number(remaining.toFixed(2)),
    feasible: remaining < 0.001,
    stacks,
  };
}

async function getMe(req, res, next) {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['passwordHash'] },
    });
    if (!user) return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { bodyweightKg, name } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: true, message: 'Usuario no encontrado' });

    if (bodyweightKg !== undefined) user.bodyweightKg = bodyweightKg;
    if (name !== undefined) user.name = name;
    await user.save();

    res.json({ id: user.id, name: user.name, bodyweightKg: user.bodyweightKg });
  } catch (err) {
    next(err);
  }
}

async function getLastSets(req, res, next) {
  try {
    const sets = await WorkoutSet.findAll({
      include: [
        { model: Exercise, attributes: ['id', 'name'] },
        { model: WorkoutSession, attributes: ['id', 'sessionDate'], where: { userId: req.userId } },
      ],
      order: [['id', 'DESC']],
    });

    const latestByExercise = new Map();
    for (const set of sets) {
      const key = String(set.exerciseId);
      if (latestByExercise.has(key)) continue;
      latestByExercise.set(key, {
        exerciseId: set.exerciseId,
        exerciseName: set.Exercise?.name || 'Ejercicio',
        weightKg: Number(set.weightKg),
        reps: set.reps,
        setType: set.setType || 'normal',
        actualRestSeconds: set.actualRestSeconds,
        sessionDate: set.WorkoutSession?.sessionDate,
      });
    }

    res.json([...latestByExercise.values()].sort((a, b) => a.exerciseName.localeCompare(b.exerciseName)));
  } catch (err) {
    next(err);
  }
}

async function getRestPreferences(req, res, next) {
  try {
    const [preferences] = await UserRestPreference.findOrCreate({
      where: { userId: req.userId },
      defaults: {
        userId: req.userId,
        defaultRestSeconds: DEFAULT_REST_SECONDS,
        defaultWarmupRestSeconds: DEFAULT_WARMUP_REST_SECONDS,
      },
    });

    res.json({
      defaultRestSeconds: Number(preferences.defaultRestSeconds),
      defaultWarmupRestSeconds: Number(preferences.defaultWarmupRestSeconds),
    });
  } catch (err) {
    next(err);
  }
}

async function updateRestPreferences(req, res, next) {
  try {
    const { defaultRestSeconds, defaultWarmupRestSeconds } = req.body || {};
    const [preferences] = await UserRestPreference.findOrCreate({
      where: { userId: req.userId },
      defaults: {
        userId: req.userId,
        defaultRestSeconds: DEFAULT_REST_SECONDS,
        defaultWarmupRestSeconds: DEFAULT_WARMUP_REST_SECONDS,
      },
    });

    if (defaultRestSeconds !== undefined) {
      preferences.defaultRestSeconds = Math.max(0, Number(defaultRestSeconds));
    }
    if (defaultWarmupRestSeconds !== undefined) {
      preferences.defaultWarmupRestSeconds = Math.max(0, Number(defaultWarmupRestSeconds));
    }
    await preferences.save();

    res.json({
      defaultRestSeconds: Number(preferences.defaultRestSeconds),
      defaultWarmupRestSeconds: Number(preferences.defaultWarmupRestSeconds),
    });
  } catch (err) {
    next(err);
  }
}

async function getPlateConfig(req, res, next) {
  try {
    const rows = await ExercisePlateConfig.findAll({
      where: { userId: req.userId },
      order: [['plateKg', 'DESC']],
    });

    const plates = rows.length > 0
      ? rows.map((row) => Number(row.plateKg)).sort((a, b) => b - a)
      : DEFAULT_PLATES.slice();

    res.json({ plates });
  } catch (err) {
    next(err);
  }
}

async function upsertPlateConfig(req, res, next) {
  try {
    const plates = parsePlateList(req.body?.plates ?? DEFAULT_PLATES);
    await ExercisePlateConfig.destroy({ where: { userId: req.userId } });
    await ExercisePlateConfig.bulkCreate(plates.map((plateKg) => ({ userId: req.userId, plateKg })));
    res.json({ plates });
  } catch (err) {
    next(err);
  }
}

async function suggestPlateStack(req, res, next) {
  try {
    const rows = await ExercisePlateConfig.findAll({
      where: { userId: req.userId },
      order: [['plateKg', 'DESC']],
    });
    const plates = rows.length > 0
      ? rows.map((row) => Number(row.plateKg)).sort((a, b) => b - a)
      : DEFAULT_PLATES.slice();

    const suggestion = buildPlateSuggestion(req.body?.targetWeightKg, plates);
    res.json(suggestion);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  updateMe,
  getLastSets,
  getRestPreferences,
  updateRestPreferences,
  getPlateConfig,
  upsertPlateConfig,
  suggestPlateStack,
};
