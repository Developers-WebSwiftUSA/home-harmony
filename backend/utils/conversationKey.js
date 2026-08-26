export const buildDirectKey = (participantIds, propertyId = null) => {
  if (!Array.isArray(participantIds) || participantIds.length !== 2) {
    return null;
  }

  const sorted = participantIds.map((id) => id.toString()).sort();
  const base = `${sorted[0]}:${sorted[1]}`;
  return propertyId ? `${base}:${propertyId.toString()}` : `${base}:general`;
};
