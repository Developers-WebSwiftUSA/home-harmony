import { describe, it, expect } from "vitest";
import {
  getListingPromotionBadge,
  isPromotionActive,
  formatCurrency,
  formatAdTypeLabel,
} from "@/features/ads/lib/promotionDisplay";
import { Property } from "@/types/models";

const baseProperty = {
  _id: "1",
  title: "Test",
  status: "active",
} as Property;

describe("promotionDisplay", () => {
  it("formats currency and ad type labels", () => {
    expect(formatCurrency(139.93)).toBe("$139.93");
    expect(formatAdTypeLabel("sponsored")).toBe("Sponsored");
    expect(formatAdTypeLabel("advertisement")).toBe("Advertisement");
  });

  it("detects active promotions", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(
      isPromotionActive({
        ...baseProperty,
        promotion: { type: "sponsored", expiresAt: future },
      })
    ).toBe(true);
    expect(
      isPromotionActive({
        ...baseProperty,
        promotion: { type: "sponsored", expiresAt: past },
      })
    ).toBe(false);
  });

  it("returns Sponsored badge for active sponsored listing", () => {
    const badge = getListingPromotionBadge(
      {
        ...baseProperty,
        promotion: {
          type: "sponsored",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
      },
      "For Sale"
    );
    expect(badge).toEqual({ label: "Sponsored", variant: "sponsored" });
  });

  it("returns Ad badge for active advertisement", () => {
    const badge = getListingPromotionBadge(
      {
        ...baseProperty,
        promotion: {
          type: "advertisement",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
      },
      "For Rent"
    );
    expect(badge).toEqual({ label: "Ad", variant: "advertised" });
  });

  it("falls back to featured then default", () => {
    expect(getListingPromotionBadge({ ...baseProperty, featured: true }, "For Sale")).toEqual({
      label: "Featured",
      variant: "featured",
    });
    expect(getListingPromotionBadge(baseProperty, "For Sale")).toEqual({
      label: "For Sale",
      variant: "default",
    });
  });
});
