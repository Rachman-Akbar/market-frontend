import { useMemo, useState } from "react";
import { BadgeCheck, BellRing, CheckCheck, ShieldAlert, TicketPercent, Truck } from "lucide-react";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { profileNotifications } from "@/features/profile/data/profileMarketplaceData";
import { cn } from "@/shared/utils/utils";

const TONE = {
  success: { icon: BadgeCheck, className: "bg-emerald-50 text-emerald-600" },
  warning: { icon: TicketPercent, className: "bg-amber-50 text-amber-600" },
  info: { icon: Truck, className: "bg-sky-50 text-sky-600" },
  danger: { icon: ShieldAlert, className: "bg-red-50 text-red-600" },
};

const FILTERS = ["Semua", "Transaksi", "Promo", "Pengiriman", "Keamanan"];

export default function NotificationsPage() {
  const [activeId, setActiveId] = useState(profileNotifications[0]?.id || "");
  const [filter, setFilter] = useState("Semua");

  const notifications = useMemo(() => {
    if (filter === "Semua") return profileNotifications;
    return profileNotifications.filter((item) => item.category === filter);
  }, [filter]);

  const activeNotification = notifications.find((item) => item.id === activeId) || notifications[0] || profileNotifications[0];

  return (
    <div className={profileLayout.page}>
      <aside className={profileLayout.sidebar}>
        <div className={profileLayout.sidebarHeader}>
          <h1 className={profileLayout.sidebarTitle}>Notifikasi</h1>
          <button type="button" className="text-slate-500 transition hover:text-[#ee4d2d]" title="Tandai semua dibaca">
            <CheckCheck size={20} />
          </button>
        </div>

        <div className={profileLayout.filterRow}>
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setFilter(item);
                const next = item === "Semua" ? profileNotifications[0] : profileNotifications.find((notif) => notif.category === item);
                setActiveId(next?.id || "");
              }}
              className={cn("shrink-0 rounded-full px-3 py-1 font-semibold transition", filter === item ? "bg-[#fff1ec] text-[#ee4d2d]" : "bg-[#f0f2f5] text-slate-500 hover:bg-[#fff1ec] hover:text-[#ee4d2d]")}
            >
              {item}
            </button>
          ))}
        </div>

        <div className={profileLayout.listScroll}>
          {notifications.map((item) => {
            const tone = TONE[item.tone] || TONE.info;
            const Icon = tone.icon;
            const active = item.id === activeNotification?.id;

            return (
              <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className={cn("grid min-h-[76px] w-full grid-cols-[auto_minmax(0,1fr)] gap-3 px-4 py-3 text-left transition", active ? "bg-[#fff7f3]" : "hover:bg-[#f7f8fa]")}>
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tone.className)}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="mb-0.5 flex items-center justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold text-slate-950">{item.title}</h3>
                    <span className={cn("shrink-0 text-xs", item.status === "unread" ? "font-semibold text-[#ee4d2d]" : "text-slate-400")}>{item.time}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{item.description}</p>
                  <hr className="mt-3 border-[#e5e7eb]" />
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className={profileLayout.contentShell}>
        {activeNotification ? (
          <div className={profileLayout.contentInner}>
            <div className={profileLayout.contentHeader}>
              <div>
                <span className={profileLayout.contentEyebrow}>{activeNotification.category}</span>
                <h2 className="mt-2 text-3xl font-light leading-tight text-slate-950">{activeNotification.title}</h2>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-400">{activeNotification.time}</span>
            </div>
            <hr className={profileLayout.divider} />
            <div className="py-8">
              <p className="text-sm leading-7 text-slate-600">{activeNotification.detail}</p>
            </div>
            <hr className={profileLayout.divider} />
            <div className="mt-8 flex gap-3">
              <button type="button" className={profileLayout.primaryButton}>Lihat Detail</button>
              <button type="button" className={profileLayout.secondaryButton}>Tandai Dibaca</button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0f2f5] text-slate-400"><BellRing size={40} /></div>
              <h2 className="mb-2 text-2xl font-light text-slate-950">Pusat Notifikasi</h2>
              <p className="text-sm leading-6 text-slate-500">Pilih pemberitahuan di sebelah kiri untuk melihat detail transaksi atau peringatan keamanan.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
