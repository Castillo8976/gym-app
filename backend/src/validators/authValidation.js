function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeEmail(email) {
  if (typeof email !== 'string') throw badRequest('email no es válido');
  const normalized = email.trim().toLowerCase();
  if (
    normalized.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  ) {
    throw badRequest('email no es válido');
  }
  return normalized;
}

function validatePassword(password, isRegistration) {
  if (typeof password !== 'string') throw badRequest('password es obligatorio');
  const length = Buffer.byteLength(password, 'utf8');
  if (length === 0 || length > 72 || (isRegistration && length < 8)) {
    throw badRequest(isRegistration
      ? 'password debe tener entre 8 y 72 bytes'
      : 'password no es válido');
  }
  return password;
}

function validateRegistrationPayload(payload) {
  if (!isObject(payload)) throw badRequest('El cuerpo de la solicitud debe ser un objeto');

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (name.length === 0 || name.length > 100) {
    throw badRequest('name debe tener entre 1 y 100 caracteres');
  }
  if (!['male', 'female'].includes(payload.gender)) {
    throw badRequest('gender debe ser male o female');
  }
  if (
    typeof payload.bodyweightKg !== 'number' ||
    !Number.isFinite(payload.bodyweightKg) ||
    payload.bodyweightKg <= 0 ||
    payload.bodyweightKg > 999.99 ||
    Math.abs(payload.bodyweightKg * 100 - Math.round(payload.bodyweightKg * 100)) > 1e-8
  ) {
    throw badRequest('bodyweightKg debe ser positivo, estar en kg y tener como máximo 2 decimales');
  }
  if (payload.birthDate !== undefined && !isCalendarDate(payload.birthDate)) {
    throw badRequest('birthDate debe ser una fecha válida con formato YYYY-MM-DD');
  }

  return {
    name,
    email: normalizeEmail(payload.email),
    password: validatePassword(payload.password, true),
    gender: payload.gender,
    birthDate: payload.birthDate,
    bodyweightKg: payload.bodyweightKg,
  };
}

function validateLoginPayload(payload) {
  if (!isObject(payload)) throw badRequest('El cuerpo de la solicitud debe ser un objeto');
  return {
    email: normalizeEmail(payload.email),
    password: validatePassword(payload.password, false),
  };
}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

module.exports = { validateLoginPayload, validateRegistrationPayload };