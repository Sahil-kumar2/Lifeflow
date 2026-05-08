const { User, DonationLog, BloodRequest } = require('../models');
const { deleteCache, getCache, setCache } = require('../utils/cache');

class DonorService {
    static async getDonationLogs(donorId) {
        const cacheKey = `donation-logs:${donorId}`;
        const cachedLogs = await getCache(cacheKey);
        if (cachedLogs) {
            return cachedLogs;
        }

        const logs = await DonationLog.find({ donor: donorId }).lean();
        const response = { count: logs.length, logs };
        await setCache(cacheKey, response, 60);
        return response;
    }

    static async updateProfile(userId, updates) {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true }
        );
        if (!updatedUser) {
            throw new Error('User not found');
        }

        await deleteCache([
            `auth:profile:${userId}`,
            `donor:nearby-requests:${userId}`,
        ]);

        return updatedUser;
    }

    static async getNearbyRequests(userId) {
        const cacheKey = `donor:nearby-requests:${userId}`;
        const cachedRequests = await getCache(cacheKey);
        if (cachedRequests) {
            return cachedRequests;
        }

        const user = await User.findById(userId);
        if (!user || !user.location) {
            throw new Error('Your location is not set.');
        }

        const [longitude, latitude] = user.location.coordinates;
        const searchRadiusDegrees = 0.18;
        const boundingBox = [
            [longitude - searchRadiusDegrees, latitude - searchRadiusDegrees],
            [longitude + searchRadiusDegrees, latitude + searchRadiusDegrees]
        ];

        const requesters = await User.find({
            role: 'patient',
            location: { $geoWithin: { $box: boundingBox } }
        });
        const requesterIds = requesters.map((requester) => requester._id);

        if (requesterIds.length === 0) {
            await setCache(cacheKey, [], 30);
            return [];
        }

        const nearbyRequests = await BloodRequest.find({
            requester: { $in: requesterIds },
            status: 'Pending'
        }).sort({ createdAt: -1 }).lean();

        await setCache(cacheKey, nearbyRequests, 30);
        return nearbyRequests;
    }
}

module.exports = DonorService;
