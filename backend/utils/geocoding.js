const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'en',
  'User-Agent': 'HomeHarmonyHub/1.0 (local dev)',
};

/**
 * Geocode a free-text address via OpenStreetMap Nominatim.
 * @returns {{ latitude: number, longitude: number, label: string } | null}
 */
export const geocodeAddress = async (query) => {
  const term = String(query || '').trim();
  if (term.length < 2) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(term)}`;
  const response = await fetch(url, { headers: NOMINATIM_HEADERS });

  if (!response.ok) {
    throw new Error(`Geocoding failed (${response.status})`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) return null;

  const item = results[0];
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    latitude,
    longitude,
    label: item.display_name,
  };
};

/**
 * Reverse geocode coordinates to city/state/country labels.
 */
export const reverseGeocode = async (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`;
  const response = await fetch(url, { headers: NOMINATIM_HEADERS });

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed (${response.status})`);
  }

  const result = await response.json();
  const addr = result?.address || {};
  const city =
    addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || addr.county || '';
  const state = addr.state || addr.region || '';
  const country = addr.country || '';

  return {
    city,
    state,
    country,
    label: result?.display_name || '',
  };
};
