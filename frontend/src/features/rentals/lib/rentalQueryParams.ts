import { RentalFilters, RentalSortOption } from "@/features/rentals/types/rental.types";
import { DEFAULT_MAP_SEARCH_RADIUS_MILES, hasMapRadiusFilter, hasMapSearchCenter } from "@/lib/mapSearch";

const DEFAULT_LOCATION_RADIUS_MILES = DEFAULT_MAP_SEARCH_RADIUS_MILES;

const sortToApi = (sort: RentalSortOption) => {
  switch (sort) {
    case "price-asc":
      return "price";
    case "price-desc":
      return "-price";
    case "relevance":
      return "relevance";
    default:
      return "-createdAt";
  }
};

export const rentalFiltersToApiParams = (
  filters: RentalFilters,
  extras?: Record<string, string | number | undefined>
) => {
  const params: Record<string, string | number> = {
    status: "active",
    listingType: "rent",
    limit: 200,
    sort: sortToApi(filters.sort),
    ...extras,
  };

  if (filters.city) params.city = filters.city;
  if (filters.state) params.state = filters.state;
  if (filters.zipCode) params.zipCode = filters.zipCode;
  if (filters.location?.trim()) {
    params.search = filters.location.trim();
  }
  if (filters.minPrice != null) params.minPrice = filters.minPrice;
  if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
  if (filters.bedrooms != null) params.bedrooms = filters.bedrooms;
  if (filters.bathrooms != null) params.bathrooms = filters.bathrooms;
  if (filters.propertyType !== "All") params.type = filters.propertyType;
  if (filters.minSqft != null) params.minSqft = filters.minSqft;
  if (filters.maxSqft != null) params.maxSqft = filters.maxSqft;
  if (filters.petsAllowed === "yes") params.petsAllowed = "true";
  if (filters.petsAllowed === "no") params.petsAllowed = "false";
  if (filters.furnished) params.furnished = "true";
  if (filters.laundry !== "any") params.laundry = filters.laundry;
  if (filters.parking) params.parking = "true";
  if (filters.moveInDate) params.moveInDate = filters.moveInDate;
  if (filters.acceptsApplications) params.acceptsApplications = "true";
  if (filters.amenities.length) params.amenities = filters.amenities.join(",");
  if (filters.minRating != null) params.minRating = filters.minRating;

  const usingMapBounds =
    extras?.swLng != null &&
    extras?.swLat != null &&
    extras?.neLng != null &&
    extras?.neLat != null;

  if (usingMapBounds) {
    params.swLng = extras!.swLng as number;
    params.swLat = extras!.swLat as number;
    params.neLng = extras!.neLng as number;
    params.neLat = extras!.neLat as number;
  } else if (
    hasMapRadiusFilter({
      latitude: filters.searchLat,
      longitude: filters.searchLng,
      radiusMiles: filters.searchRadius,
    })
  ) {
    params.latitude = filters.searchLat!;
    params.longitude = filters.searchLng!;
    params.radiusMiles = filters.searchRadius!;
  } else if (
    hasMapSearchCenter({
      latitude: filters.searchLat,
      longitude: filters.searchLng,
      radiusMiles: filters.searchRadius,
    })
  ) {
    params.latitude = filters.searchLat!;
    params.longitude = filters.searchLng!;
    params.radiusMiles = DEFAULT_LOCATION_RADIUS_MILES;
  }

  return params;
};

export const parseRentalFiltersFromSearchParams = (searchParams: URLSearchParams): RentalFilters => {
  const getNum = (key: string) => {
    const value = searchParams.get(key);
    return value ? Number(value) : null;
  };

  return {
    location: searchParams.get("location") || searchParams.get("search") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    zipCode: searchParams.get("zipCode") || "",
    minPrice: getNum("minPrice"),
    maxPrice: getNum("maxPrice"),
    bedrooms: getNum("bedrooms"),
    bathrooms: getNum("bathrooms"),
    propertyType: (searchParams.get("type") as RentalFilters["propertyType"]) || "All",
    minSqft: getNum("minSqft"),
    maxSqft: getNum("maxSqft"),
    petsAllowed: (searchParams.get("pets") as RentalFilters["petsAllowed"]) || "any",
    furnished: searchParams.get("furnished") === "true",
    laundry: (searchParams.get("laundry") as RentalFilters["laundry"]) || "any",
    parking: searchParams.get("parking") === "true",
    moveInDate: searchParams.get("moveInDate") || "",
    acceptsApplications: searchParams.get("acceptsApplications") === "true",
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) || [],
    minRating: getNum("minRating"),
    sort: (searchParams.get("sort") as RentalFilters["sort"]) || "newest",
    searchLat: getNum("searchLat"),
    searchLng: getNum("searchLng"),
    searchRadius: getNum("searchRadius"),
  };
};

export const rentalFiltersToSearchParams = (filters: RentalFilters) => {
  const params = new URLSearchParams();

  const set = (key: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined && value !== "") params.set(key, String(value));
  };

  set("location", filters.location);
  set("city", filters.city);
  set("state", filters.state);
  set("zipCode", filters.zipCode);
  set("minPrice", filters.minPrice);
  set("maxPrice", filters.maxPrice);
  set("bedrooms", filters.bedrooms);
  set("bathrooms", filters.bathrooms);
  if (filters.propertyType !== "All") set("type", filters.propertyType);
  set("minSqft", filters.minSqft);
  set("maxSqft", filters.maxSqft);
  if (filters.petsAllowed !== "any") set("pets", filters.petsAllowed);
  if (filters.furnished) set("furnished", "true");
  if (filters.laundry !== "any") set("laundry", filters.laundry);
  if (filters.parking) set("parking", "true");
  set("moveInDate", filters.moveInDate);
  if (filters.acceptsApplications) set("acceptsApplications", "true");
  if (filters.amenities.length) set("amenities", filters.amenities.join(","));
  set("minRating", filters.minRating);
  if (filters.sort !== "newest") set("sort", filters.sort);
  set("searchLat", filters.searchLat);
  set("searchLng", filters.searchLng);
  if (filters.searchRadius != null && filters.searchRadius > 0) {
    set("searchRadius", filters.searchRadius);
  }

  return params;
};
