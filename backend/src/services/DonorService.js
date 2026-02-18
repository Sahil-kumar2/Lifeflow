const { User, DonationLog, BloodRequest } = require('../models');

class DonorService {
    static async getDonationLogs(donorId) {
        const logs = await DonationLog.find({ donor: donorId });
        return { count: logs.length, logs };
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
        return updatedUser;
    }

    static async getNearbyRequests(userId) {
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
        const requesterIds = requesters.map(r => r._id);
        
        if (requesterIds.length === 0) {
            return [];
        }
        
        const nearbyRequests = await BloodRequest.find({
            requester: { $in: requesterIds },
            status: 'Open'
        }).sort({ createdAt: -1 });
        
        return nearbyRequests;
    }
}

module.exports = DonorService;
