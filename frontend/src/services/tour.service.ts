import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { Tour } from "@/types/models";

export const tourService = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<Tour[]>>(`/tours${suffix}`, { auth: true });
  },

  getById: (id: string) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}`, { auth: true }),

  listReviews: (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<Tour[]>>(`/tours/reviews${suffix}`, { auth: true });
  },

  create: (payload: {
    propertyId: string;
    date: string;
    startTime: string;
    endTime: string;
    message?: string;
    tourType?: "in-person" | "virtual" | "open-house";
  }) =>
    apiRequest<ApiResponse<Tour>>("/tours", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: string, status: string, cancellationReason?: string) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}/status`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ status, cancellationReason }),
    }),

  approve: (id: string) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}/approve`, {
      method: "PUT",
      auth: true,
    }),

  decline: (id: string, reason?: string) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}/decline`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ reason }),
    }),

  reschedule: (id: string, payload: {
    newDate: string;
    newStartTime: string;
    newEndTime: string;
    reason?: string;
    comment?: string;
  }) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}/reschedule`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),

  approveReschedule: (id: string) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}/approve-reschedule`, {
      method: "PUT",
      auth: true,
    }),

  rejectReschedule: (id: string, reason?: string) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}/reject-reschedule`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ reason }),
    }),

  markComplete: (id: string) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}/complete`, {
      method: "PUT",
      auth: true,
    }),

  submitFeedback: (id: string, payload: {
    propertyRating: number;
    agentRating?: number;
    propertyComment?: string;
    agentComment?: string;
    overallExperience?: "excellent" | "good" | "average" | "poor";
    wouldRecommend?: boolean;
  }) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}/feedback`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),

  availability: (propertyId: string, date: string, excludeTourId?: string) => {
    const params = new URLSearchParams({ propertyId, date });
    if (excludeTourId) params.append("excludeTourId", excludeTourId);
    return apiRequest<ApiResponse<Array<{ startTime: string; endTime: string; available: boolean }>>>(
      `/tours/availability?${params.toString()}`
    );
  },

  cancel: (id: string, cancelledBy: string, cancellationReason?: string) =>
    apiRequest<ApiResponse<Tour>>(`/tours/${id}/status`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ status: "cancelled", cancellationReason, cancelledBy }),
    }),
};

