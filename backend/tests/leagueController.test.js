const test = require('node:test');
const assert = require('node:assert/strict');
const leagueController = require('../src/controllers/leagueController');
const { League, LeagueMember, User } = require('../src/models');

test('blocks league creation when creator allow-list is not configured', async () => {
  const originalAllowList = process.env.LEAGUE_CREATOR_EMAILS;
  process.env.LEAGUE_CREATOR_EMAILS = '';

  let capturedError = null;
  await leagueController.createLeague(
    { userId: 1, body: { name: 'Liga test', seasonStart: '2026-10-01', seasonEnd: '2026-10-30' } },
    { status: () => ({ json: () => null }) },
    (error) => { capturedError = error; }
  );

  process.env.LEAGUE_CREATOR_EMAILS = originalAllowList;
  assert.equal(capturedError?.status, 403);
});

test('requires membership to view league members', async () => {
  const originalFindByPk = League.findByPk;
  const originalFindOne = LeagueMember.findOne;

  League.findByPk = async () => ({ id: 9 });
  LeagueMember.findOne = async () => null;

  let capturedError = null;
  await leagueController.getLeagueMembers(
    { userId: 42, params: { id: 9 } },
    { json: () => null },
    (error) => { capturedError = error; }
  );

  League.findByPk = originalFindByPk;
  LeagueMember.findOne = originalFindOne;
  assert.equal(capturedError?.status, 403);
});

test('returns only joined leagues with safe summary fields', async () => {
  const originalFindAllLeague = League.findAll;
  const originalFindAllMember = LeagueMember.findAll;

  League.findAll = async () => ([
    {
      id: 3,
      toJSON() {
        return {
          id: 3,
          name: 'Liga Plata',
          seasonStart: '2026-10-01',
          seasonEnd: '2026-10-31',
          LeagueMembers: [{ userId: 5, totalVolumeKg: '1234.5' }],
        };
      },
    },
  ]);
  LeagueMember.findAll = async () => ([
    { leagueId: 3, memberCount: '12' },
  ]);

  let payload = null;
  await leagueController.listLeagues(
    { userId: 5 },
    { json: (value) => { payload = value; } },
    (error) => { throw error; }
  );

  League.findAll = originalFindAllLeague;
  LeagueMember.findAll = originalFindAllMember;

  assert.equal(Array.isArray(payload), true);
  assert.equal(payload.length, 1);
  assert.deepEqual(payload[0], {
    id: 3,
    name: 'Liga Plata',
    seasonStart: '2026-10-01',
    seasonEnd: '2026-10-31',
    memberCount: 12,
    isJoined: true,
    myVolumeKg: 1234.5,
  });
});

test('allows league creation for approved creator emails', async () => {
  const originalAllowList = process.env.LEAGUE_CREATOR_EMAILS;
  const originalFindByPk = User.findByPk;
  const originalCreate = League.create;

  process.env.LEAGUE_CREATOR_EMAILS = 'admin@example.com';
  User.findByPk = async () => ({ id: 7, email: 'admin@example.com' });
  League.create = async (payload) => ({ id: 11, ...payload });

  let statusCode = null;
  let body = null;
  await leagueController.createLeague(
    { userId: 7, body: { name: 'Liga Noviembre', seasonStart: '2026-11-01', seasonEnd: '2026-11-30' } },
    {
      status(code) {
        statusCode = code;
        return { json(value) { body = value; } };
      },
    },
    (error) => { throw error; }
  );

  process.env.LEAGUE_CREATOR_EMAILS = originalAllowList;
  User.findByPk = originalFindByPk;
  League.create = originalCreate;

  assert.equal(statusCode, 201);
  assert.equal(body?.name, 'Liga Noviembre');
});
