export const chatThreads = [
  {
    id: "chat-1",
    store: "Saganext Official Store",
    initials: "SO",
    avatar: "from-orange-400 to-pink-500",
    status: "online",
    lastMessage: "Pesanan kamu sudah kami siapkan untuk pickup kurir hari ini.",
    unread: 2,
    time: "08:12",
    messages: [
      { id: "m1", sender: "store", text: "Halo Kak, ukuran 42 masih tersedia.", time: "07:58" },
      { id: "m2", sender: "me", text: "Baik, saya checkout sekarang ya.", time: "08:01" },
      { id: "m3", sender: "store", text: "Pesanan kamu sudah kami siapkan untuk pickup kurir hari ini.", time: "08:12" },
    ],
  },
  {
    id: "chat-2",
    store: "Nusa Elektronik",
    initials: "NE",
    avatar: "from-blue-500 to-cyan-400",
    status: "offline",
    lastMessage: "Garansi resmi distributor 1 tahun ya Kak.",
    unread: 0,
    time: "Kemarin",
    messages: [
      { id: "m1", sender: "me", text: "Apakah produk ini garansi resmi?", time: "19:20" },
      { id: "m2", sender: "store", text: "Garansi resmi distributor 1 tahun ya Kak.", time: "19:24" },
    ],
  },
  {
    id: "chat-3",
    store: "Rumah Cantik",
    initials: "RC",
    avatar: "from-rose-400 to-fuchsia-500",
    status: "online",
    lastMessage: "Untuk shade natural beige estimasi restock minggu depan.",
    unread: 0,
    time: "Senin",
    messages: [
      { id: "m1", sender: "store", text: "Untuk shade natural beige estimasi restock minggu depan.", time: "10:22" },
    ],
  },
  {
    id: "chat-4",
    store: "CS Marketplace",
    initials: "CS",
    avatar: "from-emerald-500 to-green-600",
    status: "online",
    lastMessage: "Pengajuan komplain kamu sedang diproses oleh tim kami.",
    unread: 1,
    time: "Jumat",
    messages: [
      { id: "m1", sender: "store", text: "Pengajuan komplain kamu sedang diproses oleh tim kami.", time: "14:03" },
      { id: "m2", sender: "me", text: "Baik, saya tunggu update berikutnya.", time: "14:05" },
    ],
  },
];

export async function getProfileChatThreads() {
  return chatThreads;
}
