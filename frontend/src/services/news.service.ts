import { apiRequest } from "@/api/client";
import { ApiResponse } from "@/types/api";
import { NewsArticle, NewsPayload } from "@/types/news";

export const newsService = {
  listPublic: (params?: { limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<NewsArticle[]>>(`/news${suffix}`);
  },

  getBySlug: (slug: string) =>
    apiRequest<ApiResponse<NewsArticle>>(`/news/${encodeURIComponent(slug)}`),

  adminList: (params?: { status?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.limit) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<ApiResponse<NewsArticle[]>>(`/news/admin${suffix}`, { auth: true });
  },

  adminGet: (id: string) =>
    apiRequest<ApiResponse<NewsArticle>>(`/news/admin/${id}`, { auth: true }),

  create: (payload: NewsPayload) =>
    apiRequest<ApiResponse<NewsArticle>>("/news/admin", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: NewsPayload) =>
    apiRequest<ApiResponse<NewsArticle>>(`/news/admin/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),

  publish: (id: string) =>
    apiRequest<ApiResponse<NewsArticle>>(`/news/admin/${id}/publish`, {
      method: "PUT",
      auth: true,
    }),

  archive: (id: string) =>
    apiRequest<ApiResponse<NewsArticle>>(`/news/admin/${id}/archive`, {
      method: "PUT",
      auth: true,
    }),

  remove: (id: string) =>
    apiRequest<ApiResponse<NewsArticle>>(`/news/admin/${id}`, {
      method: "DELETE",
      auth: true,
    }),
};
