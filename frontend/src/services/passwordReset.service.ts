import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";

export interface PasswordResetRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  email: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  newPassword?: string;
  reason?: string;
}

export const passwordResetService = {
  list: (status?: string, userId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (userId) params.append("userId", userId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<ApiResponse<PasswordResetRequest[]>>(
      `/password-resets${query}`,
      { auth: true }
    );
  },

  approve: (id: string) =>
    apiRequest<ApiResponse<PasswordResetRequest>>(
      `/password-resets/${id}/approve`,
      {
        method: "PUT",
        auth: true,
      }
    ),

  reject: (id: string, reason?: string) =>
    apiRequest<ApiResponse<PasswordResetRequest>>(
      `/password-resets/${id}/reject`,
      {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ reason }),
      }
    ),

  requestReset: (email: string, reason?: string) =>
    apiRequest<ApiResponse<{ requestId: string }>>(
      "/auth/forgotpassword",
      {
        method: "POST",
        body: JSON.stringify({ email, reason }),
      }
    ),

  adminReset: (userId: string) =>
    apiRequest<ApiResponse<{ userId: string; email: string; newPassword: string }>>(
      `/password-resets/reset/${userId}`,
      {
        method: "PUT",
        auth: true,
      }
    ),
};
