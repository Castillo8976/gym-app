const { Op } = require('sequelize');
const { League, LeagueMember, WorkoutSession, WorkoutSet } = require('../models');
const { calculateLeagueVolume } = require('./leagueService');

async function calculateMemberSeasonVolume(userId, league, transaction) {
  const sessions = await WorkoutSession.findAll({
    where: {
      userId,
      sessionDate: {
        [Op.between]: [league.seasonStart, league.seasonEnd],
      },
    },
    include: [{
      model: WorkoutSet,
      attributes: ['weightKg', 'reps', 'setType'],
      required: false,
    }],
    transaction,
  });

  const sets = sessions.flatMap((session) => session.WorkoutSets || []);
  return calculateLeagueVolume(sets);
}

async function recalculateLeagueMemberVolume(leagueId, userId, transaction) {
  const [league, membership] = await Promise.all([
    League.findByPk(leagueId, { transaction }),
    LeagueMember.findOne({ where: { leagueId, userId }, transaction }),
  ]);
  if (!league || !membership) return null;

  const totalVolumeKg = await calculateMemberSeasonVolume(userId, league, transaction);
  membership.totalVolumeKg = totalVolumeKg;
  await membership.save({ transaction });
  return totalVolumeKg;
}

async function recalculateUserLeagueVolumesForDate(userId, sessionDate, transaction) {
  const leagues = await League.findAll({
    where: {
      seasonStart: { [Op.lte]: sessionDate },
      seasonEnd: { [Op.gte]: sessionDate },
    },
    attributes: ['id'],
    transaction,
  });
  if (leagues.length === 0) return;

  const memberships = await LeagueMember.findAll({
    where: {
      userId,
      leagueId: leagues.map((league) => league.id),
    },
    attributes: ['leagueId'],
    transaction,
  });

  for (const membership of memberships) {
    await recalculateLeagueMemberVolume(membership.leagueId, userId, transaction);
  }
}

module.exports = {
  calculateMemberSeasonVolume,
  recalculateLeagueMemberVolume,
  recalculateUserLeagueVolumesForDate,
};