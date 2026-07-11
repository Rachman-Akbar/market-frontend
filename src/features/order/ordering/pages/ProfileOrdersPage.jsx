import { Link } from "react-router-dom";
import { formatPrice } from "@/shared/utils/utils";
import { Badge } from "@/shared/components/ui/Badge";
import { ShoppingBag } from "lucide-react";
import { useOrders } from "@/features/order/ordering/orderService";

const STATUS_LABEL = {
  pending: { label: "Menunggu Pembayaran", variant: "default" },
  processing: { label: "Diproses", variant: "secondary" },
  shipped: { label: "Dikirim", variant: "secondary" },
  delivered: { label: "Selesai", variant: "success" },
  completed: { label: "Selesai", variant: "success" },
  cancelled: { label: "Dibatalkan", variant: "destructive" },
};

export default function ProfileOrdersPage() {
  const ordersQuery = useOrders({ per_page: 20 });
  const orders = ordersQuery.data?.data || [];

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-gray-800 text-lg">Pesanan Saya</h2>
      {ordersQuery.isLoading ? <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Memuat pesanan...</div> : null}
      {ordersQuery.error ? <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-500">Pesanan gagal dimuat.</div> : null}
      {!ordersQuery.isLoading && !orders.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-3" />
          <p>Belum ada pesanan</p>
        </div>
      ) : null}
      {orders.map((order) => {
        const status = STATUS_LABEL[order.status] || { label: order.status, variant: "default" };
        return (
          <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-sm text-gray-800">{order.orderNumber}</p>
                <p className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}</p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.id}`} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0 text-gray-700">
                <span className="line-clamp-1">{item.productName} <span className="text-gray-400">({item.variantLabel}) ×{item.quantity}</span></span>
                <span className="font-medium ml-4 shrink-0">{formatPrice(item.subtotal || item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">{order.courier || order.subOrders[0]?.courier || ""}</span>
              <span className="font-bold text-orange-500">{formatPrice(order.grandTotal)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
