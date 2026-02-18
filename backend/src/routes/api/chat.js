const express = require('express');
const router = express.Router();
const { ChatController } = require('../../controllers');
const auth = require('../../middlewares/auth');

router.post('/', auth, (req, res) => ChatController.sendMessage(req, res));

module.exports = router;
