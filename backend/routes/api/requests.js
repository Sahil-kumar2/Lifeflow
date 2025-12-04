// backend/routes/api/requests.js

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const BloodRequest = require('../../models/BloodRequest');
const User = require('../../models/User');

// Initialize Twilio Client
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// @route   POST api/requests
// @desc    Create a blood request AND send SMS notifications
router.post('/', auth, async (req, res) => {
    try {
        const { bloodType, unitsRequired, hospitalName, city, longitude, latitude } = req.body;

        const user = await User.findById(req.user.id);
        if (longitude && latitude) {
            user.location = { type: 'Point', coordinates: [longitude, latitude] };
            await user.save();
        }

        const newRequest = new BloodRequest({
            requester: req.user.id,
            bloodType, unitsRequired, hospitalName, city,
        });

        const bloodRequest = await newRequest.save();

        // --- UPDATED GEOSPATIAL QUERY (using the robust $box method) ---
        // 1. Define a "bounding box" for a rough search area
        const searchRadiusDegrees = 0.18; // Approx. 20km
        const boundingBox = [
            [longitude - searchRadiusDegrees, latitude - searchRadiusDegrees],
            [longitude + searchRadiusDegrees, latitude + searchRadiusDegrees]
        ];

        // 2. Find all eligible donors within this simple box.
        const nearbyDonors = await User.find({
            role: 'donor',
            bloodType: bloodType,
            location: {
                $geoWithin: {
                    $box: boundingBox
                }
            }
        });

        // 3. Send an SMS to each nearby donor
        if (nearbyDonors.length > 0) {
            console.log(`Found ${nearbyDonors.length} nearby donors to notify via SMS.`);
            const messageBody = `Urgent need for ${bloodType} blood at ${hospitalName}, ${city}. Can you help? Log in to your LiveFlow account to respond.`;
            
            const promises = nearbyDonors.map(donor => {
                // Ensure donor.phone is a valid string
                if (donor.phone && typeof donor.phone === 'string') {
                    return client.messages.create({
                        body: messageBody,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: `+91${donor.phone}`
                    })
                    .then(message => console.log(`SMS sent to ${donor.name}: ${message.sid}`))
                    .catch(err => console.error(`Failed to send SMS to ${donor.name}:`, err.message));
                }
            });
            await Promise.all(promises);
        }

        res.json(bloodRequest);

    } catch (err) {
        console.error("!!! CRASH IN CREATE REQUEST ROUTE !!!", err);
        res.status(500).send('Server Error');
    }
});

// --- ALL OTHER ROUTES REMAIN THE SAME ---
router.post('/:id/accept', auth, async (req, res) => { /* ... existing code ... */ 
    try { const request = await BloodRequest.findById(req.params.id); if (!request) return res.status(404).json({ msg: 'Request not found' }); request.acceptedBy = req.user.id; request.status = 'In Progress'; await request.save(); res.json(request); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});
router.get('/my-requests', auth, async (req, res) => { /* ... existing code ... */ 
    try { const requests = await BloodRequest.find({ requester: req.user.id }).sort({ createdAt: -1 }); res.json(requests); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});
router.get('/inprogress', auth, async (req, res) => { /* ... existing code ... */ 
    try { const requests = await BloodRequest.find({ status: 'In Progress' }).populate('acceptedBy', ['name']).sort({ createdAt: -1 }); res.json(requests); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});
router.get('/', async (req, res) => { /* ... existing code ... */ 
    try { const requests = await BloodRequest.find({ status: 'Open' }).sort({ createdAt: -1 }); res.json(requests); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

module.exports = router;