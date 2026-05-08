const { getRedisClient } = require('../config/redis');

async function getCache(key) {
    const client = await getRedisClient();
    if (!client) {
        return null;
    }

    const value = await client.get(key);
    if (value === null) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

async function setCache(key, value, ttlSeconds = 60) {
    const client = await getRedisClient();
    if (!client) {
        return false;
    }

    await client.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
    });

    return true;
}

async function deleteCache(keys) {
    const client = await getRedisClient();
    if (!client) {
        return false;
    }

    const keyList = Array.isArray(keys) ? keys : [keys];
    const filteredKeys = keyList.filter(Boolean);

    if (filteredKeys.length === 0) {
        return true;
    }

    await client.del(filteredKeys);
    return true;
}

async function deleteByPattern(pattern) {
    const client = await getRedisClient();
    if (!client) {
        return false;
    }

    const keysToDelete = [];
    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        keysToDelete.push(key);
        if (keysToDelete.length >= 100) {
            await client.del(keysToDelete.splice(0, keysToDelete.length));
        }
    }

    if (keysToDelete.length > 0) {
        await client.del(keysToDelete);
    }

    return true;
}

async function incrementCounter(key, ttlSeconds) {
    // Sliding window implementation using a Redis sorted set.
    // Each event is stored with score = epoch ms. We remove entries older than window start,
    // then count remaining entries.
    const client = await getRedisClient();
    if (!client) {
        return null; // fail-open when Redis unavailable
    }

    try {
        const now = Date.now();
        const windowStart = now - ttlSeconds * 1000;
        const member = `${now}-${Math.random().toString(36).slice(2)}`;

        // Use MULTI to batch commands. Sequence:
        // ZADD key (now, member)
        // ZREMRANGEBYSCORE key 0 windowStart
        // ZCARD key
        // EXPIRE key ttlSeconds
        const multi = client.multi();
        multi.zAdd(key, [{ score: now, value: member }]);
        multi.zRemRangeByScore(key, 0, windowStart);
        multi.zCard(key);
        multi.expire(key, ttlSeconds);

        const results = await multi.exec();

        // results is an array of replies; zCard result is at index 2
        const zCardResult = results && results[2];
        const count = typeof zCardResult === 'number' ? zCardResult : parseInt(zCardResult, 10);
        return Number.isFinite(count) ? count : 0;
    } catch (err) {
        console.error('Sliding counter error:', err.message);
        return null; // fail-open on errors
    }
}

module.exports = {
    getCache,
    setCache,
    deleteCache,
    deleteByPattern,
    incrementCounter,
};
