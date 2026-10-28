const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../src/services/authService');
const { User } = require('../src/models');

test('performs a password hash comparison even when the email does not exist', async () => {
  const originalFindOne = User.findOne;
  const originalCompare = bcrypt.compare;
  let compareCallCount = 0;

  User.findOne = async () => null;
  bcrypt.compare = async () => {
    compareCallCount += 1;
    return false;
  };

  try {
    await assert.rejects(
      () => authService.login({ email: 'unknown@example.com', password: 'nope' }),
      { status: 401, message: 'Credenciales inválidas' }
    );
    assert.equal(compareCallCount, 1);
  } finally {
    User.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
  }
});

test('returns token and user payload when credentials are valid', async () => {
  const originalFindOne = User.findOne;
  const originalCompare = bcrypt.compare;
  const originalSign = jwt.sign;
  const originalSecret = process.env.JWT_SECRET;

  process.env.JWT_SECRET = 'x'.repeat(32);
  User.findOne = async () => ({
    id: 7,
    name: 'Silver',
    email: 'silver@example.com',
    passwordHash: 'stored-hash',
  });
  bcrypt.compare = async () => true;
  jwt.sign = () => 'signed-token';

  try {
    const result = await authService.login({ email: 'silver@example.com', password: 'password-ok' });
    assert.equal(result.token, 'signed-token');
    assert.equal(result.user.id, 7);
  } finally {
    process.env.JWT_SECRET = originalSecret;
    User.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
    jwt.sign = originalSign;
  }
});
