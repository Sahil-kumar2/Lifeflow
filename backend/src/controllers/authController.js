const { AuthService } = require('../services');

class AuthController {
    static async register(req, res) {
        try {
            const response = await AuthService.register(req.body);
            res.json(response); // Returns { msg: 'OTP sent to email' }
        } catch (err) {
            console.error(err.message);
            res.status(400).json({ msg: err.message });
        }
    }

    static async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;
            const { token, user } = await AuthService.verifyOTP(email, otp);
            res.json({ token });
        } catch (err) {
            console.error(err.message);
            res.status(400).json({ msg: err.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const { token, user } = await AuthService.login(email, password);
            res.json({ token });
        } catch (err) {
            console.error(err.message);
            res.status(400).json({ msg: err.message });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await AuthService.getProfile(req.user.id);
            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: err.message });
        }
    }
}

module.exports = AuthController;
