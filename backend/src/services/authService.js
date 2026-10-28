const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const SALT_ROUNDS = 10;
const DUMMY_PASSWORD_HASH = '$2b$10$2QVoABG.q0S2Bz8V5MzdP.0Ejf3N6A9x6d4R4pqco3EQAOEjun9w2';

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

  return user;
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

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, user };
}

module.exports = { registrarUsuario, login };
