export type MapSearchArea = {
  latitude: number | null;
  longitude: number | null;
  /** Miles; null or 0 means no radius filter (optional) */
  radiusMiles: number | null;
};

export const EMPTY_MAP_SEARCH: MapSearchArea = {
  latitude: null,
  longitude: null,
  radiusMiles: null,
};

/** Default radius when a map pin is set without an explicit radius */
export const DEFAULT_MAP_SEARCH_RADIUS_MILES = 10;

export const hasMapSearchCenter = (area: MapSearchArea) =>
  area.latitude != null &&
  area.longitude != null &&
  Number.isFinite(area.latitude) &&
  Number.isFinite(area.longitude);

export const hasMapRadiusFilter = (area: MapSearchArea) =>
  hasMapSearchCenter(area) && area.radiusMiles != null && area.radiusMiles > 0;

export { milesToMeters } from "@/lib/distanceUnits";

export const parseMapSearchFromParams = (params: URLSearchParams): MapSearchArea => {
  const lat = params.get("searchLat");
  const lng = params.get("searchLng");
  const radius = params.get("searchRadius");
  return {
    latitude: lat ? Number(lat) : null,
    longitude: lng ? Number(lng) : null,
    radiusMiles: radius ? Number(radius) : null,
  };
};

export const mapSearchToParams = (params: URLSearchParams, area: MapSearchArea) => {
  params.delete("searchLat");
  params.delete("searchLng");
  params.delete("searchRadius");
  if (hasMapSearchCenter(area)) {
    params.set("searchLat", String(area.latitude));
    params.set("searchLng", String(area.longitude));
    if (area.radiusMiles != null && area.radiusMiles > 0) {
      params.set("searchRadius", String(area.radiusMiles));
    }
  }
};

export const mapSearchToApiParams = (area: MapSearchArea) => {
  if (!hasMapSearchCenter(area)) return {};
  const radiusMiles =
    area.radiusMiles != null && area.radiusMiles > 0
      ? area.radiusMiles
      : DEFAULT_MAP_SEARCH_RADIUS_MILES;
  return {
    latitude: area.latitude!,
    longitude: area.longitude!,
    radiusMiles,
  };
};
