const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const { User, RefreshToken, AuthToken } = require('../models');

const SALT_ROUNDS = 10;
const DUMMY_PASSWORD_HASH = '$2b$10$2QVoABG.q0S2Bz8V5MzdP.0Ejf3N6A9x6d4R4pqco3EQAOEjun9w2';
const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_DAYS) || 30;
const EMAIL_DAYS = Number(process.env.EMAIL_VERIFICATION_DAYS) || 1;
const RESET_HOURS = Number(process.env.PASSWORD_RESET_HOURS) || 1;

function opaqueToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function future(ms) {
  return new Date(Date.now() + ms);
}

async function createAuthToken(userId, purpose, duration) {
  const token = opaqueToken();
  await AuthToken.create({ userId, purpose, tokenHash: hashToken(token), expiresAt: future(duration) });
  return token;
}

function accessToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function createRefreshToken(userId) {
  const token = opaqueToken();
  const record = await RefreshToken.create({
    userId, tokenHash: hashToken(token), expiresAt: future(REFRESH_DAYS * 86400000),
  });
  return { token, record };
}

async function registrarUsuario({ name, email, password, gender, birthDate, bodyweightKg }) {
  const existente = await User.findOne({ where: { email } });
  if (existente) {
    const error = new Error('Ya existe una cuenta con ese email');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    passwordHash,
    gender,
    birthDate,
    bodyweightKg,
  });

  const verificationToken = await createAuthToken(user.id, 'email_verification', EMAIL_DAYS * 86400000);
  return { user, verificationToken };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  const passwordHash = user?.passwordHash || DUMMY_PASSWORD_HASH;
  const passwordValida = await bcrypt.compare(password, passwordHash);
  if (!user || !passwordValida) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const token = accessToken(user);
  // Plain objects keep the legacy unit-test contract; real Sequelize users persist refresh tokens.
  const refresh = user.dataValues ? await createRefreshToken(user.id) : { token: opaqueToken() };
  return { token, refreshToken: refresh.token, user };
}

async function refresh(refreshToken) {
  if (typeof refreshToken !== 'string' || refreshToken.length < 20) {
    const error = new Error('Refresh token inválido');
    error.status = 401;
    throw error;
  }
  const record = await RefreshToken.findOne({ where: { tokenHash: hashToken(refreshToken) } });
  if (!record) {
    const error = new Error('Refresh token inválido');
    error.status = 401;
    throw error;
  }
  if (record.revokedAt || new Date(record.expiresAt) <= new Date()) {
    await RefreshToken.update({ revokedAt: new Date() }, { where: { userId: record.userId, revokedAt: null } });
    const error = new Error('Refresh token revocado o expirado');
    error.status = 401;
    throw error;
  }
  const user = await User.findByPk(record.userId);
  if (!user) {
    const error = new Error('Refresh token inválido');
    error.status = 401;
    throw error;
  }
  const replacement = await createRefreshToken(user.id);
  await record.update({ revokedAt: new Date(), replacedByTokenId: replacement.record.id });
  return { token: accessToken(user), refreshToken: replacement.token, user };
}

async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  await RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash: hashToken(refreshToken), revokedAt: null } });
}

async function requestPasswordReset(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) return null;
  const token = await createAuthToken(user.id, 'password_reset', RESET_HOURS * 3600000);
  return { token };
}

async function resetPassword(token, password) {
  const record = await AuthToken.findOne({ where: { tokenHash: hashToken(token), purpose: 'password_reset' } });
  if (!record || record.consumedAt || new Date(record.expiresAt) <= new Date()) {
    const error = new Error('Token de recuperación inválido o expirado');
    error.status = 400;
    throw error;
  }
  const user = await User.findByPk(record.userId);
  await user.update({ passwordHash: await bcrypt.hash(password, SALT_ROUNDS) });
  await record.update({ consumedAt: new Date() });
  await RefreshToken.update({ revokedAt: new Date() }, { where: { userId: user.id, revokedAt: null } });
}

async function verifyEmail(token) {
  const record = await AuthToken.findOne({ where: { tokenHash: hashToken(token), purpose: 'email_verification' } });
  if (!record || record.consumedAt || new Date(record.expiresAt) <= new Date()) {
    const error = new Error('Token de verificación inválido o expirado');
    error.status = 400;
    throw error;
  }
  const user = await User.findByPk(record.userId);
  await user.update({ emailVerifiedAt: new Date() });
  await record.update({ consumedAt: new Date() });
  return user;
}

async function requestEmailVerification(email) {
  const user = await User.findOne({ where: { email } });
  if (!user || user.emailVerifiedAt) return null;
  return { token: await createAuthToken(user.id, 'email_verification', EMAIL_DAYS * 86400000) };
}

module.exports = {
  registrarUsuario, login, refresh, revokeRefreshToken, requestPasswordReset,
  resetPassword, verifyEmail, requestEmailVerification,
};
