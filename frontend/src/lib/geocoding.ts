export type PlaceSuggestion = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "en",
};

export const parseNominatimAddress = (result: {
  display_name: string;
  address?: Record<string, string>;
}): Pick<PlaceSuggestion, "address" | "city" | "state" | "zipCode"> => {
  const addr = result.address || {};
  const city =
    addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || addr.county || "";
  const state = addr.state || addr.region || "";
  const zipCode = addr.postcode || "";
  const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
  const address = street || result.display_name.split(",")[0]?.trim() || "";

  return { address, city, state, zipCode };
};

export const searchPlaces = async (query: string, limit = 6): Promise<PlaceSuggestion[]> => {
  const term = query.trim();
  if (term.length < 2) return [];

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(term)}`,
    { headers: NOMINATIM_HEADERS }
  );

  if (!response.ok) {
    throw new Error("Place search failed. Try again in a moment.");
  }

  const results = await response.json();
  if (!Array.isArray(results)) return [];

  return results
    .map((item) => {
      const latitude = Number(item.lat);
      const longitude = Number(item.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

      return {
        id: String(item.place_id),
        label: item.display_name as string,
        latitude,
        longitude,
        ...parseNominatimAddress(item),
      };
    })
    .filter((item): item is PlaceSuggestion => item != null);
};

export const geocodeAddress = async (query: string): Promise<PlaceSuggestion | null> => {
  const results = await searchPlaces(query, 1);
  return results[0] || null;
};

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<PlaceSuggestion | null> => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`,
    { headers: NOMINATIM_HEADERS }
  );

  if (!response.ok) {
    throw new Error("Could not look up that map location.");
  }

  const result = await response.json();
  if (!result || result.error) return null;

  return {
    id: String(result.place_id || `${latitude},${longitude}`),
    label: result.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    latitude,
    longitude,
    ...parseNominatimAddress(result),
  };
};
