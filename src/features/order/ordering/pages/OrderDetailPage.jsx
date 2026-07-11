import { Link, useParams } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, Clock3, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { formatPrice } from "@/shared/utils/utils";
import { useOrderDetail } from "@/features/order/ordering/orderService";

export default function OrderDetailPage() {
  const { id } = useParams();
  const orderQuery = useOrderDetail(id);
  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">Memuat detail pesanan...</div>;
  }

  if (!order) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-red-500">Detail pesanan tidak ditemukan.</div>;
  }

  const success = ["paid", "settlement", "success"].includes(order.paymentStatus) || ["processing", "shipped", "completed", "delivered"].includes(order.status);
  const failed = ["cancelled", "failed", "expired"].includes(order.status) || order.paymentStatus === "failed";
  const StatusIcon = failed ? XCircle : success ? CheckCircle : Clock3;
  const statusTone = failed ? "bg-red-100 text-red-500" : success ? "bg-green-100 text-green-500" : "bg-yellow-100 text-yellow-600";
  const title = failed ? "Pesanan Dibatalkan" : success ? "Pesanan Berhasil" : "Pesanan Dibuat";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${statusTone}`}>
          <StatusIcon size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">{title}</h1>
        <p className="text-gray-500 mt-2">Status pembayaran dan pengiriman diperbarui otomatis dari backend.</p>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-6 text-left space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-600">Nomor Pesanan</span><span className="font-bold text-orange-500">{order.orderNumber}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium text-gray-700">{formatPrice(order.subtotal || Math.max(0, order.totalAmount - order.shippingCost))}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Ongkir</span><span className="font-medium text-gray-700">{formatPrice(order.shippingCost)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Diskon</span><span className="font-medium text-gray-700">-{formatPrice(order.discountAmount + order.shippingDiscountAmount)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Total Pembayaran</span><span className="font-bold text-gray-800">{formatPrice(order.grandTotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Metode Bayar</span><span className="font-medium text-gray-700">{order.paymentMethod || "-"}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Status</span><span className="font-semibold text-gray-700">{order.status}</span></div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700 text-left flex gap-2">
          <Package size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Alamat pengiriman</p>
            <p className="text-blue-600 mt-1">{order.shippingAddress}</p>
          </div>
        </div>

        <div className="mt-6 text-left">
          {order.items.map((item) => (
            <div key={`${item.id}-${item.productId}`} className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm">
              <span>{item.productName} ×{item.quantity}</span>
              <strong>{formatPrice(item.subtotal || item.price * item.quantity)}</strong>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link to="/profile/orders" className="flex-1"><Button variant="outline" className="w-full">Lihat Pesanan Saya</Button></Link>
          <Link to="/" className="flex-1"><Button className="w-full">Belanja Lagi <ArrowRight size={16} /></Button></Link>
        </div>
      </div>
    </div>
  );
}
