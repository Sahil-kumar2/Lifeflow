const express = require('express');
const router = express.Router();
const { HospitalController } = require('../../controllers');
const auth = require('../../middlewares/auth');

router.post('/verify-donation', auth, (req, res) => HospitalController.verifyDonation(req, res));

module.exports = router;
