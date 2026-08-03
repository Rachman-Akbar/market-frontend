import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";
import { cn } from "@/shared/utils/utils";

function LogoutPage({ open, pending, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Konfirmasi logout">
      <section className="w-full max-w-xl overflow-hidden bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Keluar Portal</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Konfirmasi logout</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="Tutup">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        <div className="px-6 py-8">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">logout</span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Sesi portal akan diakhiri</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Perubahan yang belum disimpan pada tab aktif dapat hilang. Pastikan proses import, export, atau penghapusan sudah selesai.</p>
            </div>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" onClick={onClose} disabled={pending} className="h-10 bg-white px-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-50">Batal</button>
          <button type="button" onClick={onConfirm} disabled={pending} className="inline-flex h-10 items-center gap-2 bg-red-600 px-4 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-60">
            <span className={`material-symbols-outlined text-[18px] ${pending ? "animate-spin" : ""}`}>{pending ? "progress_activity" : "logout"}</span>
            {pending ? "Memproses..." : "Logout"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  userName,
  roleLabel,
  searchPlaceholder,
  actionHref,
  actionLabel,
  accentTextClassName,
  avatarClassName,
  focusClassName,
  actionClassName,
  notificationClassName,
  mobileNavigation,
}) {
  const initial = userName?.slice(0, 1)?.toUpperCase() || "U";
  const center = useNotificationCenter();
  const { logout, loading } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const unreadCount = center.queueItems.length + center.infoItems.length;

  const confirmLogout = async () => {
    await logout();
    setLogoutOpen(false);
    navigate(roleLabel?.toLowerCase().includes("admin") ? "/admin/login" : "/auth/login", { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", accentTextClassName)}>{eyebrow}</p>
            <h1 className="truncate text-base font-extrabold text-slate-950">{title}</h1>
          </div>

          {searchPlaceholder ? (
            <div className="hidden min-w-0 flex-1 justify-center md:flex">
              <div className={cn("flex w-full max-w-xl items-center rounded-lg bg-slate-50 px-3 py-2 focus-within:bg-white", focusClassName)}>
                <span className="material-symbols-outlined mr-2 text-[20px] text-slate-400">search</span>
                <input className="w-full bg-transparent text-sm outline-none" placeholder={searchPlaceholder} />
              </div>
            </div>
          ) : <div className="min-w-0 flex-1" />}

          <div className="flex items-center gap-2">
            {actionHref ? (
              <Link to={actionHref} className={cn("hidden rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition sm:inline-flex", actionClassName)}>{actionLabel}</Link>
            ) : null}
            <button type="button" onClick={() => center.setOpen(true)} className={cn("relative flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600 transition", notificationClassName)} aria-label="Notifikasi">
              <span className={`material-symbols-outlined text-[20px] ${center.queueItems.length ? "animate-pulse text-amber-600" : ""}`}>{center.queueItems.length ? "notifications_active" : "notifications"}</span>
              {unreadCount ? <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">{Math.min(99, unreadCount)}</span> : null}
            </button>
            <button type="button" onClick={() => setLogoutOpen(true)} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-left hover:bg-slate-50" aria-label="Buka logout">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white", avatarClassName)}>{initial}</div>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[120px] truncate text-xs font-extrabold text-slate-900">{userName}</p>
                <p className="text-[10px] font-semibold text-slate-400">{roleLabel}</p>
              </div>
              <span className="material-symbols-outlined hidden text-[17px] text-slate-400 sm:block">expand_more</span>
            </button>
          </div>
        </div>
      </header>
      {mobileNavigation}
      <LogoutPage open={logoutOpen} pending={loading} onClose={() => setLogoutOpen(false)} onConfirm={confirmLogout} />
    </>
  );
}
