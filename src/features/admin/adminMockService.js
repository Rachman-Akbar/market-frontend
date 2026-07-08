export const adminStats = [
  { key: "gmv", label: "GMV Bulan Ini", value: "Rp2,84M", change: "+18,4%", tone: "emerald", icon: "monitoring" },
  { key: "orders", label: "Pesanan Masuk", value: "18.420", change: "+12,8%", tone: "blue", icon: "receipt_long" },
  { key: "sellers", label: "Seller Aktif", value: "1.248", change: "+6,2%", tone: "teal", icon: "storefront" },
  { key: "tickets", label: "Tiket Terbuka", value: "86", change: "-9,1%", tone: "amber", icon: "support_agent" },
];

export const adminRevenueSeries = [42, 56, 49, 70, 82, 78, 96, 116, 108, 132, 145, 164];

export const adminRecentOrders = [
  { id: "INV-260708-001", buyer: "Aulia Putri", seller: "Saganext Official", total: "Rp1.240.000", status: "Dibayar", channel: "Marketplace", createdAt: "2026-07-08T08:16:00" },
  { id: "INV-260708-002", buyer: "Riko Pratama", seller: "Nusa Elektronik", total: "Rp589.000", status: "Diproses", channel: "Mobile App", createdAt: "2026-07-08T08:04:00" },
  { id: "INV-260708-003", buyer: "Maya Sari", seller: "Rumah Cantik", total: "Rp238.500", status: "Review", channel: "Marketplace", createdAt: "2026-07-08T07:42:00" },
  { id: "INV-260707-992", buyer: "Bima Hartono", seller: "Urban Gadget", total: "Rp3.780.000", status: "Dikirim", channel: "Marketplace", createdAt: "2026-07-07T21:11:00" },
];

export const adminModerationQueue = [
  { id: "MOD-001", type: "Produk", title: "Smartwatch Fit Pro 12", owner: "Urban Gadget", priority: "Tinggi", status: "Butuh Review" },
  { id: "MOD-002", type: "Kategori", title: "Aksesoris Kamera Mirrorless", owner: "Admin Catalog", priority: "Normal", status: "Draft" },
  { id: "MOD-003", type: "Seller", title: "Verifikasi toko Maju Jaya", owner: "Seller Ops", priority: "Tinggi", status: "Menunggu Dokumen" },
];

export const adminCatalogGroups = [
  { id: 1, name: "Elektronik", slug: "elektronik", sortOrder: 1, categories: 36, products: 18420, status: "active", owner: "Catalog Ops", updatedAt: "2026-07-07" },
  { id: 2, name: "Fashion", slug: "fashion", sortOrder: 2, categories: 42, products: 22180, status: "active", owner: "Fashion Team", updatedAt: "2026-07-06" },
  { id: 3, name: "Rumah Tangga", slug: "rumah-tangga", sortOrder: 3, categories: 24, products: 9740, status: "active", owner: "Home Living", updatedAt: "2026-07-04" },
  { id: 4, name: "Hobi & Koleksi", slug: "hobi-koleksi", sortOrder: 4, categories: 18, products: 4210, status: "review", owner: "Catalog Ops", updatedAt: "2026-07-02" },
];

export const adminCategories = [
  { id: 101, group: "Elektronik", name: "Handphone & Tablet", slug: "handphone-tablet", level: 1, parent: "-", products: 6840, status: "active", visibility: "Menu utama" },
  { id: 102, group: "Elektronik", name: "Laptop", slug: "laptop", level: 1, parent: "-", products: 2150, status: "active", visibility: "Menu utama" },
  { id: 103, group: "Fashion", name: "Sepatu Pria", slug: "sepatu-pria", level: 2, parent: "Fashion Pria", products: 4680, status: "active", visibility: "Submenu" },
  { id: 104, group: "Rumah Tangga", name: "Peralatan Dapur", slug: "peralatan-dapur", level: 1, parent: "-", products: 1820, status: "active", visibility: "Menu utama" },
  { id: 105, group: "Hobi & Koleksi", name: "Diecast", slug: "diecast", level: 2, parent: "Koleksi", products: 720, status: "review", visibility: "Disembunyikan" },
];

export async function getAdminDashboardData() {
  return {
    stats: adminStats,
    revenueSeries: adminRevenueSeries,
    recentOrders: adminRecentOrders,
    moderationQueue: adminModerationQueue,
  };
}

export async function getAdminCatalogGroups() {
  return adminCatalogGroups;
}

export async function getAdminCategories() {
  return adminCategories;
}
