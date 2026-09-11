const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const sanitizePreferredArea = (input) => {
  if (!input || typeof input !== 'object') return null;

  const coords = Array.isArray(input.coordinates?.coordinates)
    ? input.coordinates.coordinates
    : null;
  const longitude = toNumber(coords?.[0] ?? input.longitude);
  const latitude = toNumber(coords?.[1] ?? input.latitude);
  if (latitude == null || longitude == null) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  const radius = input.radiusMiles == null || input.radiusMiles === '' ? null : toNumber(input.radiusMiles);
  const label = String(input.label || '').trim();
  const city = String(input.city || '').trim();
  const state = String(input.state || '').trim();

  return {
    ...(label ? { label } : {}),
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(radius != null && radius > 0 ? { radiusMiles: Math.round(radius * 10) / 10 } : {}),
    coordinates: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  };
};

export const preferredAreaCoords = (area) => {
  const coords = area?.coordinates?.coordinates;
  return Array.isArray(coords) && coords.length >= 2 ? coords : null;
};

export const isUsablePreferredArea = (area) => {
  const coords = preferredAreaCoords(area);
  if (!coords) return false;
  const longitude = Number(coords[0]);
  const latitude = Number(coords[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (latitude === 0 && longitude === 0) return false;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return false;
  return true;
};

export const stripEmptyPreferredArea = (agentProfile) => {
  if (!agentProfile) return agentProfile;
  const rest = agentProfile.toObject ? agentProfile.toObject() : { ...agentProfile };
  if (isUsablePreferredArea(rest.preferredArea)) return rest;
  delete rest.preferredArea;
  return rest;
};
