import { useMemo, useState } from "react";
import { Gift, Search, ShoppingBag, TicketPercent, Truck } from "lucide-react";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { vouchers } from "@/features/profile/data/profileMarketplaceData";
import { cn } from "@/shared/utils/utils";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "ongkir", label: "Gratis Ongkir" },
  { key: "cashback", label: "Cashback" },
  { key: "diskon", label: "Diskon" },
  { key: "toko", label: "Voucher Toko" },
];

function getVoucherIcon(category) {
  if (category === "ongkir") return Truck;
  if (category === "cashback") return Gift;
  return TicketPercent;
}

export default function VouchersPage() {
  const [filter, setFilter] = useState("all");
  const [keyword, setKeyword] = useState("");

  const filteredVouchers = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    return vouchers.filter((voucher) => {
      const categoryMatch = filter === "all" || voucher.category === filter;
      const keywordMatch = !value || `${voucher.title} ${voucher.code} ${voucher.minimum}`.toLowerCase().includes(value);
      return categoryMatch && keywordMatch;
    });
  }, [filter, keyword]);

  return (
    <section className={profileLayout.contentShell}>
      <div className={profileLayout.contentInner}>
        <div className={profileLayout.contentHeader}>
          <div>
            <span className={profileLayout.contentEyebrow}>Voucher wallet</span>
            <h2 className={profileLayout.contentTitle}>Voucher Saya</h2>
            <p className={`mt-2 ${profileLayout.contentDesc}`}>Kelola gratis ongkir, cashback, voucher toko, dan diskon belanja dummy.</p>
          </div>
        </div>

        <hr className={profileLayout.divider} />

        <div className="flex min-h-[72px] flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <label className={`${profileLayout.searchBox} min-w-0 flex-1 gap-2`}>
            <Search size={17} />
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Cari voucher atau kode promo" type="search" />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {FILTERS.map((item) => (
              <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={cn("h-9 shrink-0 rounded-full px-4 text-xs font-semibold transition", filter === item.key ? "bg-[#ee4d2d] text-white" : "bg-white text-slate-500 ring-1 ring-[#e5e7eb] hover:text-[#ee4d2d]")}>{item.label}</button>
            ))}
          </div>
        </div>

        <hr className={profileLayout.divider} />

        <div>
          {filteredVouchers.map((voucher) => {
            const Icon = getVoucherIcon(voucher.category);
            const used = voucher.status === "used";

            return (
              <div key={voucher.id} className={cn("grid min-h-[128px] gap-4 py-6 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center", used && "opacity-60")}>
                <div className={cn("flex items-center gap-3 md:block md:text-center", used ? "text-slate-400" : "text-[#ee4d2d]")}>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-[#e5e7eb] md:mx-auto md:mb-2">
                    <Icon size={22} />
                  </div>
                  <b className="block text-2xl font-light">{voucher.value}</b>
                </div>

                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-950">{voucher.title}</h3>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", used ? "bg-[#f0f2f5] text-slate-500" : "bg-[#fff1ec] text-[#ee4d2d]")}>{used ? "Dipakai" : "Aktif"}</span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Kode: {voucher.code}</p>
                  <p className="mt-2 text-sm text-slate-600">{voucher.minimum}</p>
                  <p className="mt-1 text-xs text-slate-400">{voucher.expiry}</p>
                </div>

                <div className="flex items-center gap-3 md:justify-end">
                  <button type="button" className="inline-flex h-10 items-center gap-1.5 text-xs font-semibold text-[#ee4d2d] hover:underline">
                    <ShoppingBag size={14} />
                    Produk
                  </button>
                  <button type="button" disabled={used} className={cn("inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold transition", used ? "cursor-not-allowed bg-[#f0f2f5] text-slate-400" : "bg-[#ee4d2d] text-white hover:bg-[#d73211]")}>Pakai</button>
                </div>
                <hr className="border-[#e5e7eb] md:col-span-3" />
              </div>
            );
          })}
        </div>

        {filteredVouchers.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#fff1ec] text-[#ee4d2d]"><TicketPercent size={34} /></div>
            <h3 className="text-xl font-light text-slate-950">Voucher tidak ditemukan</h3>
            <p className="mt-2 text-sm text-slate-500">Coba gunakan kata kunci lain atau pilih kategori berbeda.</p>
          </div>
        )}
      </div>
    </section>
  );
}
