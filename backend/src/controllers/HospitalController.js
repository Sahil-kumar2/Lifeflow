const { HospitalService } = require('../services');
const socket = require('../socket');

class HospitalController {
    static async verifyDonation(req, res) {
        try {
            const { donorId, requestId } = req.body;
            const result = await HospitalService.verifyDonation(req.user.id, donorId, requestId);

            // Emit completion event
            const io = socket.getIO();
            // We need the full request object to emit, but verifyDonation might not return it. 
            // However, the dashboard will likely fetch updated lists or we can just send the ID and status.
            // Better to fetch the request or let the frontend handle re-fetch.
            // For now, let's emit the requestId and status. 
            // Or better, let's return the updated request from Service?
            // The service returns { msg, badgeAwarded }. 
            // Let's just emit { _id: requestId, status: 'Completed' } which might be enough for optimistic UI updates 
            // or triggering a refetch.
            // Actually, `request_completed` usually expects the request object.
            // Let's rely on the frontend refetching or just sending the minimal update.
            io.emit('request_completed', { _id: requestId, status: 'Completed' });

            res.json(result);
        } catch (err) {
            console.error(err.message);
            res.status(err.message === 'User is not authorized' ? 403 : 500)
                .json({ msg: err.message });
        }
    }
}

module.exports = HospitalController;

module.exports = HospitalController;
