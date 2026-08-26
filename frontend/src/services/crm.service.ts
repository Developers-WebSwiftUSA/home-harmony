import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import {
  BuyerDetail,
  BuyerSummary,
  CrmMarket,
  PartnerDetail,
  PartnerSummary,
} from "@/features/crm/types/crm.types";
import { User } from "@/types/models";

export const crmService = {
  myBuyers: (market: CrmMarket) =>
    apiRequest<ApiResponse<BuyerSummary[]>>(`/crm/my-buyers?market=${market}`, { auth: true }),

  myBuyerDetail: (buyerId: string, market: CrmMarket) =>
    apiRequest<ApiResponse<BuyerDetail>>(`/crm/my-buyers/${buyerId}?market=${market}`, {
      auth: true,
    }),

  partners: (role: "seller" | "agent") =>
    apiRequest<ApiResponse<PartnerSummary[]>>(`/crm/partners?role=${role}`, { auth: true }),

  partnerDetail: (id: string) =>
    apiRequest<ApiResponse<PartnerDetail>>(`/crm/partners/${id}`, { auth: true }),

  partnerBuyerDetail: (partnerId: string, buyerId: string, market: CrmMarket) =>
    apiRequest<ApiResponse<{ partner: User; buyer: BuyerSummary; tours: BuyerDetail["tours"]; applications: BuyerDetail["applications"]; reviews: BuyerDetail["reviews"] }>>(
      `/crm/partners/${partnerId}/buyers/${buyerId}?market=${market}`,
      { auth: true }
    ),
};
