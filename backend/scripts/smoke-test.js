/**
 * API smoke test — run: node backend/scripts/smoke-test.js
 * Requires backend on port 5000 and MongoDB running.
 */
const BASE = process.env.API_URL || 'http://127.0.0.1:5000/api';

const accounts = {
  admin: { email: 'superadmin@gmail.com', password: 'admin321' },
};

let passed = 0;
let failed = 0;
const errors = [];

const log = (ok, name, detail = '') => {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
  } else {
    failed++;
    errors.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

async function request(method, path, { token, body, expectStatus } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (expectStatus != null && res.status !== expectStatus) {
    throw new Error(`${method} ${path} expected ${expectStatus}, got ${res.status}: ${text.slice(0, 200)}`);
  }
  return { status: res.status, data };
}

async function login(email, password) {
  const { status, data } = await request('POST', '/auth/login', {
    body: { email, password },
    expectStatus: 200,
  });
  if (!data?.data?.token && !data?.token) throw new Error(`Login failed for ${email}`);
  return data?.data?.token || data?.token;
}

async function run() {
  console.log('\n=== API Smoke Test ===\n');

  // Health / public
  try {
    const { status, data } = await request('GET', '/properties?limit=5&status=active&listingType=sale');
    log(status === 200 && data.success, 'GET /properties (sale)', `${data?.total ?? 0} total`);
  } catch (e) {
    log(false, 'GET /properties (sale)', e.message);
  }

  try {
    const { status, data } = await request('GET', '/properties?limit=5&status=active&listingType=rent');
    log(status === 200 && data.success, 'GET /properties (rent)', `${data?.total ?? 0} total`);
  } catch (e) {
    log(false, 'GET /properties (rent)', e.message);
  }

  try {
    const { data } = await request('GET', '/properties?status=active&listingType=rent&latitude=24.93&longitude=67.07&radiusMiles=10');
    log(Array.isArray(data?.data), 'GET /properties geo search', `${data?.data?.length ?? 0} in radius`);
  } catch (e) {
    log(false, 'GET /properties geo search', e.message);
  }

  try {
    const { data } = await request('GET', '/users/agents/public?limit=5');
    log(Array.isArray(data?.data), 'GET /users/agents/public', `${data?.data?.length ?? 0} agents`);
  } catch (e) {
    log(false, 'GET /users/agents/public', e.message);
  }

  // Auth
  let adminToken;
  try {
    adminToken = await login(accounts.admin.email, accounts.admin.password);
    log(true, 'POST /auth/login (admin)');
  } catch (e) {
    log(false, 'POST /auth/login (admin)', e.message);
  }

  if (adminToken) {
    const adminTests = [
      ['GET', '/users?limit=5', 'GET /users'],
      ['GET', '/properties?limit=5', 'GET /properties (admin)'],
      ['GET', '/tours?limit=5', 'GET /tours'],
      ['GET', '/analytics/admin', 'GET /analytics/admin'],
      ['GET', '/messages/conversations', 'GET /messages/conversations'],
      ['GET', '/ad-campaigns', 'GET /ad-campaigns'],
      ['GET', '/crm/partners', 'GET /crm/partners'],
      ['GET', '/auth/me', 'GET /auth/me'],
      ['GET', '/notifications', 'GET /notifications'],
      ['GET', '/password-resets', 'GET /password-resets'],
    ];

    for (const [method, path, name] of adminTests) {
      try {
        const { status, data } = await request(method, path, { token: adminToken });
        log(status === 200 && data?.success !== false, name);
      } catch (e) {
        log(false, name, e.message);
      }
    }

    // Viewership toggle on active property
    try {
      const { data: list } = await request('GET', '/properties?limit=1&status=active');
      const id = list?.data?.[0]?._id;
      if (id) {
        const { status, data } = await request('PUT', `/properties/${id}/viewership`, {
          token: adminToken,
          body: { enabled: true },
        });
        log(status === 200 && data?.success, 'PUT /properties/:id/viewership');
      } else {
        log(true, 'PUT /properties/:id/viewership', 'skipped — no listings');
      }
    } catch (e) {
      log(false, 'PUT /properties/:id/viewership', e.message);
    }

    // Property detail if any exist
    try {
      const { data: list } = await request('GET', '/properties?limit=1&status=active');
      const id = list?.data?.[0]?._id;
      if (id) {
        const { status, data } = await request('GET', `/properties/${id}`);
        log(status === 200 && data?.data?._id === id, 'GET /properties/:id', id);
      } else {
        log(true, 'GET /properties/:id', 'skipped — no listings');
      }
    } catch (e) {
      log(false, 'GET /properties/:id', e.message);
    }

    // Notifications already in adminTests
  }

  // Invalid login
  try {
    const { status } = await request('POST', '/auth/login', {
      body: { email: 'bad@test.com', password: 'wrong' },
      expectStatus: 401,
    });
    log(status === 401, 'POST /auth/login (invalid) rejects');
  } catch (e) {
    log(false, 'POST /auth/login (invalid)', e.message);
  }

  // Protected route without token
  try {
    const { status } = await request('GET', '/users');
    log(status === 401, 'GET /users without token → 401');
  } catch (e) {
    log(false, 'GET /users without token', e.message);
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  if (errors.length) {
    console.log('Failures:');
    errors.forEach((e) => console.log(`  - ${e.name}: ${e.detail}`));
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Smoke test crashed:', e);
  process.exit(1);
});
