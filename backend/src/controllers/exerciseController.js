const { Exercise, MuscleGroup } = require('../models');

async function listExercises(req, res, next) {
  try {
    const exercises = await Exercise.findAll({
      include: [{ model: MuscleGroup, attributes: ['id', 'name'] }],
    });
    res.json(exercises);
  } catch (err) {
    next(err);
  }
}

module.exports = { listExercises };
