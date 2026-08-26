import { useEffect, useState } from "react";
import { RentalFilters } from "@/features/rentals/types/rental.types";
import { useLocationAutocomplete } from "@/features/rentals/hooks/useLocationAutocomplete";
import { BrowseLocationSearchBar } from "@/components/PlaceSearchInput";
import { DEFAULT_MAP_SEARCH_RADIUS_MILES } from "@/lib/mapSearch";

type Props = {
  filters: RentalFilters;
  onSearch: (patch: Partial<RentalFilters>) => void;
};

export const RentalSearchBar = ({ filters, onSearch }: Props) => {
  const [value, setValue] = useState(filters.location || filters.city || "");
  const { data: suggestions = [] } = useLocationAutocomplete(value);

  useEffect(() => {
    setValue(filters.location || [filters.city, filters.state].filter(Boolean).join(", "));
  }, [filters.location, filters.city, filters.state]);

  return (
    <BrowseLocationSearchBar
      value={value}
      onValueChange={setValue}
      listingSuggestions={suggestions}
      onSearch={(result) => {
        const hasCoords =
          result.searchLat != null &&
          result.searchLng != null &&
          Number.isFinite(result.searchLat) &&
          Number.isFinite(result.searchLng);

        // Place pick → pin + default radius (same as sale browse). Avoid stacking text + geo.
        if (hasCoords) {
          onSearch({
            location: "",
            city: "",
            state: "",
            zipCode: "",
            searchLat: result.searchLat!,
            searchLng: result.searchLng!,
            searchRadius: DEFAULT_MAP_SEARCH_RADIUS_MILES,
          });
          setValue(result.term);
          return;
        }

        // Pure text / ZIP / city search — clear map pin so bounds/geo don't fight text filters.
        onSearch({
          location: result.term,
          city: result.city || "",
          state: result.state || "",
          zipCode: result.zipCode || "",
          searchLat: null,
          searchLng: null,
          searchRadius: null,
        });
      }}
    />
  );
};
