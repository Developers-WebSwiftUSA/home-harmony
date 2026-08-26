export type RentalSortOption = "newest" | "price-asc" | "price-desc" | "relevance";

export type RentalViewMode = "map" | "list";

export type RentalPropertyType =
  | "All"
  | "Apartment"
  | "House"
  | "Condo"
  | "Townhouse"
  | "Villa";

export type RentalFilters = {
  location: string;
  city: string;
  state: string;
  zipCode: string;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: RentalPropertyType;
  minSqft: number | null;
  maxSqft: number | null;
  petsAllowed: "any" | "yes" | "no";
  furnished: boolean;
  laundry: "any" | "in_unit" | "shared" | "none";
  parking: boolean;
  moveInDate: string;
  acceptsApplications: boolean;
  amenities: string[];
  minRating: number | null;
  sort: RentalSortOption;
  searchLat: number | null;
  searchLng: number | null;
  searchRadius: number | null;
};

export const DEFAULT_RENTAL_FILTERS: RentalFilters = {
  location: "",
  city: "",
  state: "",
  zipCode: "",
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  bathrooms: null,
  propertyType: "All",
  minSqft: null,
  maxSqft: null,
  petsAllowed: "any",
  furnished: false,
  laundry: "any",
  parking: false,
  moveInDate: "",
  acceptsApplications: false,
  amenities: [],
  minRating: null,
  sort: "newest",
  searchLat: null,
  searchLng: null,
  searchRadius: null,
};

export const RENTAL_PROPERTY_TYPES: RentalPropertyType[] = [
  "All",
  "Apartment",
  "House",
  "Condo",
  "Townhouse",
  "Villa",
];

export const RENTAL_AMENITY_OPTIONS = [
  "Air Conditioning",
  "Swimming Pool",
  "Gym",
  "Parking",
  "Security",
  "Garden",
  "Laundry",
  "Elevator",
  "Balcony",
  "Pet Friendly",
];

export type LocationSuggestion = {
  label: string;
  city?: string;
  state?: string;
  zipCode?: string;
};
