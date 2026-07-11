import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { SellerMetricCard } from "@/features/seller/dashboard/components/SellerMetricCard";
import { SellerOrderTable } from "@/features/seller/dashboard/components/SellerOrderTable";
import { useSellerStore } from "@/features/seller/store/services/sellerStoreService";
import { useSellerProducts } from "@/features/seller/product/services/sellerProductService";
import { useSellerOrders } from "@/features/order/ordering/orderService";
import { formatPrice } from "@/shared/utils/utils";

const statusLabels = {
  pending: "Perlu Dikirim",
  processing: "Siap Pickup",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default function SellerDashboardPage() {
  const storeQuery = useSellerStore();
  const productsQuery = useSellerProducts({ per_page: 24 });
  const ordersQuery = useSellerOrders(storeQuery.data?.id, { per_page: 15 });
  const products = productsQuery.data?.rows || [];
  const orders = ordersQuery.data?.data || [];

  const data = useMemo(() => {
    const paidOrders = orders.filter((order) => ["paid", "settlement", "success"].includes(order.paymentStatus));
    const revenue = paidOrders.reduce((total, order) => total + order.totalItemsPrice, 0);
    const completed = orders.filter((order) => order.status === "completed").length;
    const activeProducts = products.filter((product) => product.status === "active").length;
    const lowStock = products.filter((product) => product.stock <= 5).length;
    const metrics = [
      { key: "revenue", label: "Omzet dibayar", value: formatPrice(revenue), icon: "payments", change: `${paidOrders.length} pesanan` },
      { key: "orders", label: "Total pesanan", value: orders.length.toLocaleString("id-ID"), icon: "receipt_long", change: `${completed} selesai` },
      { key: "products", label: "Produk aktif", value: activeProducts.toLocaleString("id-ID"), icon: "inventory_2", change: `${lowStock} stok rendah` },
      { key: "store", label: "Status toko", value: storeQuery.data?.isActive ? "Aktif" : "Nonaktif", icon: "storefront", change: storeQuery.data?.city || "Lokasi belum diisi" },
    ];
    const rows = orders.slice(0, 8).map((order) => ({
      id: order.orderNumber,
      buyer: "Pembeli",
      product: order.items.map((item) => item.productName).filter(Boolean).join(", ") || "-",
      qty: order.items.reduce((total, item) => total + item.quantity, 0),
      total: formatPrice(order.totalItemsPrice + order.shippingCost),
      courier: [order.courier, order.service].filter(Boolean).join(" ") || "-",
      status: statusLabels[order.status] || order.status,
    }));
    return { metrics, rows };
  }, [orders, products, storeQuery.data]);

  const funnel = useMemo(() => {
    const total = Math.max(orders.length, 1);
    return [
      { label: "Produk Aktif", value: products.filter((item) => item.status === "active").length },
      { label: "Pesanan Masuk", value: orders.length },
      { label: "Diproses", value: orders.filter((item) => item.status === "processing").length },
      { label: "Dikirim", value: orders.filter((item) => item.status === "shipped").length },
      { label: "Selesai", value: orders.filter((item) => item.status === "completed").length },
    ].map((item, index) => ({ ...item, percent: index === 0 ? Math.min(100, item.value * 10) : Math.round((item.value / total) * 100) }));
  }, [orders, products]);

  return (
    <SellerPanelShell
      title="Dashboard Toko"
      subtitle="Ringkasan penjualan, pesanan, rating, dan insight konversi untuk operasional seller."
      actions={
        <>
          <Link to="/seller/products"><Button variant="outline">Kelola Produk</Button></Link>
          <Link to="/seller/banners"><Button className="bg-emerald-600 hover:bg-emerald-700">Kelola Banner</Button></Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((item) => <SellerMetricCard key={item.key} item={item} />)}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <SellerOrderTable rows={data.rows} />
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-950">Aktivitas toko</h2>
          <p className="text-sm text-slate-500">Data produk dan pesanan terkini</p>
          <div className="mt-5 space-y-3">
            {funnel.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-400" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SellerPanelShell>
  );
}
