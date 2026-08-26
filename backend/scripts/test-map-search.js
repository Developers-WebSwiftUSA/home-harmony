/**
 * Map + rental geo search test suite
 * Run: node backend/scripts/test-map-search.js
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

async function request(path, params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const url = `${BASE}${path}${q.toString() ? `?${q}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  return { status: res.status, data };
}

async function run() {
  console.log('\n=== Map & Rental Search Test Loop ===\n');

  // Baseline inventory
  console.log('Inventory');
  const sale = await request('/properties', { status: 'active', listingType: 'sale', limit: 50 });
  const rent = await request('/properties', { status: 'active', listingType: 'rent', limit: 50 });
  log(sale.status === 200, 'List sale properties', `${sale.data?.total ?? 0} total`);
  log(rent.status === 200, 'List rent properties', `${rent.data?.total ?? 0} total`);

  const rentals = rent.data?.data || [];
  const sales = sale.data?.data || [];
  const rentalWithCoords = rentals.find(
    (p) =>
      Array.isArray(p.location?.coordinates?.coordinates) &&
      p.location.coordinates.coordinates.length === 2 &&
      !(p.location.coordinates.coordinates[0] === 0 && p.location.coordinates.coordinates[1] === 0)
  );
  const saleWithCoords = sales.find(
    (p) =>
      Array.isArray(p.location?.coordinates?.coordinates) &&
      p.location.coordinates.coordinates.length === 2 &&
      !(p.location.coordinates.coordinates[0] === 0 && p.location.coordinates.coordinates[1] === 0)
  );

  log(Boolean(rentalWithCoords), 'Rental with valid coordinates', rentalWithCoords?.title);
  log(Boolean(saleWithCoords), 'Sale with valid coordinates', saleWithCoords?.title);

  if (!rentalWithCoords) {
    console.log('\nNo geo-tagged rentals — cannot complete radius/bounds tests.\n');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }

  const [lng, lat] = rentalWithCoords.location.coordinates.coordinates;
  console.log(`\nUsing rental pin [${lng}, ${lat}] (${rentalWithCoords.title})`);

  // Radius search
  console.log('\nRadius search (rentals)');
  const near = await request('/properties', {
    status: 'active',
    listingType: 'rent',
    latitude: lat,
    longitude: lng,
    radiusMiles: 10,
    limit: 50,
  });
  const nearIds = (near.data?.data || []).map((p) => p._id);
  log(near.status === 200 && nearIds.includes(rentalWithCoords._id), 'Radius 10mi includes target rental', `count=${nearIds.length}`);

  const far = await request('/properties', {
    status: 'active',
    listingType: 'rent',
    latitude: lat + 20,
    longitude: lng + 20,
    radiusMiles: 5,
    limit: 50,
  });
  const farIds = (far.data?.data || []).map((p) => p._id);
  log(!farIds.includes(rentalWithCoords._id), 'Far radius excludes target rental', `count=${farIds.length}`);

  const tiny = await request('/properties', {
    status: 'active',
    listingType: 'rent',
    latitude: lat,
    longitude: lng,
    radiusMiles: 0.01,
    limit: 50,
  });
  log(
    (tiny.data?.data || []).some((p) => p._id === rentalWithCoords._id),
    'Very small radius still finds exact pin'
  );

  // Bounds search covering rental
  console.log('\nBounds (viewport) search');
  const pad = 0.05;
  const inBounds = await request('/properties', {
    status: 'active',
    listingType: 'rent',
    swLng: lng - pad,
    swLat: lat - pad,
    neLng: lng + pad,
    neLat: lat + pad,
    limit: 50,
  });
  log(
    (inBounds.data?.data || []).some((p) => p._id === rentalWithCoords._id),
    'Bounds covering pin include rental',
    `count=${inBounds.data?.data?.length}`
  );

  // Bounds far away (NYC-ish)
  const nycBounds = await request('/properties', {
    status: 'active',
    listingType: 'rent',
    swLng: -74.1,
    swLat: 40.6,
    neLng: -73.9,
    neLat: 40.9,
    limit: 50,
  });
  log(
    !(nycBounds.data?.data || []).some((p) => p._id === rentalWithCoords._id),
    'NYC bounds do not include Karachi rental',
    `count=${nycBounds.data?.data?.length}`
  );

  // Radius wins over bounds when both sent
  console.log('\nRadius vs bounds precedence');
  const both = await request('/properties', {
    status: 'active',
    listingType: 'rent',
    latitude: lat,
    longitude: lng,
    radiusMiles: 10,
    swLng: -74.1,
    swLat: 40.6,
    neLng: -73.9,
    neLat: 40.9,
    limit: 50,
  });
  log(
    (both.data?.data || []).some((p) => p._id === rentalWithCoords._id),
    'When radius + NYC bounds sent, radius wins (finds rental)'
  );

  // Sale radius
  console.log('\nSale map search');
  if (saleWithCoords) {
    const [sLng, sLat] = saleWithCoords.location.coordinates.coordinates;
    const saleNear = await request('/properties', {
      status: 'active',
      listingType: 'sale',
      latitude: sLat,
      longitude: sLng,
      radiusMiles: 25,
      limit: 50,
    });
    log(
      (saleNear.data?.data || []).some((p) => p._id === saleWithCoords._id),
      'Sale radius search finds listing',
      saleWithCoords.title
    );
  } else {
    log(true, 'Sale radius search finds listing', 'skipped — no coords');
  }

  // Text search still works without geo
  console.log('\nText search (no geo)');
  const city = rentalWithCoords.location?.city;
  if (city) {
    const text = await request('/properties', {
      status: 'active',
      listingType: 'rent',
      city,
      limit: 50,
    });
    log(
      (text.data?.data || []).some((p) => p._id === rentalWithCoords._id),
      `Text city search "${city}" finds rental`
    );
  } else {
    log(true, 'Text city search', 'skipped — no city');
  }

  // Conflicting text+geo: geo should still return by radius (text wiped server-side)
  const conflict = await request('/properties', {
    status: 'active',
    listingType: 'rent',
    city: 'NonexistentCityXYZ',
    latitude: lat,
    longitude: lng,
    radiusMiles: 10,
    limit: 50,
  });
  log(
    (conflict.data?.data || []).some((p) => p._id === rentalWithCoords._id),
    'Geo radius overrides conflicting city filter'
  );

  // radiusMiles=0 should NOT apply a geo filter (treated as unset)
  const zeroRadius = await request('/properties', {
    status: 'active',
    listingType: 'rent',
    latitude: lat,
    longitude: lng,
    radiusMiles: 0,
    limit: 50,
  });
  log(
    (zeroRadius.data?.data || []).some((p) => p._id === rentalWithCoords._id),
    'radiusMiles=0 skips geo filter (lists rentals normally)',
    `count=${zeroRadius.data?.data?.length}`
  );

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  if (failures.length) {
    failures.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
  }
  process.exit(failed ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
