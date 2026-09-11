import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";

export type PlatformPricing = {
  gallerySlotPrice: number;
  advertisementDailyRate: number;
  sponsoredDailyRate: number;
  freeMainCount: number;
  freeGalleryCount: number;
  adDurations: number[];
};

export type UpdatePlatformPricingPayload = {
  gallerySlotPrice?: number;
  advertisementDailyRate?: number;
  sponsoredDailyRate?: number;
};

export const platformSettingsService = {
  getPricing: () =>
    apiRequest<ApiResponse<PlatformPricing>>("/platform-settings/pricing", { auth: true }),

  updatePricing: (payload: UpdatePlatformPricingPayload) =>
    apiRequest<ApiResponse<PlatformPricing>>("/platform-settings/pricing", {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),
};
