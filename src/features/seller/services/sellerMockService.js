export const sellerMetrics = [
  { key: "sales", label: "Penjualan Bulan Ini", value: "Rp428,6jt", change: "+14,2%", icon: "payments" },
  { key: "orders", label: "Pesanan Baru", value: "642", change: "+8,7%", icon: "local_shipping" },
  { key: "rating", label: "Rating Toko", value: "4,92", change: "+0,03", icon: "star" },
  { key: "conversion", label: "Konversi Produk", value: "7,8%", change: "+1,1%", icon: "trending_up" },
];

export const sellerOrders = [
  { id: "SO-260708-091", buyer: "Rara Amelia", product: "Sepatu Phoenix Running", qty: 2, total: "Rp324.000", status: "Perlu Dikirim", courier: "JNE REG" },
  { id: "SO-260708-087", buyer: "Dimas Nugroho", product: "Tas Ransel Urban Lite", qty: 1, total: "Rp219.000", status: "Siap Pickup", courier: "SiCepat BEST" },
  { id: "SO-260707-733", buyer: "Fitri Handayani", product: "Jaket Windbreaker Sage", qty: 1, total: "Rp389.000", status: "Dikirim", courier: "Anteraja" },
  { id: "SO-260707-710", buyer: "Naufal Rizqi", product: "Sneakers Flex Knit", qty: 1, total: "Rp259.000", status: "Selesai", courier: "JNE REG" },
];

export const sellerProducts = [
  { id: "PRD-001", name: "Sepatu Phoenix Running", sku: "PHX-RUN-37", stock: 128, price: 162000, sold: 1840, status: "active", category: "Sepatu Olahraga", rating: 4.9 },
  { id: "PRD-002", name: "Tas Ransel Urban Lite", sku: "BAG-URB-20L", stock: 76, price: 219000, sold: 932, status: "active", category: "Tas Pria", rating: 4.8 },
  { id: "PRD-003", name: "Jaket Windbreaker Sage", sku: "JKT-WND-SG", stock: 24, price: 389000, sold: 412, status: "review", category: "Jaket", rating: 4.7 },
  { id: "PRD-004", name: "Sneakers Flex Knit", sku: "SNK-FLX-42", stock: 0, price: 259000, sold: 1201, status: "inactive", category: "Sneakers", rating: 4.6 },
];

export const sellerBanners = [
  { id: "BNR-001", title: "Mid Year Sport Sale", placement: "Store Hero", status: "active", ctr: "8,4%", startsAt: "2026-07-01", endsAt: "2026-07-15", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
  { id: "BNR-002", title: "New Arrival Urban Bag", placement: "Product Feed", status: "scheduled", ctr: "-", startsAt: "2026-07-16", endsAt: "2026-07-31", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80" },
  { id: "BNR-003", title: "Flash Deal Weekend", placement: "Voucher Strip", status: "inactive", ctr: "6,1%", startsAt: "2026-06-28", endsAt: "2026-06-30", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" },
];

export const sellerStoreProfile = {
  name: "Saganext Official Store",
  slug: "saganext-official",
  city: "Jakarta Selatan",
  rating: 4.92,
  followers: 18420,
  responseRate: "96%",
  joinedAt: "2024-02-12",
  status: "Verified Seller",
  description: "Official store untuk kebutuhan fashion sport, sneakers, tas, dan apparel harian dengan pengiriman cepat dari Jakarta.",
  operationHours: "Senin - Sabtu, 08:00 - 20:00",
  warehouse: "Gudang Saganext Kemang",
};

export async function getSellerDashboardData() {
  return {
    metrics: sellerMetrics,
    orders: sellerOrders,
  };
}

export async function getSellerProducts() {
  return sellerProducts;
}

export async function getSellerBanners() {
  return sellerBanners;
}

export async function getSellerStoreProfile() {
  return sellerStoreProfile;
}
