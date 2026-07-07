const CATALOG_API_PREFIX = "/api/v1/catalog";

export function buildCatalogUrl(path, params = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }

    query.set(key, value);
  });

  const qs = query.toString();

  return `${CATALOG_API_PREFIX}${cleanPath}${qs ? `?${qs}` : ""}`;
}

export async function catalogRequest(path, options = {}) {
  const { params, ...fetchOptions } = options;

  let response;

  try {
    response = await fetch(buildCatalogUrl(path, params), {
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
        ...(fetchOptions.headers || {}),
      },
      ...fetchOptions,
    });
  } catch {
    throw new Error("Gagal terhubung ke server. Pastikan backend Laravel berjalan dan konfigurasi proxy/CORS sudah benar.");
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Gagal memuat data catalog (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export function unwrapData(payload) {
  if (payload?.data !== undefined) return payload.data;
  return payload;
}

export function unwrapCollection(payload) {
  const data = unwrapData(payload);

  if (Array.isArray(data)) {
    return {
      items: data,
      meta: payload?.meta || null,
    };
  }

  if (Array.isArray(data?.data)) {
    return {
      items: data.data,
      meta: data.meta || payload?.meta || data,
    };
  }

  if (Array.isArray(data?.items)) {
    return {
      items: data.items,
      meta: data.meta || payload?.meta || data,
    };
  }

  if (Array.isArray(payload?.items)) {
    return {
      items: payload.items,
      meta: payload.meta || payload,
    };
  }

  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: null,
    };
  }

  return {
    items: [],
    meta: data || payload || null,
  };
}

export function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}