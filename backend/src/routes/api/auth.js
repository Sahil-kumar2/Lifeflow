const express = require('express');
const router = express.Router();
const { AuthController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const redisRateLimit = require('../../middlewares/redisRateLimit');

const authRateLimit = redisRateLimit({
    windowSeconds: 60,
    maxRequests: 10,
    keyPrefix: 'rate-limit:auth',
});

const otpRateLimit = redisRateLimit({
    windowSeconds: 60,
    maxRequests: 5,
    keyPrefix: 'rate-limit:otp',
    keyResolver: (req) => `${req.ip}:${req.body?.email || 'unknown'}`,
});

// @route   POST api/auth/register
// @desc    Register user & send OTP
// @access  Public
router.post('/register', authRateLimit, AuthController.register);

// @route   POST api/auth/verify-otp
// @desc    Verify OTP & Login
// @access  Public
router.post('/verify-otp', otpRateLimit, AuthController.verifyOTP);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authRateLimit, AuthController.login);

router.get('/', auth, (req, res) => AuthController.getProfile(req, res));

module.exports = router;
