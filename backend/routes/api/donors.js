// backend/routes/api/donors.js

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const DonationLog = require('../../models/DonationLog'); // Import the DonationLog model
const BloodRequest = require('../../models/BloodRequest');

// --- NEW ROUTE to get donation logs for a specific donor ---
router.get('/donation-logs', auth, async (req, res) => {
    try {
        const logs = await DonationLog.find({ donor: req.user.id });
        res.json({ count: logs.length, logs });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- EXISTING, CORRECT ROUTES ---
router.patch('/profile', auth, async (req, res) => {
    try {
        const updates = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });
        if (!updatedUser) return res.status(404).json({ msg: 'User not found' });
        res.json(updatedUser);
    } catch (err) {
        console.error("Error in /profile patch:", err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/nearby-requests', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.location) return res.status(400).json({ msg: 'Your location is not set.' });

        const [longitude, latitude] = user.location.coordinates;
        const searchRadiusDegrees = 0.18;
        const boundingBox = [
            [longitude - searchRadiusDegrees, latitude - searchRadiusDegrees],
            [longitude + searchRadiusDegrees, latitude + searchRadiusDegrees]
        ];

        const requesters = await User.find({ role: 'patient', location: { $geoWithin: { $box: boundingBox } } });
        const requesterIds = requesters.map(r => r._id);
        if (requesterIds.length === 0) return res.json([]);
        const nearbyRequests = await BloodRequest.find({ requester: { $in: requesterIds }, status: 'Open' }).sort({ createdAt: -1 });
        res.json(nearbyRequests);
    } catch (err) {
        console.error("Error in /nearby-requests:", err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;