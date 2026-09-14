import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminRealtimeNotifications } from "@/features/admin/notifications/context/AdminRealtimeNotificationContext";

const MODULE_LABELS = {
  orders: "Pesanan",
  support: "Help",
  promotion_payments: "Pembayaran Promosi",
  stores: "Toko",
  chat: "Chat",
};

function iconFor(module) {
  if (module === "orders") return "receipt_long";
  if (module === "support") return "support_agent";
  if (module === "promotion_payments") return "paid";
  if (module === "stores") return "storefront";
  if (module === "chat") return "chat";
  return "notifications";
}

export function AdminNotificationDrawer() {
  const center = useAdminRealtimeNotifications();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const confirmTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(confirmTimerRef.current), []);

  if (!center.open) return null;

  const openNotification = async (item) => {
    try {
      await center.markRead(item);
    } finally {
      center.setOpen(false);
      if (item.url) navigate(item.url);
    }
  };

  const requestDelete = (id) => {
    if (confirmId === id) {
      window.clearTimeout(confirmTimerRef.current);
      setConfirmId(null);
      center.deleteOne(id);
      return;
    }
    window.clearTimeout(confirmTimerRef.current);
    setConfirmId(id);
    confirmTimerRef.current = window.setTimeout(() => setConfirmId(null), 2600);
  };

  const requestClearAll = () => {
    if (confirmClearAll) {
      window.clearTimeout(confirmTimerRef.current);
      setConfirmClearAll(false);
      center.clearAll();
      return;
    }
    window.clearTimeout(confirmTimerRef.current);
    setConfirmClearAll(true);
    confirmTimerRef.current = window.setTimeout(() => setConfirmClearAll(false), 2600);
  };

  return (
    <div className="fixed inset-0 z-[180] bg-slate-950/35 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Notifikasi admin">
      <section className="ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden bg-slate-50 shadow-2xl">
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Notifikasi Admin</p>
                <span className={`h-2 w-2 rounded-full ${center.connected ? "bg-emerald-500" : "bg-amber-500"}`} />
              </div>
              <h2 className="mt-1 text-lg font-black text-slate-950">Permintaan dan aktivitas terbaru</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">{center.connected ? "Realtime aktif" : "Realtime terputus, fallback 20 detik aktif"}</p>
            </div>
            <button type="button" onClick={() => center.setOpen(false)} className="flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="Tutup">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-xs font-extrabold text-slate-600">{center.unreadCount} belum dibaca</p>
            <div className="flex gap-2">
              <button type="button" onClick={center.refresh} className="h-8 px-3 text-xs font-extrabold text-slate-600 hover:bg-slate-100">Muat ulang</button>
              <button type="button" onClick={() => center.markAllRead()} disabled={!center.unreadCount} className="h-8 px-3 text-xs font-extrabold text-teal-700 hover:bg-teal-50 disabled:opacity-40">Tandai semua dibaca</button>
              <button type="button" onClick={requestClearAll} disabled={!center.notifications.length} className={`flex h-8 items-center gap-1 px-3 text-xs font-extrabold disabled:opacity-40 ${confirmClearAll ? "bg-red-600 text-white" : "text-red-600 hover:bg-red-50"}`}>
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                {confirmClearAll ? "Yakin?" : "Hapus semua"}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {center.loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4].map((value) => <div key={value} className="h-24 animate-pulse bg-white" />)}
            </div>
          ) : center.notifications.length ? center.notifications.map((item) => (
            <div key={item.id} className={`flex items-stretch border-b border-slate-100 transition hover:bg-slate-100 ${item.readAt ? "bg-white" : "bg-teal-50/60"}`}>
              <button type="button" onClick={() => openNotification(item)} className="flex flex-1 items-start gap-3 px-5 py-4 text-left">
                <span className={`material-symbols-outlined mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.readAt ? "bg-slate-100 text-slate-500" : "bg-teal-100 text-teal-700"}`}>{iconFor(item.module)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-black text-slate-900">{item.title}</span>
                    {!item.readAt ? <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" /> : null}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-slate-600">{item.message}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-400">
                    <span>{MODULE_LABELS[item.module] || item.module}</span>
                    <span>·</span>
                    <span>{new Date(item.createdAt).toLocaleString("id-ID")}</span>
                    {item.store?.name ? <><span>·</span><span>{item.store.name}</span></> : null}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => requestDelete(item.id)}
                className={`flex w-12 shrink-0 items-center justify-center border-l border-slate-100 text-[16px] transition ${confirmId === item.id ? "bg-red-600 text-white" : "text-slate-300 hover:bg-red-50 hover:text-red-600"}`}
                title={confirmId === item.id ? "Klik lagi untuk menghapus" : "Hapus notifikasi"}
                aria-label={confirmId === item.id ? `Konfirmasi hapus ${item.title}` : `Hapus ${item.title}`}
              >
                <span className="material-symbols-outlined">{confirmId === item.id ? "check" : "delete"}</span>
              </button>
            </div>
          )) : (
            <div className="flex h-full min-h-72 flex-col items-center justify-center px-6 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">notifications_off</span>
              <p className="mt-3 text-sm font-bold text-slate-600">Belum ada notifikasi admin.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
