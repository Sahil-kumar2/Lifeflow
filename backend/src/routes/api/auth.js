const express = require('express');
const router = express.Router();
const { AuthController } = require('../../controllers');
const auth = require('../../middlewares/auth');

router.post('/register', (req, res) => AuthController.register(req, res));
router.post('/login', (req, res) => AuthController.login(req, res));
router.get('/', auth, (req, res) => AuthController.getProfile(req, res));

module.exports = router;
