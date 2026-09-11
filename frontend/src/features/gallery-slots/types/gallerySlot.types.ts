import { Property } from "@/types/models";

export type GalleryPurchaseStatus = "pending" | "approved" | "rejected" | "cancelled" | "refunded";

export type GalleryPaymentStatus = "pending" | "charged" | "failed" | "refunded";

export interface GalleryPaymentDetails {
  cardHolderName: string;
  cardLast4: string;
  cardBrand?: string;
  billingEmail: string;
  billingAddress?: string;
}

export interface GallerySlotPurchase {
  _id: string;
  propertyId: Property | string;
  requesterId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  requesterRole: "seller" | "admin";
  slotsRequested: number;
  slotsGranted?: number;
  pricePerSlot: number;
  totalAmount: number;
  payment: GalleryPaymentDetails;
  status: GalleryPurchaseStatus;
  paymentStatus: GalleryPaymentStatus;
  chargedAmount?: number;
  chargedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  cancelledAt?: string;
  refundedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryPricing {
  freeMainCount: number;
  freeGalleryCount: number;
  pricePerSlot: number;
  description?: string;
}

export interface GalleryUsageRow {
  _id: string;
  title: string;
  status: string;
  listingType?: string;
  sellerId?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  galleryCount: number;
  paidGallerySlots: number;
  lockedCount: number;
  publicGalleryCount: number;
}

export interface CreateGalleryPurchasePayload {
  propertyId: string;
  slotsRequested: number;
  cardHolderName: string;
  cardNumber: string;
  billingEmail: string;
  billingAddress?: string;
}
