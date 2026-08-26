import { RentalFilters } from "@/features/rentals/types/rental.types";
import { hasMapRadiusFilter, hasMapSearchCenter } from "@/lib/mapSearch";

export type MapBounds = {
  swLng: number;
  swLat: number;
  neLng: number;
  neLat: number;
};

/**
 * Viewport bounds search is only used when:
 * - the toggle is on
 * - bounds have been reported after the map centered on a real origin
 * - there is no text location filter
 * - there is no map pin / radius search (pin mode wins)
 */
export const shouldUseMapBoundsSearch = (
  filters: RentalFilters,
  searchAsMapMoves: boolean,
  mapBounds: MapBounds | null,
  options?: { mapVisible?: boolean }
) => {
  if (!searchAsMapMoves || !mapBounds) return false;
  if (options?.mapVisible === false) return false;

  const hasLocationText =
    Boolean(filters.city) ||
    Boolean(filters.state) ||
    Boolean(filters.zipCode) ||
    Boolean(filters.location?.trim());

  const mapArea = {
    latitude: filters.searchLat,
    longitude: filters.searchLng,
    radiusMiles: filters.searchRadius,
  };

  if (hasLocationText) return false;
  if (hasMapRadiusFilter(mapArea)) return false;
  if (hasMapSearchCenter(mapArea)) return false;

  return true;
};

export const mapBoundsToApiParams = (bounds: MapBounds) => ({
  swLng: bounds.swLng,
  swLat: bounds.swLat,
  neLng: bounds.neLng,
  neLat: bounds.neLat,
});

/** True when bounds look like a real geographic viewport (not empty/inverted). */
export const isValidMapBounds = (bounds: MapBounds | null): bounds is MapBounds => {
  if (!bounds) return false;
  const { swLng, swLat, neLng, neLat } = bounds;
  return (
    Number.isFinite(swLng) &&
    Number.isFinite(swLat) &&
    Number.isFinite(neLng) &&
    Number.isFinite(neLat) &&
    neLat > swLat &&
    neLng !== swLng
  );
};
