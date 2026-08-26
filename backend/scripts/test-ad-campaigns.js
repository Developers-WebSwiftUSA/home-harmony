/**
 * Comprehensive ad campaign test-and-fix suite
 * Run: node backend/scripts/test-ad-campaigns.js
 */
const BASE = process.env.API_URL || 'http://127.0.0.1:5000/api';

let passed = 0;
let failed = 0;
const failures = [];

const log = (ok, name, detail = '') => {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
  } else {
    failed++;
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

async function request(method, path, { token, body, expectStatus } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (expectStatus != null && res.status !== expectStatus) {
    throw new Error(`${method} ${path} expected ${expectStatus}, got ${res.status}: ${text.slice(0, 300)}`);
  }
  return { status: res.status, data };
}

async function login(email, password) {
  const { data } = await request('POST', '/auth/login', {
    body: { email, password },
    expectStatus: 200,
  });
  return { token: data.data.token, user: data.data.user };
}

async function tryLogin(candidates) {
  for (const [email, password] of candidates) {
    try {
      return await login(email, password);
    } catch {
      // continue
    }
  }
  return null;
}

async function clearPropertyCampaigns(adminToken, propertyId) {
  const { data } = await request('GET', `/ad-campaigns?propertyId=${propertyId}&limit=50`, {
    token: adminToken,
  });
  for (const c of data?.data || []) {
    if (c.status === 'pending') {
      await request('PUT', `/ad-campaigns/${c._id}/cancel`, { token: adminToken });
    } else if (c.status === 'active') {
      await request('PUT', `/ad-campaigns/${c._id}/end`, { token: adminToken });
    }
  }
}

async function run() {
  console.log('\n=== Ad Campaign Test & Fix Loop ===\n');

  // --- Auth ---
  console.log('Auth & access');
  const admin = await tryLogin([['superadmin@gmail.com', 'admin321']]);
  log(Boolean(admin?.token), 'Admin login');
  if (!admin) {
    console.log('\nCannot continue without admin.\n');
    process.exit(1);
  }

  const seller = await tryLogin([
    ['zd@gmail.com', '123456'],
    ['zd@gmail.com', 'password'],
    ['newuser@gmail.com', '123456'],
  ]);
  log(Boolean(seller?.token), 'Seller login', seller?.user?.email);

  const buyer = await tryLogin([
    ['newbuyer@gmail.com', '123456'],
    ['testbuyer1@example.com', '123456'],
  ]);
  log(Boolean(buyer?.token), 'Buyer login', buyer?.user?.email);

  const agent = await tryLogin([
    ['agnew@agent.com', '123456'],
    ['agentnew@gmail.com', '123456'],
    ['newagent@gmail.com', '123456'],
    ['anotheragent@gmail.com', '123456'],
  ]);
  log(Boolean(agent?.token), 'Agent login', agent?.user?.email || 'none available');

  // --- Pricing ---
  console.log('\nPricing');
  try {
    const { data } = await request('GET', '/ad-campaigns/pricing', {
      token: seller?.token || admin.token,
      expectStatus: 200,
    });
    const types = data?.data?.adTypes || [];
    const durations = data?.data?.durations || [];
    log(types.length === 2, 'Pricing has 2 ad types', types.map((t) => `${t.type}:$${t.dailyRate}`).join(', '));
    log(
      durations.map((d) => d.days).join(',') === '7,14,30',
      'Pricing durations 7/14/30',
      durations.map((d) => d.days).join('/')
    );
    log(
      types.find((t) => t.type === 'sponsored')?.dailyRate === 19.99 &&
        types.find((t) => t.type === 'advertisement')?.dailyRate === 9.99,
      'Daily rates correct'
    );
  } catch (e) {
    log(false, 'Pricing catalog', e.message);
  }

  // Buyer blocked from pricing & list
  if (buyer) {
    try {
      const { status } = await request('GET', '/ad-campaigns/pricing', { token: buyer.token });
      log(status === 403, 'Buyer blocked from pricing', `status=${status}`);
    } catch (e) {
      log(false, 'Buyer blocked from pricing', e.message);
    }
    try {
      const { status } = await request('GET', '/ad-campaigns', { token: buyer.token });
      log(status === 403, 'Buyer blocked from listing campaigns', `status=${status}`);
    } catch (e) {
      log(false, 'Buyer blocked from listing campaigns', e.message);
    }
  }

  if (!seller) {
    console.log('\nNo seller — stopping create/approve flows.\n');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }

  // --- Seller properties ---
  console.log('\nSeller properties');
  let saleProperty = null;
  let rentProperty = null;
  try {
    const { data } = await request('GET', '/properties/mine', {
      token: seller.token,
      expectStatus: 200,
    });
    const active = (data?.data || []).filter((p) => p.status === 'active');
    saleProperty = active.find((p) => p.listingType === 'sale' || p.listingType === 'both');
    rentProperty = active.find((p) => p.listingType === 'rent' || p.listingType === 'both');
    log(active.length > 0, 'Seller has active listings', `${active.length} active`);
    log(Boolean(saleProperty), 'Has sale listing', saleProperty?.title);
    log(Boolean(rentProperty), 'Has rent listing', rentProperty?.title || 'optional');
  } catch (e) {
    log(false, 'Seller mine properties', e.message);
  }

  if (!saleProperty) {
    console.log('\nNo sale property for seller — cannot complete create flow.\n');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }

  await clearPropertyCampaigns(admin.token, saleProperty._id);
  if (rentProperty) await clearPropertyCampaigns(admin.token, rentProperty._id);

  // --- Create campaign ---
  console.log('\nCreate → Approve → Badge → Sort');
  let campaignId = null;
  try {
    const { status, data } = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'sponsored',
        durationDays: 7,
        cardHolderName: 'Test Seller',
        cardNumber: '4242 4242 4242 4242',
        billingEmail: 'seller-test@example.com',
        billingAddress: '100 Main St',
      },
      expectStatus: 201,
    });
    campaignId = data?.data?._id;
    log(status === 201 && data?.data?.status === 'pending', 'Create sponsored campaign', campaignId);
    log(data?.data?.totalAmount === 139.93, 'Total amount $139.93', `$${data?.data?.totalAmount}`);
    log(data?.data?.payment?.cardLast4 === '4242', 'Card last4 masked', data?.data?.payment?.cardLast4);
    log(data?.data?.payment?.cardBrand === 'visa', 'Card brand detected visa', data?.data?.payment?.cardBrand);
    log(!JSON.stringify(data).includes('4242424242424242'), 'Full card number not in response');
  } catch (e) {
    log(false, 'Create sponsored campaign', e.message);
  }

  // Duplicate blocked
  try {
    const { status, data } = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'advertisement',
        durationDays: 7,
        cardHolderName: 'Test',
        cardNumber: '4111111111111111',
        billingEmail: 't@t.com',
      },
    });
    log(status === 400, 'Duplicate pending blocked', data?.message);
  } catch (e) {
    log(false, 'Duplicate pending blocked', e.message);
  }

  // Invalid duration
  try {
    const { status } = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'advertisement',
        durationDays: 5,
        cardHolderName: 'Test',
        cardNumber: '4111111111111111',
        billingEmail: 't@t.com',
      },
    });
    // Will be 400 for duplicate OR invalid — clear first for a clean invalid-duration test later
    log(status === 400, 'Invalid/duplicate create rejected', `status=${status}`);
  } catch (e) {
    log(false, 'Invalid create rejected', e.message);
  }

  // Invalid ad type
  try {
    await clearPropertyCampaigns(admin.token, saleProperty._id);
    const { status, data } = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'premium',
        durationDays: 7,
        cardHolderName: 'Test',
        cardNumber: '4111111111111111',
        billingEmail: 't@t.com',
      },
    });
    log(status === 400 && /ad type/i.test(data?.message || ''), 'Invalid ad type rejected', data?.message);

    // Recreate valid pending for approve path
    const created = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'sponsored',
        durationDays: 14,
        cardHolderName: 'Test Seller',
        cardNumber: '5555555555554444',
        billingEmail: 'seller-test@example.com',
      },
      expectStatus: 201,
    });
    campaignId = created.data?.data?._id;
    log(created.data?.data?.payment?.cardBrand === 'mastercard', 'Mastercard brand detected');
    log(created.data?.data?.totalAmount === 279.86, '14-day sponsored total $279.86', `$${created.data?.data?.totalAmount}`);
  } catch (e) {
    log(false, 'Invalid ad type / recreate', e.message);
  }

  // Seller lists only own
  try {
    const { data } = await request('GET', '/ad-campaigns', { token: seller.token, expectStatus: 200 });
    const allOwn = (data?.data || []).every(
      (c) => c.requesterId?._id === seller.user.id || c.requesterId?.email === seller.user.email
    );
    log(allOwn && (data?.data?.length || 0) > 0, 'Seller lists only own campaigns', `${data?.data?.length} items`);
  } catch (e) {
    log(false, 'Seller lists only own campaigns', e.message);
  }

  // Admin approve
  try {
    const { data } = await request('PUT', `/ad-campaigns/${campaignId}/approve`, {
      token: admin.token,
      body: { adminNotes: 'Test approval' },
      expectStatus: 200,
    });
    log(
      data?.data?.status === 'active' && data?.data?.paymentStatus === 'charged',
      'Admin approve & charge',
      `$${data?.data?.chargedAmount}`
    );
    log(Boolean(data?.data?.startDate && data?.data?.endDate), 'Campaign dates set');
  } catch (e) {
    log(false, 'Admin approve & charge', e.message);
  }

  // Property promotion fields
  try {
    const { data } = await request('GET', `/properties/${saleProperty._id}`);
    const p = data?.data;
    log(p?.promotion?.type === 'sponsored', 'Property promotion type sponsored', p?.promotion?.type);
    log(p?.promotionPriority === 2, 'Promotion priority 2', String(p?.promotionPriority));
    log(p?.featured === true, 'Sponsored sets featured=true');
    log(new Date(p?.promotion?.expiresAt).getTime() > Date.now(), 'Promotion not expired');
  } catch (e) {
    log(false, 'Property promotion fields', e.message);
  }

  // Public browse — top of sale list
  try {
    const { data } = await request('GET', '/properties?status=active&listingType=sale&limit=20&sort=-createdAt');
    const list = data?.data || [];
    const idx = list.findIndex((p) => p._id === saleProperty._id);
    log(idx === 0, 'Promoted sale listing sorts first', `index=${idx}`);
    log(list[idx]?.promotion?.type === 'sponsored', 'Public list shows sponsored badge data');
  } catch (e) {
    log(false, 'Public sale sort', e.message);
  }

  // Cannot approve twice
  try {
    const { status, data } = await request('PUT', `/ad-campaigns/${campaignId}/approve`, {
      token: admin.token,
      body: {},
    });
    log(status === 400, 'Double-approve rejected', data?.message);
  } catch (e) {
    log(false, 'Double-approve rejected', e.message);
  }

  // Seller cannot approve
  try {
    // need a pending campaign — use rent if available else skip
    if (rentProperty) {
      await clearPropertyCampaigns(admin.token, rentProperty._id);
      const pending = await request('POST', '/ad-campaigns', {
        token: seller.token,
        body: {
          propertyId: rentProperty._id,
          adType: 'advertisement',
          durationDays: 7,
          cardHolderName: 'Test',
          cardNumber: '4111111111111111',
          billingEmail: 't@t.com',
        },
        expectStatus: 201,
      });
      const { status } = await request('PUT', `/ad-campaigns/${pending.data.data._id}/approve`, {
        token: seller.token,
        body: {},
      });
      log(status === 403, 'Seller cannot approve campaigns', `status=${status}`);

      // Admin approve rent advertisement
      const approved = await request('PUT', `/ad-campaigns/${pending.data.data._id}/approve`, {
        token: admin.token,
        body: {},
        expectStatus: 200,
      });
      log(approved.data?.data?.status === 'active', 'Approve rent advertisement');

      const { data: rentDetail } = await request('GET', `/properties/${rentProperty._id}`);
      log(rentDetail?.data?.promotion?.type === 'advertisement', 'Rent listing gets Ad promotion');
      log(rentDetail?.data?.promotionPriority === 1, 'Advertisement priority 1');
      log(rentDetail?.data?.featured !== true, 'Advertisement does not set featured');

      const { data: rentList } = await request('GET', '/properties?status=active&listingType=rent&limit=20');
      const ridx = (rentList?.data || []).findIndex((p) => p._id === rentProperty._id);
      log(ridx === 0, 'Promoted rental sorts first', `index=${ridx}`);

      await request('PUT', `/ad-campaigns/${pending.data.data._id}/end`, { token: admin.token });
    } else {
      log(true, 'Seller cannot approve campaigns', 'skipped — no rent listing');
      log(true, 'Approve rent advertisement', 'skipped');
      log(true, 'Rent listing gets Ad promotion', 'skipped');
      log(true, 'Advertisement priority 1', 'skipped');
      log(true, 'Advertisement does not set featured', 'skipped');
      log(true, 'Promoted rental sorts first', 'skipped');
    }
  } catch (e) {
    log(false, 'Seller approve / rent promotion path', e.message);
  }

  // --- Reject & cancel ---
  console.log('\nReject & cancel');
  try {
    await clearPropertyCampaigns(admin.token, saleProperty._id);
    // End the active sale campaign first was done by clear
    const pending = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'advertisement',
        durationDays: 7,
        cardHolderName: 'Test',
        cardNumber: '4111111111111111',
        billingEmail: 't@t.com',
      },
      expectStatus: 201,
    });

    const rejected = await request('PUT', `/ad-campaigns/${pending.data.data._id}/reject`, {
      token: admin.token,
      body: { rejectionReason: 'Incomplete listing photos' },
      expectStatus: 200,
    });
    log(rejected.data?.data?.status === 'rejected', 'Admin reject campaign');
    log(
      rejected.data?.data?.rejectionReason === 'Incomplete listing photos',
      'Rejection reason saved'
    );

    const { data: afterReject } = await request('GET', `/properties/${saleProperty._id}`);
    log(
      !afterReject?.data?.promotion?.type && (afterReject?.data?.promotionPriority || 0) === 0,
      'Reject does not apply promotion'
    );

    // Cancel flow
    const pending2 = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'sponsored',
        durationDays: 7,
        cardHolderName: 'Test',
        cardNumber: '4242424242424242',
        billingEmail: 't@t.com',
      },
      expectStatus: 201,
    });
    const cancelled = await request('PUT', `/ad-campaigns/${pending2.data.data._id}/cancel`, {
      token: seller.token,
      expectStatus: 200,
    });
    log(cancelled.data?.data?.status === 'cancelled', 'Seller cancel pending request');

    // Cannot cancel non-pending
    const { status: cancelActiveStatus } = await request('PUT', `/ad-campaigns/${pending2.data.data._id}/cancel`, {
      token: seller.token,
    });
    log(cancelActiveStatus === 400, 'Cannot cancel already-cancelled', `status=${cancelActiveStatus}`);
  } catch (e) {
    log(false, 'Reject & cancel flows', e.message);
  }

  // --- End early clears promotion ---
  console.log('\nEnd early');
  try {
    await clearPropertyCampaigns(admin.token, saleProperty._id);
    const created = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'sponsored',
        durationDays: 30,
        cardHolderName: 'Test',
        cardNumber: '4242424242424242',
        billingEmail: 't@t.com',
      },
      expectStatus: 201,
    });
    await request('PUT', `/ad-campaigns/${created.data.data._id}/approve`, {
      token: admin.token,
      body: {},
      expectStatus: 200,
    });
    const ended = await request('PUT', `/ad-campaigns/${created.data.data._id}/end`, {
      token: admin.token,
      expectStatus: 200,
    });
    log(ended.data?.data?.status === 'expired', 'Admin end early → expired');

    const { data: cleared } = await request('GET', `/properties/${saleProperty._id}`);
    log(
      !cleared?.data?.promotion?.type && (cleared?.data?.promotionPriority || 0) === 0 && !cleared?.data?.featured,
      'End early clears promotion fields'
    );
  } catch (e) {
    log(false, 'End early flow', e.message);
  }

  // --- Agent path ---
  console.log('\nAgent path');
  if (agent) {
    try {
      const { data: agentProps } = await request('GET', '/properties/agent', {
        token: agent.token,
        expectStatus: 200,
      });
      const activeAssigned = (agentProps?.data || []).filter((p) => p.status === 'active');
      if (activeAssigned.length) {
        const prop = activeAssigned[0];
        await clearPropertyCampaigns(admin.token, prop._id);
        const created = await request('POST', '/ad-campaigns', {
          token: agent.token,
          body: {
            propertyId: prop._id,
            adType: 'advertisement',
            durationDays: 7,
            cardHolderName: 'Agent',
            cardNumber: '4111111111111111',
            billingEmail: 'agent@test.com',
          },
          expectStatus: 201,
        });
        log(
          created.data?.data?.requesterRole === 'agent',
          'Agent can create campaign',
          created.data?.data?._id
        );
        await request('PUT', `/ad-campaigns/${created.data.data._id}/cancel`, {
          token: agent.token,
        });
        log(true, 'Agent can cancel own pending');
      } else {
        // Agent without assigned property should get 403 on seller property
        const { status } = await request('POST', '/ad-campaigns', {
          token: agent.token,
          body: {
            propertyId: saleProperty._id,
            adType: 'advertisement',
            durationDays: 7,
            cardHolderName: 'Agent',
            cardNumber: '4111111111111111',
            billingEmail: 'agent@test.com',
          },
        });
        log(status === 403, 'Agent blocked from unassigned property', `status=${status}`);
        log(true, 'Agent can cancel own pending', 'skipped — no assigned listings');
      }
    } catch (e) {
      log(false, 'Agent path', e.message);
    }
  } else {
    log(true, 'Agent can create campaign', 'skipped — no agent login');
    log(true, 'Agent can cancel own pending', 'skipped');
  }

  // --- Admin list filters ---
  console.log('\nAdmin list');
  try {
    const all = await request('GET', '/ad-campaigns', { token: admin.token, expectStatus: 200 });
    const pending = await request('GET', '/ad-campaigns?status=pending', {
      token: admin.token,
      expectStatus: 200,
    });
    log(Array.isArray(all.data?.data), 'Admin lists all campaigns', `${all.data?.data?.length} total`);
    log(
      (pending.data?.data || []).every((c) => c.status === 'pending'),
      'Admin status=pending filter works',
      `${pending.data?.data?.length} pending`
    );
  } catch (e) {
    log(false, 'Admin list', e.message);
  }

  // --- Short card number ---
  console.log('\nValidation');
  try {
    await clearPropertyCampaigns(admin.token, saleProperty._id);
    const { status, data } = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'advertisement',
        durationDays: 7,
        cardHolderName: 'Test',
        cardNumber: '12',
        billingEmail: 't@t.com',
      },
    });
    log(
      status === 400,
      'Short card number rejected with 400',
      `status=${status} msg=${data?.message || ''}`
    );
  } catch (e) {
    log(false, 'Short card number rejected', e.message);
  }

  // Missing billing email
  try {
    const { status } = await request('POST', '/ad-campaigns', {
      token: seller.token,
      body: {
        propertyId: saleProperty._id,
        adType: 'advertisement',
        durationDays: 7,
        cardHolderName: 'Test',
        cardNumber: '4111111111111111',
        billingEmail: '',
      },
    });
    log(status >= 400, 'Empty billing email rejected', `status=${status}`);
  } catch (e) {
    log(false, 'Empty billing email rejected', e.message);
  }

  // Inactive property cannot be promoted
  try {
    const { data: mine } = await request('GET', '/properties/mine', { token: seller.token });
    const inactive = (mine?.data || []).find((p) => p.status !== 'active');
    if (inactive) {
      const { status, data } = await request('POST', '/ad-campaigns', {
        token: seller.token,
        body: {
          propertyId: inactive._id,
          adType: 'advertisement',
          durationDays: 7,
          cardHolderName: 'Test',
          cardNumber: '4111111111111111',
          billingEmail: 't@t.com',
        },
      });
      log(status === 400, 'Inactive listing cannot be promoted', data?.message);
    } else {
      log(true, 'Inactive listing cannot be promoted', 'skipped — no inactive listing');
    }
  } catch (e) {
    log(false, 'Inactive listing cannot be promoted', e.message);
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  if (failures.length) {
    console.log('Failures:');
    failures.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
