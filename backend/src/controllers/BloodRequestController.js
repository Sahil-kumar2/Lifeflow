const { BloodRequestService } = require('../services');
const socket = require('../socket');

class BloodRequestController {
    static async create(req, res) {
        try {
            const bloodRequest = await BloodRequestService.createRequest(req.user.id, req.body);

            // Emit event
            const io = socket.getIO();
            io.emit('request_created', bloodRequest);

            res.json(bloodRequest);
        } catch (err) {
            console.error('Error creating request:', err);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    static async accept(req, res) {
        try {
            const request = await BloodRequestService.acceptRequest(req.params.id, req.user.id);

            const io = socket.getIO();
            io.emit('request_accepted', request);

            res.json(request);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: err.message || 'Server Error' });
        }
    }

    static async cancel(req, res) {
        try {
            const { reason } = req.body;
            const request = await BloodRequestService.cancelRequest(req.params.id, reason);

            const io = socket.getIO();
            io.emit('request_cancelled', request);

            res.json(request);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    static async complete(req, res) {
        try {
            const request = await BloodRequestService.completeRequest(req.params.id);

            const io = socket.getIO();
            io.emit('request_completed', request);

            res.json(request);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    static async getUserRequests(req, res) {
        try {
            const requests = await BloodRequestService.getUserRequests(req.user.id);
            res.json(requests);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    static async getInProgressRequests(req, res) {
        try {
            const requests = await BloodRequestService.getInProgressRequests();
            res.json(requests);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    }

    static async getOpenRequests(req, res) {
        try {
            const requests = await BloodRequestService.getOpenRequests();
            res.json(requests);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    }
}

module.exports = BloodRequestController;
