import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";

export type AnalyticsOverviewItem = {
  label: string;
  value: number;
  change?: number;
  formatted?: string;
};

export type AdminAnalytics = {
  overview: AnalyticsOverviewItem[];
  totals: {
    users: number;
    properties: number;
    activeProperties: number;
    pendingProperties: number;
    tours: number;
    confirmedTours: number;
    completedTours: number;
    reviews: number;
    views: number;
    inquiries: number;
  };
  usersByRole: Record<string, number>;
  growthByMonth: Array<{ month: string; users: number; properties: number; tours: number }>;
  topProperties: Array<{
    id: string;
    name: string;
    views: number;
    inquiries: number;
    conversion: string;
    price?: number;
    status?: string;
    seller?: string;
  }>;
};

export type SellerAnalytics = {
  overview: AnalyticsOverviewItem[];
  viewsByMonth: Array<{ month: string; views: number }>;
  topProperties: Array<{
    id: string;
    name: string;
    views: number;
    inquiries: number;
    conversion: string;
  }>;
  inquiriesBySource: Array<{ source: string; count: number; percentage: number }>;
  listingBreakdown: {
    active: number;
    pending: number;
    sold: number;
    rented: number;
  };
};

export type AgentAnalytics = {
  overview: AnalyticsOverviewItem[];
  totals: {
    tours: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    reviews: number;
    averageRating: number;
  };
  toursByMonth: Array<{ month: string; tours: number }>;
};

export const analyticsService = {
  admin: () => apiRequest<ApiResponse<AdminAnalytics>>("/analytics/admin", { auth: true }),
  seller: () => apiRequest<ApiResponse<SellerAnalytics>>("/analytics/seller", { auth: true }),
  agent: () => apiRequest<ApiResponse<AgentAnalytics>>("/analytics/agent", { auth: true }),
};
