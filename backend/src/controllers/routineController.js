const {
  sequelize,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  Exercise,
  MuscleGroup,
  WorkoutSession,
  WorkoutSet,
} = require('../models');
const { validateCreateSessionPayload } = require('../validators/workoutValidation');
const {
  validateRoutineTemplatePayload,
  validateRoutineTemplateExercisePayload,
} = require('../validators/routineValidation');
const { recalcUserPersonalRecords } = require('../services/rankService');
const { recalculateUserLeagueVolumesForDate } = require('../services/leagueVolumeService');

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function listRoutines(req, res, next) {
  try {
    const routines = await WorkoutTemplate.findAll({
      where: { userId: req.userId },
      include: [{
        model: WorkoutTemplateExercise,
        include: [{ model: Exercise, include: [{ model: MuscleGroup, attributes: ['id', 'name'] }] }],
        order: [['position', 'ASC']],
      }],
      order: [['id', 'ASC']],
    });

    res.json(routines);
  } catch (error) {
    next(error);
  }
}

async function getRoutine(req, res, next) {
  try {
    const routine = await WorkoutTemplate.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: [{
        model: WorkoutTemplateExercise,
        include: [{ model: Exercise, include: [{ model: MuscleGroup, attributes: ['id', 'name'] }] }],
        order: [['position', 'ASC']],
      }],
    });

    if (!routine) {
      const error = new Error('Rutina no encontrada');
      error.status = 404;
      throw error;
    }

    res.json(routine);
  } catch (error) {
    next(error);
  }
}

async function createRoutine(req, res, next) {
  try {
    const payload = validateRoutineTemplatePayload(req.body || {});
    const exercises = Array.isArray(req.body?.exercises) ? req.body.exercises : [];

    if (exercises.length === 0) {
      throw badRequest('La rutina debe incluir al menos un ejercicio');
    }

    const normalizedExercises = exercises.map(validateRoutineTemplateExercisePayload);
    const created = await sequelize.transaction(async (transaction) => {
      const template = await WorkoutTemplate.create({
        userId: req.userId,
        name: payload.name,
        description: payload.description || null,
        routineType: payload.routineType,
      }, { transaction });

      await WorkoutTemplateExercise.bulkCreate(normalizedExercises.map((exercise) => ({
        templateId: template.id,
        exerciseId: exercise.exerciseId,
        position: exercise.position,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        targetWeightKg: exercise.targetWeightKg,
        restSeconds: exercise.restSeconds,
        grouping: exercise.grouping,
      })), { transaction });

      return WorkoutTemplate.findByPk(template.id, {
        include: [{
          model: WorkoutTemplateExercise,
          include: [{ model: Exercise, include: [{ model: MuscleGroup, attributes: ['id', 'name'] }] }],
          order: [['position', 'ASC']],
        }],
        transaction,
      });
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function applyRoutine(req, res, next) {
  try {
    const result = await sequelize.transaction(async (transaction) => {
      const template = await WorkoutTemplate.findOne({
        where: { id: req.params.id, userId: req.userId },
        include: [{
          model: WorkoutTemplateExercise,
          include: [{ model: Exercise, attributes: ['id', 'name'] }],
          order: [['position', 'ASC']],
        }],
        transaction,
      });

      if (!template) {
        const error = new Error('Rutina no encontrada');
        error.status = 404;
        throw error;
      }

      const sessionPayload = validateCreateSessionPayload({
        sessionDate: req.body?.sessionDate,
        notes: req.body?.notes ?? `Rutina aplicada: ${template.name}`,
      });

      const session = await WorkoutSession.create({
        userId: req.userId,
        sessionDate: sessionPayload.sessionDate,
        notes: sessionPayload.notes,
      }, { transaction });

      let createdSets = 0;
      let setOrder = 1;
      const exerciseIds = new Set();

      for (const item of template.WorkoutTemplateExercises || []) {
        const totalSets = Number(item.targetSets);
        for (let index = 0; index < totalSets; index += 1) {
          await WorkoutSet.create({
            sessionId: session.id,
            exerciseId: item.exerciseId,
            weightKg: Number(item.targetWeightKg || 0),
            reps: Number(item.targetReps),
            setOrder,
            setType: 'normal',
            restSeconds: Number(item.restSeconds || 90),
          }, { transaction });
          setOrder += 1;
          createdSets += 1;
          exerciseIds.add(Number(item.exerciseId));
        }
      }

      for (const exerciseId of exerciseIds) {
        await recalcUserPersonalRecords(req.userId, exerciseId, transaction);
      }
      await recalculateUserLeagueVolumesForDate(req.userId, session.sessionDate, transaction);

      return {
        session,
        createdSets,
        routine: {
          id: template.id,
          name: template.name,
          routineType: template.routineType,
        },
      };
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRoutines,
  getRoutine,
  createRoutine,
  applyRoutine,
};
