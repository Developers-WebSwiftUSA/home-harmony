import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { hasMapSearchCenter } from "@/lib/mapSearch";
import {
  DEFAULT_RENTAL_FILTERS,
  RentalFilters,
} from "@/features/rentals/types/rental.types";
import {
  parseRentalFiltersFromSearchParams,
  rentalFiltersToSearchParams,
} from "@/features/rentals/lib/rentalQueryParams";

export const useRentalFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseRentalFiltersFromSearchParams(searchParams),
    [searchParams]
  );

  const setFilters = useCallback(
    (next: RentalFilters | ((prev: RentalFilters) => RentalFilters)) => {
      const resolved = typeof next === "function" ? next(filters) : next;
      setSearchParams(rentalFiltersToSearchParams(resolved), { replace: true });
    },
    [filters, setSearchParams]
  );

  const updateFilters = useCallback(
    (patch: Partial<RentalFilters>) => {
      setFilters({ ...filters, ...patch });
    },
    [filters, setFilters]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location || filters.city || filters.state || filters.zipCode) count++;
    if (filters.minPrice != null || filters.maxPrice != null) count++;
    if (filters.bedrooms != null || filters.bathrooms != null) count++;
    if (filters.propertyType !== DEFAULT_RENTAL_FILTERS.propertyType) count++;
    if (filters.minSqft != null || filters.maxSqft != null) count++;
    if (filters.petsAllowed !== "any") count++;
    if (filters.furnished) count++;
    if (filters.laundry !== "any") count++;
    if (filters.parking) count++;
    if (filters.moveInDate) count++;
    if (filters.acceptsApplications) count++;
    if (filters.amenities.length) count++;
    if (filters.minRating != null) count++;
    if (hasMapSearchCenter({
      latitude: filters.searchLat,
      longitude: filters.searchLng,
      radiusMiles: filters.searchRadius,
    })) count++;
    return count;
  }, [filters]);

  return { filters, setFilters, updateFilters, resetFilters, activeFilterCount };
};
