import { AdCampaign } from "@/features/ads/types/adCampaign.types";
import { Property } from "@/types/models";
import { getUserId } from "@/lib/userDisplay";

export const getCampaignRequesterId = (campaign: AdCampaign) => {
  const requester = campaign.requesterId;
  if (!requester) return "";
  if (typeof requester === "string") return requester;
  return getUserId(requester);
};

export const getBillingCustomerKey = (campaign: AdCampaign) =>
  getCampaignRequesterId(campaign) || campaign.payment?.billingEmail?.toLowerCase() || "";

export const getCampaignProperty = (campaign: AdCampaign): Property | null => {
  if (!campaign.propertyId || typeof campaign.propertyId === "string") return null;
  return campaign.propertyId;
};

export const getCampaignPropertyTitle = (campaign: AdCampaign) =>
  getCampaignProperty(campaign)?.title || "Property listing";

export const isChargedPayment = (campaign: AdCampaign) =>
  campaign.paymentStatus === "charged" && Number(campaign.chargedAmount || campaign.totalAmount || 0) > 0;

export const invoiceNumber = (campaignId: string) =>
  `HTG-AD-${String(campaignId || "").slice(-8).toUpperCase()}`;

export const getChargedPayments = (campaigns: AdCampaign[]) =>
  campaigns
    .filter(isChargedPayment)
    .sort((a, b) => new Date(b.chargedAt || b.createdAt || 0).getTime() - new Date(a.chargedAt || a.createdAt || 0).getTime());

export const getCustomerPayments = (campaigns: AdCampaign[], customerKey: string) => {
  const key = String(customerKey || "").toLowerCase();
  if (!key) return [];
  return getChargedPayments(campaigns).filter((campaign) => getBillingCustomerKey(campaign).toLowerCase() === key);
};

export const getCustomerLifetimeTotal = (payments: AdCampaign[]) =>
  payments.reduce((sum, campaign) => sum + Number(campaign.chargedAmount || campaign.totalAmount || 0), 0);

export const getCustomerLabel = (campaign?: AdCampaign | null) => {
  if (!campaign) return "Customer";
  const requester = campaign.requesterId;
  if (requester && typeof requester === "object") {
    const full = `${requester.firstName || ""} ${requester.lastName || ""}`.trim();
    return full || requester.email || campaign.payment?.cardHolderName || "Customer";
  }
  return campaign.payment?.cardHolderName || campaign.payment?.billingEmail || "Customer";
};
