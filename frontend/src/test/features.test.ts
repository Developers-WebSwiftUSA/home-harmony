import { describe, it, expect } from "vitest";
import { getHelpForRoute, getManualsForRole } from "@/features/help/lib/helpRoutes";
import { propertyFiltersToApiParams } from "@/features/properties/lib/propertyQueryParams";
import { DEFAULT_PROPERTY_FILTERS } from "@/features/properties/types/propertyFilters.types";

describe("helpRoutes", () => {
  it("resolves properties browse manual", () => {
    expect(getHelpForRoute("/properties").id).toBe("properties-browse");
  });

  it("resolves buyer dashboard manual", () => {
    expect(getHelpForRoute("/buyer").id).toBe("buyer-dashboard");
  });

  it("returns buyer help manuals", () => {
    const manuals = getManualsForRole("buyer");
    expect(manuals.length).toBeGreaterThan(5);
    expect(manuals.some((m) => m.id === "buyer-favorites")).toBe(true);
  });
});

describe("propertyFiltersToApiParams", () => {
  it("maps keyword to search param", () => {
    const params = propertyFiltersToApiParams(
      { ...DEFAULT_PROPERTY_FILTERS, keyword: "villa" },
      null
    );
    expect(params.search).toBe("villa");
  });

  it("omits price when unset", () => {
    const params = propertyFiltersToApiParams(DEFAULT_PROPERTY_FILTERS, null);
    expect(params.minPrice).toBeUndefined();
    expect(params.maxPrice).toBeUndefined();
  });

  it("includes map geo params with default radius", () => {
    const params = propertyFiltersToApiParams(DEFAULT_PROPERTY_FILTERS, {
      latitude: 24.93,
      longitude: 67.07,
      radiusMiles: 10,
    });
    expect(params.latitude).toBe(24.93);
    expect(params.longitude).toBe(67.07);
    expect(params.radiusMiles).toBe(10);
  });
});
