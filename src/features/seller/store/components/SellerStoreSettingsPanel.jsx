import { useEffect, useMemo, useState } from "react";
import {
  getSellerStoreError,
  useSaveSellerStoreAddress,
  useSellerStoreAddress,
  useUpdateSellerStore,
} from "@/features/seller/store/services/sellerStoreService";

const emptyForm = {
  store_name: "",
  description: "",
  short_description: "",
  phone: "",
  email: "",
  city: "",
  province: "",
  address: "",
  country: "Indonesia",
  district: "",
  subdistrict: "",
  postal_code: "",
  komerce_destination_id: "",
  latitude: "",
  longitude: "",
  address_notes: "",
  owner_name: "",
  owner_phone: "",
  open_days: "",
  open_time: "",
  close_time: "",
  shipping_policy: "",
  return_policy: "",
  website_url: "",
  instagram_url: "",
};

function fromStore(store, storeAddress) {
  if (!store) return { ...emptyForm };

  return {
    store_name: store.name,
    description: store.description,
    short_description: store.shortDescription,
    phone: store.phone,
    email: store.email,
    city: storeAddress?.cityOrRegency || store.city,
    province: storeAddress?.province || store.province,
    address: storeAddress?.fullAddress || store.address,
    country: storeAddress?.country || "Indonesia",
    district: storeAddress?.district || "",
    subdistrict: storeAddress?.subdistrict || "",
    postal_code: storeAddress?.postalCode || "",
    komerce_destination_id: storeAddress?.komerceDestinationId || "",
    latitude: storeAddress?.latitude ?? "",
    longitude: storeAddress?.longitude ?? "",
    address_notes: storeAddress?.notes || "",
    owner_name: store.detail.ownerName,
    owner_phone: store.detail.ownerPhone,
    open_days: store.detail.openDays,
    open_time: store.detail.openTime,
    close_time: store.detail.closeTime,
    shipping_policy: store.detail.shippingPolicy,
    return_policy: store.detail.returnPolicy,
    website_url: store.detail.websiteUrl,
    instagram_url: store.detail.instagramUrl,
  };
}

export function SellerStoreSettingsPanel({ store }) {
  const storeAddressQuery = useSellerStoreAddress();
  const storeAddress = storeAddressQuery.data || null;
  const [form, setForm] = useState(() => fromStore(store, storeAddress));
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [message, setMessage] = useState("");
  const updateMutation = useUpdateSellerStore();
  const saveAddressMutation = useSaveSellerStoreAddress();
  const pending = updateMutation.isPending || saveAddressMutation.isPending;

  useEffect(
    () => setForm(fromStore(store, storeAddress)),
    [store, storeAddress],
  );

  const detailKeys = useMemo(
    () => [
      "owner_name",
      "owner_phone",
      "open_days",
      "open_time",
      "close_time",
      "shipping_policy",
      "return_policy",
      "website_url",
      "instagram_url",
    ],
    [],
  );
  const addressOnlyKeys = useMemo(
    () => [
      "country",
      "district",
      "subdistrict",
      "postal_code",
      "komerce_destination_id",
      "latitude",
      "longitude",
      "address_notes",
    ],
    [],
  );

  const change = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const buildAddress = () => ({
    label: "Alamat Toko",
    recipientName: form.owner_name || form.store_name,
    phoneNumber: form.owner_phone || form.phone,
    country: form.country || "Indonesia",
    province: form.province,
    cityOrRegency: form.city,
    district: form.district,
    subdistrict: form.subdistrict,
    postalCode: form.postal_code,
    fullAddress: form.address,
    notes: form.address_notes,
    latitude: form.latitude,
    longitude: form.longitude,
    komerceDestinationId: form.komerce_destination_id,
    isPrimary: true,
  });

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");

    const address = buildAddress();
    const requiredAddress = [
      address.recipientName,
      address.phoneNumber,
      address.province,
      address.cityOrRegency,
      address.district,
      address.subdistrict,
      address.postalCode,
      address.fullAddress,
      address.latitude,
      address.longitude,
    ];

    if (requiredAddress.some((value) => String(value ?? "").trim() === "")) {
      setMessage("Lengkapi seluruh data alamat toko dan koordinat.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (addressOnlyKeys.includes(key)) return;
      data.append(
        detailKeys.includes(key) ? `detail[${key}]` : key,
        value || "",
      );
    });
    if (logo) data.append("logo", logo);
    if (banner) data.append("banner", banner);

    if (!store?.id) {
      setMessage(
        "Data toko tidak ditemukan. Selesaikan onboarding seller terlebih dahulu.",
      );
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: store.id, formData: data });
      await saveAddressMutation.mutateAsync(address);

      setMessage("Perubahan toko dan alamat berhasil disimpan.");
      setLogo(null);
      setBanner(null);
    } catch (error) {
      setMessage(getSellerStoreError(error));
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">
          Informasi operasional
        </h2>
        <div className="mt-4 grid gap-3">
          {[
            ["owner_name", "Nama pemilik"],
            ["owner_phone", "Telepon pemilik"],
            ["open_days", "Hari operasional"],
            ["open_time", "Jam buka", "time"],
            ["close_time", "Jam tutup", "time"],
          ].map(([key, label, type]) => (
            <label key={key} className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500">{label}</span>
              <input
                type={type || "text"}
                value={form[key]}
                onChange={change(key)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </label>
          ))}
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">
              Kebijakan pengiriman
            </span>
            <textarea
              value={form.shipping_policy}
              onChange={change("shipping_policy")}
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">
              Kebijakan retur
            </span>
            <textarea
              value={form.return_policy}
              onChange={change("return_policy")}
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">
          Pengaturan toko
        </h2>
        <div className="mt-4 grid gap-3">
          {[
            ["store_name", "Nama toko", true],
            ["short_description", "Deskripsi singkat"],
            ["phone", "Telepon", true],
            ["email", "Email", false, "email"],
            ["country", "Negara", true],
            ["province", "Provinsi", true],
            ["city", "Kota / Kabupaten", true],
            ["district", "Kecamatan", true],
            ["subdistrict", "Kelurahan / Desa", true],
            ["postal_code", "Kode Pos", true],
            ["komerce_destination_id", "Komerce Destination ID (opsional)"],
            ["latitude", "Latitude", true, "number"],
            ["longitude", "Longitude", true, "number"],
            ["address", "Alamat Lengkap", true],
            ["address_notes", "Catatan Alamat"],
          ].map(([key, label, required, type]) => (
            <label key={key} className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500">{label}</span>
              <input
                type={type || "text"}
                step={type === "number" ? "any" : undefined}
                required={Boolean(required)}
                value={form[key]}
                onChange={change(key)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </label>
          ))}
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">Deskripsi</span>
            <textarea
              value={form.description}
              onChange={change("description")}
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Logo</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setLogo(event.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Banner</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setBanner(event.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500"
              />
            </label>
          </div>
        </div>
        {message ? (
          <p className="mt-4 text-sm font-semibold text-slate-600">{message}</p>
        ) : null}
        <div className="mt-4 flex justify-end">
          <button
            disabled={pending}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </form>
  );
}
