const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendOTP } = require('./EmailService');
const { deleteCache, getCache, setCache } = require('../utils/cache');

class AuthService {
    static async register(userData) {
        const { name, email, password, phone, role, city, bloodType, longitude, latitude } = userData;

        let user = await User.findOne({ email });
        if (user) {
            if (user.isVerified) {
                throw new Error('User already exists');
            } else {
                user.name = name;
                user.password = password;
                user.phone = phone;
                user.role = role;
                user.city = city;
                user.bloodType = bloodType;
            }
        } else {
            user = new User({ name, email, password, phone, role, city, bloodType });
        }

        if (longitude && latitude) {
            user.location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        try {
            await sendOTP(email, otp);
        } catch (err) {
            console.error('Failed to send OTP email:', err);
            throw new Error('Failed to send verification email');
        }

        return { msg: 'OTP sent to email' };
    }

    static async verifyOTP(email, otp) {
        let user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid User');
        }

        if (user.otp !== otp) {
            throw new Error('Invalid OTP');
        }

        if (user.otpExpires < Date.now()) {
            throw new Error('OTP Expired');
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        await deleteCache(`auth:profile:${user.id}`);

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

        if (!user.isVerified) {
            throw new Error('Account not verified. Please verify your email.');
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });

        return { token, user };
    }

    static async getProfile(userId) {
        const cacheKey = `auth:profile:${userId}`;
        const cachedProfile = await getCache(cacheKey);
        if (cachedProfile) {
            return cachedProfile;
        }

        const user = await User.findById(userId).select('-password').lean();
        if (!user) {
            throw new Error('User not found');
        }

        await setCache(cacheKey, user, 120);
        return user;
    }
}

module.exports = AuthService;
