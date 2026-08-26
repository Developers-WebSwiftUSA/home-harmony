import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import {
  AdCampaign,
  AdPricingCatalog,
  CreateAdCampaignPayload,
} from "@/features/ads/types/adCampaign.types";

export const adCampaignService = {
  pricing: () =>
    apiRequest<ApiResponse<AdPricingCatalog>>("/ad-campaigns/pricing", { auth: true }),

  list: (params?: Record<string, string | number>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") query.set(key, String(value));
      });
    }
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<AdCampaign[]>>(`/ad-campaigns${suffix}`, { auth: true });
  },

  getById: (id: string) =>
    apiRequest<ApiResponse<AdCampaign>>(`/ad-campaigns/${id}`, { auth: true }),

  create: (payload: CreateAdCampaignPayload) =>
    apiRequest<ApiResponse<AdCampaign>>("/ad-campaigns", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  cancel: (id: string) =>
    apiRequest<ApiResponse<AdCampaign>>(`/ad-campaigns/${id}/cancel`, {
      method: "PUT",
      auth: true,
    }),

  approve: (id: string, adminNotes?: string) =>
    apiRequest<ApiResponse<AdCampaign>>(`/ad-campaigns/${id}/approve`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ adminNotes }),
    }),

  reject: (id: string, rejectionReason?: string, adminNotes?: string) =>
    apiRequest<ApiResponse<AdCampaign>>(`/ad-campaigns/${id}/reject`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ rejectionReason, adminNotes }),
    }),

  end: (id: string) =>
    apiRequest<ApiResponse<AdCampaign>>(`/ad-campaigns/${id}/end`, {
      method: "PUT",
      auth: true,
    }),
};
