const authService = require('../services/authService');
const {
  validateLoginPayload,
  validateRegistrationPayload,
  validateTokenPayload,
  validatePasswordResetPayload,
  validateNewPasswordPayload,
} = require('../validators/authValidation');

async function register(req, res, next) {
  try {
    const { user, verificationToken } = await authService.registrarUsuario(validateRegistrationPayload(req.body));
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      ...(process.env.AUTH_EXPOSE_TOKENS === 'true' ? { verificationToken } : {}),
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { token, refreshToken, user } = await authService.login(validateLoginPayload(req.body));
    res.json({
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(validateTokenPayload(req.body).token);
    res.json({ token: result.token, refreshToken: result.refreshToken, user: { id: result.user.id, name: result.user.name, email: result.user.email } });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    await authService.revokeRefreshToken(validateTokenPayload(req.body).token);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function requestPasswordReset(req, res, next) {
  try {
    const result = await authService.requestPasswordReset(validatePasswordResetPayload(req.body).email);
    res.json({
      accepted: true,
      ...(process.env.AUTH_EXPOSE_TOKENS === 'true' && result ? { resetToken: result.token } : {}),
    });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = validateNewPasswordPayload(req.body);
    await authService.resetPassword(token, password);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function verifyEmail(req, res, next) {
  try {
    await authService.verifyEmail(validateTokenPayload(req.body).token);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function requestEmailVerification(req, res, next) {
  try {
    const result = await authService.requestEmailVerification(validatePasswordResetPayload(req.body).email);
    res.json({
      accepted: true,
      ...(process.env.AUTH_EXPOSE_TOKENS === 'true' && result ? { verificationToken: result.token } : {}),
    });
  } catch (err) { next(err); }
}

module.exports = {
  register, login, refresh, logout, requestPasswordReset, resetPassword,
  verifyEmail, requestEmailVerification,
};
