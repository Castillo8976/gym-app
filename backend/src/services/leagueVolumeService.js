const { Op } = require('sequelize');
const { League, LeagueMember, WorkoutSession, WorkoutSet } = require('../models');
const { calculateLeagueVolume } = require('./leagueService');

async function calculateMemberSeasonVolume(userId, league) {
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
  });

  const sets = sessions.flatMap((session) => session.WorkoutSets || []);
  return calculateLeagueVolume(sets);
}

async function recalculateLeagueMemberVolume(leagueId, userId) {
  const [league, membership] = await Promise.all([
    League.findByPk(leagueId),
    LeagueMember.findOne({ where: { leagueId, userId } }),
  ]);
  if (!league || !membership) return null;

  const totalVolumeKg = await calculateMemberSeasonVolume(userId, league);
  membership.totalVolumeKg = totalVolumeKg;
  await membership.save();
  return totalVolumeKg;
}

async function recalculateUserLeagueVolumesForDate(userId, sessionDate) {
  const leagues = await League.findAll({
    where: {
      seasonStart: { [Op.lte]: sessionDate },
      seasonEnd: { [Op.gte]: sessionDate },
    },
    attributes: ['id'],
  });
  if (leagues.length === 0) return;

  const memberships = await LeagueMember.findAll({
    where: {
      userId,
      leagueId: leagues.map((league) => league.id),
    },
    attributes: ['leagueId'],
  });

  for (const membership of memberships) {
    await recalculateLeagueMemberVolume(membership.leagueId, userId);
  }
}

module.exports = {
  calculateMemberSeasonVolume,
  recalculateLeagueMemberVolume,
  recalculateUserLeagueVolumesForDate,
};