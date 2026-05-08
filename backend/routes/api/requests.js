// backend/routes/api/requests.js

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const BloodRequest = require('../../models/BloodRequest');
const User = require('../../models/User');
const { getSMSQueue } = require('../../src/config/queue');

// @route   POST api/requests
// @desc    Create a blood request AND queue SMS notifications via BullMQ
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

        // --- GEOSPATIAL QUERY (using $box method) ---
        const searchRadiusDegrees = 0.18; // Approx. 20km
        const boundingBox = [
            [longitude - searchRadiusDegrees, latitude - searchRadiusDegrees],
            [longitude + searchRadiusDegrees, latitude + searchRadiusDegrees]
        ];

        const nearbyDonors = await User.find({
            role: 'donor',
            bloodType: bloodType,
            location: {
                $geoWithin: {
                    $box: boundingBox
                }
            }
        });

        // Queue SMS notifications via BullMQ (non-blocking)
        if (nearbyDonors.length > 0) {
            console.log(`📨 Found ${nearbyDonors.length} nearby donors. Queueing SMS via BullMQ...`);
            const messageBody = `Urgent need for ${bloodType} blood at ${hospitalName}, ${city}. Can you help? Log in to your LiveFlow account to respond.`;
            
            const smsQueue = getSMSQueue();
            if (smsQueue) {
                const jobPromises = nearbyDonors.map(donor => {
                    if (donor.phone && typeof donor.phone === 'string') {
                        const jobId = `sms-${bloodRequest._id}-${donor._id}`;
                        return smsQueue.add(
                            'send-sms',
                            {
                                requestId: bloodRequest._id,
                                donorPhone: donor.phone,
                                donorName: donor.name,
                                messageBody: messageBody
                            },
                            {
                                jobId,
                                priority: 10  // High priority for urgent notifications
                            }
                        )
                            .then(job => console.log(`✅ SMS job queued for ${donor.name} (Job ID: ${job.id})`))
                            .catch(err => console.error(`❌ Failed to queue SMS for ${donor.name}:`, err.message));
                    }
                });
                await Promise.all(jobPromises);
                console.log(`📨 All ${nearbyDonors.length} SMS jobs queued successfully`);
            } else {
                console.warn('⚠️  SMS Queue unavailable - notifications not sent');
            }
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