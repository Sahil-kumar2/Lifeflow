const express = require('express');
const router = express.Router();
const { DonorController } = require('../../controllers');
const auth = require('../../middlewares/auth');

router.get('/donation-logs', auth, (req, res) => DonorController.getDonationLogs(req, res));
router.patch('/profile', auth, (req, res) => DonorController.updateProfile(req, res));
router.get('/nearby-requests', auth, (req, res) => DonorController.getNearbyRequests(req, res));

module.exports = router;
