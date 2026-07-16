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

function resolveStoreSource(payload = {}) {
  const source = unwrapApiData(payload) || {};
  return source.store || source.data?.store || source.data || source;
}

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
    komerce_destination_id:
      String(values.komerce_destination_id || "").trim() || null,
    is_primary: true,
  };
}

function isEmailVerificationError(error) {
  const status = Number(error?.response?.status || 0);
  const message = String(error?.response?.data?.message || error?.message || "")
    .toLowerCase()
    .trim();

  return status === 403 && message.includes("email verification");
}

function isSessionEmailVerified(session) {
  const user = session?.user || {};
  const explicit =
    user.email_verified ?? user.emailVerified ?? session?.email_verified;

  if (explicit === true || explicit === 1 || explicit === "1") {
    return true;
  }

  return Boolean(
    user.email_verified_at ||
    user.emailVerifiedAt ||
    session?.email_verified_at,
  );
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
    },
  );
  const store = normalizeStore(resolveStoreSource(response.data));

  if (!store.id) {
    throw new Error(
      "Backend tidak mengembalikan data toko setelah pendaftaran.",
    );
  }

  return store;
}

async function createStoreAddress(values) {
  const response = await apiClient.post(
    "/api/v1/order/addresses",
    buildStoreAddressPayload(values),
    {
      params: {
        scope: "store",
      },
    },
  );

  return unwrapApiData(response.data);
}

export function useSellerOnboarding() {
  const queryClient = useQueryClient();
  const { switchRole, refreshMe } = useAuth();

  return useMutation({
    mutationFn: async ({ values, files }) => {
      await refreshMe();
      let store;

      try {
        store = await registerSellerStore(values, files);
      } catch (error) {
        if (!isEmailVerificationError(error)) {
          throw error;
        }

        const currentSession = await refreshMe();

        if (!isSessionEmailVerified(currentSession)) {
          throw new Error(
            "Email akun belum terverifikasi di backend. Verifikasi email terlebih dahulu, lalu buka kembali pendaftaran seller.",
          );
        }

        store = await registerSellerStore(values, files);
      }

      await refreshMe();
      await switchRole("seller", {
        deviceName: "marketplace-web-seller",
        storageScope: "window",
      });

      let address = null;
      let addressError = "";

      try {
        address = await createStoreAddress(values);
      } catch (error) {
        addressError = getApiMessage(
          error,
          "Toko berhasil dibuat, tetapi alamat toko belum berhasil disimpan.",
        );
      }

      await refreshMe();

      return {
        store,
        address,
        addressError,
      };
    },
    onSuccess: ({ store, address }) => {
      queryClient.setQueryData(
        ["seller", "stores", "detail", String(store.id)],
        store,
      );

      if (address) {
        queryClient.setQueryData(sellerOnboardingKeys.address, [address]);
      }

      queryClient.invalidateQueries({ queryKey: sellerOnboardingKeys.store });
      queryClient.invalidateQueries({ queryKey: sellerOnboardingKeys.address });
    },
  });
}

export function getSellerOnboardingError(error) {
  return getApiMessage(
    error,
    "Pendaftaran toko gagal diproses. Periksa kembali data yang diisi.",
  );
}
