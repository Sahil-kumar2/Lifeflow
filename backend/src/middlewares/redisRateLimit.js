const { incrementCounter } = require('../utils/cache');

// In-memory fallback store: Map<key, Array<timestamp_ms>>
const localCounters = new Map();

function incrementLocalCounter(key, ttlSeconds) {
    const now = Date.now();
    const windowStart = now - ttlSeconds * 1000;

    let arr = localCounters.get(key) || [];
    // keep only timestamps inside window
    arr = arr.filter(ts => ts > windowStart);
    arr.push(now);
    // bound memory: keep last 10000 entries per key
    if (arr.length > 10000) arr = arr.slice(arr.length - 10000);
    localCounters.set(key, arr);
    return arr.length;
}

module.exports = function redisRateLimit({
    windowSeconds = 60,
    maxRequests = 10,
    keyPrefix = 'rate-limit',
    keyResolver,
} = {}) {
    return async (req, res, next) => {
        try {
            const identity = keyResolver ? keyResolver(req) : req.ip;
            const key = `${keyPrefix}:${identity}`;
            let currentCount = await incrementCounter(key, windowSeconds);
            let source = 'redis';

            // If Redis unavailable or error, fallback to in-memory sliding window
            if (currentCount === null) {
                currentCount = incrementLocalCounter(key, windowSeconds);
                source = 'memory';
            }

            res.setHeader('X-RateLimit-Limit', String(maxRequests));
            res.setHeader('X-RateLimit-Remaining', String(Math.max(maxRequests - currentCount, 0)));
            res.setHeader('X-RateLimit-Source', source);

            if (currentCount > maxRequests) {
                res.setHeader('Retry-After', String(windowSeconds));
                return res.status(429).json({
                    msg: 'Too many requests. Please try again later.',
                });
            }

            return next();
        } catch (error) {
            console.error('Rate limiter error (fallback to allow):', error.message);
            // On unexpected errors, fail-open to avoid outage
            return next();
        }
    };
};
