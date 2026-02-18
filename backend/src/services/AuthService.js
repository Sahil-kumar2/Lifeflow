const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {
    static async register(userData) {
        const { name, email, password, phone, role, city, bloodType, longitude, latitude } = userData;

        let user = await User.findOne({ email });
        if (user) {
            throw new Error('User already exists');
        }

        user = new User({ name, email, password, phone, role, city, bloodType });

        // Save location if provided
        if (longitude && latitude) {
            user.location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
        }

        await user.save();
        
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
        
        return { token, user };
    }

    static async login(email, password) {
        let user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid Credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid Credentials');
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });
        
        return { token, user };
    }

    static async getProfile(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

module.exports = AuthService;
