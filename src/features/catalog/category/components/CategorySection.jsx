import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";
import { SkeletonLine, Skeleton } from "@/shared/components/feedback/Skeleton";
import {
  getCategoryHref,
  useCategoriesMenu,
} from "@/features/catalog/category/services/categoryService";
import {
  createPpobTransaction,
  getPpobAdminError,
} from "@/features/ppob/services/ppobService";
import { usePpobCatalog } from "@/features/ppob/hooks/usePpobCatalog";

const DEFAULT_CATEGORY = "pulsa";

const CATEGORY_ICONS = {
  pulsa: "phone_android",
  data: "wifi",
  "token-listrik": "bolt",
  tagihan: "receipt_long",
  internet: "router",
  voucher: "confirmation_number",
};

function flattenCategories(categories = []) {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children || []),
  ]);
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));
}

// Functional "Top Up & Tagihan" widget reusing the PPOB catalog + buyer endpoint.
function TopUpSection() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const notifications = useNotificationCenter();

  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [productId, setProductId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [busy, setBusy] = useState(false);

  const catalog = usePpobCatalog(category);
  const categories = catalog.categories;
  const products = catalog.products;
  const isLoadingProducts = catalog.isLoadingProducts;

  const selected = useMemo(
    () => products.find((p) => String(p.id) === productId) || null,
    [products, productId]
  );

  const requireLogin = useCallback(() => {
    notifications.push({ type: "info", title: "Perlu Masuk", message: "Silakan masuk untuk melakukan pembelian." });
    navigate("/auth/login");
  }, [notifications, navigate]);

  const buy = useCallback(async () => {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    if (!selected) {
      notifications.push({ type: "error", title: "Top Up", message: "Pilih produk terlebih dahulu." });
      return;
    }
    if (!customerId.trim()) {
      notifications.push({ type: "error", title: "Top Up", message: "Masukkan nomor HP / ID pelanggan." });
      return;
    }
    setBusy(true);
    try {
      const res = await createPpobTransaction(selected.id, customerId.trim());
      notifications.push({
        type: "success",
        title: "Top Up Berhasil",
        message: `"${selected.name}" (${customerId.trim()}) • status ${res?.status || "pending"}.`,
      });
      setCustomerId("");
      setProductId("");
    } catch (e) {
      notifications.push({ type: "error", title: "Top Up Gagal", message: getPpobAdminError(e, "Transaksi gagal diproses.") });
    } finally {
      setBusy(false);
    }
  }, [isAuthenticated, requireLogin, selected, customerId, notifications]);

  const selectCategory = useCallback((key) => {
    setCategory(key);
    setProductId("");
  }, []);

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-bold">Top Up &amp; Tagihan</h3>
        <Link to="/ppob" className="text-[#10B981] text-xs font-semibold hover:underline">
          Lihat Semua
        </Link>
      </div>

      {isLoadingProducts && !products.length ? (
        <div className="grid grid-cols-1 gap-2" aria-busy="true">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-xs text-gray-400">Layanan belum tersedia saat ini.</p>
      ) : (
        <>
          <div className="flex items-center border-b border-gray-100 mb-4 overflow-x-auto hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => selectCategory(cat.key)}
                className={`px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap border-b-2 -mb-px flex items-center gap-1 ${
                  category === cat.key ? "text-[#10B981] border-[#10B981]" : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{CATEGORY_ICONS[cat.key] || "category"}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pilih Produk{catalog.operatorName ? ` (${catalog.operatorName})` : ""}</p>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={isLoadingProducts}
                className="w-full px-2 py-2 border border-gray-200 text-xs focus:outline-none focus:border-[#10B981] disabled:bg-gray-50"
                style={{ borderRadius: 5 }}
              >
                <option value="">{isLoadingProducts ? "Memuat..." : "Pilih layanan"}</option>
                {products.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name} — {formatRupiah(p.sellingPrice)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">No. HP / ID Pelanggan</p>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Masukan Nomor"
                inputMode="numeric"
                className="w-full px-2 py-2 border border-gray-200 text-xs focus:outline-none focus:border-[#10B981]"
                style={{ borderRadius: 5 }}
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Total Bayar</p>
                <p className="px-2 py-2 text-xs font-bold text-gray-700 border border-gray-200 bg-gray-50" style={{ borderRadius: 5 }}>
                  {selected ? formatRupiah(selected.sellingPrice) : "—"}
                </p>
              </div>
              <button
                onClick={buy}
                disabled={busy || !customerId.trim() || !productId}
                className="px-4 py-2 bg-[#10B981] text-white text-xs font-semibold hover:bg-[#0EA371] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: 5 }}
              >
                {busy ? "Memproses..." : selected ? "Beli" : "Bayar"}
              </button>
            </div>
          </div>
        </>
      )}

      <button
        onClick={requireLogin}
        className="mt-3 text-xs font-semibold text-[#10B981] hover:underline"
      >
        Belum punya akun? Masuk untuk transaksi.
      </button>
    </div>
  );
}

export function CategorySection() {
  const categoriesQuery = useCategoriesMenu();
  const quickLinks = useMemo(
    () => flattenCategories(categoriesQuery.data?.data || []).slice(0, 7),
    [categoriesQuery.data],
  );

  const [activeTab, setActiveTab] = useState(0);
  const TABS = ["Pulsa", "Paket Data", "Listrik PLN", "Roaming"];

  return (
    <div
      className="bg-white border border-gray-100 p-4"
      style={{ borderRadius: 5 }}
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.15fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-100"
        style={{ borderRadius: 5 }}
      >
        <div className="p-5">
          <h3 className="text-base font-bold mb-3">Kategori Populer</h3>

          <div
            className="relative overflow-hidden flex items-center justify-between px-6 py-4 mb-0"
            style={{
              borderRadius: 5,
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              minHeight: 96,
            }}
          >
            <div className="text-white z-10">
              <p className="text-xs font-semibold opacity-90">
                Yuk, belanja di Tokopedia
              </p>
              <p className="text-xs opacity-75 mb-3">
                Barang lengkap dari beragam kategori
              </p>
              <button
                className="px-4 py-1.5 border border-white/60 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                style={{ borderRadius: 5 }}
              >
                Cek Sekarang
              </button>
            </div>

            <div className="absolute right-4 bottom-0 opacity-90">
              <span className="material-symbols-outlined text-[52px]">
                shopping_bag
              </span>
            </div>
          </div>

          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`mt-2 w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${
                activeTab === i ? "bg-[#10B981]/10 text-[#10B981]" : "text-gray-600 hover:bg-gray-50"
              }`}
              style={{ borderRadius: 5 }}
            >
              {tab}
            </button>
          ))}
        </div>

        <TopUpSection />
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {quickLinks.map((item) => (
          <Link
            key={item.id || item.slug}
            to={getCategoryHref(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-xs text-gray-700 hover:border-[#10B981] hover:text-[#10B981] transition-colors whitespace-nowrap flex-shrink-0"
            style={{ borderRadius: 20 }}
          >
            <span className="material-symbols-outlined text-[14px] text-[#10B981]">
              category
            </span>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
