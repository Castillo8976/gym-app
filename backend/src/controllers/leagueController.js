const { League, LeagueMember, User, sequelize } = require('../models');
const { validateLeaguePayload } = require('../validators/leagueValidation');
const { calculateLeagueStandings } = require('../services/leagueService');
const { recalculateLeagueMemberVolume } = require('../services/leagueVolumeService');

function resolveLeagueCreatorAllowList() {
  const raw = process.env.LEAGUE_CREATOR_EMAILS;
  if (typeof raw !== 'string') return new Set();
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

async function assertCanCreateLeague(userId) {
  const allowedEmails = resolveLeagueCreatorAllowList();
  if (allowedEmails.size === 0) {
    const error = new Error('La creación de ligas está deshabilitada en este entorno');
    error.status = 403;
    throw error;
  }

  const user = await User.findByPk(userId, { attributes: ['id', 'email'] });
  if (!user || !allowedEmails.has(String(user.email || '').toLowerCase())) {
    const error = new Error('No tienes permisos para crear ligas');
    error.status = 403;
    throw error;
  }
}

async function listLeagues(req, res, next) {
  try {
    const leagues = await League.findAll({
      include: [{
        model: LeagueMember,
        where: { userId: req.userId },
        attributes: ['id', 'leagueId', 'userId', 'totalVolumeKg'],
        required: true,
      }],
      order: [['seasonStart', 'DESC']],
    });

    const leagueIds = leagues.map((league) => Number(league.id));
    const memberCountsByLeague = new Map();
    if (leagueIds.length > 0) {
      const rows = await LeagueMember.findAll({
        where: { leagueId: leagueIds },
        attributes: ['leagueId', [sequelize.fn('COUNT', sequelize.col('id')), 'memberCount']],
        group: ['leagueId'],
        raw: true,
      });
      for (const row of rows) {
        memberCountsByLeague.set(Number(row.leagueId), Number(row.memberCount || 0));
      }
    }

    const payload = leagues.map((league) => {
      const plainLeague = league.toJSON();
      const myMembership = (plainLeague.LeagueMembers || [])[0] || null;

      return {
        id: plainLeague.id,
        name: plainLeague.name,
        seasonStart: plainLeague.seasonStart,
        seasonEnd: plainLeague.seasonEnd,
        memberCount: memberCountsByLeague.get(Number(plainLeague.id)) || 0,
        isJoined: true,
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
    await assertCanCreateLeague(req.userId);
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
    await recalculateLeagueMemberVolume(league.id, req.userId);
    await membership.reload();

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

    const membership = await LeagueMember.findOne({
      where: { leagueId: league.id, userId: req.userId },
      attributes: ['id'],
    });
    if (!membership) {
      const error = new Error('Debes unirte a la liga para ver su clasificación');
      error.status = 403;
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
