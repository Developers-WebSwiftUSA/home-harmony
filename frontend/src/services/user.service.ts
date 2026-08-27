import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { AgentPublicProfile, User } from "@/types/models";

export const userService = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.append(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<User[]>>(`/users${suffix}`, { auth: true });
  },

  listActiveAgents: () =>
    apiRequest<ApiResponse<User[]>>("/users/agents/active", { auth: true }),

  listPublicAgents: () => apiRequest<ApiResponse<User[]>>("/users/agents/public"),

  getById: (id: string) =>
    apiRequest<ApiResponse<User>>(`/users/${id}`, { auth: true }),

  getAgentProfile: (id: string) =>
    apiRequest<ApiResponse<AgentPublicProfile>>(`/users/agents/${id}/profile`),

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

  verify: (id: string) =>
    apiRequest<ApiResponse<User>>(`/users/${id}/verify`, {
      method: "PUT",
      auth: true,
    }),
};

