const { DEFAULT_STANDARDS } = require('../services/strengthStandards');

async function up(queryInterface, Sequelize) {
  const exercises = await queryInterface.sequelize.query(
    'SELECT id, name FROM exercises',
    { type: Sequelize.QueryTypes.SELECT },
  );
  const existing = await queryInterface.sequelize.query(
    'SELECT exercise_id, gender, rank_level FROM strength_standards',
    { type: Sequelize.QueryTypes.SELECT },
  );
  const existingKeys = new Set(existing.map((row) => (
    `${row.exercise_id}:${row.gender}:${row.rank_level}`
  )));
  const rows = [];

  for (const exercise of exercises) {
    const standards = Object.entries(DEFAULT_STANDARDS).find(([name]) => (
      name.toLowerCase() === String(exercise.name).toLowerCase()
    ))?.[1];
    if (!standards) continue;

    for (const [gender, ranks] of Object.entries(standards)) {
      for (const [rankLevel, bodyweightRatio] of Object.entries(ranks)) {
        const key = `${exercise.id}:${gender}:${rankLevel}`;
        if (!existingKeys.has(key)) {
          rows.push({
            exercise_id: exercise.id,
            gender,
            rank_level: rankLevel,
            bodyweight_ratio: bodyweightRatio,
          });
        }
      }
    }
  }

  if (rows.length > 0) {
    await queryInterface.bulkInsert('strength_standards', rows);
  }
}

async function down() {
  throw new Error('No se eliminan estándares en rollback para proteger valores personalizados; restaura un backup.');
}

module.exports = { up, down };
