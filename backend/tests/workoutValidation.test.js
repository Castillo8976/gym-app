const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateCreateSessionPayload,
  validateSetPayload,
} = require('../src/validators/workoutValidation');
const {
  validateLoginPayload,
  validateRegistrationPayload,
} = require('../src/validators/authValidation');
const {
  validateRoutineTemplatePayload,
  validateRoutineTemplateExercisePayload,
} = require('../src/validators/routineValidation');

test('accepts a valid session date and optional notes', () => {
  assert.deepEqual(
    validateCreateSessionPayload({ sessionDate: '2026-10-04', notes: 'Entrenamiento A' }),
    { sessionDate: '2026-10-04', notes: 'Entrenamiento A' }
  );
});

test('defaults a missing session date and notes', () => {
  const payload = validateCreateSessionPayload({});
  assert.match(payload.sessionDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(payload.notes, null);
});

test('rejects invalid calendar dates and non-text notes', () => {
  assert.throws(() => validateCreateSessionPayload({ sessionDate: '2026-02-30' }), { status: 400 });
  assert.throws(() => validateCreateSessionPayload({ notes: 12 }), { status: 400 });
});

test('accepts a valid set with kilogram precision', () => {
  assert.deepEqual(
    validateSetPayload({ exerciseId: 4, weightKg: 80.25, reps: 8, setOrder: 2 }),
    { exerciseId: 4, weightKg: 80.25, reps: 8, setOrder: 2 }
  );
});

test('accepts set metadata for warm-up tracking and rest timing', () => {
  assert.deepEqual(
    validateSetPayload({
      exerciseId: 4,
      weightKg: 80,
      reps: 8,
      setOrder: 2,
      setType: 'warmup',
      restSeconds: 90,
      actualRestSeconds: 94,
      notes: 'Calentamiento para press',
    }),
    {
      exerciseId: 4,
      weightKg: 80,
      reps: 8,
      setOrder: 2,
      setType: 'warmup',
      restSeconds: 90,
      actualRestSeconds: 94,
      notes: 'Calentamiento para press',
    }
  );
});

test('rejects invalid exercise identifiers and unsupported weight values', () => {
  const valid = { exerciseId: 4, weightKg: 80, reps: 8, setOrder: 1 };
  assert.throws(() => validateSetPayload({ ...valid, exerciseId: '4' }), { status: 400 });
  assert.throws(() => validateSetPayload({ ...valid, weightKg: 0 }), { status: 400 });
  assert.throws(() => validateSetPayload({ ...valid, weightKg: 10000 }), { status: 400 });
  assert.throws(() => validateSetPayload({ ...valid, weightKg: 80.123 }), { status: 400 });
});

test('requires positive integer repetitions and set order', () => {
  const valid = { exerciseId: 4, weightKg: 80, reps: 8, setOrder: 1 };
  assert.throws(() => validateSetPayload({ ...valid, reps: 0 }), { status: 400 });
  assert.throws(() => validateSetPayload({ ...valid, reps: 2.5 }), { status: 400 });
  assert.throws(() => validateSetPayload({ ...valid, setOrder: -1 }), { status: 400 });
  assert.throws(() => validateSetPayload({ ...valid, setType: 'invalid' }), { status: 400 });
  assert.throws(() => validateSetPayload({ ...valid, restSeconds: -1 }), { status: 400 });
});

test('normalizes valid registration fields and validates profile units', () => {
  const registration = validateRegistrationPayload({
    name: ' Silver ',
    email: 'SILVER@example.com',
    password: 'password-segura',
    gender: 'male',
    bodyweightKg: 75.25,
  });
  assert.equal(registration.name, 'Silver');
  assert.equal(registration.email, 'silver@example.com');
  assert.equal(registration.bodyweightKg, 75.25);
});

test('rejects invalid registration credentials and bodyweight values', () => {
  const valid = {
    name: 'Silver',
    email: 'silver@example.com',
    password: 'password-segura',
    gender: 'male',
    bodyweightKg: 75,
  };
  assert.throws(() => validateRegistrationPayload({ ...valid, password: 'short' }), { status: 400 });
  assert.throws(() => validateRegistrationPayload({ ...valid, gender: 'other' }), { status: 400 });
  assert.throws(() => validateRegistrationPayload({ ...valid, bodyweightKg: 0 }), { status: 400 });
  assert.throws(() => validateRegistrationPayload({ ...valid, bodyweightKg: 75.123 }), { status: 400 });
});

test('normalizes login email and rejects blank passwords', () => {
  assert.deepEqual(
    validateLoginPayload({ email: ' SILVER@example.com ', password: 'password-segura' }),
    { email: 'silver@example.com', password: 'password-segura' }
  );
  assert.throws(() => validateLoginPayload({ email: 'silver@example.com', password: '' }), { status: 400 });
});

test('accepts valid routine template metadata and exercise rows', () => {
  assert.deepEqual(
    validateRoutineTemplatePayload({
      name: ' Press + remo ',
      description: 'Sesión de empuje',
      routineType: 'superset',
    }),
    {
      name: 'Press + remo',
      description: 'Sesión de empuje',
      routineType: 'superset',
    }
  );

  assert.deepEqual(
    validateRoutineTemplateExercisePayload({
      exerciseId: 3,
      position: 1,
      targetSets: 4,
      targetReps: 8,
      targetWeightKg: 70,
      restSeconds: 90,
      grouping: 'main',
    }),
    {
      exerciseId: 3,
      position: 1,
      targetSets: 4,
      targetReps: 8,
      targetWeightKg: 70,
      restSeconds: 90,
      grouping: 'main',
    }
  );
});

test('rejects invalid routine template fields', () => {
  assert.throws(() => validateRoutineTemplatePayload({ name: '', routineType: 'invalid' }), { status: 400 });
  assert.throws(() => validateRoutineTemplateExercisePayload({ exerciseId: 0, position: 0, targetSets: 0, targetReps: 0 }), { status: 400 });
});