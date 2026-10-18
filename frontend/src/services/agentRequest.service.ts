import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { AgentAssignmentRequest } from "@/types/models";

export const agentRequestService = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<AgentAssignmentRequest[]>>(`/agent-requests${suffix}`, {
      auth: true,
    });
  },

  getById: (id: string) =>
    apiRequest<ApiResponse<AgentAssignmentRequest>>(`/agent-requests/${id}`, { auth: true }),

  create: (payload: { propertyId: string; preferredAgentId?: string | null; message?: string }) =>
    apiRequest<ApiResponse<AgentAssignmentRequest>>("/agent-requests", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  cancel: (id: string) =>
    apiRequest<ApiResponse<AgentAssignmentRequest>>(`/agent-requests/${id}/cancel`, {
      method: "PUT",
      auth: true,
    }),

  approve: (id: string, payload?: { agentId?: string; adminNotes?: string }) =>
    apiRequest<ApiResponse<AgentAssignmentRequest>>(`/agent-requests/${id}/approve`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload || {}),
    }),

  reject: (id: string, payload?: { rejectionReason?: string; adminNotes?: string }) =>
    apiRequest<ApiResponse<AgentAssignmentRequest>>(`/agent-requests/${id}/reject`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload || {}),
    }),
};
