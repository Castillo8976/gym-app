const { isCalendarDate } = require('./dateValidation');

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validateLeaguePayload(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw badRequest('El cuerpo de la solicitud debe ser un objeto');
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const seasonStart = typeof payload.seasonStart === 'string' ? payload.seasonStart : '';
  const seasonEnd = typeof payload.seasonEnd === 'string' ? payload.seasonEnd : '';

  if (!name || name.length > 100) {
    throw badRequest('name debe tener entre 1 y 100 caracteres');
  }

  if (!isCalendarDate(seasonStart)) {
    throw badRequest('La fecha de inicio de temporada debe tener formato YYYY-MM-DD');
  }

  if (!isCalendarDate(seasonEnd)) {
    throw badRequest('La fecha de fin de temporada debe tener formato YYYY-MM-DD');
  }

  if (seasonEnd < seasonStart) {
    throw badRequest('La fecha de fin debe ser posterior o igual a la de inicio');
  }

  return {
    name,
    seasonStart,
    seasonEnd,
  };
}

module.exports = { validateLeaguePayload };
