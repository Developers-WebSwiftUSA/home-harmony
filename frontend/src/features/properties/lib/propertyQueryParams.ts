import {
  DEFAULT_PROPERTY_FILTERS,
  PropertyFilters,
} from "@/features/properties/types/propertyFilters.types";
import { hasMapSearchCenter, DEFAULT_MAP_SEARCH_RADIUS_MILES } from "@/lib/mapSearch";

const getNum = (params: URLSearchParams, key: string) => {
  const value = params.get(key);
  return value ? Number(value) : null;
};

export const parsePropertyFiltersFromSearchParams = (params: URLSearchParams): PropertyFilters => ({
  keyword: params.get("keyword") || "",
  type: params.get("type") || "All",
  minPrice: getNum(params, "minPrice"),
  maxPrice: getNum(params, "maxPrice"),
  bedrooms: getNum(params, "bedrooms"),
  bathrooms: getNum(params, "bathrooms"),
  minSqft: getNum(params, "minSqft"),
  maxSqft: getNum(params, "maxSqft"),
  petsAllowed: (params.get("pets") as PropertyFilters["petsAllowed"]) || "any",
  minRating: getNum(params, "minRating"),
  parking: params.get("parking") === "true",
  amenities: params.get("amenities")?.split(",").filter(Boolean) || [],
});

export const propertyFiltersToSearchParams = (
  filters: PropertyFilters,
  existing: URLSearchParams
) => {
  const params = new URLSearchParams(existing);

  const set = (key: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined && value !== "") params.set(key, String(value));
    else params.delete(key);
  };

  set("keyword", filters.keyword);
  if (filters.type !== "All") set("type", filters.type);
  else params.delete("type");

  set("minPrice", filters.minPrice);
  set("maxPrice", filters.maxPrice);
  set("bedrooms", filters.bedrooms);
  set("bathrooms", filters.bathrooms);
  set("minSqft", filters.minSqft);
  set("maxSqft", filters.maxSqft);
  if (filters.petsAllowed !== "any") set("pets", filters.petsAllowed);
  else params.delete("pets");
  set("minRating", filters.minRating);
  if (filters.parking) params.set("parking", "true");
  else params.delete("parking");
  if (filters.amenities.length) params.set("amenities", filters.amenities.join(","));
  else params.delete("amenities");

  return params;
};

export const propertyFiltersToApiParams = (
  filters: PropertyFilters,
  mapSearch?: { latitude: number | null; longitude: number | null; radiusMiles: number | null }
) => {
  const params: Record<string, string | number> = {
    status: "active",
    listingType: "sale",
    limit: 200,
  };

  if (filters.type !== "All") params.type = filters.type;
  if (filters.keyword) params.search = filters.keyword;
  if (filters.minPrice != null) params.minPrice = filters.minPrice;
  if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
  if (filters.bedrooms != null) params.bedrooms = filters.bedrooms;
  if (filters.bathrooms != null) params.bathrooms = filters.bathrooms;
  if (filters.minSqft != null) params.minSqft = filters.minSqft;
  if (filters.maxSqft != null) params.maxSqft = filters.maxSqft;
  if (filters.petsAllowed === "yes") params.petsAllowed = "true";
  if (filters.petsAllowed === "no") params.petsAllowed = "false";
  if (filters.minRating != null) params.minRating = filters.minRating;
  if (filters.parking) params.parking = "true";
  if (filters.amenities.length) params.amenities = filters.amenities.join(",");

  if (mapSearch && hasMapSearchCenter(mapSearch)) {
    params.latitude = mapSearch.latitude!;
    params.longitude = mapSearch.longitude!;
    params.radiusMiles =
      mapSearch.radiusMiles != null && mapSearch.radiusMiles > 0
        ? mapSearch.radiusMiles
        : DEFAULT_MAP_SEARCH_RADIUS_MILES;
  }

  return params;
};

export const countActivePropertyFilters = (filters: PropertyFilters) => {
  let count = 0;
  if (filters.keyword) count++;
  if (filters.type !== DEFAULT_PROPERTY_FILTERS.type) count++;
  if (filters.minPrice != null || filters.maxPrice != null) count++;
  if (filters.bedrooms != null || filters.bathrooms != null) count++;
  if (filters.minSqft != null || filters.maxSqft != null) count++;
  if (filters.petsAllowed !== "any") count++;
  if (filters.minRating != null) count++;
  if (filters.parking) count++;
  if (filters.amenities.length) count++;
  return count;
};
