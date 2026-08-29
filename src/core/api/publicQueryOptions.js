export const PUBLIC_QUERY_REFRESH_MS = 30000;

// Shared options for public (non-authenticated) product/catalog queries.
// These are tuned for freshness without wasteful polling: data is marked
// stale immediately so it refetches on mount/focus/reconnect, but is NOT
// polled in the background. Add an explicit `refetchInterval` only to
// queries that genuinely need live updates (e.g. vouchers, PPOB balance).
export const publicQueryOptions = {
  staleTime: 0,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: false,
  refetchIntervalInBackground: false,
};
