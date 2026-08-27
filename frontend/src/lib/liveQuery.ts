/** Poll admin dashboards so counts stay current without a full page refresh. */
export const liveQueryOptions = {
  refetchInterval: 15_000,
  refetchOnWindowFocus: true,
  staleTime: 0,
} as const;
