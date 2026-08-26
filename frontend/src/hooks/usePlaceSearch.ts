import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPlaces } from "@/lib/geocoding";

export const usePlaceSearch = (query: string, enabled = true) => {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ["place-search", debounced],
    queryFn: () => searchPlaces(debounced),
    enabled: enabled && debounced.trim().length >= 2,
    staleTime: 60_000,
  });
};
