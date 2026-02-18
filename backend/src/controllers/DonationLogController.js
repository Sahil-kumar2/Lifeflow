const { DonationLog, BloodRequest } = require('../models');

class DonationLogController {
    static async getDonorHistory(req, res) {
        try {
            const logs = await DonationLog.find({ donor: req.user.id })
                .populate('hospital', 'name city')
                .populate({
                    path: 'bloodRequest',
                    select: 'bloodType hospitalName'
                })
                .sort({ donationDate: -1 });
            res.json(logs);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }

    static async getHospitalHistory(req, res) {
        try {
            const logs = await DonationLog.find({ hospital: req.user.id })
                .populate('donor', 'name bloodType email')
                .populate('bloodRequest', 'bloodType')
                .sort({ donationDate: -1 });
            res.json(logs);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }

    static async getPatientHistory(req, res) {
        try {
            // Find all requests made by this patient
            const userRequests = await BloodRequest.find({ requester: req.user.id }).select('_id');
            const requestIds = userRequests.map(r => r._id);

            // Find logs associated with these requests
            const logs = await DonationLog.find({ bloodRequest: { $in: requestIds } })
                .populate('donor', 'name email')
                .populate('hospital', 'name city')
                .populate('bloodRequest', 'bloodType')
                .sort({ donationDate: -1 });

            res.json(logs);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }
}

module.exports = DonationLogController;
