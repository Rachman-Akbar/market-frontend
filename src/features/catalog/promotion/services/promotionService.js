const promotionRows = [
  {
    id: "promo-payday",
    title: "Payday Sale",
    subtitle: "Diskon hingga 60% untuk produk pilihan rumah tangga dan elektronik",
    badge: "Berakhir 23:59",
    cta: "Belanja Sekarang",
    image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=900&q=80",
    href: "/search?q=payday%20sale",
    color: "from-emerald-600 to-lime-500",
  },
  {
    id: "promo-free-shipping",
    title: "Gratis Ongkir Nasional",
    subtitle: "Nikmati pengiriman hemat dari official store pilihan",
    badge: "Voucher terbatas",
    cta: "Ambil Voucher",
    image: "https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?auto=format&fit=crop&w=900&q=80",
    href: "/search?q=gratis%20ongkir",
    color: "from-sky-600 to-teal-500",
  },
  {
    id: "promo-local-brand",
    title: "Bangga Brand Lokal",
    subtitle: "Produk lokal kurasi terbaik dengan kualitas premium",
    badge: "Kurasi editor",
    cta: "Lihat Pilihan",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    href: "/search?q=brand%20lokal",
    color: "from-slate-800 to-emerald-700",
  },
];

export async function getPromotionHighlights() {
  return promotionRows;
}
