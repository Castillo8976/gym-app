function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validateCreateSessionPayload(payload) {
  if (!isObject(payload)) throw badRequest('El cuerpo de la solicitud debe ser un objeto');

  if (payload.sessionDate !== undefined && !isCalendarDate(payload.sessionDate)) {
    throw badRequest('sessionDate debe ser una fecha válida con formato YYYY-MM-DD');
  }
  if (payload.notes !== undefined && payload.notes !== null && typeof payload.notes !== 'string') {
    throw badRequest('notes debe ser texto');
  }

  return {
    sessionDate: payload.sessionDate || new Date().toISOString().slice(0, 10),
    notes: payload.notes ?? null,
  };
}

function validateSetPayload(payload) {
  if (!isObject(payload)) throw badRequest('El cuerpo de la solicitud debe ser un objeto');

  const { exerciseId, weightKg, reps, setOrder, setType, restSeconds, actualRestSeconds, notes } = payload;
  const allowedSetTypes = ['warmup', 'normal', 'failure', 'drop_set'];

  if (!Number.isSafeInteger(exerciseId) || exerciseId <= 0) {
    throw badRequest('exerciseId debe ser un entero positivo');
  }
  if (
    typeof weightKg !== 'number' ||
    !Number.isFinite(weightKg) ||
    weightKg <= 0 ||
    weightKg > 9999.99 ||
    Math.abs(weightKg * 100 - Math.round(weightKg * 100)) > 1e-8
  ) {
    throw badRequest('weightKg debe ser mayor que 0, estar en kg y tener como máximo 2 decimales');
  }
  if (!Number.isSafeInteger(reps) || reps <= 0) {
    throw badRequest('reps debe ser un entero positivo');
  }
  if (!Number.isSafeInteger(setOrder) || setOrder <= 0) {
    throw badRequest('setOrder debe ser un entero positivo');
  }
  if (setType !== undefined && !allowedSetTypes.includes(setType)) {
    throw badRequest('setType debe ser warmup, normal, failure o drop_set');
  }
  if (restSeconds !== undefined && (typeof restSeconds !== 'number' || !Number.isSafeInteger(restSeconds) || restSeconds < 0 || restSeconds > 600)) {
    throw badRequest('restSeconds debe ser un entero entre 0 y 600 segundos');
  }
  if (actualRestSeconds !== undefined && (typeof actualRestSeconds !== 'number' || !Number.isSafeInteger(actualRestSeconds) || actualRestSeconds < 0 || actualRestSeconds > 600)) {
    throw badRequest('actualRestSeconds debe ser un entero entre 0 y 600 segundos');
  }
  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    throw badRequest('notes debe ser texto');
  }

  const normalizedSet = {
    exerciseId,
    weightKg,
    reps,
    setOrder,
  };

  if (setType !== undefined || restSeconds !== undefined || actualRestSeconds !== undefined || notes !== undefined) {
    normalizedSet.setType = setType ?? 'normal';
    if (restSeconds !== undefined) normalizedSet.restSeconds = restSeconds;
    if (actualRestSeconds !== undefined) normalizedSet.actualRestSeconds = actualRestSeconds;
    if (notes !== undefined) normalizedSet.notes = notes ?? null;
  }

  return normalizedSet;
}

module.exports = { validateCreateSessionPayload, validateSetPayload };