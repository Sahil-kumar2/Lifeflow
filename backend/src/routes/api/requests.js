const express = require('express');
const router = express.Router();
const { BloodRequestController } = require('../../controllers');
const auth = require('../../middlewares/auth');

router.post('/', auth, (req, res) => BloodRequestController.create(req, res));
// router.post('/:id/accept', auth, (req, res) => BloodRequestController.accept(req, res)); // Updated below to avoid conflict if I replaced it, but I'll strict replace lines.
router.post('/:id/accept', auth, (req, res) => BloodRequestController.accept(req, res));
router.post('/:id/cancel', auth, (req, res) => BloodRequestController.cancel(req, res));
router.post('/:id/complete', auth, (req, res) => BloodRequestController.complete(req, res));
router.get('/my-requests', auth, (req, res) => BloodRequestController.getUserRequests(req, res));
router.get('/inprogress', auth, (req, res) => BloodRequestController.getInProgressRequests(req, res));
router.get('/', (req, res) => BloodRequestController.getOpenRequests(req, res));

module.exports = router;
