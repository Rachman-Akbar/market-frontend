import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Fingerprint, Info, Lock, LogOut, MapPinCheck, Monitor, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/AuthContext";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { getAddressError, useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from "@/features/profile/address/addressService";
import { apiClient, getApiMessage } from "@/core/utils/apiClient";
import { reverseGeocode } from "@/features/profile/address/geocodingService";
import { cn } from "@/shared/utils/utils";

const TABS = [
  { key: "biodata", label: "Biodata" },
  { key: "alamat", label: "Alamat" },
  { key: "keamanan", label: "Keamanan" },
];

const EMPTY_ADDRESS = {
  label: "Rumah",
  recipientName: "",
  phoneNumber: "",
  country: "Indonesia",
  province: "",
  cityOrRegency: "",
  district: "",
  subdistrict: "",
  postalCode: "",
  fullAddress: "",
  notes: "",
  latitude: "",
  longitude: "",
  komerceDestinationId: "",
  isPrimary: false,
};

function Field({ label, children }) {
  return (
    <label className="block min-h-[74px] border-b border-[#e5e7eb] pb-3">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function BiodataTab({ user, refreshMe }) {
  const [form, setForm] = useState({ name: user.name || "", email: user.email || "" });
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.put(`/api/v1/identity/users/${user.id}`, form);
      return response.data;
    },
    onSuccess: async () => {
      await refreshMe?.();
      setMessage("Biodata berhasil diperbarui.");
    },
    onError: (error) => setMessage(getApiMessage(error, "Biodata gagal diperbarui.")),
  });

  return (
    <div className="max-w-[640px] space-y-6">
      <Field label="Nama Lengkap">
        <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="h-8 w-full border-0 bg-transparent p-0 text-[15px] font-medium text-slate-900 outline-none" />
      </Field>
      <Field label="Email">
        <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="h-8 w-full border-0 bg-transparent p-0 text-[15px] font-medium text-slate-900 outline-none" />
      </Field>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      <button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()} className={profileLayout.primaryButton}>
        {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  );
}

function AddressForm({ initialValue, onClose }) {
  const [form, setForm] = useState(initialValue || EMPTY_ADDRESS);
  const [message, setMessage] = useState("");
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const isEdit = Boolean(initialValue?.id);
  const pending = createMutation.isPending || updateMutation.isPending;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Browser tidak mendukung geolocation.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toFixed(8);
        const longitude = position.coords.longitude.toFixed(8);
        setForm((current) => ({ ...current, latitude, longitude }));
        try {
          const location = await reverseGeocode(latitude, longitude);
          setForm((current) => ({ ...current, latitude, longitude, ...location }));
          setMessage("Koordinat dan wilayah berhasil diperbarui.");
        } catch (error) {
          setMessage(error.message || "Koordinat berhasil diperbarui, tetapi wilayah tidak dapat dibaca.");
        }
      },
      () => setMessage("Lokasi tidak dapat diakses.")
    );
  };

  const submit = async () => {
    const requiredValues = [form.label, form.recipientName, form.phoneNumber, form.province, form.cityOrRegency, form.district, form.subdistrict, form.postalCode, form.fullAddress, form.latitude, form.longitude, form.komerceDestinationId];
    if (requiredValues.some((value) => String(value ?? "").trim() === "")) {
      setMessage("Lengkapi seluruh data alamat, koordinat, dan Komerce Destination ID.");
      return;
    }
    try {
      setMessage("");
      if (isEdit) await updateMutation.mutateAsync({ id: initialValue.id, values: form });
      else await createMutation.mutateAsync(form);
      onClose();
    } catch (error) {
      setMessage(getAddressError(error));
    }
  };

  return (
    <div className="max-w-[760px] space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {[{ key: "label", label: "Label Alamat" }, { key: "recipientName", label: "Nama Penerima" }, { key: "phoneNumber", label: "Nomor Telepon" }, { key: "country", label: "Negara" }, { key: "province", label: "Provinsi" }, { key: "cityOrRegency", label: "Kota / Kabupaten" }, { key: "district", label: "Kecamatan" }, { key: "subdistrict", label: "Kelurahan / Desa" }, { key: "postalCode", label: "Kode Pos" }, { key: "komerceDestinationId", label: "Komerce Destination ID" }].map((field) => (
          <label key={field.key} className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500">{field.label}</span>
            <input value={form[field.key]} onChange={(event) => update(field.key, event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ee4d2d]" />
          </label>
        ))}
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-500">Alamat Lengkap</span>
        <textarea value={form.fullAddress} onChange={(event) => update("fullAddress", event.target.value)} className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#ee4d2d]" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-500">Catatan / Patokan</span>
        <input value={form.notes} onChange={(event) => update("notes", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ee4d2d]" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5"><span className="text-xs font-semibold text-slate-500">Latitude</span><input type="number" step="any" value={form.latitude} onChange={(event) => update("latitude", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ee4d2d]" /></label>
        <label className="space-y-1.5"><span className="text-xs font-semibold text-slate-500">Longitude</span><input type="number" step="any" value={form.longitude} onChange={(event) => update("longitude", event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ee4d2d]" /></label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.isPrimary} onChange={(event) => update("isPrimary", event.target.checked)} />Jadikan alamat utama</label>
        <button type="button" onClick={useCurrentLocation} className="text-sm font-semibold text-[#ee4d2d] hover:underline">Gunakan lokasi saat ini</button>
      </div>
      {message ? <p className="text-sm text-red-500">{message}</p> : null}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className={profileLayout.secondaryButton}>Batal</button>
        <button type="button" disabled={pending} onClick={submit} className={profileLayout.primaryButton}>{pending ? "Menyimpan..." : "Simpan Alamat"}</button>
      </div>
    </div>
  );
}

function AlamatTab() {
  const addressesQuery = useAddresses();
  const deleteMutation = useDeleteAddress();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const addresses = addressesQuery.data || [];

  if (showForm) return <AddressForm initialValue={editing} onClose={() => { setShowForm(false); setEditing(null); }} />;

  return (
    <div className="max-w-[760px]">
      <div className="mb-4 flex h-10 justify-end">
        <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#ee4d2d] hover:underline"><Plus size={16} />Tambah Alamat</button>
      </div>
      {addressesQuery.isLoading ? <p className="py-8 text-sm text-slate-500">Memuat alamat...</p> : null}
      {!addressesQuery.isLoading && !addresses.length ? <p className="py-8 text-sm text-slate-500">Belum ada alamat tersimpan.</p> : null}
      <div>
        {addresses.map((address) => (
          <div key={address.id} className="group min-h-[152px] py-5">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-950">{address.label}</span>
                {address.isPrimary ? <span className="rounded-full border border-[#ee4d2d]/25 bg-[#fff1ec] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ee4d2d]">Utama</span> : null}
              </div>
              <div className="flex items-center gap-3 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={() => { setEditing(address); setShowForm(true); }} className="text-sm font-semibold text-slate-400 hover:text-[#ee4d2d]">Ubah</button>
                <button type="button" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(address.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <h4 className="text-[15px] font-semibold text-slate-950">{address.recipientName}</h4>
            <p className="mt-1 text-sm text-slate-500">{address.phoneNumber}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{[address.fullAddress, address.subdistrict, address.district, address.cityOrRegency, address.province, address.postalCode].filter(Boolean).join(", ")}</p>
            {address.notes ? <p className="mt-1 text-xs font-medium text-slate-400">{address.notes}</p> : null}
            {address.latitude && address.longitude ? <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#ee4d2d]"><MapPinCheck size={15} />Pinpoint akurat</p> : null}
            <hr className="mt-5 border-[#e5e7eb]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function KeamananTab({ onLogout }) {
  const currentDevice = useMemo(() => `${navigator.userAgent.includes("Windows") ? "Windows" : "Perangkat"} • ${navigator.language}`, []);
  return (
    <div className="max-w-[760px]">
      <div className="mb-8 flex min-h-[64px] gap-3 border-l-2 border-[#ee4d2d] bg-[#fff7f3] px-4 py-3 text-sm leading-6 text-slate-600"><Info className="mt-0.5 shrink-0 text-[#ee4d2d]" size={18} /><p>Bila terdapat aktivitas tidak dikenal, segera keluar dari perangkat dan perbarui kata sandi melalui pengaturan keamanan.</p></div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Perangkat Aktif</h3>
      <div className="group flex min-h-[72px] items-center gap-5 py-4"><Monitor className="text-[#ee4d2d]" size={24} /><div><b className="block text-[15px] font-medium text-slate-950">Browser saat ini</b><span className="text-xs text-slate-400">{currentDevice} • <span className="text-[#ee4d2d]">Sedang aktif</span></span></div></div>
      <hr className="border-[#e5e7eb]" />
      <button type="button" onClick={onLogout} className="mt-8 inline-flex h-10 items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600"><LogOut size={16} />Keluar dari Semua Perangkat</button>
    </div>
  );
}

export default function ProfilePage({ defaultTab = "biodata" }) {
  const { user: authUser, logout, refreshMe } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => setActiveTab(defaultTab), [defaultTab]);

  const user = {
    id: authUser?.id || "",
    name: authUser?.name || "User",
    email: authUser?.email || "",
    username: authUser?.username || String(authUser?.email || "user").split("@")[0],
  };
  const initial = user.name.slice(0, 1).toUpperCase();
  const handleLogout = async () => {
    await logout?.();
    queryClient.clear();
    navigate("/");
  };

  return (
    <section className={profileLayout.page}>
      <aside className="hidden h-full w-[360px] shrink-0 flex-col overflow-y-auto border-r border-[#e5e7eb] bg-white md:flex" aria-label="Profil pengguna">
        <div className="flex min-h-[300px] flex-col items-center border-b border-[#e5e7eb] px-8 py-8 text-center">
          <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#ee4d2d] text-5xl font-bold text-white shadow-inner">{initial}</div>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{user.name}</h2>
          <span className="mb-6 text-sm font-medium text-[#ee4d2d]">@{user.username}</span>
          <button type="button" className={profileLayout.secondaryButton}>Ubah Foto</button>
        </div>
        <div className="py-2">
          {[{ label: "Buat Kata Sandi", icon: Lock }, { label: "PIN Marketplace", icon: Lock }, { label: "Verifikasi Instan", icon: Fingerprint }].map(({ label, icon: Icon }) => (
            <div key={label}><button type="button" className="flex h-14 w-full items-center justify-between px-8 text-left text-sm font-medium text-slate-800 transition hover:bg-[#fff7f3] hover:text-[#ee4d2d]"><span className="flex items-center gap-3"><Icon size={16} className="text-slate-400" />{label}</span><ChevronRight size={16} className="text-slate-400" /></button><hr className="border-[#e5e7eb]" /></div>
          ))}
          <Link to="/profile/notifications" className="flex h-14 w-full items-center justify-between px-8 text-left text-sm font-medium text-slate-800 transition hover:bg-[#fff7f3] hover:text-[#ee4d2d]"><span className="flex items-center gap-3"><ShieldCheck size={16} className="text-slate-400" />Pusat Keamanan</span><ChevronRight size={16} className="text-slate-400" /></Link>
        </div>
      </aside>

      <div className={profileLayout.contentShell}>
        <div className={profileLayout.contentInner}>
          <div className={profileLayout.contentHeader}><div><span className={profileLayout.contentEyebrow}>Account settings</span><h1 className={profileLayout.contentTitle}>Pengaturan Akun</h1><p className={`mt-2 ${profileLayout.contentDesc}`}>Kelola profil pembeli, alamat, dan keamanan akun marketplace.</p></div></div>
          <div className="mb-8 flex h-12 gap-8 overflow-x-auto border-b border-[#e5e7eb]" role="tablist">
            {TABS.map((tab) => <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={cn("shrink-0 border-b-2 pb-3 text-sm font-semibold transition", activeTab === tab.key ? "border-[#ee4d2d] text-[#ee4d2d]" : "border-transparent text-slate-400 hover:text-slate-900")}>{tab.label}</button>)}
          </div>
          {activeTab === "biodata" ? <BiodataTab user={user} refreshMe={refreshMe} /> : null}
          {activeTab === "alamat" ? <AlamatTab /> : null}
          {activeTab === "keamanan" ? <KeamananTab onLogout={handleLogout} /> : null}
        </div>
      </div>
    </section>
  );
}
