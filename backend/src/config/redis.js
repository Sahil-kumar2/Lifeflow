const { createClient } = require('redis');
require('dotenv').config();

let client = null;
let connectPromise = null;
let isRedisReady = false;

const getRedisUrl = () => process.env.REDIS_URL || null;

async function connectRedis() {
    const redisUrl = getRedisUrl();

    if (!redisUrl) {
        return null;
    }

    if (client && isRedisReady) {
        return client;
    }

    if (connectPromise) {
        return connectPromise;
    }

    client = createClient({
        url: redisUrl,
    });

    client.on('error', (error) => {
        isRedisReady = false;
        console.error('Redis client error:', error.message);
    });

    client.on('ready', () => {
        isRedisReady = true;
        console.log('Redis connected');
    });

    connectPromise = client.connect()
        .then(() => client)
        .catch((error) => {
            console.warn('Redis unavailable, continuing without cache:', error.message);
            isRedisReady = false;
            client = null;
            connectPromise = null;
            return null;
        });

    return connectPromise;
}

async function getRedisClient() {
    if (client && isRedisReady) {
        return client;
    }

    return connectRedis();
}

async function closeRedis() {
    if (client) {
        await client.quit();
    }

    client = null;
    connectPromise = null;
    isRedisReady = false;
}

module.exports = {
    connectRedis,
    getRedisClient,
    closeRedis,
};
