import { useMemo, useState } from "react";
import { Gift, Search, TicketPercent, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { useActiveVouchers } from "@/features/order/voucher/services/voucherService";
import { formatPrice } from "@/shared/utils/utils";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "shipping", label: "Gratis Ongkir" },
  { key: "percentage", label: "Persentase" },
  { key: "fixed", label: "Potongan Tetap" },
];

function getVoucherIcon(type) {
  if (String(type).includes("shipping")) return Truck;
  if (type === "percentage") return Gift;
  return TicketPercent;
}

function getVoucherValue(voucher) {
  if (voucher.discountType === "percentage" || voucher.discountType === "shipping_percentage") return `${voucher.discountValue}%`;
  if (voucher.discountType === "free_shipping") return "Gratis";
  return formatPrice(voucher.discountValue);
}

export default function VouchersPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const vouchersQuery = useActiveVouchers();
  const vouchers = vouchersQuery.data || [];
  const filteredVouchers = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return vouchers.filter((voucher) => {
      const categoryMatch = filter === "all" || (filter === "shipping" ? voucher.discountType.includes("shipping") || voucher.discountType === "free_shipping" : voucher.discountType === filter);
      const keywordMatch = !search || `${voucher.name} ${voucher.code}`.toLowerCase().includes(search);
      return categoryMatch && keywordMatch;
    });
  }, [filter, keyword, vouchers]);

  return (
    <section className={profileLayout.contentShell}>
      <div className={profileLayout.contentInner}>
        <div className={profileLayout.contentHeader}>
          <div>
            <span className={profileLayout.contentEyebrow}>Voucher wallet</span>
            <h2 className={profileLayout.contentTitle}>Voucher Saya</h2>
            <p className={`mt-2 ${profileLayout.contentDesc}`}>Voucher aktif yang tersedia untuk checkout.</p>
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
              <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`h-9 shrink-0 rounded-full px-4 text-xs font-semibold transition ${filter === item.key ? "bg-[#03ac0e] text-white" : "bg-white text-slate-500 ring-1 ring-[#e5e7eb] hover:text-[#03ac0e]"}`}>{item.label}</button>
            ))}
          </div>
        </div>
        <hr className={profileLayout.divider} />

        {vouchersQuery.isLoading ? <p className="py-12 text-center text-sm text-slate-500">Memuat voucher...</p> : null}
        {vouchersQuery.error ? <p className="py-12 text-center text-sm text-red-600">{vouchersQuery.error.message}</p> : null}
        {filteredVouchers.map((voucher) => {
          const Icon = getVoucherIcon(voucher.discountType);
          return (
            <div key={voucher.id} className="grid min-h-[128px] gap-4 py-6 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center">
              <div className="flex items-center gap-3 text-[#03ac0e] md:block md:text-center">
                {voucher.imageUrl ? (
                  <img src={voucher.imageUrl} alt={voucher.name} className="h-16 w-24 rounded-xl object-cover ring-1 ring-[#e5e7eb] md:mx-auto md:mb-2" />
                ) : (
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-[#e5e7eb] md:mx-auto md:mb-2"><Icon size={22} /></div>
                )}
                <b className="block text-2xl font-light">{getVoucherValue(voucher)}</b>
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-950">{voucher.name}</h3>
                  <span className="rounded-full bg-[#e9fbea] px-2 py-0.5 text-[11px] font-semibold text-[#03ac0e]">Aktif</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Kode: {voucher.code}</p>
                <p className="mt-2 text-sm text-slate-600">Min. belanja {formatPrice(voucher.minSpend)}</p>
                <p className="mt-1 text-xs text-slate-400">Berlaku sampai {voucher.endsAt ? new Date(voucher.endsAt).toLocaleDateString("id-ID") : "tanpa batas"}</p>
              </div>
              <button type="button" onClick={() => navigate("/cart", { state: { voucherCode: voucher.code } })} className="inline-flex h-10 items-center justify-center rounded-full bg-[#03ac0e] px-5 text-sm font-semibold text-white transition hover:bg-[#039f0d]">Pakai</button>
              <hr className="border-[#e5e7eb] md:col-span-3" />
            </div>
          );
        })}

        {!vouchersQuery.isLoading && !filteredVouchers.length ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#e9fbea] text-[#03ac0e]"><TicketPercent size={34} /></div>
            <h3 className="text-xl font-light text-slate-950">Voucher tidak ditemukan</h3>
            <p className="mt-2 text-sm text-slate-500">Belum ada voucher aktif yang sesuai filter.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
