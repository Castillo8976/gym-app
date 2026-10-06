function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validateLeaguePayload(payload = {}) {
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const seasonStart = typeof payload.seasonStart === 'string' ? payload.seasonStart : '';
  const seasonEnd = typeof payload.seasonEnd === 'string' ? payload.seasonEnd : '';

  if (!name) {
    throw badRequest('El nombre de la liga es obligatorio');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(seasonStart)) {
    throw badRequest('La fecha de inicio de temporada debe tener formato YYYY-MM-DD');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(seasonEnd)) {
    throw badRequest('La fecha de fin de temporada debe tener formato YYYY-MM-DD');
  }

  const startDate = new Date(`${seasonStart}T12:00:00`);
  const endDate = new Date(`${seasonEnd}T12:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw badRequest('Las fechas de la temporada no son válidas');
  }

  if (endDate < startDate) {
    throw badRequest('La fecha de fin debe ser posterior o igual a la de inicio');
  }

  return {
    name,
    seasonStart,
    seasonEnd,
  };
}

module.exports = { validateLeaguePayload };
