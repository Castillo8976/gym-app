const { WorkoutTemplate, WorkoutTemplateExercise, Exercise, MuscleGroup, WorkoutSession, WorkoutSet } = require('../models');
const { validateCreateSessionPayload } = require('../validators/workoutValidation');
const {
  validateRoutineTemplatePayload,
  validateRoutineTemplateExercisePayload,
} = require('../validators/routineValidation');

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function listRoutines(req, res, next) {
  try {
    const routines = await WorkoutTemplate.findAll({
      where: { userId: req.user.id },
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
      where: { id: req.params.id, userId: req.user.id },
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

    const template = await WorkoutTemplate.create({
      userId: req.user.id,
      name: payload.name,
      description: payload.description || null,
      routineType: payload.routineType,
    });

    for (const exercisePayload of exercises) {
      const normalized = validateRoutineTemplateExercisePayload(exercisePayload);
      await WorkoutTemplateExercise.create({
        templateId: template.id,
        exerciseId: normalized.exerciseId,
        position: normalized.position,
        targetSets: normalized.targetSets,
        targetReps: normalized.targetReps,
        targetWeightKg: normalized.targetWeightKg,
        restSeconds: normalized.restSeconds,
        grouping: normalized.grouping,
      });
    }

    const created = await WorkoutTemplate.findByPk(template.id, {
      include: [{
        model: WorkoutTemplateExercise,
        include: [{ model: Exercise, include: [{ model: MuscleGroup, attributes: ['id', 'name'] }] }],
        order: [['position', 'ASC']],
      }],
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function applyRoutine(req, res, next) {
  try {
    const template = await WorkoutTemplate.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: WorkoutTemplateExercise,
        include: [{ model: Exercise, attributes: ['id', 'name'] }],
        order: [['position', 'ASC']],
      }],
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
      userId: req.user.id,
      sessionDate: sessionPayload.sessionDate,
      notes: sessionPayload.notes,
    });

    let createdSets = 0;
    let setOrder = 1;

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
        });
        setOrder += 1;
        createdSets += 1;
      }
    }

    res.status(201).json({
      session,
      createdSets,
      routine: {
        id: template.id,
        name: template.name,
        routineType: template.routineType,
      },
    });
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
