const DEFAULT_STANDARDS = {
  'Press de banca': {
    male: { bronce: 0.5, plata: 0.75, oro: 1, platino: 1.25, diamante: 1.5 },
    female: { bronce: 0.3, plata: 0.45, oro: 0.6, platino: 0.75, diamante: 0.9 },
  },
  Sentadilla: {
    male: { bronce: 0.75, plata: 1, oro: 1.5, platino: 1.75, diamante: 2 },
    female: { bronce: 0.5, plata: 0.7, oro: 1, platino: 1.25, diamante: 1.5 },
  },
  'Peso muerto': {
    male: { bronce: 1, plata: 1.25, oro: 1.75, platino: 2, diamante: 2.5 },
    female: { bronce: 0.6, plata: 0.8, oro: 1.1, platino: 1.4, diamante: 1.75 },
  },
  'Press militar': {
    male: { bronce: 0.45, plata: 0.65, oro: 0.85, platino: 1.05, diamante: 1.2 },
    female: { bronce: 0.25, plata: 0.4, oro: 0.55, platino: 0.7, diamante: 0.85 },
  },
  'Curl con barra': {
    male: { bronce: 0.35, plata: 0.55, oro: 0.75, platino: 0.9, diamante: 1.1 },
    female: { bronce: 0.2, plata: 0.35, oro: 0.5, platino: 0.65, diamante: 0.8 },
  },
};

function normalizeExerciseName(value) {
  return String(value || '').trim().toLowerCase();
}

function getDefaultStandards(exerciseName) {
  return Object.entries(DEFAULT_STANDARDS).find(
    ([name]) => normalizeExerciseName(name) === normalizeExerciseName(exerciseName)
  )?.[1] || null;
}

module.exports = { DEFAULT_STANDARDS, getDefaultStandards };
