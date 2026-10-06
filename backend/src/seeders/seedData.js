require('dotenv').config();
const { sequelize, MuscleGroup, Exercise, StrengthStandard } = require('../models');

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

async function seed() {
  const grupos = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos'];
  await sequelize.transaction(async (transaction) => {
    const gruposCreados = {};
    for (const nombre of grupos) {
      const [grupo] = await MuscleGroup.findOrCreate({
        where: { name: nombre },
        transaction,
      });
      gruposCreados[nombre] = grupo;
    }

    const ejerciciosAncla = [
      { name: 'Press de banca', grupo: 'Pecho' },
      { name: 'Peso muerto', grupo: 'Espalda' },
      { name: 'Sentadilla', grupo: 'Piernas' },
      { name: 'Press militar', grupo: 'Hombros' },
      { name: 'Curl con barra', grupo: 'Brazos' },
    ];

    const createdExercises = {};
    for (const exercise of ejerciciosAncla) {
      const [created] = await Exercise.findOrCreate({
        where: { name: exercise.name },
        defaults: {
          muscleGroupId: gruposCreados[exercise.grupo].id,
          isAnchor: true,
        },
        transaction,
      });
      createdExercises[exercise.name] = created;
    }

    for (const [exerciseName, genders] of Object.entries(DEFAULT_STANDARDS)) {
      const exercise = createdExercises[exerciseName];
      if (!exercise) continue;

      for (const [gender, ranks] of Object.entries(genders)) {
        for (const [rankName, ratio] of Object.entries(ranks)) {
          await StrengthStandard.findOrCreate({
            where: {
              exerciseId: exercise.id,
              gender,
              rankLevel: rankName,
            },
            defaults: {
              bodyweightRatio: ratio,
            },
            transaction,
          });
        }
      }
    }
  });

  console.log('Catálogo inicial cargado: grupos musculares, ejercicios ancla y estándares de rango.');
}

seed()
  .catch((err) => {
    console.error('Error al cargar el catálogo:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
