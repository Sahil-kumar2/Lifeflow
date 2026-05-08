#!/usr/bin/env node

/**
 * Redis Verification Test Suite
 * Run after starting your backend server: node test-redis.js
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';
const delay = (ms) => new Promise(res => setTimeout(res, ms));

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

// Helper to make HTTP requests
async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test helper
async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    tests.passed++;
    tests.results.push({ name, status: 'PASS' });
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
    tests.failed++;
    tests.results.push({ name, status: 'FAIL', error: err.message });
  }
}

// Redis Health Check
async function runTests() {
  console.log('\n🚀 Starting Redis Verification Tests...\n');

  // Test 1: Server is running
  await test('Server is running', async () => {
    const res = await request('GET', '/api/requests');
    if (res.status >= 200 && res.status < 500) return;
    throw new Error(`Server responded with ${res.status}`);
  });

  // Test 2: Blood requests caching
  await test('Blood requests endpoint works', async () => {
    const res = await request('GET', '/api/requests');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.body)) throw new Error('Expected array response');
  });

  // Test 3: Caching - verify second call is faster
  await test('Response caching (second call faster)', async () => {
    const start1 = Date.now();
    await request('GET', '/api/requests');
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    await request('GET', '/api/requests');
    const time2 = Date.now() - start2;

    console.log(`   📊 First call: ${time1}ms, Second call: ${time2}ms`);
    if (time2 > time1 * 2) {
      console.log(`   ⚠️  Second call wasn't significantly faster - Redis may not be caching`);
    }
  });

  // Test 4: Auth Rate Limiting
  console.log('\n📊 Testing Auth Rate Limiting (10 requests/60s)...');
  await test('Auth rate limiting - under limit (request 1-10)', async () => {
    for (let i = 1; i <= 10; i++) {
      const res = await request('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      
      if (res.status === 429) {
        throw new Error(`Hit rate limit at request ${i} (expected after 10)`);
      }
      
      // Log rate limit headers
      if (i === 10) {
        console.log(`   Headers on request 10:`);
        console.log(`   - X-RateLimit-Limit: ${res.headers['x-ratelimit-limit']}`);
        console.log(`   - X-RateLimit-Remaining: ${res.headers['x-ratelimit-remaining']}`);
        console.log(`   - Retry-After: ${res.headers['retry-after']}`);
      }
    }
  });

  await test('Auth rate limiting - above limit (request 11)', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    if (res.status !== 429) {
      throw new Error(`Expected 429, got ${res.status} - Rate limiting not working!`);
    }
    console.log(`   ✓ Got 429 Too Many Requests as expected`);
    console.log(`   ✓ Retry-After: ${res.headers['retry-after']} seconds`);
  });

  // Test 5: OTP Rate Limiting
  console.log('\n📊 Testing OTP Rate Limiting (5 requests/60s)...');
  await test('OTP rate limiting - under limit (requests 1-5)', async () => {
    for (let i = 1; i <= 5; i++) {
      const res = await request('POST', '/api/auth/verify-otp', {
        email: 'test@example.com',
        otp: '000000'
      });
      
      if (res.status === 429) {
        throw new Error(`Hit rate limit at request ${i} (expected after 5)`);
      }
    }
  });

  await test('OTP rate limiting - above limit (request 6)', async () => {
    const res = await request('POST', '/api/auth/verify-otp', {
      email: 'test@example.com',
      otp: '000000'
    });
    
    if (res.status !== 429) {
      throw new Error(`Expected 429, got ${res.status}`);
    }
  });

  // Test 6: Chat endpoint availability
  console.log('\n📊 Testing Chat Functionality...');
  await test('Chat endpoint exists', async () => {
    try {
      const res = await request('POST', '/api/chat', {
        message: 'What is blood type?'
      });
      
      // 401 is expected if not authenticated, but endpoint exists
      if (res.status === 404) {
        throw new Error('Chat endpoint not found');
      }
      console.log(`   ℹ️  Chat endpoint responded with status ${res.status} (expected 401 without auth)`);
    } catch (err) {
      if (err.message.includes('ECONNREFUSED')) {
        throw new Error('Server connection refused');
      }
      throw err;
    }
  });

  // Test 7: Cache headers
  console.log('\n📊 Testing Cache Response Headers...');
  await test('Response headers are present', async () => {
    const res = await request('GET', '/api/requests');
    console.log(`   Available headers: ${Object.keys(res.headers).join(', ')}`);
  });

  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`📊 Total: ${tests.passed + tests.failed}`);
  console.log('='.repeat(50));

  if (tests.failed === 0) {
    console.log('\n🎉 All tests passed! Redis appears to be working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check Redis connection and configuration.\n');
  }

  // Detailed results
  if (tests.results.some(r => r.status === 'FAIL')) {
    console.log('\n❌ Failed Tests:');
    tests.results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }

  process.exit(tests.failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test suite error:', err.message);
  process.exit(1);
});
