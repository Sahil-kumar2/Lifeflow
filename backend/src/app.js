const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { initSMSQueue } = require('./config/queue');
const { initSMSWorker } = require('./workers/smsWorker');
const ensureGeoIndex = require('./utils/ensureIndexes');
const { auth, requests, hospitals, donors, chat, donations } = require('./routes').api;

module.exports = async () => {
    // Connect to database
    await connectDB();

    // Ensure geospatial index exists
    await ensureGeoIndex();

    // Connect to Redis if configured; continue without cache if unavailable
    await connectRedis();

    // Initialize SMS Queue and Worker for async job processing
    initSMSQueue();
    await initSMSWorker();

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Health check route
    app.get('/', (req, res) => res.send('LiveFlow API is running...'));

    // API Routes
    app.use('/api/auth', auth);
    app.use('/api/requests', requests);
    app.use('/api/hospitals', hospitals);
    app.use('/api/donors', donors);
    app.use('/api/chat', chat);
    app.use('/api/donations', donations);

    return app;
};
