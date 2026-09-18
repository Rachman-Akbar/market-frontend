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

export function AdminNotificationPanel({ onClose }) {
  const center = useAdminRealtimeNotifications();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const confirmTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(confirmTimerRef.current), []);

  const openNotification = async (item) => {
    try {
      await center.markRead(item);
    } finally {
      onClose?.();
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
    <section className="flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden bg-slate-50 shadow-2xl ring-1 ring-slate-200">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-teal-700">Notifikasi Admin</p>
            <span className={`h-2 w-2 shrink-0 rounded-full ${center.connected ? "bg-emerald-500" : "bg-amber-500"}`} />
          </div>
          <p className={`shrink-0 text-[11px] font-bold ${center.connected ? "text-slate-400" : "text-amber-600"}`}>
            {center.connected ? "Realtime aktif" : "Realtime terputus"}
          </p>
        </div>
        <h2 className="mt-1 truncate text-sm font-black text-slate-950">Permintaan dan aktivitas terbaru</h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-slate-100 pt-2.5">
          <p className="text-[11px] font-extrabold text-slate-600">{center.unreadCount} belum dibaca</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={center.refresh} className="h-7 px-2 text-[11px] font-extrabold text-slate-600 hover:bg-slate-100">Muat ulang</button>
            <button type="button" onClick={() => center.markAllRead()} disabled={!center.unreadCount} className="h-7 px-2 text-[11px] font-extrabold text-teal-700 hover:bg-teal-50 disabled:opacity-40">Tandai dibaca</button>
            <button type="button" onClick={requestClearAll} disabled={!center.notifications.length} className={`flex h-7 items-center gap-1 px-2 text-[11px] font-extrabold disabled:opacity-40 ${confirmClearAll ? "bg-red-600 text-white" : "text-red-600 hover:bg-red-50"}`}>
              <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
              {confirmClearAll ? "Yakin?" : "Hapus semua"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-h-[min(60vh,26rem)] flex-1 overflow-y-auto">
        {center.loading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3, 4].map((value) => <div key={value} className="h-20 animate-pulse bg-white" />)}
          </div>
        ) : center.notifications.length ? center.notifications.map((item) => (
          <div key={item.id} className={`flex items-stretch border-b border-slate-100 transition hover:bg-slate-100 ${item.readAt ? "bg-white" : "bg-teal-50/60"}`}>
            <button type="button" onClick={() => openNotification(item)} className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left">
              <span className={`material-symbols-outlined mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.readAt ? "bg-slate-100 text-slate-500" : "bg-teal-100 text-teal-700"}`}>{iconFor(item.module)}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-black text-slate-900">{item.title}</span>
                  {!item.readAt ? <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" /> : null}
                </span>
                <span className="mt-0.5 block text-sm leading-5 text-slate-600">{item.message}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-400">
                  <span>{MODULE_LABELS[item.module] || item.module}</span>
                  <span>·</span>
                  <span>{new Date(item.createdAt).toLocaleString("id-ID")}</span>
                  {item.store?.name ? <><span>·</span><span className="truncate">{item.store.name}</span></> : null}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => requestDelete(item.id)}
              className={`flex w-10 shrink-0 items-center justify-center border-l border-slate-100 text-[16px] transition ${confirmId === item.id ? "bg-red-600 text-white" : "text-slate-300 hover:bg-red-50 hover:text-red-600"}`}
              title={confirmId === item.id ? "Klik lagi untuk menghapus" : "Hapus notifikasi"}
              aria-label={confirmId === item.id ? `Konfirmasi hapus ${item.title}` : `Hapus ${item.title}`}
            >
              <span className="material-symbols-outlined">{confirmId === item.id ? "check" : "delete"}</span>
            </button>
          </div>
        )) : (
          <div className="flex min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
            <p className="mt-2 text-sm font-bold text-slate-600">Belum ada notifikasi admin.</p>
          </div>
        )}
      </div>
    </section>
  );
}