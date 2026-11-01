const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/password-reset/request', authController.requestPasswordReset);
router.post('/password-reset/confirm', authController.resetPassword);
router.post('/email/verify', authController.verifyEmail);
router.post('/email/verification-request', authController.requestEmailVerification);

module.exports = router;
