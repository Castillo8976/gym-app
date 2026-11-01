const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const authService = require('../src/services/authService');
const { User, RefreshToken, AuthToken } = require('../src/models');

test('rotates a valid refresh token and revokes its predecessor', async () => {
  const original = {
    findOne: RefreshToken.findOne, create: RefreshToken.create,
    userFindByPk: User.findByPk, sign: jwt.sign,
  };
  const record = {
    userId: 4, revokedAt: null, expiresAt: new Date(Date.now() + 10000),
    update: async (values) => Object.assign(record, values),
  };
  process.env.JWT_SECRET = 'x'.repeat(32);
  RefreshToken.findOne = async () => record;
  RefreshToken.create = async (values) => ({ id: 8, ...values });
  User.findByPk = async () => ({ id: 4, name: 'A', email: 'a@example.com', dataValues: {} });
  jwt.sign = () => 'access';
  try {
    const result = await authService.refresh('a'.repeat(32));
    assert.equal(result.token, 'access');
    assert.equal(record.revokedAt instanceof Date, true);
    assert.equal(record.replacedByTokenId, 8);
  } finally {
    RefreshToken.findOne = original.findOne; RefreshToken.create = original.create;
    User.findByPk = original.userFindByPk; jwt.sign = original.sign;
  }
});

test('creates a password reset token without sending email', async () => {
  const originalFind = User.findOne;
  const originalCreate = AuthToken.create;
  User.findOne = async () => ({ id: 12 });
  let created;
  AuthToken.create = async (values) => { created = values; };
  try {
    const result = await authService.requestPasswordReset('a@example.com');
    assert.equal(typeof result.token, 'string');
    assert.equal(created.userId, 12);
    assert.equal(created.purpose, 'password_reset');
    assert.equal(created.tokenHash.length, 64);
  } finally {
    User.findOne = originalFind; AuthToken.create = originalCreate;
  }
});

test('returns no reset token for unknown accounts', async () => {
  const originalFind = User.findOne;
  User.findOne = async () => null;
  try {
    assert.equal(await authService.requestPasswordReset('unknown@example.com'), null);
  } finally {
    User.findOne = originalFind;
  }
});
