import { HELP_MANUALS, ROLE_HELP_ORDER } from "@/features/help/content/manuals";
import type { HelpManual } from "@/features/help/types/help.types";

type RouteRule = {
  test: (pathname: string) => boolean;
  manualId: string;
};

const ROUTE_RULES: RouteRule[] = [
  { test: (p) => p === "/", manualId: "home" },
  { test: (p) => p === "/properties", manualId: "properties-browse" },
  { test: (p) => /^\/properties\/[^/]+$/.test(p), manualId: "property-detail" },
  { test: (p) => p === "/rentals", manualId: "rentals-browse" },
  { test: (p) => /^\/rentals\/[^/]+$/.test(p), manualId: "rental-detail" },
  { test: (p) => p === "/agents", manualId: "agents" },
  { test: (p) => p === "/contact", manualId: "contact" },
  { test: (p) => p === "/contact-agent", manualId: "contact-agent" },
  { test: (p) => p === "/news", manualId: "news" },
  { test: (p) => p === "/login", manualId: "login" },
  { test: (p) => p === "/forgot-password", manualId: "forgot-password" },

  { test: (p) => p === "/admin/help", manualId: "dashboard-help" },
  { test: (p) => p === "/admin", manualId: "admin-dashboard" },
  { test: (p) => p === "/admin/users", manualId: "admin-users" },
  { test: (p) => /^\/admin\/users\/[^/]+$/.test(p), manualId: "admin-user-review" },
  { test: (p) => p === "/admin/partners", manualId: "admin-partners" },
  { test: (p) => p === "/admin/properties", manualId: "admin-properties" },
  { test: (p) => /^\/admin\/properties\/[^/]+$/.test(p), manualId: "admin-property-review" },
  { test: (p) => p === "/admin/ad-campaigns", manualId: "admin-ad-campaigns" },
  { test: (p) => p === "/admin/tours", manualId: "admin-tours" },
  { test: (p) => p === "/admin/reviews", manualId: "admin-reviews" },
  { test: (p) => p === "/admin/analytics", manualId: "admin-analytics" },
  { test: (p) => p === "/admin/moderation", manualId: "admin-moderation" },
  { test: (p) => p === "/admin/password-resets", manualId: "admin-password-resets" },
  { test: (p) => p === "/admin/messages", manualId: "admin-messages" },
  { test: (p) => p === "/admin/settings", manualId: "admin-settings" },

  { test: (p) => p === "/buyer/help", manualId: "dashboard-help" },
  { test: (p) => p === "/buyer", manualId: "buyer-dashboard" },
  { test: (p) => p === "/buyer/favorites", manualId: "buyer-favorites" },
  { test: (p) => p === "/buyer/saved-rentals", manualId: "buyer-saved-rentals" },
  { test: (p) => p === "/buyer/applications", manualId: "buyer-applications" },
  { test: (p) => p === "/buyer/tours", manualId: "buyer-tours" },
  { test: (p) => p === "/buyer/messages", manualId: "buyer-messages" },
  { test: (p) => p === "/buyer/alerts", manualId: "buyer-alerts" },
  { test: (p) => p === "/buyer/settings", manualId: "buyer-settings" },

  { test: (p) => p === "/seller/help", manualId: "dashboard-help" },
  { test: (p) => p === "/seller", manualId: "seller-dashboard" },
  { test: (p) => p === "/seller/listings", manualId: "seller-listings" },
  { test: (p) => p === "/seller/listings/new", manualId: "seller-add-listing" },
  { test: (p) => /^\/seller\/listings\/[^/]+\/edit$/.test(p), manualId: "seller-add-listing" },
  { test: (p) => p === "/seller/promotions", manualId: "seller-promotions" },
  { test: (p) => p === "/seller/buyers", manualId: "seller-buyers" },
  { test: (p) => p === "/seller/applications", manualId: "seller-applications" },
  { test: (p) => p === "/seller/tours", manualId: "seller-tours" },
  { test: (p) => p === "/seller/reviews", manualId: "seller-reviews" },
  { test: (p) => p === "/seller/analytics", manualId: "seller-analytics" },
  { test: (p) => p === "/seller/messages", manualId: "seller-messages" },
  { test: (p) => p === "/seller/settings", manualId: "seller-settings" },

  { test: (p) => p === "/agent/help", manualId: "dashboard-help" },
  { test: (p) => p === "/agent", manualId: "agent-dashboard" },
  { test: (p) => p === "/agent/clients", manualId: "agent-clients" },
  { test: (p) => p === "/agent/properties", manualId: "agent-properties" },
  { test: (p) => p === "/agent/promotions", manualId: "agent-promotions" },
  { test: (p) => p === "/agent/applications", manualId: "agent-applications" },
  { test: (p) => p === "/agent/calendar", manualId: "agent-calendar" },
  { test: (p) => p === "/agent/tours", manualId: "agent-tours" },
  { test: (p) => p === "/agent/reviews", manualId: "agent-reviews" },
  { test: (p) => p === "/agent/performance", manualId: "agent-performance" },
  { test: (p) => p === "/agent/messages", manualId: "agent-messages" },
  { test: (p) => p === "/agent/settings", manualId: "agent-settings" },

  { test: (p) => /\/tours\/[^/]+$/.test(p), manualId: "tour-detail" },
];

export const getHelpForRoute = (pathname: string): HelpManual => {
  const rule = ROUTE_RULES.find((r) => r.test(pathname));
  const manualId = rule?.manualId ?? "generic-page";
  return HELP_MANUALS[manualId] ?? HELP_MANUALS["generic-page"];
};

export const getManualsForRole = (role: "admin" | "buyer" | "seller" | "agent"): HelpManual[] => {
  const ids = ROLE_HELP_ORDER[role] ?? [];
  return ids.map((id) => HELP_MANUALS[id]).filter(Boolean);
};
