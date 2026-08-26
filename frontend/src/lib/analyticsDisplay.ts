import { AnalyticsOverviewItem } from "@/services/analytics.service";

export const formatOverviewValue = (item: AnalyticsOverviewItem): string => {
  if (item.formatted) return item.formatted;
  if (item.label.toLowerCase().includes("price")) {
    return `$${Math.round(item.value / 1000).toLocaleString()}K`;
  }
  return item.value.toLocaleString();
};

export const getTrend = (change = 0) => ({
  trend: change >= 0 ? ("up" as const) : ("down" as const),
  label: `${change >= 0 ? "+" : ""}${change}%`,
});
