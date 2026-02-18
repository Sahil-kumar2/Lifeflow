const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendOTP } = require('./EmailService');

class AuthService {
    static async register(userData) {
        const { name, email, password, phone, role, city, bloodType, longitude, latitude } = userData;

        let user = await User.findOne({ email });
        if (user) {
            if (user.isVerified) {
                throw new Error('User already exists');
            } else {
                // Determine if we should update the existing unverified user or just resend OTP
                // For simplicity, let's update the details and resend OTP
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

        // Save location if provided
        if (longitude && latitude) {
            user.location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        try {
            await sendOTP(email, otp);
        } catch (err) {
            console.error("Failed to send OTP email:", err);
            // Optionally delete user or handle error
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
            // Option to resend OTP here if needed, or just block
            throw new Error('Account not verified. Please verify your email.');
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
