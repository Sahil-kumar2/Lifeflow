const { DonorService } = require('../services');

class DonorController {
    static async getDonationLogs(req, res) {
        try {
            const logs = await DonorService.getDonationLogs(req.user.id);
            res.json(logs);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    static async updateProfile(req, res) {
        try {
            const updatedUser = await DonorService.updateProfile(req.user.id, req.body);
            res.json(updatedUser);
        } catch (err) {
            console.error('Error in profile update:', err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    static async getNearbyRequests(req, res) {
        try {
            const requests = await DonorService.getNearbyRequests(req.user.id);
            res.json(requests);
        } catch (err) {
            console.error('Error in nearby requests:', err);
            res.status(400).json({ msg: err.message });
        }
    }
}

module.exports = DonorController;
