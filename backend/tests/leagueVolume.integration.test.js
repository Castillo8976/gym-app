const test = require('node:test');
const assert = require('node:assert/strict');
const {
  sequelize,
  User,
  WorkoutSession,
  WorkoutSet,
  League,
  LeagueMember,
} = require('../src/models');
const {
  recalculateLeagueMemberVolume,
  recalculateUserLeagueVolumesForDate,
} = require('../src/services/leagueVolumeService');

test('recalculates a member league volume across season boundaries and set mutations', {
  skip: process.env.RUN_DB_INTEGRATION !== '1',
}, async () => {
  const suffix = `${process.pid}-${Date.now()}`;
  const createdSessionIds = [];
  let user;
  let league;

  try {
    await sequelize.authenticate();
    user = await User.create({
      name: 'Temporary League Volume Test',
      email: `league-volume-${suffix}@example.test`,
      passwordHash: 'integration-test-only',
      gender: 'male',
      bodyweightKg: 80,
    });
    league = await League.create({
      name: `League Volume Test ${suffix}`,
      seasonStart: '2026-10-01',
      seasonEnd: '2026-10-31',
    });

    const inSeason = await WorkoutSession.create({
      userId: user.id,
      sessionDate: '2026-10-01',
      notes: 'integration test',
    });
    const outsideSeason = await WorkoutSession.create({
      userId: user.id,
      sessionDate: '2026-11-01',
      notes: 'integration test',
    });
    const endBoundary = await WorkoutSession.create({
      userId: user.id,
      sessionDate: '2026-10-31',
      notes: 'integration test',
    });
    createdSessionIds.push(inSeason.id, outsideSeason.id, endBoundary.id);

    const warmup = await WorkoutSet.create({
      sessionId: inSeason.id,
      exerciseId: 1,
      weightKg: 60,
      reps: 5,
      setOrder: 1,
      setType: 'warmup',
    });
    const normal = await WorkoutSet.create({
      sessionId: inSeason.id,
      exerciseId: 1,
      weightKg: 50,
      reps: 5,
      setOrder: 2,
      setType: 'normal',
    });
    await WorkoutSet.create({
      sessionId: inSeason.id,
      exerciseId: 1,
      weightKg: 40,
      reps: 5,
      setOrder: 3,
      setType: 'failure',
    });
    const dropSet = await WorkoutSet.create({
      sessionId: inSeason.id,
      exerciseId: 1,
      weightKg: 20,
      reps: 5,
      setOrder: 4,
      setType: 'drop_set',
    });
    await WorkoutSet.create({
      sessionId: outsideSeason.id,
      exerciseId: 1,
      weightKg: 999,
      reps: 99,
      setOrder: 1,
      setType: 'normal',
    });

    const membership = await LeagueMember.create({
      leagueId: league.id,
      userId: user.id,
      totalVolumeKg: 0,
    });
    assert.equal(await recalculateLeagueMemberVolume(league.id, user.id), 550);

    await WorkoutSet.create({
      sessionId: inSeason.id,
      exerciseId: 1,
      weightKg: 10,
      reps: 10,
      setOrder: 5,
      setType: 'normal',
    });
    await recalculateUserLeagueVolumesForDate(user.id, inSeason.sessionDate);
    assert.equal(Number((await membership.reload()).totalVolumeKg), 650);

    await normal.update({ weightKg: 25, reps: 2 });
    await recalculateUserLeagueVolumesForDate(user.id, inSeason.sessionDate);
    assert.equal(Number((await membership.reload()).totalVolumeKg), 450);

    await dropSet.destroy();
    await recalculateUserLeagueVolumesForDate(user.id, inSeason.sessionDate);
    assert.equal(Number((await membership.reload()).totalVolumeKg), 350);

    await WorkoutSet.create({
      sessionId: endBoundary.id,
      exerciseId: 1,
      weightKg: 5,
      reps: 2,
      setOrder: 1,
      setType: 'normal',
    });
    await recalculateUserLeagueVolumesForDate(user.id, endBoundary.sessionDate);
    assert.equal(Number((await membership.reload()).totalVolumeKg), 360);
    assert.equal(Number((await warmup.reload()).weightKg), 60);
  } finally {
    if (user) {
      await LeagueMember.destroy({ where: { userId: user.id } });
      if (createdSessionIds.length > 0) {
        await WorkoutSet.destroy({ where: { sessionId: createdSessionIds } });
        await WorkoutSession.destroy({ where: { id: createdSessionIds } });
      }
      await User.destroy({ where: { id: user.id } });
    }
    if (league) await League.destroy({ where: { id: league.id } });
    await sequelize.close();
  }
});