const { League, LeagueMember, User } = require('../models');
const { validateLeaguePayload } = require('../validators/leagueValidation');
const { calculateLeagueStandings } = require('../services/leagueService');

async function listLeagues(req, res, next) {
  try {
    const leagues = await League.findAll({
      include: [{
        model: LeagueMember,
        include: [{ model: User, attributes: ['id', 'name'] }],
        required: false,
      }],
      order: [['seasonStart', 'DESC']],
    });

    const payload = leagues.map((league) => {
      const plainLeague = league.toJSON();
      const members = plainLeague.LeagueMembers || [];
      const myMembership = members.find((member) => Number(member.userId) === Number(req.userId));

      return {
        ...plainLeague,
        memberCount: members.length,
        isJoined: Boolean(myMembership),
        myVolumeKg: myMembership ? Number(myMembership.totalVolumeKg || 0) : 0,
      };
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
}

async function createLeague(req, res, next) {
  try {
    const payload = validateLeaguePayload(req.body || {});
    const league = await League.create({
      name: payload.name,
      seasonStart: payload.seasonStart,
      seasonEnd: payload.seasonEnd,
    });

    res.status(201).json(league);
  } catch (error) {
    next(error);
  }
}

async function joinLeague(req, res, next) {
  try {
    const league = await League.findByPk(req.params.id);
    if (!league) {
      const error = new Error('Liga no encontrada');
      error.status = 404;
      throw error;
    }

    const [membership] = await LeagueMember.findOrCreate({
      where: { leagueId: league.id, userId: req.userId },
      defaults: {
        leagueId: league.id,
        userId: req.userId,
        totalVolumeKg: 0,
      },
    });

    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
}

async function getLeagueMembers(req, res, next) {
  try {
    const league = await League.findByPk(req.params.id);
    if (!league) {
      const error = new Error('Liga no encontrada');
      error.status = 404;
      throw error;
    }

    const members = await LeagueMember.findAll({
      where: { leagueId: league.id },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['totalVolumeKg', 'DESC'], ['userId', 'ASC']],
    });

    res.json(calculateLeagueStandings(members));
  } catch (error) {
    next(error);
  }
}

module.exports = { listLeagues, createLeague, joinLeague, getLeagueMembers };
