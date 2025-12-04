// backend/routes/api/hospitals.js

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const BloodRequest = require('../../models/BloodRequest');
const DonationLog = require('../../models/DonationLog');

router.post('/verify-donation', auth, async (req, res) => {
    try {
        const hospitalUser = await User.findById(req.user.id);
        if (hospitalUser.role !== 'hospital') {
            return res.status(403).json({ msg: 'User is not authorized' });
        }

        const { donorId, requestId } = req.body;

        // --- Step 1: Update existing records ---
        const request = await BloodRequest.findById(requestId);
        if (request) {
            request.status = 'Fulfilled';
            await request.save();
        }

        const donor = await User.findById(donorId);
        if (donor) {
            donor.lastDonationDate = new Date();
        } else {
            return res.status(404).json({ msg: 'Donor not found' });
        }

        const newLog = new DonationLog({
            donor: donorId,
            hospital: req.user.id,
            bloodRequest: requestId,
        });
        await newLog.save();

        // --- Step 2: NEW GAMIFICATION LOGIC ---
        // Count the donor's total number of donations
        const donationCount = await DonationLog.countDocuments({ donor: donorId });
        let badgeAwarded = null;

        // Ensure rewards object and badges array exist
        if (!donor.rewards) {
            donor.rewards = { badges: [] };
        }
        if (!donor.rewards.badges) {
            donor.rewards.badges = [];
        }

        // Check for milestones and award badges if they haven't been awarded before
        if (donationCount === 1 && !donor.rewards.badges.includes("First Donation")) {
            donor.rewards.badges.push("First Donation");
            badgeAwarded = "First Donation";
        }
        if (donationCount === 5 && !donor.rewards.badges.includes("5 Donations Club")) {
            donor.rewards.badges.push("5 Donations Club");
            badgeAwarded = "5 Donations Club";
        }
        if (donationCount === 10 && !donor.rewards.badges.includes("Blood Hero")) {
            donor.rewards.badges.push("Blood Hero");
            badgeAwarded = "Blood Hero";
        }
        
        // Save the updated donor profile only if a new badge was awarded
        if (badgeAwarded) {
            await donor.save();
        }

        res.json({ msg: 'Donation successfully verified.', badgeAwarded });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;