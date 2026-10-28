const { sequelize, WorkoutSession, WorkoutSet, Exercise } = require('../models');
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
    const result = await sequelize.transaction(async (transaction) => {
      const session = await WorkoutSession.findOne({
        where: { id: req.params.id, userId: req.userId },
        transaction,
      });
      if (!session) {
        const error = new Error('Sesión no encontrada');
        error.status = 404;
        throw error;
      }

      const exercise = await Exercise.findByPk(exerciseId, { transaction });
      if (!exercise) {
        const error = new Error('El ejercicio indicado no existe');
        error.status = 400;
        throw error;
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
      }, { transaction });

      const calculations = await registrarSetYActualizarPR(
        req.userId, exerciseId, weightKg, reps, transaction, setType
      );
      await recalculateUserLeagueVolumesForDate(req.userId, session.sessionDate, transaction);
      return { set, calculations };
    });

    res.status(201).json({
      set: result.set,
      calculations: {
        status: result.calculations.esNuevoPR ? 'updated' : 'stable',
        isNewPR: result.calculations.esNuevoPR,
        estimated1rm: result.calculations.estimated1rm,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateSet(req, res, next) {
  try {
    const payload = validateSetPayload(req.body);
    const updatedSet = await sequelize.transaction(async (transaction) => {
      const session = await WorkoutSession.findOne({
        where: { id: req.params.id, userId: req.userId },
        transaction,
      });
      if (!session) {
        const error = new Error('Sesión no encontrada');
        error.status = 404;
        throw error;
      }

      const set = await WorkoutSet.findOne({
        where: { id: req.params.setId, sessionId: session.id },
        transaction,
      });
      if (!set) {
        const error = new Error('Serie no encontrada');
        error.status = 404;
        throw error;
      }

      const exercise = await Exercise.findByPk(payload.exerciseId, { transaction });
      if (!exercise) {
        const error = new Error('El ejercicio indicado no existe');
        error.status = 400;
        throw error;
      }

      const previousExerciseId = Number(set.exerciseId);
      set.exerciseId = payload.exerciseId;
      set.weightKg = payload.weightKg;
      set.reps = payload.reps;
      set.setOrder = payload.setOrder;
      set.setType = payload.setType;
      set.restSeconds = payload.restSeconds;
      set.actualRestSeconds = payload.actualRestSeconds;
      set.notes = payload.notes || null;
      await set.save({ transaction });

      await recalcUserPersonalRecords(req.userId, previousExerciseId, transaction);
      if (Number(payload.exerciseId) !== Number(previousExerciseId)) {
        await recalcUserPersonalRecords(req.userId, Number(payload.exerciseId), transaction);
      }
      await recalculateUserLeagueVolumesForDate(req.userId, session.sessionDate, transaction);
      return set;
    });

    res.json(updatedSet);
  } catch (err) {
    next(err);
  }
}

async function deleteSet(req, res, next) {
  try {
    const deletedSetId = await sequelize.transaction(async (transaction) => {
      const session = await WorkoutSession.findOne({
        where: { id: req.params.id, userId: req.userId },
        transaction,
      });
      if (!session) {
        const error = new Error('Sesión no encontrada');
        error.status = 404;
        throw error;
      }

      const set = await WorkoutSet.findOne({
        where: { id: req.params.setId, sessionId: session.id },
        transaction,
      });
      if (!set) {
        const error = new Error('Serie no encontrada');
        error.status = 404;
        throw error;
      }

      const exerciseId = Number(set.exerciseId);
      await set.destroy({ transaction });
      await recalcUserPersonalRecords(req.userId, exerciseId, transaction);
      await recalculateUserLeagueVolumesForDate(req.userId, session.sessionDate, transaction);
      return Number(req.params.setId);
    });

    res.json({ deleted: true, setId: deletedSetId });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSession, listSessions, getSessionDetail, addSet, updateSet, deleteSet };
