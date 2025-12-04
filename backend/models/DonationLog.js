// backend/models/DonationLog.js

const mongoose = require('mongoose');

const DonationLogSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bloodRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodRequest',
    },
    unitsDonated: {
        type: Number,
        default: 1,
    },
    donationDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// This is the crucial line that creates and exports the final model
module.exports = mongoose.model('DonationLog', DonationLogSchema);