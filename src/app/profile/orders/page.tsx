import { mockOrders } from "@/lib/mockData";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
  pending: { label: "Menunggu Pembayaran", variant: "default" },
  processing: { label: "Diproses", variant: "secondary" },
  shipped: { label: "Dikirim", variant: "secondary" },
  delivered: { label: "Selesai", variant: "success" },
  cancelled: { label: "Dibatalkan", variant: "destructive" },
};

export default function OrdersPage() {
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-gray-800 text-lg">Pesanan Saya</h2>
      {mockOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-3" />
          <p>Belum ada pesanan</p>
        </div>
      ) : (
        mockOrders.map((order) => {
          const st = STATUS_LABEL[order.status];
          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{order.id}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0 text-gray-700">
                  <span className="line-clamp-1">{item.productName} <span className="text-gray-400">({item.variantLabel}) ×{item.quantity}</span></span>
                  <span className="font-medium ml-4 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500">{order.shippingMethod}</span>
                <span className="font-bold text-orange-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
