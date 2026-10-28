require('dotenv').config();
const { sequelize, MuscleGroup, Exercise, StrengthStandard } = require('../models');
const { DEFAULT_STANDARDS } = require('../services/strengthStandards');

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
