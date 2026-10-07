const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateLeagueStandings,
  calculateLeagueVolume,
} = require('../src/services/leagueService');

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

test('calculates league volume from working sets and excludes warmups', () => {
  const volume = calculateLeagueVolume([
    { weightKg: '50.00', reps: 5, setType: 'normal' },
    { weightKg: '40.00', reps: 10, setType: 'failure' },
    { weightKg: '20.00', reps: 5, setType: 'drop_set' },
    { weightKg: '60.00', reps: 5, setType: 'warmup' },
  ]);

  assert.equal(volume, 750);
});

test('rounds aggregate league volume to two decimals', () => {
  assert.equal(calculateLeagueVolume([
    { weightKg: '12.34', reps: 3, setType: 'normal' },
    { weightKg: '5.55', reps: 2, setType: 'normal' },
  ]), 48.12);
});
