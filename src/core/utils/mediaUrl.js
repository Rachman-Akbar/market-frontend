import { API_BASE_URL } from "@/core/utils/apiClient";

function trimTrailingSlash(value = "") {
  return String(value || "").trim().replace(/\/+$/, "");
}

function localBackendOrigin() {
  if (typeof window === "undefined") return "";

  const { protocol, hostname, port, origin } = window.location;
  const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

  if (localHosts.has(hostname) && ["3000", "3001", "4173", "5173", "5174"].includes(port)) {
    return `${protocol}//${hostname}:8000`;
  }

  return origin;
}

export function getAssetBaseUrl() {
  const configured = trimTrailingSlash(
    import.meta.env.VITE_ASSET_BASE_URL || API_BASE_URL || "",
  );

  if (/^https?:\/\//i.test(configured)) {
    try {
      return new URL(configured).origin;
    } catch {
      return configured;
    }
  }

  return trimTrailingSlash(localBackendOrigin());
}

function resolveLocalAbsoluteUrl(raw) {
  try {
    const parsed = new URL(raw);
    const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

    if (!localHosts.has(parsed.hostname)) {
      return raw;
    }

    const storageIndex = parsed.pathname.indexOf("/storage/");

    if (storageIndex >= 0) {
      return `${getAssetBaseUrl()}${parsed.pathname.slice(storageIndex)}${parsed.search}${parsed.hash}`;
    }

    return raw;
  } catch {
    const storageIndex = raw.indexOf("/storage/");

    if (storageIndex >= 0) {
      return `${getAssetBaseUrl()}${raw.slice(storageIndex)}`;
    }

    return raw;
  }
}

export function resolveMediaUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(data:|blob:)/i.test(raw)) return raw;

  if (/^https?:\/\//i.test(raw)) {
    return resolveLocalAbsoluteUrl(raw);
  }

  if (raw.startsWith("//")) {
    const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
    return `${protocol}${raw}`;
  }

  const base = getAssetBaseUrl();
  const normalized = raw.replace(/^\/+/, "");
  const storagePath = normalized.startsWith("storage/")
    ? normalized
    : `storage/${normalized}`;

  return base ? `${base}/${storagePath}` : `/${storagePath}`;
}
