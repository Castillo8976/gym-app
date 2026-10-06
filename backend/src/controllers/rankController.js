const { UserRank, MuscleGroup, PersonalRecord, Exercise } = require('../models');

async function getMyRanks(req, res, next) {
  try {
    const ranks = await UserRank.findAll({
      where: { userId: req.userId },
      include: [{ model: MuscleGroup, attributes: ['id', 'name'] }],
    });
    res.json(ranks);
  } catch (err) {
    next(err);
  }
}

async function getMyRecords(req, res, next) {
  try {
    const records = await PersonalRecord.findAll({
      where: { userId: req.userId },
      include: [{ model: Exercise, attributes: ['id', 'name'] }],
      order: [['achieved_at', 'DESC']],
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyRanks, getMyRecords };
