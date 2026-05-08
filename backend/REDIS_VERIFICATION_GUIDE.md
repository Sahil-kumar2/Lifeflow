# Redis Verification Guide

## 1. Check Redis Connection Status

### Server Logs
When server starts, you should see:
```
Redis connected successfully
```

If Redis is unavailable, you'll see:
```
Redis connection error: <error message>
```
System will continue working without Redis (graceful degradation).

---

## 2. Monitor Redis Keys in Real-Time

### Install Redis CLI (if not already installed)
```bash
# Windows with Chocolatey
choco install redis

# macOS with Homebrew
brew install redis

# Or use Docker
docker run -d -p 6379:6379 redis:latest
```

### Connect to Redis & Watch Keys
```bash
redis-cli
> MONITOR          # Real-time command viewer
> KEYS *           # See all cached keys
> KEYS blood-*     # See blood request cache keys
> KEYS auth:*      # See auth profile cache keys
> KEYS chat:*      # See chat response cache keys
```

### Check Specific Cache Values
```bash
redis-cli
> GET blood-requests:open
> GET auth:profile:{userId}
> GET chat:response:abc123...
> TTL blood-requests:open    # See remaining expiration time
```

---

## 3. Test Each Caching Feature

### A. Blood Request Caching (20-30s TTL)

1. **First call - cache miss (should query MongoDB):**
   ```bash
   curl http://localhost:5000/api/requests
   ```
   Check logs for "Fetching from database"

2. **Verify cache was set:**
   ```bash
   redis-cli
   > GET blood-requests:open
   ```
   Should return JSON array

3. **Second call - cache hit (should return instantly from Redis):**
   ```bash
   curl http://localhost:5000/api/requests
   ```
   Should return same data instantly

4. **Create a new blood request:**
   ```bash
   POST /api/requests with body { blood_type, location, ... }
   ```

5. **Verify cache was invalidated:**
   ```bash
   redis-cli
   > GET blood-requests:open
   ```
   Should return `(nil)` → cache cleared, next read will query DB again

---

### B. Auth Profile Caching (120s TTL)

1. **Login to get auth token:**
   ```bash
   POST /api/auth/login
   Body: { email, password }
   Response: { token, user }
   ```

2. **Check profile cache was created:**
   ```bash
   redis-cli
   > KEYS auth:profile:*
   > GET auth:profile:{userId}
   ```
   Should show cached user profile (without password)

3. **Get profile again (cache hit):**
   ```bash
   GET /api/auth/profile
   Headers: Authorization: Bearer {token}
   ```
   Should return instantly from cache

4. **Wait 120+ seconds** → Cache expires, next call queries DB again

---

### C. Chat Response Caching (3600s TTL)

1. **Send a chat message:**
   ```bash
   POST /api/chat
   Body: { message: "What is blood type O positive?" }
   ```
   First response takes 2-5 seconds (Gemini API call)

2. **Verify cache key was created:**
   ```bash
   redis-cli
   > KEYS chat:response:*
   ```
   Should show one or more keys

3. **Send the same message again:**
   ```bash
   POST /api/chat
   Body: { message: "What is blood type O positive?" }
   ```
   Second response should be **instant** (< 100ms from cache)

4. **Send a different message:**
   ```bash
   POST /api/chat
   Body: { message: "How to donate blood?" }
   ```
   Different hash → cache miss → calls Gemini API again

---

### D. Nearby Donor Requests Caching (30s TTL)

1. **Fetch nearby requests as donor:**
   ```bash
   GET /api/donors/nearby-requests
   Headers: Authorization: Bearer {donorToken}
   ```

2. **Check cache:**
   ```bash
   redis-cli
   > GET donor:nearby-requests:{donorId}
   ```

3. **Update donor profile (location change):**
   ```bash
   PUT /api/donors/profile
   ```

4. **Verify cache was invalidated:**
   ```bash
   redis-cli
   > GET donor:nearby-requests:{donorId}
   ```
   Should return `(nil)`

---

## 4. Test Rate Limiting (Verify Throttling Works)

### A. Auth Rate Limiting (10 requests/60 seconds)

1. **Make 10 login attempts rapidly:**
   ```bash
   for i in {1..10}; do
     curl -X POST http://localhost:5000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","password":"password"}'
   done
   ```

2. **All 10 should succeed with 200/401**

3. **Make an 11th request:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

4. **Should get 429 Too Many Requests:**
   ```
   HTTP/1.1 429 Too Many Requests
   X-RateLimit-Limit: 10
   X-RateLimit-Remaining: 0
   Retry-After: 45
   ```

5. **Verify rate limit counter in Redis:**
   ```bash
   redis-cli
   > KEYS rate-limit:*
   > TTL rate-limit:auth:{ip}
   ```

---

### B. OTP Rate Limiting (5 requests/60 seconds)

1. **Make 5 OTP verify attempts:**
   ```bash
   for i in {1..5}; do
     curl -X POST http://localhost:5000/api/auth/verify-otp \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","otp":"000000"}'
   done
   ```

2. **6th request should be throttled (429)**

---

### C. Chat Rate Limiting (20 requests/60 seconds per user)

1. **Send 20 chat messages rapidly (authenticated):**
   ```bash
   for i in {1..20}; do
     curl -X POST http://localhost:5000/api/chat \
       -H "Authorization: Bearer {token}" \
       -H "Content-Type: application/json" \
       -d '{"message":"Hello"}'
   done
   ```

2. **21st request should return 429**

---

## 5. Debugging: Enable Verbose Logging

### Option 1: Check Redis Client Logs
Modify `backend/src/config/redis.js` to add debug logging:
```javascript
client.on('connect', () => console.log('✅ Redis connected'));
client.on('error', (err) => console.log('❌ Redis error:', err));
client.on('end', () => console.log('⚠️ Redis disconnected'));
```

### Option 2: Log Cache Operations
Modify `backend/src/utils/cache.js` to log operations:
```javascript
export const getCache = async (key) => {
  if (!client) return null;
  try {
    const value = await client.get(key);
    console.log(`📖 Cache GET: ${key} → ${value ? 'HIT' : 'MISS'}`);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error(`❌ Cache GET error: ${key}`, err);
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds = 60) => {
  if (!client) return false;
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
    console.log(`📝 Cache SET: ${key} (${ttlSeconds}s TTL)`);
    return true;
  } catch (err) {
    console.error(`❌ Cache SET error: ${key}`, err);
    return false;
  }
};
```

---

## 6. Quick Verification Checklist

### Before Declaring Redis "Working":

- [ ] Server logs show "Redis connected successfully"
- [ ] `redis-cli PING` returns `PONG`
- [ ] Blood request cache keys appear in `redis-cli KEYS blood-*`
- [ ] First API call to `/api/requests` is slower (DB hit), second is faster (cache hit)
- [ ] Creating a blood request invalidates the cache
- [ ] Auth login creates profile cache at `auth:profile:{userId}`
- [ ] Chat sends same message twice → second is instant (cached)
- [ ] 11th login attempt within 60s returns **429 Too Many Requests**
- [ ] Rate limit headers (X-RateLimit-*) appear in response
- [ ] `redis-cli TTL blood-requests:open` shows countdown (not -1 or -2)

---

## 7. Troubleshooting

### Problem: "No cache keys appearing in redis-cli"

**Possible causes:**
1. Redis not running → Start Redis service
2. REDIS_URL not set → Set in .env: `REDIS_URL=redis://localhost:6379`
3. Redis connection failed silently → Check server logs for "Redis connection error"
4. Cache operations happening but keys expired → TTL might be very short, check immediately

**Solution:**
```bash
# Check if Redis is running
redis-cli PING

# Check server logs for Redis connection status
# Add manual test in your route temporarily:
app.get('/test-redis', async (req, res) => {
  const client = getRedisClient();
  if (!client) return res.json({ redis: 'disconnected' });
  await setCache('test-key', { message: 'redis works' }, 60);
  const value = await getCache('test-key');
  res.json({ redis: 'working', cached: value });
});
```

### Problem: "Rate limiting not working"

**Possible causes:**
1. Redis unavailable → Rate limit middleware gracefully bypasses (fail-open)
2. REDIS_URL incorrect → Check .env file

**Solution:**
```bash
# Verify Redis is running
redis-cli KEYS rate-limit:*

# Manually trigger rate limit on test endpoint:
for i in {1..15}; do
  echo "Request $i:"
  curl -i -X POST http://localhost:5000/api/auth/login
done
```

### Problem: "Cache not invalidating after data mutation"

**Possible causes:**
1. Mutation endpoint not hitting the service method
2. Service method not calling `invalidateRequestCaches()`
3. Pattern-based deletion not working (Redis SCAN issue)

**Solution:**
```bash
# Before mutation
redis-cli GET blood-requests:open

# After creating blood request
redis-cli GET blood-requests:open    # Should be (nil)
redis-cli KEYS blood-requests:*       # Should be empty

# If keys still exist, pattern deletion may have failed
```

---

## 8. Performance Indicators

### Expected Response Times

| Endpoint | Cache Status | Response Time |
|----------|--------------|----------------|
| `/api/requests` | First call (miss) | 50-200ms |
| `/api/requests` | Cached (hit) | 5-15ms |
| `/api/chat` | First call (Gemini) | 2-5 seconds |
| `/api/chat` | Cached response | < 100ms |
| `/api/auth/profile` | First call (miss) | 20-50ms |
| `/api/auth/profile` | Cached (hit) | 5-10ms |

If cached responses are not significantly faster, Redis might not be working.

---

## 9. Summary Command Cheatsheet

```bash
# Terminal 1: Start Redis
redis-server
# or with Docker:
docker run -p 6379:6379 redis:latest

# Terminal 2: Monitor Redis in real-time
redis-cli MONITOR

# Terminal 3: Run your backend
npm start

# Terminal 4: Test your API
curl http://localhost:5000/api/requests
curl http://localhost:5000/api/requests  # Should be faster

# Verify all caches
redis-cli KEYS *                    # All keys
redis-cli DBSIZE                    # Total key count
redis-cli INFO stats                # Memory & hit/miss stats
redis-cli FLUSHDB                   # Clear all (careful!)
```
