import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { SellerMetricCard } from "@/features/seller/dashboard/components/SellerMetricCard";
import { SellerOrderTable } from "@/features/seller/dashboard/components/SellerOrderTable";
import { getSellerDashboardData } from "@/features/seller/services/sellerMockService";

const FUNNEL = [82, 68, 54, 42, 31];

export default function SellerDashboardPage() {
  const [data, setData] = useState({ metrics: [], orders: [] });
  const max = Math.max(...FUNNEL);

  useEffect(() => {
    getSellerDashboardData().then(setData);
  }, []);

  return (
    <SellerPanelShell
      title="Dashboard Toko"
      subtitle="Ringkasan penjualan, pesanan, rating, dan insight konversi untuk operasional seller."
      actions={
        <>
          <Link to="/seller/products"><Button variant="outline">Kelola Produk</Button></Link>
          <Link to="/seller/banners"><Button className="bg-emerald-600 hover:bg-emerald-700">Buat Banner</Button></Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((item) => <SellerMetricCard key={item.key} item={item} />)}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <SellerOrderTable rows={data.orders} />
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-950">Funnel toko</h2>
          <p className="text-sm text-slate-500">Kunjungan hingga checkout</p>
          <div className="mt-5 space-y-3">
            {["Dilihat", "Klik Produk", "Tambah Keranjang", "Checkout", "Dibayar"].map((label, index) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                  <span>{label}</span>
                  <span>{FUNNEL[index]}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-400" style={{ width: `${(FUNNEL[index] / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SellerPanelShell>
  );
}
