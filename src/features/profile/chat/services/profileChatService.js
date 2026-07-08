export const chatThreads = [
  {
    id: "chat-1",
    store: "Saganext Official Store",
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
    status: "online",
    lastMessage: "Untuk shade natural beige estimasi restock minggu depan.",
    unread: 0,
    time: "Senin",
    messages: [
      { id: "m1", sender: "store", text: "Untuk shade natural beige estimasi restock minggu depan.", time: "10:22" },
    ],
  },
];

export async function getProfileChatThreads() {
  return chatThreads;
}
