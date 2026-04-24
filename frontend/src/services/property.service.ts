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

  create: (payload: {
    title: string;
    description: string;
    type: string;
    status?: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    location: {
      address: string;
      city: string;
      state: string;
      zipCode?: string;
      country?: string;
      coordinates: {
        type: "Point";
        coordinates: [number, number];
      };
    };
    images?: Array<{ url: string; isPrimary?: boolean }>;
    amenities?: string[];
  }) =>
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

  remove: (id: string) =>
    apiRequest<ApiResponse<{ message: string }>>(`/properties/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  nearby: (longitude: number, latitude: number, maxDistance = 10000) =>
    apiRequest<ApiResponse<Property[]>>(
      `/properties/search/nearby?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`
    ),
};

