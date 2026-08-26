import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_PROPERTY_FILTERS, PropertyFilters } from "@/features/properties/types/propertyFilters.types";
import {
  countActivePropertyFilters,
  parsePropertyFiltersFromSearchParams,
  propertyFiltersToSearchParams,
} from "@/features/properties/lib/propertyQueryParams";

export const usePropertyFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parsePropertyFiltersFromSearchParams(searchParams),
    [searchParams]
  );

  const setFilters = useCallback(
    (next: PropertyFilters | ((prev: PropertyFilters) => PropertyFilters)) => {
      const resolved = typeof next === "function" ? next(filters) : next;
      setSearchParams(propertyFiltersToSearchParams(resolved, searchParams), { replace: true });
    },
    [filters, searchParams, setSearchParams]
  );

  const updateFilters = useCallback(
    (patch: Partial<PropertyFilters>) => {
      setFilters({ ...filters, ...patch });
    },
    [filters, setFilters]
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    [
      "keyword",
      "type",
      "minPrice",
      "maxPrice",
      "bedrooms",
      "bathrooms",
      "minSqft",
      "maxSqft",
      "pets",
      "minRating",
      "parking",
      "amenities",
    ].forEach((key) => params.delete(key));
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const activeFilterCount = useMemo(() => countActivePropertyFilters(filters), [filters]);

  return { filters, setFilters, updateFilters, resetFilters, activeFilterCount, searchParams, setSearchParams };
};

export { DEFAULT_PROPERTY_FILTERS };
