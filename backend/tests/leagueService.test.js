const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateLeagueStandings } = require('../src/services/leagueService');

test('orders league members by total volume descending and preserves a neutral score for empty leagues', () => {
  const standings = calculateLeagueStandings([
    { userId: 1, user: { name: 'Ada' }, totalVolumeKg: '240.5' },
    { userId: 2, user: { name: 'Lin' }, totalVolumeKg: '360.0' },
    { userId: 3, user: { name: 'Mia' }, totalVolumeKg: '0' },
  ]);

  assert.deepEqual(standings.map((row) => row.user.name), ['Lin', 'Ada', 'Mia']);
  assert.equal(standings[0].totalVolumeKg, 360);
  assert.equal(standings[2].totalVolumeKg, 0);
  assert.equal(calculateLeagueStandings([]).length, 0);
});
