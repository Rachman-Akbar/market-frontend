export const catalogGroups = [
  { id: "elektronik", slug: "elektronik", name: "Elektronik", icon: "📱" },
  { id: "fashion", slug: "fashion", name: "Fashion", icon: "👕" },
  { id: "dapur", slug: "dapur", name: "Dapur", icon: "🍳" },
  { id: "kesehatan", slug: "kesehatan", name: "Kesehatan", icon: "💊" },
  { id: "olahraga", slug: "olahraga", name: "Olahraga", icon: "🏃" },
  { id: "otomotif", slug: "otomotif", name: "Otomotif", icon: "🚗" },
  { id: "hobi", slug: "hobi", name: "Hobi", icon: "🎮" },
  { id: "rumah", slug: "rumah", name: "Rumah", icon: "🏠" },
];

export const mockAddresses = [
  {
    id: "addr-1",
    label: "Rumah",
    recipientName: "Guest User",
    phone: "0812-3456-7890",
    street: "Jl. Merdeka No. 10",
    city: "Jakarta Pusat",
    province: "DKI Jakarta",
    postalCode: "10110",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Kantor",
    recipientName: "Guest User",
    phone: "0812-3456-7890",
    street: "Jl. Sudirman Kav. 52",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12190",
    isDefault: false,
  },
];

export const shippingOptions = [
  { id: "jne-reg", courier: "JNE", service: "REG", estimatedDays: "2-3 hari", price: 18000 },
  { id: "sicepat-best", courier: "SiCepat", service: "BEST", estimatedDays: "1 hari", price: 26000 },
  { id: "gosend-instant", courier: "GoSend", service: "Instant", estimatedDays: "3 jam", price: 32000 },
];

export const mockOrders = [
  {
    id: "ORD-2026-0001",
    createdAt: "2026-07-01T09:30:00.000Z",
    status: "pending",
    shippingMethod: "JNE REG",
    total: 180000,
    items: [
      {
        productId: "sepatu-phoenix",
        variantId: "citroen-37",
        productName: "Sepatu Saganext Phoenix Running Ringan TPU Plat Series",
        variantLabel: "PHOENIX Citroen, 37",
        storeName: "Saganext",
        price: 162000,
        quantity: 1,
      },
    ],
  },
];
