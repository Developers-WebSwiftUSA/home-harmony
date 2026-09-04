import { PendingActionCounts } from "@/services/pendingActions.service";

export const SIDEBAR_PENDING_COUNT_KEYS: Record<
  string,
  Partial<Record<string, keyof PendingActionCounts>>
> = {
  admin: {
    Users: "users",
    Properties: "properties",
    Moderation: "properties",
    "Ad Campaigns": "adCampaigns",
    Tours: "tours",
    "Password Resets": "passwordResets",
    Messages: "messages",
  },
  seller: {
    Applications: "applications",
    "Tour Requests": "tours",
    Messages: "messages",
  },
  agent: {
    Applications: "applications",
    Tours: "tours",
    Messages: "messages",
  },
  buyer: {
    "My Tours": "tours",
    Messages: "messages",
  },
};

export const getSidebarPendingCount = (
  role: string,
  label: string,
  counts: PendingActionCounts
) => {
  const key = SIDEBAR_PENDING_COUNT_KEYS[role]?.[label];
  if (!key) return 0;
  return counts[key] || 0;
};

export const formatPendingBadge = (count: number) => (count > 99 ? "99+" : String(count));
