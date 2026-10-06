const authService = require('../services/authService');
const {
  validateLoginPayload,
  validateRegistrationPayload,
} = require('../validators/authValidation');

async function register(req, res, next) {
  try {
    const user = await authService.registrarUsuario(validateRegistrationPayload(req.body));
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { token, user } = await authService.login(validateLoginPayload(req.body));
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
