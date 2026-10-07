function normalizeVolume(value) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function calculateLeagueVolume(sets = []) {
  const eligibleSetTypes = new Set(['normal', 'failure', 'drop_set']);
  const totalVolume = sets.reduce((total, set) => {
    if (!set || !eligibleSetTypes.has(set.setType || 'normal')) return total;

    const weightKg = Number(set.weightKg ?? set.weight_kg);
    const reps = Number(set.reps);
    if (!Number.isFinite(weightKg) || !Number.isFinite(reps) || weightKg <= 0 || reps <= 0) {
      return total;
    }
    return total + weightKg * reps;
  }, 0);

  return Number(totalVolume.toFixed(2));
}

function calculateLeagueStandings(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  return rows
    .map((row) => {
      const plainRow = row && typeof row.toJSON === 'function' ? row.toJSON() : row;
      const totalVolumeKg = Number(normalizeVolume(plainRow.totalVolumeKg).toFixed(2));
      return {
        ...plainRow,
        totalVolumeKg,
        user: plainRow.user || plainRow.User || null,
      };
    })
    .sort((left, right) => Number(right.totalVolumeKg) - Number(left.totalVolumeKg))
    .map((row, index) => ({
      ...row,
      position: index + 1,
    }));
}

module.exports = { calculateLeagueStandings, calculateLeagueVolume, normalizeVolume };
