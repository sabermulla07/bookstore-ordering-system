/**
 * Automated Verification Script for BookVerse
 * Tests all 4 pages and core database API endpoints
 */

const http = require('http');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting BookVerse Verification Tests...\n');
  const baseUrl = 'http://localhost:3000';

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Pages check
  await test('1. Home Page renders (GET /)', async () => {
    const res = await request(`${baseUrl}/`);
    if (res.statusCode !== 200 || !res.data.includes('BookVerse')) {
      throw new Error(`Expected status 200 with BookVerse title, got ${res.statusCode}`);
    }
  });

  await test('2. Login Page renders (GET /login)', async () => {
    const res = await request(`${baseUrl}/login`);
    if (res.statusCode !== 200 || !res.data.includes('Login to Your Account')) {
      throw new Error(`Expected status 200 with Login form, got ${res.statusCode}`);
    }
  });

  await test('3. Catalogue Page renders (GET /catalogue)', async () => {
    const res = await request(`${baseUrl}/catalogue`);
    if (res.statusCode !== 200 || !res.data.includes('Browse Book Catalogue')) {
      throw new Error(`Expected status 200 with Catalogue, got ${res.statusCode}`);
    }
  });

  await test('4. Registration Page renders (GET /register)', async () => {
    const res = await request(`${baseUrl}/register`);
    if (res.statusCode !== 200 || !res.data.includes('Create an Account')) {
      throw new Error(`Expected status 200 with Register form, got ${res.statusCode}`);
    }
  });

  // 2. API Endpoints
  await test('5. Books API returns catalogue data (GET /api/books)', async () => {
    const res = await request(`${baseUrl}/api/books`);
    const json = JSON.parse(res.data);
    if (res.statusCode !== 200 || !json.success || json.books.length === 0) {
      throw new Error(`Expected books array, got ${json.count} books`);
    }
  });

  await test('6. Categories API returns genre list (GET /api/books/categories)', async () => {
    const res = await request(`${baseUrl}/api/books/categories`);
    const json = JSON.parse(res.data);
    if (res.statusCode !== 200 || !json.success || json.categories.length < 6) {
      throw new Error(`Expected categories list`);
    }
  });

  await test('7. User Login verification (POST /api/auth/login)', async () => {
    const res = await request(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: 'sabermulla',
      password: 'password123'
    });
    const json = JSON.parse(res.data);
    if (res.statusCode !== 200 || !json.success) {
      throw new Error(`Login failed: ${json.message}`);
    }
  });

  await test('8. User Registration to database (POST /api/auth/register)', async () => {
    const testNum = Math.floor(1000 + Math.random() * 9000);
    const res = await request(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      full_name: 'Test Student',
      email: `student${testNum}@test.com`,
      username: `student_${testNum}`,
      password: 'mypassword123',
      confirmPassword: 'mypassword123',
      phone: '9988776655',
      address: 'Hostel Block B, Pune'
    });
    const json = JSON.parse(res.data);
    if (res.statusCode !== 201 || !json.success) {
      throw new Error(`Registration failed: ${json.message}`);
    }
  });

  await test('9. Cart Checkout saves order to database (POST /api/orders/checkout)', async () => {
    const res = await request(`${baseUrl}/api/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      items: [{ id: 1, quantity: 2, price: 649 }],
      shipping_address: 'Room 204, Campus Hostel, Pune',
      payment_method: 'Cash on Delivery'
    });
    const json = JSON.parse(res.data);
    if (res.statusCode !== 201 || !json.success || !json.order.order_number) {
      throw new Error(`Checkout failed: ${json.message}`);
    }
  });

  console.log(`\n📊 Test Results: ${passed}/${total} passed (${Math.round(passed/total*100)}% success)`);
  process.exit(passed === total ? 0 : 1);
}

// Start temporary server for testing
const { fork } = require('child_process');
const serverProcess = fork('server.js', { silent: true });

setTimeout(() => {
  runTests().finally(() => {
    serverProcess.kill();
  });
}, 1500);
