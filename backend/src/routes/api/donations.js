const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const DonationLogController = require('../../controllers/DonationLogController');

// @route   GET api/donations/donor-history
// @desc    Get donation history for the logged-in donor
// @access  Private (Donor)
router.get('/donor-history', auth, DonationLogController.getDonorHistory);

// @route   GET api/donations/hospital-history
// @desc    Get verification history for the logged-in hospital
// @access  Private (Hospital)
router.get('/hospital-history', auth, DonationLogController.getHospitalHistory);

// @route   GET api/donations/patient-history
// @desc    Get donation history for patient (received donations)
// @access  Private
router.get('/patient-history', auth, DonationLogController.getPatientHistory);

module.exports = router;
