const { Queue } = require('bullmq');
const { getRedisClient } = require('./redis');

let smsQueue = null;

/**
 * Initialize SMS Queue
 * Uses Redis connection from redis.js config
 * @returns {Queue} BullMQ Queue instance
 */
const initSMSQueue = () => {
    const redisClient = getRedisClient();
    
    if (!redisClient) {
        console.warn('⚠️  Redis not available - SMS Queue will not work');
        return null;
    }

    if (!smsQueue) {
        try {
            smsQueue = new Queue('sms-queue', {
                connection: redisClient,
                defaultJobOptions: {
                    attempts: 3,              // Retry up to 3 times on failure
                    backoff: {
                        type: 'exponential',
                        delay: 2000            // 2s, then 4s, then 8s
                    },
                    removeOnComplete: {
                        age: 3600               // Keep successful jobs for 1 hour in history
                    },
                    removeOnFail: false        // Keep failed jobs for debugging
                }
            });

            console.log('✅ SMS Queue initialized successfully');
        } catch (err) {
            console.error('❌ Failed to initialize SMS Queue:', err.message);
            smsQueue = null;
        }
    }

    return smsQueue;
};

/**
 * Get SMS Queue instance
 * @returns {Queue|null} Queue instance or null if not initialized
 */
const getSMSQueue = () => {
    if (!smsQueue) {
        return initSMSQueue();
    }
    return smsQueue;
};

/**
 * Close SMS Queue
 * Call on server shutdown
 */
const closeSMSQueue = async () => {
    if (smsQueue) {
        try {
            await smsQueue.close();
            console.log('✅ SMS Queue closed');
            smsQueue = null;
        } catch (err) {
            console.error('❌ Error closing SMS Queue:', err.message);
        }
    }
};

module.exports = {
    initSMSQueue,
    getSMSQueue,
    closeSMSQueue
};
