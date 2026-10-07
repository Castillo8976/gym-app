const test = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveRankForRatio,
  getExerciseStandardThresholds,
  resolveHighestRank,
} = require('../src/services/rankService');

test('maps ratio values to the documented strength rank thresholds', () => {
  assert.equal(resolveRankForRatio(0.52, 'male', 'Press de banca'), 'bronce');
  assert.equal(resolveRankForRatio(0.8, 'male', 'Press de banca'), 'plata');
  assert.equal(resolveRankForRatio(1.3, 'male', 'Press de banca'), 'platino');
  assert.equal(resolveRankForRatio(0.35, 'female', 'Press de banca'), 'bronce');
  assert.equal(resolveRankForRatio(0.7, 'female', 'Press de banca'), 'oro');
});

test('returns the fallback standard table for anchor exercises when no database rows exist', () => {
  assert.deepEqual(getExerciseStandardThresholds('Sentadilla', 'male'), {
    bronce: 0.75,
    plata: 1,
    oro: 1.5,
    platino: 1.75,
    diamante: 2,
  });

  assert.deepEqual(getExerciseStandardThresholds('Peso muerto', 'female'), {
    bronce: 0.6,
    plata: 0.8,
    oro: 1.1,
    platino: 1.4,
    diamante: 1.75,
  });
});

test('recomputes a group rank from its current anchor exercise ranks', () => {
  assert.equal(resolveHighestRank(['plata', 'bronce']), 'plata');
  assert.equal(resolveHighestRank(['bronce']), 'bronce');
  assert.equal(resolveHighestRank([]), 'bronce');
});
