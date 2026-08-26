import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { RentalApplication } from "@/types/models";

export const rentalApplicationService = {
  list: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<RentalApplication[]>>(`/rental-applications${suffix}`, {
      auth: true,
    });
  },

  getById: (id: string) =>
    apiRequest<ApiResponse<RentalApplication>>(`/rental-applications/${id}`, { auth: true }),

  create: (payload: {
    propertyId: string;
    fullName: string;
    email: string;
    phone?: string;
    moveInDate?: string;
    message?: string;
  }) =>
    apiRequest<ApiResponse<RentalApplication>>("/rental-applications", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: string, status: string, statusNote?: string) =>
    apiRequest<ApiResponse<RentalApplication>>(`/rental-applications/${id}/status`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ status, statusNote }),
    }),
};
