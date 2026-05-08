const express = require('express');
const router = express.Router();
const { ChatController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const redisRateLimit = require('../../middlewares/redisRateLimit');

const chatRateLimit = redisRateLimit({
    windowSeconds: 60,
    maxRequests: 20,
    keyPrefix: 'rate-limit:chat',
    keyResolver: (req) => req.user?.id || req.ip,
});

router.post('/', auth, chatRateLimit, (req, res) => ChatController.sendMessage(req, res));

module.exports = router;
