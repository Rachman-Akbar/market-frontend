import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  getApiMessage,
  unwrapApiData,
} from "@/core/utils/apiClient";
import { useAuth } from "@/features/auth/context/AuthContext";

export const sellerOnboardingKeys = {
  store: ["seller", "stores"],
  address: ["order", "addresses", "store"],
};

function normalizeStore(row = {}) {
  return {
    id: Number(row.id || 0),
    userId: row.user_id ? String(row.user_id) : "",
    name: row.name || row.store_name || "",
    slug: row.slug || "",
    logo: row.logo || "",
    bannerUrl: row.banner_url || "",
  };
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildStoreFormData(values = {}, files = {}) {
  const formData = new FormData();
  const detailKeys = [
    "owner_name",
    "owner_phone",
    "open_days",
    "open_time",
    "close_time",
    "shipping_policy",
    "return_policy",
    "website_url",
    "instagram_url",
  ];

  const storeFields = {
    store_name: values.store_name,
    description: values.description,
    short_description: values.short_description,
    phone: values.phone,
    email: values.email,
    city: values.city_or_regency,
    province: values.province,
    address: values.full_address,
  };

  Object.entries(storeFields).forEach(([key, value]) => {
    formData.append(key, String(value || ""));
  });

  detailKeys.forEach((key) => {
    const value = values[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      formData.append(`detail[${key}]`, String(value));
    }
  });

  if (files.logo) {
    formData.append("logo", files.logo);
  }

  if (files.banner) {
    formData.append("banner", files.banner);
  }

  return formData;
}

function buildStoreAddressPayload(values = {}) {
  return {
    label: "Alamat Toko",
    recipient_name: String(values.owner_name || values.store_name || "").trim(),
    phone_number: String(values.owner_phone || values.phone || "").trim(),
    country: String(values.country || "Indonesia").trim(),
    province: String(values.province || "").trim(),
    city_or_regency: String(values.city_or_regency || "").trim(),
    district: String(values.district || "").trim(),
    subdistrict: String(values.subdistrict || "").trim(),
    postal_code: String(values.postal_code || "").trim(),
    full_address: String(values.full_address || "").trim(),
    notes: String(values.address_notes || "").trim() || null,
    latitude: toNullableNumber(values.latitude),
    longitude: toNullableNumber(values.longitude),
    is_primary: true,
  };
}

async function registerSellerStore(values, files) {
  const formData = buildStoreFormData(values, files);
  const response = await apiClient.post(
    "/api/v1/identity/auth/register-seller",
    formData,
    {
      headers: {
        "X-Device-Name": "marketplace-web-seller-onboarding",
      },
    }
  );

  return normalizeStore(unwrapApiData(response.data));
}

async function createStoreAddress(values) {
  const response = await apiClient.post(
    "/api/v1/order/addresses",
    buildStoreAddressPayload(values),
    {
      params: {
        scope: "store",
      },
    }
  );

  return unwrapApiData(response.data);
}

export function useSellerOnboarding() {
  const queryClient = useQueryClient();
  const { switchRole, refreshMe } = useAuth();

  return useMutation({
    mutationFn: async ({ values, files }) => {
      const store = await registerSellerStore(values, files);

      await switchRole("seller", {
        deviceName: "marketplace-web-seller",
        storageScope: "window",
      });

      const address = await createStoreAddress(values);
      await refreshMe();

      return {
        store,
        address,
      };
    },
    onSuccess: ({ store, address }) => {
      queryClient.setQueryData(
        ["seller", "stores", "detail", String(store.id)],
        store
      );
      queryClient.setQueryData(sellerOnboardingKeys.address, [address]);
      queryClient.invalidateQueries({ queryKey: sellerOnboardingKeys.store });
      queryClient.invalidateQueries({ queryKey: sellerOnboardingKeys.address });
    },
  });
}

export function getSellerOnboardingError(error) {
  return getApiMessage(
    error,
    "Pendaftaran toko gagal diproses. Periksa kembali data yang diisi."
  );
}
