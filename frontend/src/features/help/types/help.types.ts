import type { LucideIcon } from "lucide-react";

export type HelpVisualType =
  | "search-filters"
  | "map-search"
  | "listing-card"
  | "sidebar-nav"
  | "message-chat"
  | "tour-booking"
  | "rental-apply"
  | "promotion"
  | "dashboard-stats"
  | "listing-form"
  | "crm-board"
  | "calendar"
  | "reviews"
  | "help-fab"
  | "table-actions"
  | "auth-form"
  | "map-browse";

export type HelpStep = {
  title: string;
  description: string;
  visual?: HelpVisualType;
  tips?: string[];
};

export type HelpManual = {
  id: string;
  title: string;
  summary: string;
  role?: "public" | "admin" | "buyer" | "seller" | "agent";
  steps: HelpStep[];
  relatedLinks?: { label: string; href: string }[];
};

export type HelpNavItem = {
  manualId: string;
  label: string;
  icon?: LucideIcon;
};
