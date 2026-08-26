export type PropertyPetFilter = "any" | "yes" | "no";

export type PropertyFilters = {
  keyword: string;
  type: string;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  minSqft: number | null;
  maxSqft: number | null;
  petsAllowed: PropertyPetFilter;
  minRating: number | null;
  parking: boolean;
  amenities: string[];
};

export const DEFAULT_PROPERTY_FILTERS: PropertyFilters = {
  keyword: "",
  type: "All",
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  bathrooms: null,
  minSqft: null,
  maxSqft: null,
  petsAllowed: "any",
  minRating: null,
  parking: false,
  amenities: [],
};

export const PROPERTY_TYPES = ["All", "House", "Apartment", "Villa", "Commercial", "Condo", "Townhouse"];

export const PROPERTY_AMENITY_OPTIONS = [
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
