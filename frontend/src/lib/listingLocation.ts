export const isValidPropertyCoordinates = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180 &&
  !(lat === 0 && lng === 0);

export type ListingLocationForm = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  country?: string;
};

export const buildListingLocation = (form: ListingLocationForm) => {
  const location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      type: "Point";
      coordinates: [number, number];
    };
  } = {
    address: form.address,
    city: form.city,
    state: form.state,
    zipCode: form.zipCode,
    country: form.country || "USA",
  };

  const lat = Number(form.latitude);
  const lng = Number(form.longitude);
  if (isValidPropertyCoordinates(lat, lng)) {
    location.coordinates = {
      type: "Point",
      coordinates: [lng, lat],
    };
  }

  return location;
};
