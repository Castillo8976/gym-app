const test = require('node:test');
const assert = require('node:assert/strict');
const { summarizeBestPRsFromSets } = require('../src/services/rankService');

test('rebuilds the strongest set summary per exercise when a set is edited or removed', () => {
  const sets = [
    { exerciseId: 1, weightKg: 80, reps: 8 },
    { exerciseId: 1, weightKg: 75, reps: 10 },
    { exerciseId: 2, weightKg: 60, reps: 10 },
    { exerciseId: 2, weightKg: 45, reps: 12 },
  ];

  const bestByExercise = summarizeBestPRsFromSets(sets);

  assert.deepEqual(bestByExercise, [
    { exerciseId: 1, estimated1rm: 101.33 },
    { exerciseId: 2, estimated1rm: 80 },
  ]);
});
