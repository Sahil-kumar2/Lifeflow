const { BloodRequest, User } = require('../models');
const { deleteByPattern, getCache, setCache } = require('../utils/cache');
const { getSMSQueue } = require('../config/queue');

class BloodRequestService {
    static async invalidateRequestCaches() {
        await deleteByPattern('blood-requests:*');
        await deleteByPattern('donor:nearby-requests:*');
    }

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

        await this.invalidateRequestCaches();

        await this.notifyNearbyDonors(bloodRequest._id, bloodType, hospitalName, city, longitude, latitude);

        return bloodRequest;
    }

    static async notifyNearbyDonors(requestId, bloodType, hospitalName, city, longitude, latitude) {
        try {
            const searchRadiusDegrees = 0.18;
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
                console.log(`📨 Found ${nearbyDonors.length} nearby donors. Queueing SMS notifications...`);
                const messageBody = `Urgent need for ${bloodType} blood at ${hospitalName}, ${city}. Can you help? Log in to your LiveFlow account to respond.`;

                const smsQueue = getSMSQueue();
                if (!smsQueue) {
                    console.warn('⚠️  SMS Queue not available - falling back to direct SMS');
                    // Fallback to direct sending if queue not available
                    return;
                }

                // Queue SMS job for each donor (non-blocking)
                const jobPromises = nearbyDonors.map(donor => {
                    if (donor.phone && typeof donor.phone === 'string') {
                        const jobId = `sms-${requestId}-${donor._id}`;
                        return smsQueue.add(
                            'send-sms',
                            {
                                requestId,
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
                console.log(`📨 All SMS jobs queued for ${nearbyDonors.length} donors`);
            }
        } catch (err) {
            console.error('Error notifying donors:', err);
        }
    }

    static async acceptRequest(requestId, userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const newStatus = user.role === 'hospital' ? 'Completed' : 'In Progress';

        const request = await BloodRequest.findOneAndUpdate(
            { _id: requestId, status: 'Pending' },
            {
                status: newStatus,
                acceptedBy: userId
            },
            { new: true }
        ).populate('requester', 'name').populate('acceptedBy', 'name');

        if (!request) {
            throw new Error('Request not found or already accepted');
        }

        await this.invalidateRequestCaches();

        return request;
    }

    static async cancelRequest(requestId, reason) {
        const request = await BloodRequest.findById(requestId);
        if (!request) throw new Error('Request not found');

        request.status = 'Pending';
        request.acceptedBy = null;
        request.cancellationReason = reason;
        await request.save();

        await this.invalidateRequestCaches();

        return request;
    }

    static async completeRequest(requestId) {
        const request = await BloodRequest.findById(requestId);
        if (!request) throw new Error('Request not found');

        request.status = 'Completed';
        await request.save();

        await this.invalidateRequestCaches();

        return request;
    }

    static async getUserRequests(userId) {
        const cacheKey = `blood-requests:user:${userId}`;
        const cachedRequests = await getCache(cacheKey);
        if (cachedRequests) {
            return cachedRequests;
        }

        const requests = await BloodRequest.find({ requester: userId }).sort({ createdAt: -1 }).lean();
        await setCache(cacheKey, requests, 30);
        return requests;
    }

    static async getInProgressRequests() {
        const cacheKey = 'blood-requests:in-progress';
        const cachedRequests = await getCache(cacheKey);
        if (cachedRequests) {
            return cachedRequests;
        }

        const requests = await BloodRequest.find({
            status: 'In Progress'
        })
            .populate('acceptedBy', ['name'])
            .sort({ createdAt: -1 })
            .lean();

        await setCache(cacheKey, requests, 20);
        return requests;
    }

    static async getOpenRequests() {
        const cacheKey = 'blood-requests:open';
        const cachedRequests = await getCache(cacheKey);
        if (cachedRequests) {
            return cachedRequests;
        }

        const requests = await BloodRequest.find({ status: 'Pending' }).sort({ createdAt: -1 }).lean();
        await setCache(cacheKey, requests, 20);
        return requests;
    }
}

module.exports = BloodRequestService;
