import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/models";

export const userService = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<User[]>>(`/users${suffix}`, { auth: true });
  },

  getById: (id: string) =>
    apiRequest<ApiResponse<User>>(`/users/${id}`, { auth: true }),

  update: (id: string, payload: Partial<User>) => {
    const endpoint = id === "me" ? "/users/me" : `/users/${id}`;
    return apiRequest<ApiResponse<User>>(endpoint, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    });
  },

  remove: (id: string) =>
    apiRequest<ApiResponse<{ message: string }>>(`/users/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  issueAgentLicense: (id: string) =>
    apiRequest<ApiResponse<{ approvalCode: string; issuedAt?: string }>>(`/users/${id}/issue-agent-license`, {
      method: "PUT",
      auth: true,
    }),

  redeemAgentLicense: (code: string) =>
    apiRequest<ApiResponse<User>>(`/users/me/redeem-agent-license`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ code }),
    }),
};

