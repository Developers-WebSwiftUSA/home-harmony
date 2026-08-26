import { Property, User } from "@/types/models";

export type RatingSummary = {
  average: number;
  count: number;
};

export const getPropertyRating = (property?: Property | null): RatingSummary => ({
  average: property?.rating?.average ?? 0,
  count: property?.rating?.count ?? 0,
});

export const getAgentRating = (agent?: User | null): RatingSummary => ({
  average: agent?.agentProfile?.rating?.average ?? 0,
  count: agent?.agentProfile?.rating?.count ?? 0,
});

export const formatRating = (average: number) => average.toFixed(1);
