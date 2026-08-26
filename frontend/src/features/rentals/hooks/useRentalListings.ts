import { useQuery } from "@tanstack/react-query";

import { propertyService } from "@/services/property.service";

import { RentalFilters } from "@/features/rentals/types/rental.types";

import { rentalFiltersToApiParams } from "@/features/rentals/lib/rentalQueryParams";

import { MapBounds, mapBoundsToApiParams } from "@/features/rentals/lib/mapBoundsSearch";



export const useRentalListings = (

  filters: RentalFilters,

  mapBounds?: MapBounds | null

) => {

  const boundsExtras = mapBounds ? mapBoundsToApiParams(mapBounds) : undefined;

  const apiParams = rentalFiltersToApiParams(filters, boundsExtras);



  return useQuery({

    queryKey: ["rentals", apiParams],

    queryFn: () => propertyService.list(apiParams),

  });

};

