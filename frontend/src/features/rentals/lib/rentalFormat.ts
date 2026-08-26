import { Property } from "@/types/models";

export const formatRentPrice = (price: number) => `$${Number(price || 0).toLocaleString()}/mo`;

export const formatRentPriceShort = (price: number) => {
  const value = Number(price || 0);
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `$${value}`;
};

export const getPropertyLocationLabel = (property: Property) =>
  [property.location?.address, property.location?.city, property.location?.state]
    .filter(Boolean)
    .join(", ");

export const isRentalListing = (property: Property) =>
  property.listingType === "rent" || property.listingType === "both";

export const getMonthlyFeesTotal = (property: Property) =>
  (property.rentalDetails?.monthlyFees || []).reduce((sum, fee) => sum + (fee.amount || 0), 0);

export const estimateMonthlyCost = (property: Property, options?: { pets?: boolean }) => {
  const rent = property.price || 0;
  const fees = getMonthlyFeesTotal(property);
  const petFee = options?.pets && property.rentalDetails?.petFee ? property.rentalDetails.petFee : 0;
  return rent + fees + petFee;
};
