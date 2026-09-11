import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import {
  CreateGalleryPurchasePayload,
  GalleryPricing,
  GallerySlotPurchase,
  GalleryUsageRow,
} from "@/features/gallery-slots/types/gallerySlot.types";

export const gallerySlotService = {
  pricing: () => apiRequest<ApiResponse<GalleryPricing>>("/gallery-slots/pricing", { auth: true }),

  getSettings: () => apiRequest<ApiResponse<GalleryPricing>>("/gallery-slots/settings", { auth: true }),

  updateSettings: (pricePerSlot: number) =>
    apiRequest<ApiResponse<GalleryPricing>>("/gallery-slots/settings", {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ pricePerSlot }),
    }),

  usage: () => apiRequest<ApiResponse<GalleryUsageRow[]>>("/gallery-slots/usage", { auth: true }),

  list: (params?: { status?: string; propertyId?: string; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.propertyId) search.set("propertyId", params.propertyId);
    if (params?.limit) search.set("limit", String(params.limit));
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<ApiResponse<GallerySlotPurchase[]> & { statusCounts?: Record<string, number> }>(
      `/gallery-slots${suffix}`,
      { auth: true }
    );
  },

  create: (payload: CreateGalleryPurchasePayload) =>
    apiRequest<ApiResponse<GallerySlotPurchase>>("/gallery-slots", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  cancel: (id: string) =>
    apiRequest<ApiResponse<GallerySlotPurchase>>(`/gallery-slots/${id}/cancel`, {
      method: "PUT",
      auth: true,
    }),

  approve: (id: string, adminNotes?: string) =>
    apiRequest<ApiResponse<GallerySlotPurchase>>(`/gallery-slots/${id}/approve`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ adminNotes }),
    }),

  reject: (id: string, rejectionReason?: string, adminNotes?: string) =>
    apiRequest<ApiResponse<GallerySlotPurchase>>(`/gallery-slots/${id}/reject`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ rejectionReason, adminNotes }),
    }),

  refund: (id: string, adminNotes?: string) =>
    apiRequest<ApiResponse<GallerySlotPurchase>>(`/gallery-slots/${id}/refund`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ adminNotes }),
    }),

  grant: (propertyId: string, slots: number) =>
    apiRequest<ApiResponse<{ _id: string; title: string; paidGallerySlots: number }>>(
      `/gallery-slots/properties/${propertyId}/grant`,
      {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ slots }),
      }
    ),
};
