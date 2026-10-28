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
const { validateLeaguePayload } = require('../src/validators/leagueValidation');
const {
  validateRestPreferencesPayload,
  validateUpdateMePayload,
} = require('../src/validators/userValidation');
const routineController = require('../src/controllers/routineController');
const { WorkoutTemplate } = require('../src/models');

test('accepts a valid session date and optional notes', () => {
  assert.deepEqual(
    validateCreateSessionPayload({ sessionDate: '2026-10-04', notes: 'Entrenamiento A' }),
    { sessionDate: '2026-10-04', notes: 'Entrenamiento A' }
  );
});

test('defaults a missing session date and notes to the local calendar date', () => {
  const payload = validateCreateSessionPayload({});
  const now = new Date();
  const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  assert.equal(payload.sessionDate, expected);
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

test('listRoutines uses req.userId for the authenticated user scope', async () => {
  const originalFindAll = WorkoutTemplate.findAll;
  WorkoutTemplate.findAll = async ({ where }) => {
    assert.deepEqual(where, { userId: 42 });
    return [];
  };

  try {
    await routineController.listRoutines(
      { userId: 42 },
      { json: (value) => assert.deepEqual(value, []) },
      () => { throw new Error('next should not be called'); }
    );
  } finally {
    WorkoutTemplate.findAll = originalFindAll;
  }
});

test('rejects invalid routine template fields', () => {
  assert.throws(() => validateRoutineTemplatePayload({ name: '', routineType: 'invalid' }), { status: 400 });
  assert.throws(() => validateRoutineTemplateExercisePayload({ exerciseId: 0, position: 0, targetSets: 0, targetReps: 0 }), { status: 400 });
});

test('validates profile updates and normalizes the name', () => {
  assert.deepEqual(
    validateUpdateMePayload({ name: ' Ana ', bodyweightKg: 62.5 }),
    { name: 'Ana', bodyweightKg: 62.5 }
  );
  assert.throws(() => validateUpdateMePayload({}), { status: 400 });
  assert.throws(() => validateUpdateMePayload(null), { status: 400 });
  assert.throws(() => validateUpdateMePayload({ name: '  ' }), { status: 400 });
  assert.throws(() => validateUpdateMePayload({ name: 'A'.repeat(101) }), { status: 400 });
  assert.throws(() => validateUpdateMePayload({ bodyweightKg: 0 }), { status: 400 });
  assert.throws(() => validateUpdateMePayload({ bodyweightKg: 1000 }), { status: 400 });
  assert.throws(() => validateUpdateMePayload({ bodyweightKg: 62.123 }), { status: 400 });
  assert.throws(() => validateUpdateMePayload({ email: 'ana@example.com' }), { status: 400 });
});

test('validates rest preference updates as integer seconds from 0 to 600', () => {
  assert.deepEqual(
    validateRestPreferencesPayload({ defaultRestSeconds: 0, defaultWarmupRestSeconds: 600 }),
    { defaultRestSeconds: 0, defaultWarmupRestSeconds: 600 }
  );
  assert.deepEqual(
    validateRestPreferencesPayload({ defaultRestSeconds: 90 }),
    { defaultRestSeconds: 90 }
  );
  assert.throws(() => validateRestPreferencesPayload({}), { status: 400 });
  assert.throws(() => validateRestPreferencesPayload(null), { status: 400 });
  assert.throws(() => validateRestPreferencesPayload({ defaultRestSeconds: -1 }), { status: 400 });
  assert.throws(() => validateRestPreferencesPayload({ defaultRestSeconds: 601 }), { status: 400 });
  assert.throws(() => validateRestPreferencesPayload({ defaultRestSeconds: 1.5 }), { status: 400 });
  assert.throws(() => validateRestPreferencesPayload({ defaultRestSeconds: '90' }), { status: 400 });
  assert.throws(() => validateRestPreferencesPayload({ extra: 90 }), { status: 400 });
});

test('validates league season dates as real calendar dates', () => {
  assert.deepEqual(
    validateLeaguePayload({
      name: ' Liga Octubre ',
      seasonStart: '2026-10-01',
      seasonEnd: '2026-10-31',
    }),
    { name: 'Liga Octubre', seasonStart: '2026-10-01', seasonEnd: '2026-10-31' }
  );
  assert.throws(() => validateLeaguePayload({ name: 'Liga', seasonStart: '2026-02-31', seasonEnd: '2026-03-01' }), { status: 400 });
  assert.throws(() => validateLeaguePayload({ name: 'Liga', seasonStart: '2026-10-02', seasonEnd: '2026-10-01' }), { status: 400 });
  assert.equal(
    validateLeaguePayload({ name: 'Liga', seasonStart: '2026-10-01', seasonEnd: '2026-10-01' }).seasonEnd,
    '2026-10-01'
  );
  assert.throws(() => validateLeaguePayload({ name: 'L'.repeat(101), seasonStart: '2026-10-01', seasonEnd: '2026-10-31' }), { status: 400 });
  assert.throws(() => validateLeaguePayload([]), { status: 400 });
});