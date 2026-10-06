function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value, fieldName, maxLength = 300) {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  if (typeof value !== 'string') {
    throw badRequest(`${fieldName} debe ser texto`);
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw badRequest(`${fieldName} no puede estar vacío`);
  }
  if (normalized.length > maxLength) {
    throw badRequest(`${fieldName} debe tener menos de ${maxLength} caracteres`);
  }
  return normalized;
}

function validateRoutineTemplatePayload(payload) {
  if (!isObject(payload)) throw badRequest('El cuerpo de la solicitud debe ser un objeto');

  const name = normalizeText(payload.name, 'name', 100);
  const description = payload.description === undefined || payload.description === null
    ? ''
    : String(payload.description).trim();
  const allowedTypes = ['single', 'superset', 'circuit'];
  const routineType = payload.routineType ?? 'single';

  if (!allowedTypes.includes(routineType)) {
    throw badRequest('routineType debe ser single, superset o circuit');
  }

  return {
    name,
    description,
    routineType,
  };
}

function validateRoutineTemplateExercisePayload(payload) {
  if (!isObject(payload)) throw badRequest('Cada ejercicio de la rutina debe ser un objeto');

  const exerciseId = Number(payload.exerciseId);
  const position = Number(payload.position);
  const targetSets = Number(payload.targetSets);
  const targetReps = Number(payload.targetReps);
  const targetWeightKg = Number(payload.targetWeightKg);
  const restSeconds = Number(payload.restSeconds);

  if (!Number.isSafeInteger(exerciseId) || exerciseId <= 0) {
    throw badRequest('exerciseId debe ser un entero positivo');
  }
  if (!Number.isSafeInteger(position) || position <= 0) {
    throw badRequest('position debe ser un entero positivo');
  }
  if (!Number.isSafeInteger(targetSets) || targetSets <= 0 || targetSets > 20) {
    throw badRequest('targetSets debe ser un entero entre 1 y 20');
  }
  if (!Number.isSafeInteger(targetReps) || targetReps <= 0 || targetReps > 30) {
    throw badRequest('targetReps debe ser un entero entre 1 y 30');
  }
  if (!Number.isFinite(targetWeightKg) || targetWeightKg < 0 || targetWeightKg > 9999.99) {
    throw badRequest('targetWeightKg debe ser un valor mayor o igual a 0 y con un máximo de 2 decimales');
  }
  if (!Number.isSafeInteger(restSeconds) || restSeconds < 0 || restSeconds > 600) {
    throw badRequest('restSeconds debe ser un entero entre 0 y 600');
  }

  const grouping = payload.grouping ?? 'main';
  const allowedGroupings = ['main', 'paired', 'circuit'];
  if (!allowedGroupings.includes(grouping)) {
    throw badRequest('grouping debe ser main, paired o circuit');
  }

  return {
    exerciseId,
    position,
    targetSets,
    targetReps,
    targetWeightKg: Number(targetWeightKg.toFixed(2)),
    restSeconds,
    grouping,
  };
}

module.exports = {
  validateRoutineTemplatePayload,
  validateRoutineTemplateExercisePayload,
};
