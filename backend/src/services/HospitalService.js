const { User, DonationLog, BloodRequest } = require('../models');
const { deleteByPattern, deleteCache } = require('../utils/cache');

class HospitalService {
    static async verifyDonation(hospitalUserId, donorId, requestId) {
        const hospitalUser = await User.findById(hospitalUserId);
        if (hospitalUser.role !== 'hospital') {
            throw new Error('User is not authorized');
        }

        const request = await BloodRequest.findById(requestId);
        if (request) {
            request.status = 'Completed';
            await request.save();
        }

        const donor = await User.findById(donorId);
        if (!donor) {
            throw new Error('Donor not found');
        }
        donor.lastDonationDate = new Date();

        const newLog = new DonationLog({
            donor: donorId,
            hospital: hospitalUserId,
            bloodRequest: requestId,
        });
        await newLog.save();

        const donationCount = await DonationLog.countDocuments({ donor: donorId });
        let badgeAwarded = null;

        if (!donor.rewards) {
            donor.rewards = { badges: [] };
        }
        if (!donor.rewards.badges) {
            donor.rewards.badges = [];
        }

        if (donationCount === 1 && !donor.rewards.badges.includes('First Donation')) {
            donor.rewards.badges.push('First Donation');
            badgeAwarded = 'First Donation';
        }
        if (donationCount === 5 && !donor.rewards.badges.includes('5 Donations Club')) {
            donor.rewards.badges.push('5 Donations Club');
            badgeAwarded = '5 Donations Club';
        }
        if (donationCount === 10 && !donor.rewards.badges.includes('Blood Hero')) {
            donor.rewards.badges.push('Blood Hero');
            badgeAwarded = 'Blood Hero';
        }

        if (badgeAwarded) {
            await donor.save();
        }

        await deleteByPattern('blood-requests:*');
        await deleteByPattern('donor:nearby-requests:*');
        await deleteCache([
            `donation-logs:${donorId}`,
            `auth:profile:${donorId}`,
        ]);

        return { msg: 'Donation successfully verified.', badgeAwarded };
    }
}

module.exports = HospitalService;
