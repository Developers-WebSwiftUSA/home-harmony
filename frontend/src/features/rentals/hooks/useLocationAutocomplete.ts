import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/property.service";
import { LocationSuggestion } from "@/features/rentals/types/rental.types";

export const useLocationAutocomplete = (query: string, listingType: "rent" | "sale" = "rent") => {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ["location-suggest", listingType, debounced],
    queryFn: () => propertyService.suggestLocations(debounced, listingType),
    enabled: debounced.trim().length >= 2,
    select: (res) => res.data as LocationSuggestion[],
  });
};
