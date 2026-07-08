import { Package, Search, Truck } from "lucide-react";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { orders } from "@/features/profile/data/profileMarketplaceData";
import { cn } from "@/shared/utils/utils";

export default function OrdersPage() {
  return (
    <section className={profileLayout.contentShell}>
      <div className={profileLayout.contentInner}>
        <div className={profileLayout.contentHeader}>
          <div>
            <span className={profileLayout.contentEyebrow}>Order activity</span>
            <h2 className={profileLayout.contentTitle}>Pesanan Saya</h2>
            <p className={`mt-2 ${profileLayout.contentDesc}`}>Daftar pesanan dummy dengan pemisah garis, bukan card.</p>
          </div>
          <label className={`${profileLayout.searchBox} w-full sm:max-w-xs`}>
            <Search size={17} className="mr-2" />
            <input type="search" placeholder="Cari pesanan" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
          </label>
        </div>

        <hr className={profileLayout.divider} />

        <div>
          {orders.map((order) => (
            <div key={order.id} className="min-h-[104px] py-6">
              <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1ec] text-[#ee4d2d]"><Package size={22} /></div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-950">{order.product}</h3>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", order.status === "Selesai" ? "bg-emerald-50 text-emerald-600" : "bg-[#fff1ec] text-[#ee4d2d]")}>{order.status}</span>
                  </div>
                  <p className="text-sm text-slate-500">{order.store}</p>
                  <p className="mt-1 text-xs text-slate-400">{order.id} • {order.date}</p>
                </div>
                <div className="flex items-center justify-between gap-4 lg:justify-end">
                  <p className="text-sm font-semibold text-slate-950">{order.total}</p>
                  <button type="button" className={profileLayout.secondaryButton}><Truck size={15} /> Detail</button>
                </div>
              </div>
              <hr className="mt-6 border-[#e5e7eb]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
