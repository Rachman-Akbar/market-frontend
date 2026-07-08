import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Fingerprint, Info, Lock, LogOut, MapPinCheck, Monitor, Plus, ShieldCheck, Smartphone } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { profileAddresses, securityDevices } from "@/features/profile/data/profileMarketplaceData";
import { cn } from "@/shared/utils/utils";

const TABS = [
  { key: "biodata", label: "Biodata" },
  { key: "alamat", label: "Alamat" },
  { key: "keamanan", label: "Keamanan" },
];

function Field({ label, children }) {
  return (
    <label className="block min-h-[74px] border-b border-[#e5e7eb] pb-3">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function Input({ value, type = "text" }) {
  return <input type={type} defaultValue={value} className="h-8 w-full border-0 bg-transparent p-0 text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400" />;
}

function BiodataTab({ user }) {
  return (
    <div className="max-w-[640px] space-y-6">
      <Field label="Nama Lengkap">
        <Input value={user.name} />
      </Field>
      <Field label="Username">
        <Input value={user.username} />
      </Field>
      <Field label="Email">
        <Input value={user.email} type="email" />
      </Field>
      <Field label="Nomor HP">
        <Input value="+62 812-3456-7890" type="tel" />
      </Field>
      <Field label="Jenis Kelamin">
        <Input value="Laki-laki" />
      </Field>
      <button type="button" className={profileLayout.primaryButton}>
        Simpan Perubahan
      </button>
    </div>
  );
}

function AlamatTab() {
  return (
    <div className="max-w-[760px]">
      <div className="mb-4 flex h-10 justify-end">
        <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-[#ee4d2d] hover:underline">
          <Plus size={16} />
          Tambah Alamat
        </button>
      </div>

      <div>
        {profileAddresses.map((address) => (
          <div key={address.id} className="group min-h-[152px] py-5">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-950">{address.label}</span>
                {address.primary && <span className="rounded-full border border-[#ee4d2d]/25 bg-[#fff1ec] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ee4d2d]">Utama</span>}
              </div>
              <button type="button" className="text-sm font-semibold text-slate-400 opacity-0 transition hover:text-[#ee4d2d] group-hover:opacity-100">
                Ubah
              </button>
            </div>
            <h4 className="text-[15px] font-semibold text-slate-950">{address.receiver}</h4>
            <p className="mt-1 text-sm text-slate-500">{address.phone}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{address.address}</p>
            <p className="mt-1 text-xs font-medium text-slate-400">{address.note}</p>
            {address.pinpoint && (
              <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#ee4d2d]">
                <MapPinCheck size={15} />
                Pinpoint akurat
              </p>
            )}
            <hr className="mt-5 border-[#e5e7eb]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function KeamananTab({ onLogout }) {
  return (
    <div className="max-w-[760px]">
      <div className="mb-8 flex min-h-[64px] gap-3 border-l-2 border-[#ee4d2d] bg-[#fff7f3] px-4 py-3 text-sm leading-6 text-slate-600">
        <Info className="mt-0.5 shrink-0 text-[#ee4d2d]" size={18} />
        <p>Bila terdapat aktivitas tidak dikenal, segera keluar dari perangkat dan perbarui kata sandi melalui pengaturan keamanan.</p>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Perangkat Aktif</h3>
      <div>
        {securityDevices.map((device) => {
          const Icon = device.type === "desktop" ? Monitor : Smartphone;
          const active = device.status === "Sedang aktif";

          return (
            <div key={device.id}>
              <div className="group flex min-h-[72px] items-center justify-between gap-5 py-4">
                <div className="flex min-w-0 items-center gap-5">
                  <Icon className={active ? "text-[#ee4d2d]" : "text-slate-400"} size={24} />
                  <div className="min-w-0">
                    <b className="block truncate text-[15px] font-medium text-slate-950">{device.name}</b>
                    <span className="text-xs text-slate-400">
                      {device.meta} • <span className={active ? "text-[#ee4d2d]" : "text-slate-500"}>{device.status}</span>
                    </span>
                  </div>
                </div>
                {!active && <button type="button" className="text-sm font-semibold text-red-500 opacity-0 transition hover:text-red-600 group-hover:opacity-100">Keluar</button>}
              </div>
              <hr className="border-[#e5e7eb]" />
            </div>
          );
        })}
      </div>
      <button type="button" onClick={onLogout} className="mt-8 inline-flex h-10 items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
        <LogOut size={16} />
        Keluar dari Semua Perangkat
      </button>
    </div>
  );
}

export default function ProfilePage({ defaultTab = "biodata" }) {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const user = {
    name: authUser?.name || "Muhammad Rifqi",
    email: authUser?.email || "rifqi@example.com",
    username: authUser?.username || "rifqim_dev",
    role: authUser?.role || "buyer",
  };
  const initial = user.name.slice(0, 1).toUpperCase();

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  return (
    <section className={profileLayout.page}>
      <aside className="hidden h-full w-[360px] shrink-0 flex-col overflow-y-auto border-r border-[#e5e7eb] bg-white md:flex" aria-label="Profil pengguna">
        <div className="flex min-h-[300px] flex-col items-center border-b border-[#e5e7eb] px-8 py-8 text-center">
          <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#ee4d2d] text-5xl font-bold text-white shadow-inner">
            {initial}
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{user.name}</h2>
          <span className="mb-6 text-sm font-medium text-[#ee4d2d]">@{user.username}</span>
          <button type="button" className={profileLayout.secondaryButton}>
            Ubah Foto
          </button>
        </div>

        <div className="py-2">
          <button type="button" className="flex h-14 w-full items-center justify-between px-8 text-left text-sm font-medium text-slate-800 transition hover:bg-[#fff7f3] hover:text-[#ee4d2d]">
            <span>Buat Kata Sandi</span>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
          <hr className="border-[#e5e7eb]" />
          <button type="button" className="flex h-14 w-full items-center justify-between px-8 text-left text-sm font-medium text-slate-800 transition hover:bg-[#fff7f3] hover:text-[#ee4d2d]">
            <span className="flex items-center gap-3">
              <Lock size={16} className="text-slate-400" />
              PIN Marketplace
            </span>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
          <hr className="border-[#e5e7eb]" />
          <button type="button" className="flex h-14 w-full items-center justify-between px-8 text-left text-sm font-medium text-slate-800 transition hover:bg-[#fff7f3] hover:text-[#ee4d2d]">
            <span className="flex items-center gap-3">
              <Fingerprint size={16} className="text-slate-400" />
              Verifikasi Instan
            </span>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
          <hr className="border-[#e5e7eb]" />
          <Link to="/profile/notifications" className="flex h-14 w-full items-center justify-between px-8 text-left text-sm font-medium text-slate-800 transition hover:bg-[#fff7f3] hover:text-[#ee4d2d]">
            <span className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-slate-400" />
              Pusat Keamanan
            </span>
            <ChevronRight size={16} className="text-slate-400" />
          </Link>
        </div>
      </aside>

      <div className={profileLayout.contentShell}>
        <div className={profileLayout.contentInner}>
          <div className={profileLayout.contentHeader}>
            <div>
              <span className={profileLayout.contentEyebrow}>Account settings</span>
              <h1 className={profileLayout.contentTitle}>Pengaturan Akun</h1>
              <p className={`mt-2 ${profileLayout.contentDesc}`}>Kelola profil pembeli, alamat, dan keamanan akun marketplace.</p>
            </div>
          </div>

          <div className="mb-8 flex h-12 gap-8 overflow-x-auto border-b border-[#e5e7eb]" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "shrink-0 border-b-2 pb-3 text-sm font-semibold transition",
                  activeTab === tab.key ? "border-[#ee4d2d] text-[#ee4d2d]" : "border-transparent text-slate-400 hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "biodata" && <BiodataTab user={user} />}
          {activeTab === "alamat" && <AlamatTab />}
          {activeTab === "keamanan" && <KeamananTab onLogout={handleLogout} />}
        </div>
      </div>
    </section>
  );
}
