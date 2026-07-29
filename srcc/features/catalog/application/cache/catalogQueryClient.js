import { normalizeCacheTtl } from "@/features/catalog/domain/cache/catalogCacheConfig";
import {
  getCachedCatalogValue,
  setCachedCatalogValue,
  getCatalogInFlight,
  setCatalogInFlight,
  clearCatalogCache,
} from "@/features/catalog/infrastructure/cache/catalogCacheStore";

export function buildCatalogCacheKey(method, url) {
  return `${String(method || "GET").toUpperCase()}:${url}`;
}

export async function runCatalogQuery(key, loader, options = {}) {
  const ttl = normalizeCacheTtl(options.ttl);
  const cacheEnabled = options.cache !== false;

  if (cacheEnabled && !options.force) {
    const cached = getCachedCatalogValue(key);
    if (cached !== undefined) return cached;

    const inFlight = getCatalogInFlight(key);
    if (inFlight) return inFlight;
  }

  const promise = Promise.resolve()
    .then(loader)
    .then((value) => {
      if (cacheEnabled) {
        setCachedCatalogValue(key, value, ttl, options.persist === true);
      }
      return value;
    });

  if (!cacheEnabled) return promise;

  return setCatalogInFlight(key, promise);
}

export function invalidateCatalogQueries(match = "") {
  clearCatalogCache(match);
}
