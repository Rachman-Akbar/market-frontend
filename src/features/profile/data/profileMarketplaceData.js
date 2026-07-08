export const profileAddresses = [
  {
    id: "addr-1",
    label: "Rumah",
    receiver: "Mochammad Rifqi",
    phone: "+62 815-5376-9480",
    address: "Jl. Mooding 2222, Kebayoran Baru, Jakarta Selatan",
    note: "Patokan pagar hitam dekat minimarket",
    primary: true,
    pinpoint: true,
  },
  {
    id: "addr-2",
    label: "Kantor",
    receiver: "Rifqi Marketplace",
    phone: "+62 812-1111-2200",
    address: "Jl. Sudirman Kav. 52, Jakarta Pusat",
    note: "Titip resepsionis lantai 8",
    primary: false,
    pinpoint: true,
  },
];

export const securityDevices = [
  {
    id: "device-1",
    name: "Chrome di Windows 10",
    meta: "140.213.187.138",
    status: "Sedang aktif",
    type: "desktop",
  },
  {
    id: "device-2",
    name: "Chrome di Android 10",
    meta: "114.5.241.21",
    status: "Kemarin",
    type: "mobile",
  },
  {
    id: "device-3",
    name: "Safari di iPhone",
    meta: "36.72.111.90",
    status: "3 hari lalu",
    type: "mobile",
  },
];

export const profileNotifications = [
  {
    id: "notif-1",
    title: "Transaksi Berhasil",
    description: "Pembayaran pesanan SPX-240702 berhasil dan sedang diteruskan ke penjual.",
    detail: "Pembayaran melalui ShopeePay telah berhasil diverifikasi. Pesanan akan masuk proses pengemasan maksimal hari ini pukul 18.00.",
    time: "2 mnt",
    category: "Transaksi",
    status: "unread",
    tone: "success",
  },
  {
    id: "notif-2",
    title: "Voucher Baru Tersedia",
    description: "Kamu mendapatkan voucher gratis ongkir untuk pembelian berikutnya.",
    detail: "Voucher gratis ongkir berlaku untuk minimal belanja Rp40.000 sampai 12 Juli 2026. Gunakan sebelum checkout agar potongan otomatis masuk.",
    time: "18 mnt",
    category: "Promo",
    status: "unread",
    tone: "warning",
  },
  {
    id: "notif-3",
    title: "Pesanan Dalam Pengiriman",
    description: "Kurir sedang mengantar paket dari Saganext Official Store.",
    detail: "Paket sudah keluar dari hub Jakarta Selatan pada 08:41. Estimasi tiba hari ini pukul 13.00 - 16.00.",
    time: "1 jam",
    category: "Pengiriman",
    status: "read",
    tone: "info",
  },
  {
    id: "notif-4",
    title: "Aktivitas Login Baru",
    description: "Akun kamu baru saja login dari perangkat Chrome Windows.",
    detail: "Login terdeteksi dari Chrome Windows 10. Bila ini bukan kamu, segera ubah kata sandi dan keluar dari semua perangkat.",
    time: "Kemarin",
    category: "Keamanan",
    status: "read",
    tone: "danger",
  },
];

export const groupThreads = [
  {
    id: "group-1",
    name: "Komunitas Flash Sale",
    initials: "FS",
    avatar: "from-orange-500 to-rose-500",
    memberCount: 128,
    status: "Aktif sekarang",
    lastMessage: "Admin: Flash sale jam 12.00 sudah dibuka, cek voucher toko ya.",
    unread: 7,
    time: "10:02",
    messages: [
      { id: "gm-1", sender: "Admin", role: "store", text: "Flash sale jam 12.00 sudah dibuka, cek voucher toko ya.", time: "09:58" },
      { id: "gm-2", sender: "Rani", role: "store", text: "Voucher gratis ongkir masih bisa digabung cashback kan?", time: "10:00" },
      { id: "gm-3", sender: "Saya", role: "me", text: "Aku coba checkout setelah produk masuk keranjang.", time: "10:02" },
    ],
  },
  {
    id: "group-2",
    name: "Buyer Gadget ID",
    initials: "BG",
    avatar: "from-sky-500 to-cyan-400",
    memberCount: 86,
    status: "24 anggota online",
    lastMessage: "Dimas: Garansi distributor biasanya 1 tahun.",
    unread: 3,
    time: "Kemarin",
    messages: [
      { id: "gm-1", sender: "Dimas", role: "store", text: "Garansi distributor biasanya 1 tahun.", time: "19:12" },
      { id: "gm-2", sender: "Saya", role: "me", text: "Berarti aman untuk pembelian laptop second ya?", time: "19:14" },
    ],
  },
  {
    id: "group-3",
    name: "Beauty Deals Harian",
    initials: "BD",
    avatar: "from-pink-500 to-fuchsia-500",
    memberCount: 211,
    status: "Ramai hari ini",
    lastMessage: "Nisa: Shade natural beige restock minggu depan.",
    unread: 0,
    time: "Senin",
    messages: [
      { id: "gm-1", sender: "Nisa", role: "store", text: "Shade natural beige restock minggu depan.", time: "14:08" },
      { id: "gm-2", sender: "Saya", role: "me", text: "Aku aktifkan pengingat restock dulu.", time: "14:10" },
    ],
  },
  {
    id: "group-4",
    name: "Seller Support Center",
    initials: "SS",
    avatar: "from-emerald-500 to-teal-500",
    memberCount: 42,
    status: "Tim support online",
    lastMessage: "CS: Pengajuan komplain akan dicek maksimal 1x24 jam.",
    unread: 1,
    time: "Jumat",
    messages: [
      { id: "gm-1", sender: "CS", role: "store", text: "Pengajuan komplain akan dicek maksimal 1x24 jam.", time: "15:31" },
      { id: "gm-2", sender: "Saya", role: "me", text: "Baik, bukti video sudah saya lampirkan.", time: "15:34" },
    ],
  },
];

export const paymentMethods = [
  { id: "pay-1", name: "ShopeePay", number: "Saldo aktif", status: "Utama", type: "wallet", active: true },
  { id: "pay-2", name: "BCA Virtual Account", number: "**** 9821", status: "Aktif", type: "card", active: false },
  { id: "pay-3", name: "QRIS", number: "Scan & Pay", status: "Aktif", type: "qris", active: false },
  { id: "pay-4", name: "Mandiri Transfer", number: "**** 7740", status: "Aktif", type: "bank", active: false },
];

export const paymentTransactions = [
  { id: "trx-1", date: "08 Jul 2026", description: "Pesanan SPX-240702", method: "ShopeePay", status: "Berhasil", total: "Rp 284.500" },
  { id: "trx-2", date: "07 Jul 2026", description: "Top Up ShopeePay", method: "BCA VA", status: "Berhasil", total: "Rp 1.000.000" },
  { id: "trx-3", date: "05 Jul 2026", description: "Refund pesanan", method: "Saldo", status: "Diproses", total: "Rp 75.000" },
  { id: "trx-4", date: "02 Jul 2026", description: "Pembayaran COD", method: "Tunai", status: "Berhasil", total: "Rp 118.900" },
];

export const vouchers = [
  { id: "v-1", title: "Gratis Ongkir XTRA", code: "ONGKIRXTRA", value: "Rp20.000", minimum: "Min. belanja Rp40.000", expiry: "Berlaku sampai 12 Jul 2026", category: "ongkir", status: "active" },
  { id: "v-2", title: "Cashback 15%", code: "CB15JULI", value: "15%", minimum: "Maks. cashback Rp35.000", expiry: "Berlaku sampai 15 Jul 2026", category: "cashback", status: "active" },
  { id: "v-3", title: "Diskon Elektronik", code: "ELEKTRONIK50", value: "Rp50.000", minimum: "Min. belanja Rp500.000", expiry: "Berlaku sampai 20 Jul 2026", category: "diskon", status: "active" },
  { id: "v-4", title: "Beauty Payday", code: "BEAUTYDAY", value: "25%", minimum: "Khusus produk beauty", expiry: "Berakhir 3 hari lagi", category: "diskon", status: "active" },
  { id: "v-5", title: "Voucher Toko Saganext", code: "SAGANEXT10", value: "10%", minimum: "Min. belanja Rp100.000", expiry: "Sudah digunakan", category: "toko", status: "used" },
];

export const orders = [
  { id: "ORD-240708-001", store: "Saganext Official Store", product: "Sneakers Urban Runner", status: "Dikemas", total: "Rp 284.500", date: "08 Jul 2026" },
  { id: "ORD-240707-014", store: "Nusa Elektronik", product: "Keyboard Mechanical RGB", status: "Dikirim", total: "Rp 519.000", date: "07 Jul 2026" },
  { id: "ORD-240705-088", store: "Rumah Cantik", product: "Serum Brightening 30ml", status: "Selesai", total: "Rp 118.900", date: "05 Jul 2026" },
];

export const wishlistItems = [
  { id: "wish-1", name: "Tas Selempang Casual", store: "Mode Harian", price: "Rp 89.000", tag: "Diskon 30%" },
  { id: "wish-2", name: "Headset Bluetooth Pro", store: "Nusa Elektronik", price: "Rp 249.000", tag: "Gratis Ongkir" },
  { id: "wish-3", name: "Jaket Windbreaker", store: "Saganext Official Store", price: "Rp 179.000", tag: "Flash Sale" },
];
