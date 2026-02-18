const express = require('express');
const router = express.Router();
const { AuthController } = require('../../controllers');
const auth = require('../../middlewares/auth');

// @route   POST api/auth/register
// @desc    Register user & send OTP
// @access  Public
router.post('/register', AuthController.register);

// @route   POST api/auth/verify-otp
// @desc    Verify OTP & Login
// @access  Public
router.post('/verify-otp', AuthController.verifyOTP);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', AuthController.login);

router.get('/', auth, (req, res) => AuthController.getProfile(req, res));

module.exports = router;
