export type NewsStatus = "scheduled" | "active" | "archived";

export type NewsArticle = {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  image?: string;
  category?: string;
  authorName?: string;
  status: NewsStatus;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NewsPayload = {
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  category?: string;
  authorName?: string;
  publishNow?: boolean;
  scheduledAt?: string;
  status?: NewsStatus;
};
