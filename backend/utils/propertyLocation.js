import { geocodeAddress, reverseGeocode } from './geocoding.js';

export const isValidPropertyCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return false;
  const [longitude, latitude] = coordinates;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return false;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;
  if (latitude === 0 && longitude === 0) return false;
  return true;
};

export const buildPropertyGeocodeQuery = (location = {}) => {
  const cityStateCountry = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(', ')
    .trim();
  if (cityStateCountry.length >= 3) return cityStateCountry;

  return [location.address, location.city, location.state, location.zipCode, location.country]
    .filter(Boolean)
    .join(', ')
    .trim();
};

/**
 * Ensures location has usable GeoJSON coordinates, geocoding from text when needed.
 */
export const ensurePropertyCoordinates = async (location) => {
  if (!location || typeof location !== 'object') return location;

  const existing = location.coordinates?.coordinates;
  if (isValidPropertyCoordinates(existing)) return location;

  const query = buildPropertyGeocodeQuery(location);
  if (!query) return location;

  const result = await geocodeAddress(query);
  if (!result) return location;

  return {
    ...location,
    coordinates: {
      type: 'Point',
      coordinates: [result.longitude, result.latitude],
    },
  };
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const invalidCoordinatesFilter = {
  $or: [
    { 'location.coordinates.coordinates': { $exists: false } },
    { 'location.coordinates.coordinates': null },
    { 'location.coordinates.coordinates': { $size: 0 } },
    { 'location.coordinates.coordinates': [0, 0] },
  ],
};

export const buildAreaTextFilter = (area) => {
  if (!area) return null;
  const clauses = [];
  if (area.city) {
    clauses.push({ 'location.city': { $regex: escapeRegex(area.city), $options: 'i' } });
  }
  if (area.state) {
    clauses.push({ 'location.state': { $regex: escapeRegex(area.state), $options: 'i' } });
  }
  if (!clauses.length) return null;
  return clauses.length === 1 ? clauses[0] : { $and: clauses };
};

/**
 * Apply radius map search, including a city/state fallback for listings missing coordinates.
 */
export const applyMapRadiusSearch = async (query, { longitude, latitude, radiusMiles, buildRadiusFilter }) => {
  const geoFilter = buildRadiusFilter(longitude, latitude, radiusMiles);

  delete query.$and;
  delete query.$or;
  delete query['location.city'];
  delete query['location.state'];
  delete query['location.zipCode'];

  let areaFilter = null;
  try {
    const area = await reverseGeocode(latitude, longitude);
    areaFilter = buildAreaTextFilter(area);
  } catch {
    // Reverse geocoding unavailable — geo-only search.
  }

  if (areaFilter) {
    query.$or = [
      { 'location.coordinates': geoFilter },
      { $and: [invalidCoordinatesFilter, areaFilter] },
    ];
  } else {
    query['location.coordinates'] = geoFilter;
  }
};

/**
 * Apply viewport bounds map search, including a city/state fallback for listings missing coordinates.
 */
export const applyMapBoundsSearch = async (query, { swLng, swLat, neLng, neLat }) => {
  const west = parseFloat(String(swLng));
  const south = parseFloat(String(swLat));
  const east = parseFloat(String(neLng));
  const north = parseFloat(String(neLat));

  const boxFilter = {
    $geoWithin: {
      $box: [
        [west, south],
        [east, north],
      ],
    },
  };

  delete query.$and;
  delete query.$or;
  delete query['location.city'];
  delete query['location.state'];
  delete query['location.zipCode'];

  const centerLat = (south + north) / 2;
  const centerLng = (west + east) / 2;

  let areaFilter = null;
  try {
    const area = await reverseGeocode(centerLat, centerLng);
    areaFilter = buildAreaTextFilter(area);
  } catch {
    // Reverse geocoding unavailable — geo-only search.
  }

  if (areaFilter) {
    query.$or = [
      { 'location.coordinates': boxFilter },
      { $and: [invalidCoordinatesFilter, areaFilter] },
    ];
  } else {
    query['location.coordinates'] = boxFilter;
  }
};
