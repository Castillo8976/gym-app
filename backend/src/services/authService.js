const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const SALT_ROUNDS = 10;

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
  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const passwordValida = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValida) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, user };
}

module.exports = { registrarUsuario, login };
