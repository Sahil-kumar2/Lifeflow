const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['donor', 'patient', 'hospital', 'admin'], 
        required: true 
    },
    // This location object is what will be indexed
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // Stored as [longitude, latitude]
        }
    },
    city: { type: String, required: true },
    bloodType: { type: String },
    lastDonationDate: { type: Date },
    rewards: {
        badges: { type: [String], default: [] }
    },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// This explicitly tells Mongoose to create a 2dsphere index on the 'location' field.
UserSchema.index({ location: '2dsphere' });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);
