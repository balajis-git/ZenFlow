const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  resetPasswordPage,
  logout,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../validators/schemas');
const validateFields = require('../middleware/validator');

router.post('/register', registerValidator, validateFields, register);
router.get('/verify-email', verifyEmail);
router.post('/login', loginValidator, validateFields, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password-page', resetPasswordPage);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
