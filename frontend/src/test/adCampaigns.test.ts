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
  it("builds invoice numbers and groups charged payments by customer", async () => {
    const { invoiceNumber, isChargedPayment, getCustomerPayments, getBillingCustomerKey } = await import(
      "@/features/ads/lib/campaignBilling"
    );
    expect(invoiceNumber("abc123xyz")).toBe("HTG-AD-BC123XYZ");
    const charged = {
      _id: "pay1",
      requesterId: { _id: "u1", firstName: "Ann", lastName: "Lee", email: "ann@test.com" },
      payment: { billingEmail: "ann@test.com", cardHolderName: "Ann Lee", cardLast4: "4242" },
      paymentStatus: "charged",
      chargedAmount: 50,
      chargedAt: "2026-01-02T00:00:00.000Z",
    } as never;
    const pending = { ...charged, _id: "pay2", paymentStatus: "pending", chargedAmount: 0 } as never;
    expect(isChargedPayment(charged)).toBe(true);
    expect(isChargedPayment(pending)).toBe(false);
    expect(getBillingCustomerKey(charged)).toBe("u1");
    expect(getCustomerPayments([charged, pending], "u1")).toHaveLength(1);
  });

  it("searches charged bills by name, email, or invoice number", async () => {
    const { matchesBillSearch, searchChargedPayments, invoiceNumber } = await import(
      "@/features/ads/lib/campaignBilling"
    );
    const charged = {
      _id: "abc123xyz",
      requesterId: { _id: "u1", firstName: "Ann", lastName: "Lee", email: "ann@test.com" },
      payment: { billingEmail: "ann@test.com", cardHolderName: "Ann Lee", cardLast4: "4242" },
      paymentStatus: "charged",
      chargedAmount: 50,
    } as never;
    const other = {
      ...charged,
      _id: "otherpay9",
      requesterId: { _id: "u2", firstName: "Ben", lastName: "Cole", email: "ben@test.com" },
      payment: { billingEmail: "ben@test.com", cardHolderName: "Ben Cole", cardLast4: "1111" },
    } as never;

    expect(matchesBillSearch(charged, "ann lee")).toBe(true);
    expect(matchesBillSearch(charged, "ann@test.com")).toBe(true);
    expect(matchesBillSearch(charged, invoiceNumber("abc123xyz"))).toBe(true);
    expect(matchesBillSearch(charged, "htg-ad-bc123xyz")).toBe(true);
    expect(matchesBillSearch(charged, "BC123XYZ")).toBe(true);
    expect(matchesBillSearch(charged, "ben")).toBe(false);
    expect(searchChargedPayments([charged, other], "ann")).toHaveLength(1);
    expect(searchChargedPayments([charged, other], "ben@test.com")).toHaveLength(1);
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
