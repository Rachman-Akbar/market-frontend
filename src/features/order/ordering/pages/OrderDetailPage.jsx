import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const total = searchParams.get("total");
  const payment = searchParams.get("payment");
  const shipping = searchParams.get("shipping");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={48} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mt-2">Pesanan Berhasil! 🎉</h1>
        <p className="text-gray-500 mt-2">Terima kasih telah berbelanja di MarketKu</p>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Nomor Pesanan</span>
            <span className="font-bold text-orange-500">{id}</span>
          </div>
          {total && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Pembayaran</span>
              <span className="font-bold text-gray-800">
                Rp {parseInt(total).toLocaleString("id-ID")}
              </span>
            </div>
          )}
          {payment && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Metode Bayar</span>
              <span className="font-medium text-gray-700">{decodeURIComponent(payment)}</span>
            </div>
          )}
          {shipping && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pengiriman</span>
              <span className="font-medium text-gray-700">{decodeURIComponent(shipping)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className="text-yellow-600 font-semibold bg-yellow-50 px-2 py-0.5 rounded-full text-xs">Menunggu Pembayaran</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700 text-left flex gap-2">
          <Package size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Langkah selanjutnya</p>
            <p className="text-blue-600 mt-1">Selesaikan pembayaran sebelum 1×24 jam agar pesanan diproses oleh penjual.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link to="/profile/orders" className="flex-1">
            <Button variant="outline" className="w-full">Lihat Pesanan Saya</Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full">
              Belanja Lagi <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
