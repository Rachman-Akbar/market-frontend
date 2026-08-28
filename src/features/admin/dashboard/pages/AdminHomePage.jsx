import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import {
  getAdminMode,
  setAdminMode,
  subscribeAdminMode,
} from "@/features/admin/adminMode";
import AdminDashboardPage from "@/features/admin/dashboard/pages/AdminDashboardPage";
import AdminStoreContextPage from "@/features/admin/storeContext/pages/AdminStoreContextPage";

function readMode() {
  return typeof window !== "undefined" ? getAdminMode() : "seller";
}

function ModeSelector({ onSelect, current }) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Pilih Mode Kerja</p>
        <h1 className="text-xl font-extrabold text-slate-950">Selamat datang di Panel Admin</h1>
        <p className="text-sm text-slate-500">Pilih fokus kerja dulu — Panel Seller (operasional) atau Monitoring Toko (supervisi).</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("seller")}
          className="group relative flex flex-col items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <span className="material-symbols-outlined text-[26px]">storefront</span>
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Panel Seller</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Kelola operasional marketplace: produk, stok, pesanan, voucher, promosi, keuangan, dan PPOB.
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-teal-700 group-hover:gap-2">
            Masuk Panel Seller <span className="material-symbols-outlined text-base">arrow_forward</span>
          </span>
          {current === "seller" && <span className="absolute right-4 top-4 rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-black uppercase text-white">Mode aktif</span>}
        </button>

        <button
          type="button"
          onClick={() => onSelect("monitor")}
          className="group relative flex flex-col items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <span className="material-symbols-outlined text-[26px]">monitor_heart</span>
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Monitoring Toko</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Supervisi satu toko: statistik, tren order, pesanan, produk, dan settlement secara terfokus.
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-indigo-700 group-hover:gap-2">
            Mulai Monitoring <span className="material-symbols-outlined text-base">arrow_forward</span>
          </span>
          {current === "monitor" && <span className="absolute right-4 top-4 rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase text-white">Mode aktif</span>}
        </button>
      </div>

      <Link to="/admin/orders" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800">
        Lewati, langsung ke Pesanan <span className="material-symbols-outlined text-base">east</span>
      </Link>
    </section>
  );
}

export default function AdminHomePage() {
  const [mode, setModeLocal] = useState(readMode);

  useEffect(() => subscribeAdminMode(setModeLocal), []);

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {mode ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAdminMode(mode === "seller" ? "monitor" : "seller")}>
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              Ganti ke {mode === "seller" ? "Monitoring Toko" : "Panel Seller"}
            </Button>
          </div>
        ) : null}
      </div>

      {!mode ? (
        <ModeSelector onSelect={setAdminMode} current={mode} />
      ) : mode === "seller" ? (
        <AdminDashboardPage />
      ) : (
        <AdminStoreContextPage />
      )}
    </div>
  );
}
