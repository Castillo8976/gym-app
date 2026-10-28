function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateUpdateMePayload(payload) {
  if (!isObject(payload)) throw badRequest('El cuerpo de la solicitud debe ser un objeto');

  const allowedFields = ['name', 'bodyweightKg'];
  const providedFields = Object.keys(payload).filter((field) => payload[field] !== undefined);
  if (providedFields.length === 0) {
    throw badRequest('Debe proporcionar name o bodyweightKg');
  }
  if (providedFields.some((field) => !allowedFields.includes(field))) {
    throw badRequest('Solo se permiten los campos name y bodyweightKg');
  }

  const normalized = {};
  if (payload.name !== undefined) {
    if (typeof payload.name !== 'string') {
      throw badRequest('name debe ser texto');
    }
    const name = payload.name.trim();
    if (name.length === 0 || name.length > 100) {
      throw badRequest('name debe tener entre 1 y 100 caracteres');
    }
    normalized.name = name;
  }

  if (payload.bodyweightKg !== undefined) {
    const { bodyweightKg } = payload;
    if (
      typeof bodyweightKg !== 'number' ||
      !Number.isFinite(bodyweightKg) ||
      bodyweightKg <= 0 ||
      bodyweightKg > 999.99 ||
      Math.abs(bodyweightKg * 100 - Math.round(bodyweightKg * 100)) > 1e-8
    ) {
      throw badRequest('bodyweightKg debe ser positivo, estar en kg y tener como máximo 2 decimales');
    }
    normalized.bodyweightKg = bodyweightKg;
  }

  return normalized;
}

function validateRestPreferencesPayload(payload) {
  if (!isObject(payload)) throw badRequest('El cuerpo de la solicitud debe ser un objeto');

  const allowedFields = ['defaultRestSeconds', 'defaultWarmupRestSeconds'];
  const providedFields = Object.keys(payload).filter((field) => payload[field] !== undefined);
  if (providedFields.length === 0) {
    throw badRequest('Debe proporcionar al menos una preferencia de descanso');
  }
  if (providedFields.some((field) => !allowedFields.includes(field))) {
    throw badRequest('Solo se permiten defaultRestSeconds y defaultWarmupRestSeconds');
  }

  const normalized = {};
  for (const field of providedFields) {
    const value = payload[field];
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 600) {
      throw badRequest(`${field} debe ser un entero entre 0 y 600 segundos`);
    }
    normalized[field] = value;
  }

  return normalized;
}

module.exports = { validateRestPreferencesPayload, validateUpdateMePayload };
