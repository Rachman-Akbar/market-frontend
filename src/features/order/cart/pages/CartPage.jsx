import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  MessageSquareText,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Ticket,
  Trash2,
} from "lucide-react";
import { useCart } from "@/features/order/cart/context/CartContext";
import { CartItemRow } from "@/features/order/cart/components/CartItemRow";
import { formatPrice } from "@/shared/utils/utils";

const tabs = [
  { key: "wishlist", label: "Wishlist" },
  { key: "cart", label: "Cart" },
  { key: "order", label: "Order" },
  { key: "review", label: "Review" },
];

const sortOptions = [
  { value: "latest", label: "Terbaru" },
  { value: "priceHigh", label: "Harga Tertinggi" },
  { value: "priceLow", label: "Harga Terendah" },
  { value: "popular", label: "Terpopuler" },
];

const dummyCartItems = [
  {
    productId: "K90-PRO",
    variantId: "black-blue",
    productName: "Mechanical Keyboard K90 Pro - Stealth Black Wireless RGB",
    variantLabel: "Cherry MX Blue",
    storeName: "TechGear Official",
    price: 1450000,
    quantity: 1,
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=300&q=80",
  },
  {
    productId: "SONY-XM5",
    variantId: "silver",
    productName: "Sony WH-1000XM5 Wireless Noise Canceling Headphones - Silver",
    variantLabel: "Silver",
    storeName: "AudioLuxe Jakarta",
    price: 4299000,
    quantity: 1,
    stock: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80",
  },
  {
    productId: "SPEAKER-S3",
    variantId: "matte-gray",
    productName: "Portable Bluetooth Speaker Mini S3",
    variantLabel: "Matte Gray",
    storeName: "AudioLuxe Jakarta",
    price: 450000,
    quantity: 1,
    stock: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=300&q=80",
  },
];

const dummyWishlistItems = [
  {
    id: "WL-001",
    productName: "Smartwatch Active Pro dengan AMOLED Display",
    storeName: "WearHub Official",
    price: 899000,
    previousPrice: 1299000,
    imageUrl:
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=300&q=80",
    badge: "Diskon 31%",
  },
  {
    id: "WL-002",
    productName: "Premium Slim Backpack Anti Air untuk Laptop 15 Inch",
    storeName: "Urban Daily Store",
    price: 325000,
    previousPrice: 450000,
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80",
    badge: "Banyak Dicari",
  },
  {
    id: "WL-003",
    productName: "Desk Lamp Minimalis Touch Control Warm White",
    storeName: "HomeLight Studio",
    price: 189000,
    previousPrice: 240000,
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=80",
    badge: "Stok Terbatas",
  },
];

const dummyOrders = [
  {
    id: "ORD-2026-00091",
    date: "8 Juli 2026",
    storeName: "TechGear Official",
    status: "Selesai",
    productName: "USB-C Hub 9 in 1 Aluminum Series",
    variantLabel: "Space Gray",
    quantity: 1,
    total: 389000,
    imageUrl:
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "ORD-2026-00088",
    date: "6 Juli 2026",
    storeName: "AudioLuxe Jakarta",
    status: "Dikirim",
    productName: "Wireless Earbuds Neo Bass ANC",
    variantLabel: "Pearl White",
    quantity: 1,
    total: 749000,
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "ORD-2026-00077",
    date: "2 Juli 2026",
    storeName: "Urban Daily Store",
    status: "Diproses",
    productName: "Organizer Pouch Premium Travel Pack",
    variantLabel: "Black",
    quantity: 2,
    total: 258000,
    imageUrl:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=300&q=80",
  },
];

const dummyReviews = [
  {
    id: "RV-001",
    productName: "Mechanical Keyboard K90 Pro",
    reviewer: "Raka Pratama",
    rating: 5,
    date: "4 minggu lalu",
    variantLabel: "Cherry MX Blue",
    content:
      "Build quality terasa premium, koneksi stabil, dan suara switch sangat solid untuk kerja harian maupun gaming.",
    imageUrl:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "RV-002",
    productName: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    reviewer: "Nadya Kirana",
    rating: 5,
    date: "2 minggu lalu",
    variantLabel: "Silver",
    content:
      "Noise canceling sangat nyaman, ringan dipakai lama, dan packaging rapi. Cocok untuk meeting dan perjalanan.",
    imageUrl:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80",
  },
];

function getItemKey(item) {
  return `${item.productId}-${item.variantId || "default"}`;
}

function getItemAmount(item) {
  return item.price * (item.quantity || 1);
}

function sortByOption(list, sortBy) {
  const rows = [...list];

  if (sortBy === "priceHigh") {
    return rows.sort((a, b) => (b.price || b.total || 0) - (a.price || a.total || 0));
  }

  if (sortBy === "priceLow") {
    return rows.sort((a, b) => (a.price || a.total || 0) - (b.price || b.total || 0));
  }

  return rows;
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold leading-8 text-[#181c1f]">{title}</h2>
      <p className="mt-1 text-sm leading-5 text-[#5f5e5e]">{description}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-[#e0e3e7] bg-white px-6 text-center shadow-sm">
      <Icon size={56} className="mb-4 text-[#bccabc]" />
      <h3 className="text-lg font-bold text-[#181c1f]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#5f5e5e]">{description}</p>
    </div>
  );
}

function SortDropdown({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-[#bccabc] bg-white px-4 pr-10 text-sm text-[#181c1f] shadow-sm outline-none transition focus:border-[#006d38] focus:ring-1 focus:ring-[#00aa5b] sm:w-[190px]"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            Sort By: {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#5f5e5e]"
      />
    </div>
  );
}

function TabNavigation({ activeTab, onChange }) {
  return (
    <nav className="mb-6 flex items-center gap-10 overflow-x-auto border-b border-transparent pb-1">
      {tabs.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`whitespace-nowrap py-2 text-base transition-all duration-300 ${
              active
                ? "border-b-2 border-[#00aa5b] font-bold text-[#006d38]"
                : "border-b-2 border-transparent text-[#5f5e5e] hover:text-[#006d38]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function StoreGroup({ storeName, items, selectedKeys, onToggleStore, onToggleItem, onDecrease, onIncrease, onRemove }) {
  const allChecked = items.every((item) => selectedKeys.includes(getItemKey(item)));

  return (
    <div className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#ebeef2] pb-3">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={() => onToggleStore(items)}
          className="h-5 w-5 rounded border-[#6d7b6e] text-[#006d38] focus:ring-[#00aa5b]"
        />
        <Store size={20} className="text-[#00aa5b]" />
        <span className="text-base font-bold text-[#181c1f]">{storeName}</span>
        {storeName.toLowerCase().includes("official") ? (
          <span className="rounded bg-[#76fca3] px-2 py-0.5 text-[10px] font-bold text-[#005229]">
            PRO
          </span>
        ) : null}
      </div>

      <div className="divide-y divide-[#ebeef2]">
        {items.map((item) => (
          <CartItemRow
            key={getItemKey(item)}
            item={item}
            checked={selectedKeys.includes(getItemKey(item))}
            onToggle={onToggleItem}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function CartSummary({ selectedItems, onCheckout, voucherCode, onVoucherCodeChange }) {
  const itemCount = selectedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + getItemAmount(item), 0);
  const shipping = itemCount ? 25000 : 0;
  const discount = itemCount ? 50000 : 0;
  const total = Math.max(subtotal + shipping - discount, 0);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm">
        <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-[#181c1f]">
          <Ticket size={20} className="text-[#00aa5b]" />
          Pakai Promo/Voucher
        </h4>
        <div className="flex gap-2">
          <input
            value={voucherCode}
            onChange={(event) => onVoucherCodeChange(event.target.value)}
            placeholder="Masukkan kode promo"
            className="h-10 min-w-0 flex-1 rounded-lg border border-[#bccabc] bg-[#f7fafe] px-4 text-sm outline-none transition focus:border-[#006d38] focus:ring-1 focus:ring-[#00aa5b]"
          />
          <button
            type="button"
            className="h-10 rounded-lg bg-[#00aa5b] px-4 text-sm font-bold text-white transition hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm">
        <h4 className="mb-5 text-base font-bold text-[#181c1f]">Ringkasan Belanja</h4>
        <div className="space-y-3 text-sm text-[#5f5e5e]">
          <div className="flex justify-between gap-4">
            <span>Subtotal ({itemCount} barang)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Ongkos Kirim</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[#006d38]">
            <span>Diskon Voucher</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        </div>
        <hr className="my-5 border-[#e0e3e7]" />
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="text-lg font-bold text-[#181c1f]">Total Pembayaran</span>
          <span className="text-2xl font-semibold text-[#006d38]">{formatPrice(total)}</span>
        </div>
        <button
          type="button"
          disabled={!selectedItems.length}
          onClick={onCheckout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00aa5b] py-3 text-lg font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Lanjut ke Pembayaran
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="px-2 text-center text-[10px] leading-5 text-[#474746]">
        <ShieldCheck size={13} className="mr-1 inline align-[-2px]" />
        Transaksi Anda aman dan terlindungi. MarketPremium menjamin keamanan data dan pembayaran Anda.
      </div>
    </aside>
  );
}

function CartTab({ items, selectedKeys, onToggleAll, onToggleStore, onToggleItem, onDecrease, onIncrease, onRemove, onClear, onCheckout, voucherCode, onVoucherCodeChange }) {
  const selectedItems = items.filter((item) => selectedKeys.includes(getItemKey(item)));
  const storeGroups = useMemo(() => {
    return items.reduce((acc, item) => {
      const key = item.storeName || "MarketPremium Store";
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});
  }, [items]);

  if (!items.length) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Cart kosong"
        description="Tambahkan produk pilihanmu agar bisa diproses ke pembayaran dari halaman ini."
      />
    );
  }

  return (
    <div className="grid grid-cols-12 items-start gap-6">
      <div className="col-span-12 space-y-4 lg:col-span-8">
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedKeys.length === items.length}
              onChange={onToggleAll}
              className="h-5 w-5 rounded border-[#6d7b6e] text-[#006d38] focus:ring-[#00aa5b]"
            />
            <span className="text-base font-semibold text-[#181c1f]">
              Pilih Semua ({items.length} Barang)
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-2 text-sm font-semibold text-[#ba1a1a] transition hover:underline"
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>

        {Object.entries(storeGroups).map(([storeName, storeItems]) => (
          <StoreGroup
            key={storeName}
            storeName={storeName}
            items={storeItems}
            selectedKeys={selectedKeys}
            onToggleStore={onToggleStore}
            onToggleItem={onToggleItem}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="col-span-12 lg:col-span-4">
        <CartSummary
          selectedItems={selectedItems}
          onCheckout={onCheckout}
          voucherCode={voucherCode}
          onVoucherCodeChange={onVoucherCodeChange}
        />
      </div>
    </div>
  );
}

function WishlistTab({ items }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={Heart}
        title="Wishlist kosong"
        description="Simpan produk favoritmu agar lebih mudah ditemukan saat ingin checkout."
      />
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 space-y-4 lg:col-span-8">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm">
            <div className="flex gap-4">
              <img src={item.imageUrl} alt={item.productName} className="h-24 w-24 flex-shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[#76fca3] px-2 py-0.5 text-[10px] font-bold text-[#005229]">
                    {item.badge}
                  </span>
                  <span className="text-xs text-[#5f5e5e]">{item.storeName}</span>
                </div>
                <h3 className="line-clamp-2 text-base font-semibold text-[#181c1f]">{item.productName}</h3>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold text-[#006d38]">{formatPrice(item.price)}</p>
                    <p className="text-sm text-[#5f5e5e] line-through">{formatPrice(item.previousPrice)}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-[#00aa5b] px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    Masukkan Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="col-span-12 lg:col-span-4">
        <div className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <h4 className="text-base font-bold text-[#181c1f]">Ringkasan Wishlist</h4>
          <hr className="my-4 border-[#e0e3e7]" />
          <div className="space-y-3 text-sm text-[#5f5e5e]">
            <div className="flex justify-between">
              <span>Total produk</span>
              <span>{items.length} item</span>
            </div>
            <div className="flex justify-between">
              <span>Estimasi nilai</span>
              <span>{formatPrice(items.reduce((sum, item) => sum + item.price, 0))}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function OrderTab({ items }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={PackageCheck}
        title="Order belum tersedia"
        description="Pesanan yang sedang berjalan dan riwayat pembelian akan muncul di tab ini."
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((order) => (
        <div key={order.id} className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#ebeef2] pb-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#181c1f]">{order.id}</p>
              <p className="mt-1 text-xs text-[#5f5e5e]">{order.date}</p>
            </div>
            <span className="w-fit rounded-full bg-[#e5e8ec] px-3 py-1 text-xs font-bold text-[#3d4a3f]">
              {order.status}
            </span>
          </div>
          <div className="flex gap-4 py-4">
            <img src={order.imageUrl} alt={order.productName} className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="mb-1 flex items-center gap-2 text-sm font-bold text-[#181c1f]">
                <Store size={16} className="text-[#00aa5b]" />
                {order.storeName}
              </p>
              <h3 className="line-clamp-2 text-base font-semibold text-[#181c1f]">{order.productName}</h3>
              <p className="mt-1 text-sm text-[#5f5e5e]">
                Variant: {order.variantLabel} x{order.quantity}
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm text-[#5f5e5e]">Total</p>
              <p className="text-lg font-bold text-[#006d38]">{formatPrice(order.total)}</p>
            </div>
          </div>
          <hr className="border-[#ebeef2]" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#5f5e5e]">
              Pesanan dari {order.storeName} tersusun sesuai urutan terbaru.
            </p>
            <button
              type="button"
              className="rounded-lg border border-[#bccabc] bg-white px-4 py-2 text-sm font-bold text-[#006d38] transition hover:border-[#006d38]"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={15}
          className={index < rating ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#bccabc]"}
        />
      ))}
    </div>
  );
}

function ReviewTab({ items }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title="Review belum tersedia"
        description="Ulasan pembelian yang sudah selesai akan ditampilkan di tab ini."
      />
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-12 lg:col-span-4">
        <div className="rounded-xl border border-[#e0e3e7] bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <Star size={42} className="fill-[#f59e0b] text-[#f59e0b]" />
            <div>
              <p className="text-5xl font-bold text-[#181c1f]">
                4.8<span className="ml-1 text-lg font-normal text-[#5f5e5e]">/ 5.0</span>
              </p>
              <p className="mt-2 text-sm font-bold text-[#181c1f]">96% pembeli merasa puas</p>
              <p className="mt-1 text-sm text-[#5f5e5e]">2096 rating • 1230 ulasan</p>
            </div>
          </div>
          <hr className="my-5 border-[#e0e3e7]" />
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const width = [86, 11, 2, 1, 1][index];

              return (
                <div key={rating} className="flex items-center gap-2 text-xs text-[#5f5e5e]">
                  <Star size={14} className="fill-[#f59e0b] text-[#f59e0b]" />
                  <span className="w-3">{rating}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ebeef2]">
                    <div className="h-full rounded-full bg-[#006d38]" style={{ width: `${width}%` }} />
                  </div>
                  <span className="w-8 text-right">{width}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="col-span-12 space-y-4 lg:col-span-8">
        {items.map((review) => (
          <div key={review.id} className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm">
            <div className="flex gap-4">
              <img src={review.imageUrl} alt={review.productName} className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-[#5f5e5e]">{review.date}</span>
                </div>
                <h3 className="line-clamp-1 text-base font-bold text-[#181c1f]">{review.productName}</h3>
                <p className="mt-1 text-xs text-[#5f5e5e]">
                  {review.reviewer} • Variant: {review.variantLabel}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#181c1f]">{review.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { items: contextItems, updateQty, removeItem, clearCart } = useCart();
  const [activeTab, setActiveTab] = useState("cart");
  const [sortBy, setSortBy] = useState("latest");
  const [voucherCode, setVoucherCode] = useState("");
  const [dummyItems, setDummyItems] = useState(dummyCartItems);

  const isUsingContextItems = contextItems.length > 0;
  const cartItems = isUsingContextItems ? contextItems : dummyItems;
  const sortedCartItems = useMemo(() => sortByOption(cartItems, sortBy), [cartItems, sortBy]);
  const wishlistItems = useMemo(() => sortByOption(dummyWishlistItems, sortBy), [sortBy]);
  const orderItems = useMemo(() => sortByOption(dummyOrders, sortBy), [sortBy]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    setSelectedKeys(sortedCartItems.map(getItemKey));
  }, [sortedCartItems]);

  const selectedItems = sortedCartItems.filter((item) => selectedKeys.includes(getItemKey(item)));
  const selectedCount = selectedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleToggleAll = () => {
    setSelectedKeys((current) => {
      if (current.length === sortedCartItems.length) return [];
      return sortedCartItems.map(getItemKey);
    });
  };

  const handleToggleStore = (storeItems) => {
    const storeKeys = storeItems.map(getItemKey);
    const allChecked = storeKeys.every((key) => selectedKeys.includes(key));

    setSelectedKeys((current) => {
      if (allChecked) return current.filter((key) => !storeKeys.includes(key));
      return Array.from(new Set([...current, ...storeKeys]));
    });
  };

  const handleToggleItem = (itemKey) => {
    setSelectedKeys((current) => {
      if (current.includes(itemKey)) return current.filter((key) => key !== itemKey);
      return [...current, itemKey];
    });
  };

  const handleDummyQty = (item, quantity) => {
    setDummyItems((current) =>
      current
        .map((row) => (getItemKey(row) === getItemKey(item) ? { ...row, quantity } : row))
        .filter((row) => row.quantity > 0)
    );
  };

  const handleDecrease = (item) => {
    const nextQty = (item.quantity || 1) - 1;

    if (isUsingContextItems) {
      if (nextQty <= 0) {
        removeItem(item.productId, item.variantId);
        return;
      }
      updateQty(item.productId, item.variantId, nextQty);
      return;
    }

    handleDummyQty(item, nextQty);
  };

  const handleIncrease = (item) => {
    const nextQty = (item.quantity || 1) + 1;

    if (isUsingContextItems) {
      updateQty(item.productId, item.variantId, nextQty);
      return;
    }

    handleDummyQty(item, nextQty);
  };

  const handleRemove = (item) => {
    if (isUsingContextItems) {
      removeItem(item.productId, item.variantId);
      return;
    }

    setDummyItems((current) => current.filter((row) => getItemKey(row) !== getItemKey(item)));
  };

  const handleClear = () => {
    if (isUsingContextItems) {
      clearCart();
      return;
    }

    setDummyItems([]);
  };

  return (
    <div className="min-h-screen bg-[#f7fafe] text-[#181c1f]">
      <main className="mx-auto max-w-[1280px] px-5 py-6">
        <TabNavigation activeTab={activeTab} onChange={setActiveTab} />

        <section className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeader
            title="MarketPremium Activity"
            description="Kelola wishlist, cart, order, dan review dalam satu layout utama yang mengikuti referensi HTML."
          />
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </section>

        <div className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {activeTab === "wishlist" ? <WishlistTab items={wishlistItems} /> : null}

          {activeTab === "cart" ? (
            <CartTab
              items={sortedCartItems}
              selectedKeys={selectedKeys}
              onToggleAll={handleToggleAll}
              onToggleStore={handleToggleStore}
              onToggleItem={handleToggleItem}
              onDecrease={handleDecrease}
              onIncrease={handleIncrease}
              onRemove={handleRemove}
              onClear={handleClear}
              onCheckout={() => navigate("/checkout")}
              voucherCode={voucherCode}
              onVoucherCodeChange={setVoucherCode}
            />
          ) : null}

          {activeTab === "order" ? <OrderTab items={orderItems} /> : null}
          {activeTab === "review" ? <ReviewTab items={dummyReviews} /> : null}
        </div>

        {activeTab === "cart" && sortedCartItems.length ? (
          <div className="mt-6 lg:hidden">
            <button
              type="button"
              disabled={!selectedCount}
              onClick={() => navigate("/checkout")}
              className="w-full rounded-xl bg-[#00aa5b] py-5 text-2xl font-bold text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
