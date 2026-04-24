import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import type { PublicAgent } from "@/types/models";

type AgentsListResponse = {
  success: boolean;
  count: number;
  data: PublicAgent[];
};

export const agentPublicService = {
  list: () => apiRequest<AgentsListResponse>("/agents"),

  getById: (id: string) =>
    apiRequest<ApiResponse<PublicAgent>>(`/agents/${encodeURIComponent(id)}`),
};
