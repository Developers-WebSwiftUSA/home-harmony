export type DistanceUnit = "miles" | "km";

export const MILES_TO_KM = 1.609344;
export const KM_TO_MILES = 1 / MILES_TO_KM;

export const MAX_RADIUS_MILES = 50;
export const MAX_RADIUS_KM = 80;

export const milesToKm = (miles: number) => miles * MILES_TO_KM;
export const kmToMiles = (km: number) => km * KM_TO_MILES;
export const milesToMeters = (miles: number) => miles * 1609.344;

export const getMaxRadiusForUnit = (unit: DistanceUnit) =>
  unit === "km" ? MAX_RADIUS_KM : MAX_RADIUS_MILES;

export const formatDistance = (miles: number, unit: DistanceUnit, decimals = 0) => {
  if (unit === "km") {
    const km = milesToKm(miles);
    const value = decimals > 0 ? km.toFixed(decimals) : String(Math.round(km));
    return `${value} km`;
  }
  const value = decimals > 0 ? miles.toFixed(decimals) : String(Math.round(miles));
  return `${value} mi`;
};

export const formatRadiusLabel = (radiusMiles: number | null | undefined, unit: DistanceUnit) => {
  if (!radiusMiles || radiusMiles <= 0) return "Any distance";
  return formatDistance(radiusMiles, unit);
};

export const toDisplayValue = (miles: number, unit: DistanceUnit) =>
  unit === "km" ? Math.round(milesToKm(miles)) : Math.round(miles);

export const fromDisplayValue = (display: number, unit: DistanceUnit) =>
  unit === "km" ? kmToMiles(display) : display;

export const isDistanceUnit = (value: unknown): value is DistanceUnit =>
  value === "miles" || value === "km";
