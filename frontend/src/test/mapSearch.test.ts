import { describe, it, expect } from "vitest";
import {
  shouldUseMapBoundsSearch,
  isValidMapBounds,
} from "@/features/rentals/lib/mapBoundsSearch";
import { DEFAULT_RENTAL_FILTERS } from "@/features/rentals/types/rental.types";
import { rentalFiltersToApiParams } from "@/features/rentals/lib/rentalQueryParams";
import { DEFAULT_MAP_SEARCH_RADIUS_MILES } from "@/lib/mapSearch";

const bounds = { swLng: 66.9, swLat: 24.8, neLng: 67.2, neLat: 25.0 };

describe("shouldUseMapBoundsSearch", () => {
  it("uses bounds when toggle on and no location/pin", () => {
    expect(shouldUseMapBoundsSearch(DEFAULT_RENTAL_FILTERS, true, bounds)).toBe(true);
  });

  it("disables bounds when map not visible", () => {
    expect(
      shouldUseMapBoundsSearch(DEFAULT_RENTAL_FILTERS, true, bounds, { mapVisible: false })
    ).toBe(false);
  });

  it("disables bounds when city text is set", () => {
    expect(
      shouldUseMapBoundsSearch({ ...DEFAULT_RENTAL_FILTERS, city: "Karachi" }, true, bounds)
    ).toBe(false);
  });

  it("disables bounds when map pin/radius is set", () => {
    expect(
      shouldUseMapBoundsSearch(
        {
          ...DEFAULT_RENTAL_FILTERS,
          searchLat: 24.93,
          searchLng: 67.07,
          searchRadius: 10,
        },
        true,
        bounds
      )
    ).toBe(false);
  });

  it("disables bounds when pin center exists without radius", () => {
    expect(
      shouldUseMapBoundsSearch(
        {
          ...DEFAULT_RENTAL_FILTERS,
          searchLat: 24.93,
          searchLng: 67.07,
          searchRadius: null,
        },
        true,
        bounds
      )
    ).toBe(false);
  });
});

describe("isValidMapBounds", () => {
  it("rejects null or inverted bounds", () => {
    expect(isValidMapBounds(null)).toBe(false);
    expect(isValidMapBounds({ swLng: 1, swLat: 2, neLng: 1, neLat: 1 })).toBe(false);
  });

  it("accepts normal viewport", () => {
    expect(isValidMapBounds(bounds)).toBe(true);
  });
});

describe("rentalFiltersToApiParams geo", () => {
  it("applies default radius for center-only pin", () => {
    const params = rentalFiltersToApiParams({
      ...DEFAULT_RENTAL_FILTERS,
      searchLat: 24.93,
      searchLng: 67.07,
      searchRadius: null,
    });
    expect(params.latitude).toBe(24.93);
    expect(params.longitude).toBe(67.07);
    expect(params.radiusMiles).toBe(DEFAULT_MAP_SEARCH_RADIUS_MILES);
  });

  it("prefers map bounds extras over pin", () => {
    const params = rentalFiltersToApiParams(DEFAULT_RENTAL_FILTERS, {
      swLng: bounds.swLng,
      swLat: bounds.swLat,
      neLng: bounds.neLng,
      neLat: bounds.neLat,
    });
    expect(params.swLng).toBe(bounds.swLng);
    expect(params.latitude).toBeUndefined();
  });

  it("uses explicit radius when set", () => {
    const params = rentalFiltersToApiParams({
      ...DEFAULT_RENTAL_FILTERS,
      searchLat: 24.93,
      searchLng: 67.07,
      searchRadius: 25,
    });
    expect(params.radiusMiles).toBe(25);
  });
});
