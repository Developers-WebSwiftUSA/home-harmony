import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";

export type PendingActionCounts = {
  properties: number;
  users: number;
  passwordResets: number;
  adCampaigns: number;
  tours: number;
  applications: number;
  messages: number;
};

export const pendingActionsService = {
  get: () => apiRequest<ApiResponse<PendingActionCounts>>("/pending-actions", { auth: true }),
};
