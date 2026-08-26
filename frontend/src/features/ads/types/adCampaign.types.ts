import { Property } from "@/types/models";

export type AdType = "advertisement" | "sponsored";

export type AdCampaignStatus = "pending" | "active" | "rejected" | "expired" | "cancelled";

export type AdPaymentStatus = "pending" | "charged" | "failed" | "refunded";

export interface AdPaymentDetails {
  cardHolderName: string;
  cardLast4: string;
  cardBrand?: string;
  billingEmail: string;
  billingAddress?: string;
}

export interface AdCampaign {
  _id: string;
  propertyId: Property | string;
  requesterId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  requesterRole: "seller" | "agent";
  adType: AdType;
  durationDays: number;
  dailyRate: number;
  totalAmount: number;
  payment: AdPaymentDetails;
  status: AdCampaignStatus;
  paymentStatus: AdPaymentStatus;
  chargedAmount?: number;
  chargedAt?: string;
  startDate?: string;
  endDate?: string;
  approvedBy?: { firstName?: string; lastName?: string; email?: string };
  approvedAt?: string;
  rejectedBy?: { firstName?: string; lastName?: string; email?: string };
  rejectedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdPricingOption {
  type: AdType;
  label: string;
  description: string;
  dailyRate: number;
}

export interface AdPricingCatalog {
  adTypes: AdPricingOption[];
  durations: Array<{ days: number; label: string }>;
}

export interface CreateAdCampaignPayload {
  propertyId: string;
  adType: AdType;
  durationDays: number;
  cardHolderName: string;
  cardNumber: string;
  billingEmail: string;
  billingAddress?: string;
}

export interface PropertyPromotion {
  type?: AdType;
  campaignId?: string;
  expiresAt?: string;
}
