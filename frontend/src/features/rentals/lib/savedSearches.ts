import { RentalFilters } from "@/features/rentals/types/rental.types";
import { rentalFiltersToSearchParams } from "@/features/rentals/lib/rentalQueryParams";

export type SavedRentalSearch = {
  id: string;
  name: string;
  filters: RentalFilters;
  createdAt: string;
};

const STORAGE_KEY = "rental-saved-searches";
const MAX_SAVED = 10;

export const getSavedRentalSearches = (): SavedRentalSearch[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const formatSavedSearchLabel = (filters: RentalFilters) => {
  const parts: string[] = [];
  if (filters.location || filters.city) {
    parts.push(filters.location || filters.city);
  }
  if (filters.propertyType !== "All") parts.push(filters.propertyType);
  if (filters.bedrooms != null) parts.push(`${filters.bedrooms}+ beds`);
  if (filters.minPrice != null || filters.maxPrice != null) {
    parts.push(
      `$${filters.minPrice ?? 0}-$${filters.maxPrice ?? "any"}/mo`.replace("$any", "any")
    );
  }
  return parts.length ? parts.join(" · ") : "All rentals";
};

export const saveRentalSearch = (filters: RentalFilters, name?: string): SavedRentalSearch => {
  const saved = getSavedRentalSearches();
  const entry: SavedRentalSearch = {
    id: String(Date.now()),
    name: name?.trim() || formatSavedSearchLabel(filters),
    filters,
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...saved.filter((item) => item.id !== entry.id)].slice(0, MAX_SAVED);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return entry;
};

export const deleteSavedRentalSearch = (id: string) => {
  const next = getSavedRentalSearches().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const savedSearchToUrl = (filters: RentalFilters) => {
  const params = rentalFiltersToSearchParams(filters);
  const query = params.toString();
  return query ? `/rentals?${query}` : "/rentals";
};
