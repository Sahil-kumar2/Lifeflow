// backend/models/BloodRequest.js

const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // This new field will store the ID of the donor who accepts the request
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    bloodType: { type: String, required: true },
    unitsRequired: { type: Number, required: true },
    hospitalName: { type: String, required: true },
    city: { type: String, required: true },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Fulfilled', 'Closed'], // Added 'In Progress'
        default: 'Open',
    },
    urgency: {
        type: String,
        enum: ['Urgent', 'Scheduled'],
        default: 'Urgent',
    },
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);