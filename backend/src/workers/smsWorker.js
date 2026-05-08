const { Worker, Queue } = require('bullmq');
const twilio = require('twilio');
const { getRedisClient } = require('../config/redis');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

let smsWorker = null;
let dlqQueue = null;

/**
 * Initialize SMS Worker
 * Processes SMS jobs from the queue with automatic retries
 */
const initSMSWorker = async () => {
    const redisClient = getRedisClient();

    if (!redisClient) {
        console.warn('⚠️  Redis not available - SMS Worker cannot start');
        return null;
    }

    try {
        // initialize DLQ queue to capture permanently failed jobs
        try {
            dlqQueue = new Queue('sms-dead-letter', { connection: redisClient });
            console.log('✅ SMS Dead Letter Queue initialized');
        } catch (err) {
            console.warn('⚠️ Could not initialize DLQ:', err.message);
            dlqQueue = null;
        }
        smsWorker = new Worker(
            'sms-queue',
            async (job) => {
                const { donorPhone, donorName, messageBody } = job.data;

                console.log(`📨 Processing SMS job ${job.id} for ${donorName}...`);

                try {
                    // Ensure phone is valid string
                    if (!donorPhone || typeof donorPhone !== 'string') {
                        throw new Error(`Invalid phone number: ${donorPhone}`);
                    }

                    // Send SMS via Twilio
                    const message = await client.messages.create({
                        body: messageBody,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: `+91${donorPhone}`
                    });

                    console.log(`✅ SMS sent to ${donorName} (SID: ${message.sid})`);

                    return {
                        success: true,
                        messageSid: message.sid,
                        donorName,
                        donorPhone,
                        timestamp: new Date()
                    };
                } catch (err) {
                    console.error(`❌ Failed to send SMS to ${donorName}:`, err.message);
                    
                    // Throw error to trigger retry mechanism
                    throw new Error(`SMS sending failed: ${err.message}`);
                }
            },
            {
                connection: redisClient,
                concurrency: 5,              // Process 5 SMS jobs in parallel
                defaultJobOptions: {
                    timeout: 30000            // 30 second timeout per job
                }
            }
        );

        // Event handlers for debugging
        smsWorker.on('completed', (job) => {
            console.log(`✅ Job ${job.id} completed successfully`);
        });

        smsWorker.on('failed', async (job, err) => {
            try {
                console.error(`❌ Job ${job.id} failed (Attempt ${job.attemptsMade}):`, err.message);

                // Determine configured attempts (fallback to 3)
                const maxAttempts = (job.opts && job.opts.attempts) ? job.opts.attempts : 3;

                // If job has exhausted attempts, move it to DLQ
                if (job.attemptsMade >= maxAttempts) {
                    if (dlqQueue) {
                        await dlqQueue.add(
                            'dead-sms',
                            {
                                originalJob: job.data,
                                jobId: job.id,
                                failedReason: err.message,
                                attemptsMade: job.attemptsMade,
                                maxAttempts,
                                timestamp: new Date().toISOString()
                            },
                            { removeOnComplete: true }
                        );
                        console.log(`📦 Job ${job.id} moved to DLQ (sms-dead-letter)`);
                    } else {
                        console.warn(`⚠️ DLQ not available; job ${job.id} remains in failed state`);
                    }
                }
            } catch (e) {
                console.error('❌ Error while handling failed job for DLQ:', e.message);
            }
        });

        smsWorker.on('error', (err) => {
            console.error('❌ SMS Worker error:', err.message);
        });

        smsWorker.on('stalled', (jobId, prev) => {
            console.warn(`⚠️  Job ${jobId} stalled - will be retried`);
        });

        console.log('✅ SMS Worker started successfully (concurrency: 5)');
        return smsWorker;
    } catch (err) {
        console.error('❌ Failed to initialize SMS Worker:', err.message);
        smsWorker = null;
        return null;
    }
};

/**
 * Get SMS Worker instance
 */
const getSMSWorker = () => {
    return smsWorker;
};

/**
 * Close SMS Worker
 * Call on server shutdown
 */
const closeSMSWorker = async () => {
    if (smsWorker) {
        try {
            await smsWorker.close();
            console.log('✅ SMS Worker closed');
            smsWorker = null;
        } catch (err) {
            console.error('❌ Error closing SMS Worker:', err.message);
        }
    }
    if (dlqQueue) {
        try {
            await dlqQueue.close();
            console.log('✅ DLQ Queue closed');
            dlqQueue = null;
        } catch (err) {
            console.error('❌ Error closing DLQ Queue:', err.message);
        }
    }
};

module.exports = {
    initSMSWorker,
    getSMSWorker,
    closeSMSWorker
};
