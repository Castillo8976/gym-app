const { WorkoutSession, WorkoutSet, Exercise } = require('../models');
const {
  validateCreateSessionPayload,
  validateSetPayload,
} = require('../validators/workoutValidation');
const { registrarSetYActualizarPR, recalcUserPersonalRecords } = require('../services/rankService');
const { recalculateUserLeagueVolumesForDate } = require('../services/leagueVolumeService');

async function createSession(req, res, next) {
  try {
    const { sessionDate, notes } = validateCreateSessionPayload(req.body);
    const session = await WorkoutSession.create({
      userId: req.userId,
      sessionDate,
      notes,
    });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

async function listSessions(req, res, next) {
  try {
    const sessions = await WorkoutSession.findAll({
      where: { userId: req.userId },
      order: [['sessionDate', 'DESC']],
    });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
}

async function getSessionDetail(req, res, next) {
  try {
    const session = await WorkoutSession.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: [{
        model: WorkoutSet,
        include: [{ model: Exercise, attributes: ['id', 'name', 'muscleGroupId'] }],
      }],
      order: [[WorkoutSet, 'setOrder', 'ASC']],
    });
    if (!session) return res.status(404).json({ error: true, message: 'Sesión no encontrada' });
    res.json(session);
  } catch (err) {
    next(err);
  }
}

async function addSet(req, res, next) {
  try {
    const { exerciseId, weightKg, reps, setOrder, setType, restSeconds, actualRestSeconds, notes } = validateSetPayload(req.body);
    const session = await WorkoutSession.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!session) return res.status(404).json({ error: true, message: 'Sesión no encontrada' });

    const exercise = await Exercise.findByPk(exerciseId);
    if (!exercise) {
      return res.status(400).json({ error: true, message: 'El ejercicio indicado no existe' });
    }

    const set = await WorkoutSet.create({
      sessionId: session.id,
      exerciseId,
      weightKg,
      reps,
      setOrder,
      setType,
      restSeconds,
      actualRestSeconds,
      notes,
    });

    const calculations = await registrarSetYActualizarPR(req.userId, exerciseId, weightKg, reps);
    await recalculateUserLeagueVolumesForDate(req.userId, session.sessionDate);

    res.status(201).json({
      set,
      calculations: {
        status: calculations.esNuevoPR ? 'updated' : 'stable',
        isNewPR: calculations.esNuevoPR,
        estimated1rm: calculations.estimated1rm,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateSet(req, res, next) {
  try {
    const session = await WorkoutSession.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!session) {
      return res.status(404).json({ error: true, message: 'Sesión no encontrada' });
    }

    const set = await WorkoutSet.findOne({
      where: { id: req.params.setId, sessionId: session.id },
    });
    if (!set) {
      return res.status(404).json({ error: true, message: 'Serie no encontrada' });
    }

    const payload = validateSetPayload(req.body);
    const previousExerciseId = Number(set.exerciseId);

    set.exerciseId = payload.exerciseId;
    set.weightKg = payload.weightKg;
    set.reps = payload.reps;
    set.setOrder = payload.setOrder;
    set.setType = payload.setType;
    set.restSeconds = payload.restSeconds;
    set.actualRestSeconds = payload.actualRestSeconds;
    set.notes = payload.notes || null;
    await set.save();

    await recalcUserPersonalRecords(req.userId, previousExerciseId);
    if (Number(payload.exerciseId) !== Number(previousExerciseId)) {
      await recalcUserPersonalRecords(req.userId, Number(payload.exerciseId));
    }
    await recalculateUserLeagueVolumesForDate(req.userId, session.sessionDate);

    res.json(set);
  } catch (err) {
    next(err);
  }
}

async function deleteSet(req, res, next) {
  try {
    const session = await WorkoutSession.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!session) {
      return res.status(404).json({ error: true, message: 'Sesión no encontrada' });
    }

    const set = await WorkoutSet.findOne({
      where: { id: req.params.setId, sessionId: session.id },
    });
    if (!set) {
      return res.status(404).json({ error: true, message: 'Serie no encontrada' });
    }

    const exerciseId = Number(set.exerciseId);
    await set.destroy();
    await recalcUserPersonalRecords(req.userId, exerciseId);
    await recalculateUserLeagueVolumesForDate(req.userId, session.sessionDate);

    res.json({ deleted: true, setId: Number(req.params.setId) });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSession, listSessions, getSessionDetail, addSet, updateSet, deleteSet };
