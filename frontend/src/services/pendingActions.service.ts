import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";

export type PendingActionCounts = {
  properties: number;
  users: number;
  passwordResets: number;
  adCampaigns: number;
  galleryPurchases: number;
  agentRequests: number;
  tours: number;
  applications: number;
  messages: number;
};

export const pendingActionsService = {
  get: () => apiRequest<ApiResponse<PendingActionCounts>>("/pending-actions", { auth: true }),
};
