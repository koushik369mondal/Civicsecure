const express = require('express');
const router = express.Router();

const { sendOTPController, verifyOTPController, validateTokenController } = require('../controllers/authController');
const { otpLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { validatePhone, validateOTPFormat } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Send OTP route
router.post('/send-otp', otpLimiter, validatePhone, sendOTPController);

// Verify OTP route
router.post('/verify-otp', loginLimiter, validatePhone, validateOTPFormat, verifyOTPController);

// Validate token route
router.get('/validate-token', authenticateToken, validateTokenController);

module.exports = router;
