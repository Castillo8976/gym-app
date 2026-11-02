const {
  User,
  UserRank,
  MuscleGroup,
  PersonalRecord,
  Exercise,
  StrengthStandard,
} = require('../models');

async function getMyRanks(req, res, next) {
  try {
    const [user, ranks, anchors, records] = await Promise.all([
      User.findByPk(req.userId, { attributes: ['bodyweightKg'] }),
      UserRank.findAll({
        where: { userId: req.userId },
        include: [{ model: MuscleGroup, attributes: ['id', 'name'] }],
      }),
      Exercise.findAll({ where: { isAnchor: true }, attributes: ['id', 'muscleGroupId'] }),
      PersonalRecord.findAll({
        where: { userId: req.userId },
        attributes: ['exerciseId', 'estimated1rm'],
      }),
    ]);
    const recordsByExercise = new Map(records.map((record) => [Number(record.exerciseId), Number(record.estimated1rm)]));
    const anchorIdsByGroup = new Map();
    for (const anchor of anchors) {
      const groupId = Number(anchor.muscleGroupId);
      anchorIdsByGroup.set(groupId, [...(anchorIdsByGroup.get(groupId) || []), Number(anchor.id)]);
    }

    const payload = [];
    for (const rank of ranks) {
      const groupId = Number(rank.muscleGroupId);
      const ratios = (anchorIdsByGroup.get(groupId) || [])
        .map((exerciseId) => Number(recordsByExercise.get(exerciseId)) / Number(user?.bodyweightKg))
        .filter(Number.isFinite);
      const ratio = ratios.length > 0 ? Math.max(...ratios) : 0;
      const standards = await StrengthStandard.findAll({
        where: { exerciseId: anchorIdsByGroup.get(groupId) || [] },
        attributes: ['rankLevel', 'bodyweightRatio'],
        order: [['bodyweightRatio', 'ASC']],
      });
      const thresholds = {};
      for (const standard of standards) {
        thresholds[standard.rankLevel] = Number(standard.bodyweightRatio);
      }
      const currentThreshold = thresholds[rank.currentRank] || 0;
      const nextRanks = ['bronce', 'plata', 'oro', 'platino', 'diamante'];
      const nextRank = nextRanks[nextRanks.indexOf(rank.currentRank) + 1];
      const nextThreshold = nextRank ? thresholds[nextRank] : currentThreshold;
      const progressPercent = nextThreshold > currentThreshold
        ? Math.min(100, Math.max(0, ((ratio - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
        : (ratio >= currentThreshold ? 100 : 0);
      payload.push({
        ...rank.toJSON(),
        ratio: Number(ratio.toFixed(2)),
        progressPercent: Number(progressPercent.toFixed(1)),
        thresholds,
        nextRank: nextRank || null,
      });
    }
    res.json(payload);
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
