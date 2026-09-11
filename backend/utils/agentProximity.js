import { isValidPropertyCoordinates } from './propertyLocation.js';
import { preferredAreaCoords } from './preferredArea.js';

const US_STATE_ALIASES = {
  alabama: 'al',
  al: 'al',
  alaska: 'ak',
  ak: 'ak',
  arizona: 'az',
  az: 'az',
  arkansas: 'ar',
  ar: 'ar',
  california: 'ca',
  ca: 'ca',
  colorado: 'co',
  co: 'co',
  connecticut: 'ct',
  ct: 'ct',
  delaware: 'de',
  de: 'de',
  florida: 'fl',
  fl: 'fl',
  georgia: 'ga',
  ga: 'ga',
  hawaii: 'hi',
  hi: 'hi',
  idaho: 'id',
  id: 'id',
  illinois: 'il',
  il: 'il',
  indiana: 'in',
  in: 'in',
  iowa: 'ia',
  ia: 'ia',
  kansas: 'ks',
  ks: 'ks',
  kentucky: 'ky',
  ky: 'ky',
  louisiana: 'la',
  la: 'la',
  maine: 'me',
  me: 'me',
  maryland: 'md',
  md: 'md',
  massachusetts: 'ma',
  ma: 'ma',
  michigan: 'mi',
  mi: 'mi',
  minnesota: 'mn',
  mn: 'mn',
  mississippi: 'ms',
  ms: 'ms',
  missouri: 'mo',
  mo: 'mo',
  montana: 'mt',
  mt: 'mt',
  nebraska: 'ne',
  ne: 'ne',
  nevada: 'nv',
  nv: 'nv',
  'new hampshire': 'nh',
  nh: 'nh',
  'new jersey': 'nj',
  nj: 'nj',
  'new mexico': 'nm',
  nm: 'nm',
  'new york': 'ny',
  ny: 'ny',
  'north carolina': 'nc',
  nc: 'nc',
  'north dakota': 'nd',
  nd: 'nd',
  ohio: 'oh',
  oh: 'oh',
  oklahoma: 'ok',
  ok: 'ok',
  oregon: 'or',
  or: 'or',
  pennsylvania: 'pa',
  pa: 'pa',
  'rhode island': 'ri',
  ri: 'ri',
  'south carolina': 'sc',
  sc: 'sc',
  'south dakota': 'sd',
  sd: 'sd',
  tennessee: 'tn',
  tn: 'tn',
  texas: 'tx',
  tx: 'tx',
  utah: 'ut',
  ut: 'ut',
  vermont: 'vt',
  vt: 'vt',
  virginia: 'va',
  va: 'va',
  washington: 'wa',
  wa: 'wa',
  'west virginia': 'wv',
  wv: 'wv',
  wisconsin: 'wi',
  wi: 'wi',
  wyoming: 'wy',
  wy: 'wy',
  'district of columbia': 'dc',
  dc: 'dc',
};

export const normalizeRegion = (value) => {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '');
  if (!raw) return '';
  return US_STATE_ALIASES[raw] || raw;
};

export const haversineMiles = (fromCoords, toCoords) => {
  if (!isValidPropertyCoordinates(fromCoords) || !isValidPropertyCoordinates(toCoords)) {
    return null;
  }
  const [lng1, lat1] = fromCoords;
  const [lng2, lat2] = toCoords;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const earthMiles = 3958.7613;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthMiles * Math.asin(Math.min(1, Math.sqrt(a)));
};

const coordsFromLocation = (location) => location?.coordinates?.coordinates;

const formatLocationLabel = (city, state) =>
  [city, state].map((part) => String(part || '').trim()).filter(Boolean).join(', ');

const resolveAgentPlace = (agent, listings = [], propertyCoords) => {
  const preferred = agent.agentProfile?.preferredArea;
  const preferredCoords = preferredAreaCoords(preferred);
  if (isValidPropertyCoordinates(preferredCoords)) {
    return {
      coords: preferredCoords,
      city: preferred?.city || agent.location?.city || '',
      state: preferred?.state || agent.location?.state || '',
      radiusMiles: preferred?.radiusMiles || null,
      source: 'preferred',
    };
  }

  const profileCoords = coordsFromLocation(agent.location);
  if (isValidPropertyCoordinates(profileCoords)) {
    return {
      coords: profileCoords,
      city: agent.location?.city || '',
      state: agent.location?.state || '',
      radiusMiles: null,
      source: 'profile',
    };
  }

  let best = null;
  listings.forEach((listing) => {
    const coords = coordsFromLocation(listing.location);
    const hasCoords = isValidPropertyCoordinates(coords);
    const distance = hasCoords && propertyCoords ? haversineMiles(propertyCoords, coords) : Number.POSITIVE_INFINITY;
    const candidate = {
      coords: hasCoords ? coords : null,
      city: listing.location?.city || '',
      state: listing.location?.state || '',
      distance,
    };
    if (!best) {
      best = candidate;
      return;
    }
    const bestHasCoords = Boolean(best.coords);
    if (hasCoords && !bestHasCoords) {
      best = candidate;
      return;
    }
    if (hasCoords === bestHasCoords && candidate.distance < best.distance) {
      best = candidate;
    }
  });

  if (best) {
    return { coords: best.coords, city: best.city, state: best.state, radiusMiles: null, source: 'listing' };
  }

  return {
    coords: null,
    city: agent.location?.city || '',
    state: agent.location?.state || '',
    radiusMiles: null,
    source: 'none',
  };
};

export const rankAgentsForProperty = (agents, property, listingsByAgent = new Map()) => {
  const propertyCoords = coordsFromLocation(property?.location);
  const propertyState = normalizeRegion(property?.location?.state);
  const propertyCity = String(property?.location?.city || '')
    .trim()
    .toLowerCase();

  return agents
    .map((agent) => {
      const listings = listingsByAgent.get(String(agent._id)) || [];
      const place = resolveAgentPlace(agent, listings, isValidPropertyCoordinates(propertyCoords) ? propertyCoords : null);
      const agentState = normalizeRegion(place.state);
      const agentCity = String(place.city || '').trim().toLowerCase();
      const sameState = Boolean(propertyState && agentState && propertyState === agentState);
      const sameCity = Boolean(propertyCity && agentCity && propertyCity === agentCity);
      const distanceMiles = haversineMiles(
        isValidPropertyCoordinates(propertyCoords) ? propertyCoords : null,
        place.coords
      );
      const radiusMiles = Number(place.radiusMiles);
      const inPreferredArea = Boolean(
        place.source === 'preferred' &&
          distanceMiles != null &&
          Number.isFinite(radiusMiles) &&
          radiusMiles > 0 &&
          distanceMiles <= radiusMiles
      );

      return {
        ...agent,
        location: agent.location || undefined,
        distanceMiles: distanceMiles == null ? null : Number(distanceMiles.toFixed(1)),
        sameState,
        sameCity,
        inPreferredArea,
        locationLabel:
          formatLocationLabel(place.city, place.state) ||
          String(agent.agentProfile?.preferredArea?.label || '').trim(),
      };
    })
    .sort((a, b) => {
      if (Boolean(a.inPreferredArea) !== Boolean(b.inPreferredArea)) return a.inPreferredArea ? -1 : 1;
      if (Boolean(a.sameState) !== Boolean(b.sameState)) return a.sameState ? -1 : 1;
      if (Boolean(a.sameCity) !== Boolean(b.sameCity)) return a.sameCity ? -1 : 1;
      const aDistance = a.distanceMiles == null ? Number.POSITIVE_INFINITY : a.distanceMiles;
      const bDistance = b.distanceMiles == null ? Number.POSITIVE_INFINITY : b.distanceMiles;
      if (aDistance !== bDistance) return aDistance - bDistance;
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
};
