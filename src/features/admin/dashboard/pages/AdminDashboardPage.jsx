import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { AdminStatCard } from "@/features/admin/dashboard/components/AdminStatCard";
import { AdminMiniChart } from "@/features/admin/dashboard/components/AdminMiniChart";
import { AdminDataTable } from "@/features/admin/dashboard/components/AdminDataTable";
import { useAdminDashboard } from "@/features/admin/adminService";

export default function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboard();
  const data = dashboardQuery.data || { stats: [], revenueSeries: [], recentOrders: [], moderationQueue: [] };

  return (
    <AdminShell
      title="Dashboard Operasional"
      subtitle="Ringkasan performa marketplace, antrean moderasi, transaksi, dan kesehatan operasional harian."
      actions={
        <>
          <Link to="/admin/categories"><Button variant="outline">Kelola Kategori</Button></Link>
          <Link to="/admin/catalog-groups"><Button className="bg-teal-600 hover:bg-teal-700">Catalog Group</Button></Link>
        </>
      }
    >
      {dashboardQuery.isLoading ? <p className="py-8 text-sm text-slate-500">Memuat dashboard...</p> : null}
      {dashboardQuery.error ? <p className="py-8 text-sm text-red-600">{dashboardQuery.error.message}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((item) => <AdminStatCard key={item.key} item={item} />)}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminMiniChart values={data.revenueSeries} />
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-950">Antrean moderasi</h2>
              <p className="text-sm text-slate-500">Toko yang memerlukan perhatian</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">rule</span>
          </div>
          <div className="space-y-3">
            {data.moderationQueue.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-teal-700">{item.type} · {item.id}</p>
                    <h3 className="mt-1 text-sm font-extrabold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">Owner: {item.owner}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">{item.priority}</span>
                </div>
                <p className="mt-3 text-xs font-semibold text-amber-700">{item.status}</p>
              </div>
            ))}
            {!data.moderationQueue.length ? <p className="py-8 text-center text-sm text-slate-500">Tidak ada antrean moderasi.</p> : null}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <AdminDataTable rows={data.recentOrders} />
      </div>
    </AdminShell>
  );
}
