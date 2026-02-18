const { BloodRequest, User } = require('../models');
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class BloodRequestService {
    static async createRequest(userId, requestData) {
        const { bloodType, unitsRequired, hospitalName, city, longitude, latitude } = requestData;

        const user = await User.findById(userId);
        if (longitude && latitude) {
            user.location = { type: 'Point', coordinates: [longitude, latitude] };
            await user.save();
        }

        const newRequest = new BloodRequest({
            requester: userId,
            bloodType, unitsRequired, hospitalName, city,
        });

        const bloodRequest = await newRequest.save();

        // Notify nearby donors via SMS
        await this.notifyNearbyDonors(bloodType, hospitalName, city, longitude, latitude);

        return bloodRequest;
    }

    static async notifyNearbyDonors(bloodType, hospitalName, city, longitude, latitude) {
        try {
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

            if (nearbyDonors.length > 0) {
                console.log(`Found ${nearbyDonors.length} nearby donors to notify via SMS.`);
                const messageBody = `Urgent need for ${bloodType} blood at ${hospitalName}, ${city}. Can you help? Log in to your LiveFlow account to respond.`;

                const promises = nearbyDonors.map(donor => {
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
        } catch (err) {
            console.error('Error notifying donors:', err);
        }
    }

    static async acceptRequest(requestId, userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const newStatus = user.role === 'hospital' ? 'Completed' : 'In Progress';

        // Atomic update to prevent race conditions
        const request = await BloodRequest.findOneAndUpdate(
            { _id: requestId, status: 'Pending' },
            {
                status: newStatus,
                acceptedBy: userId
            },
            { new: true }
        ).populate('requester', 'name').populate('acceptedBy', 'name'); // Populate acceptedBy too

        if (!request) {
            throw new Error('Request not found or already accepted');
        }
        return request;
    }

    static async cancelRequest(requestId, reason) {
        const request = await BloodRequest.findById(requestId);
        if (!request) throw new Error('Request not found');

        request.status = 'Pending';
        request.acceptedBy = null;
        request.cancellationReason = reason;
        await request.save();
        return request;
    }

    static async completeRequest(requestId) {
        const request = await BloodRequest.findById(requestId);
        if (!request) throw new Error('Request not found');

        request.status = 'Completed';
        await request.save();
        return request;
    }

    static async getUserRequests(userId) {
        const requests = await BloodRequest.find({ requester: userId }).sort({ createdAt: -1 });
        return requests;
    }

    static async getInProgressRequests() {
        // Only fetch requests that are currently in progress and need verification
        const requests = await BloodRequest.find({
            status: 'In Progress'
        })
            .populate('acceptedBy', ['name'])
            .sort({ createdAt: -1 });
        return requests;
    }

    static async getOpenRequests() {
        const requests = await BloodRequest.find({ status: 'Pending' }).sort({ createdAt: -1 });
        return requests;
    }
}

module.exports = BloodRequestService;
