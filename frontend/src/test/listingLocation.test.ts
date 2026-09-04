import { describe, expect, it } from "vitest";
import { buildListingLocation } from "@/lib/listingLocation";
import { parseNominatimAddress } from "@/lib/geocoding";

describe("buildListingLocation", () => {
  it("omits coordinates when lat/lng are empty so the form can submit", () => {
    const location = buildListingLocation({
      address: "12 Main St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      latitude: "",
      longitude: "",
    });
    expect(location.coordinates).toBeUndefined();
    expect(location.address).toBe("12 Main St");
  });

  it("omits invalid or zero coordinates", () => {
    expect(
      buildListingLocation({
        address: "12 Main St",
        city: "Austin",
        state: "TX",
        zipCode: "",
        latitude: "0",
        longitude: "0",
      }).coordinates
    ).toBeUndefined();
  });

  it("includes a GeoJSON point when both coordinates are valid", () => {
    const location = buildListingLocation({
      address: "12 Main St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      latitude: "30.2672",
      longitude: "-97.7431",
    });
    expect(location.coordinates).toEqual({
      type: "Point",
      coordinates: [-97.7431, 30.2672],
    });
  });
});

describe("parseNominatimAddress", () => {
  it("builds street address parts from a reverse-geocode result", () => {
    expect(
      parseNominatimAddress({
        display_name: "221B Baker Street, London, England",
        address: {
          house_number: "221B",
          road: "Baker Street",
          city: "London",
          state: "England",
          postcode: "NW1 6XE",
        },
      })
    ).toEqual({
      address: "221B Baker Street",
      city: "London",
      state: "England",
      zipCode: "NW1 6XE",
    });
  });
});
