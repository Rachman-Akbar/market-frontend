import { FormPageLayout } from "@/shared/components/crud/FormPageLayout";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";
import { formatPrice } from "@/shared/utils/utils";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("id-ID");
}

function CustomerDetailForm({ customer }) {
  if (!customer) return null;

  const avatar = resolveMediaUrl(customer.avatar || "");
  const stats = [
    { label: "Jumlah Pesanan", value: Number(customer.orders_count || 0).toLocaleString("id-ID"), icon: "receipt_long", tone: "bg-sky-50 text-sky-700" },
    { label: "Total Belanja", value: formatPrice(customer.total_spent), icon: "payments", tone: "bg-emerald-50 text-emerald-700" },
    { label: "Pesanan Terakhir", value: formatDate(customer.last_order_at), icon: "schedule", tone: "bg-amber-50 text-amber-700" },
  ];

  return (
    <FormPageLayout
      title="Detail Pelanggan"
      subtitle={customer.name ? `ID ${customer.id} · ${customer.name}` : `ID ${customer.id}`}
      lead={
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${customer.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {customer.is_active ? "Aktif" : "Nonaktif"}
        </span>
      }
    >
      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt={customer.name || "Pelanggan"} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-slate-400">
              <span className="material-symbols-outlined text-[32px]">person</span>
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-slate-900">{customer.name || "Tanpa Nama"}</p>
            <p className="truncate text-sm text-slate-500">{customer.email || "-"}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-400">Terdaftar {formatDate(customer.registered_at)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <span className={`grid h-9 w-9 place-items-center rounded-lg ${item.tone}`}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </span>
            <p className="mt-3 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="mt-1 truncate text-lg font-black text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-sm font-extrabold text-slate-900">Informasi Kontak</h2>
        <div className="mt-3 divide-y divide-slate-100">
          <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Nama</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{customer.name || "-"}</span></div>
          <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Email</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{customer.email || "-"}</span></div>
          <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Status</span><span className="text-right font-bold text-slate-800">{customer.is_active ? "Aktif" : "Nonaktif"}</span></div>
          <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Terdaftar</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{formatDate(customer.registered_at)}</span></div>
        </div>
      </div>
    </FormPageLayout>
  );
}

export default CustomerDetailForm;
export { CustomerDetailForm };