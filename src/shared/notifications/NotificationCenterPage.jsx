import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";

function NotificationItem({ item, onRemove }) {
  const icon = item.status === "processing" ? "sync" : item.status === "waiting" ? "pending_actions" : item.type === "error" ? "error" : item.type === "success" ? "check_circle" : "info";
  const iconClass = item.status === "processing" ? "animate-spin text-amber-600" : item.status === "waiting" ? "text-amber-600" : item.type === "error" ? "text-red-600" : item.type === "success" ? "text-emerald-600" : "text-sky-600";

  return (
    <article className="border-b border-slate-100 bg-white px-5 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined mt-0.5 text-[21px] ${iconClass}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
            </div>
            <button type="button" onClick={() => onRemove(item.id)} className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Hapus notifikasi">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          {item.status === "processing" ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full bg-emerald-500 transition-all ${item.progress === null ? "w-1/3 animate-pulse" : ""}`} style={item.progress === null ? undefined : { width: `${Math.max(3, Math.min(100, item.progress))}%` }} />
            </div>
          ) : null}
          {item.status === "waiting" && (item.actionLabel || item.secondaryActionLabel) ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.secondaryActionLabel ? <button type="button" onClick={() => item.onSecondaryAction?.()} className="h-9 border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 hover:bg-slate-50">{item.secondaryActionLabel}</button> : null}
              {item.actionLabel ? <button type="button" onClick={() => item.onAction?.()} className="h-9 bg-emerald-600 px-4 text-xs font-extrabold text-white hover:bg-emerald-700">{item.actionLabel}</button> : null}
            </div>
          ) : null}
          <p className="mt-2 text-[11px] font-semibold text-slate-400">{new Date(item.createdAt).toLocaleString("id-ID")}</p>
        </div>
      </div>
    </article>
  );
}

export function NotificationCenterPage() {
  const center = useNotificationCenter();
  const rows = center.activeTab === "queue" ? center.queueItems : center.infoItems;

  return (
    <div className="fixed inset-0 z-[180] bg-slate-950/35 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Pusat notifikasi">
      <div className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden bg-slate-50 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Pusat Notifikasi</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">Proses dan informasi terbaru</h2>
          </div>
          <button type="button" onClick={() => center.setOpen(false)} className="flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="Tutup">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        <div className="flex items-center border-b border-slate-200 bg-white px-5">
          {[{ key: "queue", label: `Antrean (${center.queueItems.length})` }, { key: "info", label: `Info (${center.infoItems.length})` }].map((tab) => (
            <button key={tab.key} type="button" onClick={() => center.setActiveTab(tab.key)} className={`border-b-2 px-4 py-3 text-sm font-extrabold ${center.activeTab === tab.key ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              {tab.label}
            </button>
          ))}
          <button type="button" onClick={() => center.clear(center.activeTab)} className="ml-auto px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600">Bersihkan</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rows.length ? rows.map((item) => <NotificationItem key={item.id} item={item} onRemove={center.remove} />) : (
            <div className="flex h-full min-h-72 flex-col items-center justify-center px-6 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">notifications_off</span>
              <p className="mt-3 text-sm font-bold text-slate-600">Belum ada {center.activeTab === "queue" ? "proses dalam antrean" : "informasi"}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
