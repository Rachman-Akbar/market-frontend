export const PUBLIC_QUERY_REFRESH_MS = 30000;

export const publicQueryOptions = {
  staleTime: 0,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: PUBLIC_QUERY_REFRESH_MS,
  refetchIntervalInBackground: false,
};
