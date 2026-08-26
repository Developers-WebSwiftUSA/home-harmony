import { Property } from "@/types/models";
import { AdType } from "@/features/ads/types/adCampaign.types";

export type PromotionBadgeVariant = "default" | "featured" | "sponsored" | "advertised";

export const isPromotionActive = (property: Property) => {
  if (!property.promotion?.type || !property.promotion.expiresAt) return false;
  return new Date(property.promotion.expiresAt).getTime() > Date.now();
};

export const getListingPromotionBadge = (
  property: Property,
  defaultLabel: string
): { label: string; variant: PromotionBadgeVariant } => {
  if (property.promotion?.type === "sponsored" && isPromotionActive(property)) {
    return { label: "Sponsored", variant: "sponsored" };
  }
  if (property.promotion?.type === "advertisement" && isPromotionActive(property)) {
    return { label: "Ad", variant: "advertised" };
  }
  if (property.featured) {
    return { label: "Featured", variant: "featured" };
  }
  return { label: defaultLabel, variant: "default" };
};

export const formatAdTypeLabel = (adType: AdType) =>
  adType === "sponsored" ? "Sponsored" : "Advertisement";

export const formatCurrency = (amount: number) =>
  `$${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatCampaignPeriod = (start?: string, end?: string) => {
  if (!start || !end) return "—";
  const startDate = new Date(start).toLocaleDateString();
  const endDate = new Date(end).toLocaleDateString();
  return `${startDate} – ${endDate}`;
};
