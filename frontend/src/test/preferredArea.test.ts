import { describe, expect, it } from "vitest";
import { draftToPreferredArea, preferredAreaToDraft } from "@/lib/preferredArea";

describe("preferredArea mapping", () => {
  it("returns null when no map center is set", () => {
    expect(
      draftToPreferredArea({
        latitude: null,
        longitude: null,
        radiusMiles: 10,
        city: "Austin",
      })
    ).toBeNull();
  });

  it("stores GeoJSON coordinates as [lng, lat]", () => {
    const payload = draftToPreferredArea({
      latitude: 30.2672,
      longitude: -97.7431,
      radiusMiles: 15,
      label: "Austin, Texas",
      city: "Austin",
      state: "Texas",
    });
    expect(payload?.coordinates?.coordinates).toEqual([-97.7431, 30.2672]);
    expect(payload?.radiusMiles).toBe(15);

    const draft = preferredAreaToDraft(payload);
    expect(draft.latitude).toBe(30.2672);
    expect(draft.longitude).toBe(-97.7431);
    expect(draft.city).toBe("Austin");
  });
});
