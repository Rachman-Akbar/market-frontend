export const CATALOG_CACHE_TTL = {
  short: 60 * 1000,
  medium: 5 * 60 * 1000,
  long: 30 * 60 * 1000,
};

export const CATALOG_PERSIST_PREFIX = "kishamarket_catalog_cache_v2";

export function normalizeCacheTtl(value, fallback = CATALOG_CACHE_TTL.short) {
  const ttl = Number(value);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : fallback;
}
