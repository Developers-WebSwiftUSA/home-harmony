import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { Property } from "@/types/models";

export const propertyService = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<Property[]>>(`/properties${suffix}`);
  },

  getById: (id: string, requireAuth = false) =>
    apiRequest<ApiResponse<Property>>(`/properties/${id}`, requireAuth ? { auth: true } : {}),

  create: (payload: Record<string, unknown>) =>
    apiRequest<ApiResponse<Property>>("/properties", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  mine: () => apiRequest<ApiResponse<Property[]>>("/properties/mine", { auth: true }),
  agent: () => apiRequest<ApiResponse<Property[]>>("/properties/agent", { auth: true }),

  approve: (id: string) =>
    apiRequest<ApiResponse<Property>>(`/properties/${id}/approve`, {
      method: "PUT",
      auth: true,
    }),

  reject: (id: string) =>
    apiRequest<ApiResponse<Property>>(`/properties/${id}/reject`, {
      method: "PUT",
      auth: true,
    }),

  update: (id: string, payload: Partial<Property>) =>
    apiRequest<ApiResponse<Property>>(`/properties/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),

  assignAgent: (id: string, agentId: string | null) =>
    apiRequest<ApiResponse<Property>>(`/properties/${id}/assign-agent`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ agentId }),
    }),

  setViewership: (id: string, enabled: boolean) =>
    apiRequest<ApiResponse<Property> & { message?: string }>(`/properties/${id}/viewership`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ enabled }),
    }),

  remove: (id: string) =>
    apiRequest<ApiResponse<{ message: string }>>(`/properties/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  nearby: (longitude: number, latitude: number, maxDistance = 10000, listingType?: string) => {
    const params = new URLSearchParams({
      longitude: String(longitude),
      latitude: String(latitude),
      maxDistance: String(maxDistance),
    });
    if (listingType) params.set("listingType", listingType);
    return apiRequest<ApiResponse<Property[]>>(`/properties/search/nearby?${params.toString()}`);
  },

  suggestLocations: (q: string, listingType = "rent") =>
    apiRequest<ApiResponse<Array<{ label: string; city?: string; state?: string; zipCode?: string }>>>(
      `/properties/locations/suggest?q=${encodeURIComponent(q)}&listingType=${listingType}`
    ),
};

