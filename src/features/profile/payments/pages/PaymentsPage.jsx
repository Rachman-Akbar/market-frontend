import { CreditCard, Landmark, Plus, QrCode, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { paymentMethods, paymentTransactions } from "@/features/profile/data/profileMarketplaceData";
import { cn } from "@/shared/utils/utils";

const METHOD_ICON = {
  wallet: Wallet,
  card: CreditCard,
  qris: QrCode,
  bank: Landmark,
};

export default function PaymentsPage() {
  return (
    <section className={profileLayout.contentShell} aria-label="Halaman pembayaran">
      <div className={profileLayout.contentInner}>
        <div className={profileLayout.contentHeader}>
          <div>
            <span className={profileLayout.contentEyebrow}>Payment center</span>
            <h2 className={profileLayout.contentTitle}>Pembayaran</h2>
            <p className={`mt-2 ${profileLayout.contentDesc}`}>Ringkasan saldo, metode pembayaran, dan riwayat transaksi dengan ukuran container yang konsisten.</p>
          </div>
          <button type="button" className={profileLayout.primaryButton}>
            <Plus size={17} />
            Tambah Metode
          </button>
        </div>

        <hr className={profileLayout.divider} />

        <div className="grid gap-8 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div>
            <span className="text-sm font-semibold text-slate-500">Saldo ShopeePay</span>
            <strong className="mt-2 block text-4xl font-light tracking-tight text-slate-950">Rp 2.450.000</strong>
            <p className="mt-4 text-sm leading-6 text-slate-500">Siap digunakan untuk checkout, refund, top up, dan pembayaran instan di marketplace.</p>
            <button type="button" className={`mt-6 ${profileLayout.primaryButton}`}>Top Up Saldo</button>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Metode Pembayaran</h3>
            {paymentMethods.map((method) => {
              const Icon = METHOD_ICON[method.type] || CreditCard;

              return (
                <div key={method.id} className="py-4">
                  <div className="flex min-h-[52px] items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", method.active ? "bg-[#fff1ec] text-[#ee4d2d]" : "bg-[#f0f2f5] text-slate-500")}>
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <b className="block truncate text-sm font-semibold text-slate-950">{method.name}</b>
                        <span className="text-xs text-slate-400">{method.number}</span>
                      </div>
                    </div>
                    <em className={cn("shrink-0 rounded-full px-3 py-1 text-[11px] not-italic font-semibold", method.active ? "bg-[#fff1ec] text-[#ee4d2d]" : "bg-[#f0f2f5] text-slate-500")}>{method.status}</em>
                  </div>
                  <hr className="mt-4 border-[#e5e7eb]" />
                </div>
              );
            })}
          </div>
        </div>

        <hr className={profileLayout.divider} />

        <div className="py-8">
          <div className="mb-4 flex min-h-[56px] items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Riwayat Transaksi</h3>
              <p className="mt-1 text-sm text-slate-500">Dummy transaksi terbaru untuk preview tampilan.</p>
            </div>
            <button type="button" className="text-sm font-semibold text-[#ee4d2d] hover:underline">Lihat Semua</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-2 py-3">Tanggal</th>
                  <th className="px-2 py-3">Deskripsi</th>
                  <th className="px-2 py-3">Metode</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {paymentTransactions.map((trx) => (
                  <tr key={trx.id} className="h-[56px] border-b border-[#e5e7eb] last:border-b-0">
                    <td className="px-2 py-4 text-sm text-slate-500">{trx.date}</td>
                    <td className="px-2 py-4 text-sm font-semibold text-slate-950">{trx.description}</td>
                    <td className="px-2 py-4 text-sm text-slate-500">{trx.method}</td>
                    <td className="px-2 py-4"><span className={cn("text-xs font-semibold", trx.status === "Berhasil" ? "text-emerald-600" : "text-amber-600")}>{trx.status}</span></td>
                    <td className="px-2 py-4 text-right text-sm font-semibold text-slate-950">{trx.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <hr className={profileLayout.divider} />

        <div className="grid gap-6 py-8 md:grid-cols-3">
          {[
            { label: "Keamanan", value: "3D Secure aktif", icon: ShieldCheck },
            { label: "Perangkat", value: "Chrome Windows", icon: Smartphone },
            { label: "Limit harian", value: "Rp 10.000.000", icon: CreditCard },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="min-h-[92px]">
              <Icon className="mb-3 text-[#ee4d2d]" size={22} />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
