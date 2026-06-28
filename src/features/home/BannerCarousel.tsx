"use client";
import { useState } from "react";

const banners = [
  {
    gradient: "from-cyan-400 to-blue-500",
    title: "Mau transaksi lebih hemat?",
    subtitle: "Cek promo asyik Tokopedia!",
    cta: "Cek Sekarang",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClSUqqTCy3aeamjJO5o5nvT_XQNTUaA4j13uz0MCTSvucvDzF4E1eJjlXlAn4wcoXk0Qml-66-pmBkZ0c0YwWE5LvmDq-7HnABqy7Mh8tr6I0ID8352sYYzmevioiOWzIOwQ_WIWksYhmMWgh_ecWf0kfmGRGpYo3lqXOPwFthjBDyffgwVLbOJ5IbjkacJKK2Vclenoe9QKrMGTyfeiabQE6VLg3gqxBxZDmtmWSreEy4rZA7Y2MZM8HfLDllPma5FKV0Ej5SVySe",
  },
  {
    gradient: "from-green-400 to-emerald-600",
    title: "Flash Sale Hari Ini!",
    subtitle: "Diskon hingga 70% untuk produk pilihan",
    cta: "Belanja Sekarang",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClSUqqTCy3aeamjJO5o5nvT_XQNTUaA4j13uz0MCTSvucvDzF4E1eJjlXlAn4wcoXk0Qml-66-pmBkZ0c0YwWE5LvmDq-7HnABqy7Mh8tr6I0ID8352sYYzmevioiOWzIOwQ_WIWksYhmMWgh_ecWf0kfmGRGpYo3lqXOPwFthjBDyffgwVLbOJ5IbjkacJKK2Vclenoe9QKrMGTyfeiabQE6VLg3gqxBxZDmtmWSreEy4rZA7Y2MZM8HfLDllPma5FKV0Ej5SVySe",
  },
  {
    gradient: "from-orange-400 to-red-500",
    title: "Gratis Ongkir ke Seluruh Indonesia",
    subtitle: "Minimal pembelian Rp50.000",
    cta: "Klaim Sekarang",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClSUqqTCy3aeamjJO5o5nvT_XQNTUaA4j13uz0MCTSvucvDzF4E1eJjlXlAn4wcoXk0Qml-66-pmBkZ0c0YwWE5LvmDq-7HnABqy7Mh8tr6I0ID8352sYYzmevioiOWzIOwQ_WIWksYhmMWgh_ecWf0kfmGRGpYo3lqXOPwFthjBDyffgwVLbOJ5IbjkacJKK2Vclenoe9QKrMGTyfeiabQE6VLg3gqxBxZDmtmWSreEy4rZA7Y2MZM8HfLDllPma5FKV0Ej5SVySe",
  },
];

export function BannerCarousel() {
  const [active, setActive] = useState(0);
  const banner = banners[active];

  return (
    <section className="relative w-full aspect-[12/3] rounded-xl overflow-hidden shadow-sm">
      <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} flex items-center px-16`}>
        <div className="max-w-md text-white space-y-4 z-10">
          <h2 className="text-2xl font-bold leading-tight">{banner.title}</h2>
          <p className="text-base opacity-90">{banner.subtitle}</p>
          <button className="px-8 py-3 bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold rounded-lg hover:bg-white/30 transition-all">
            {banner.cta}
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none flex items-center justify-center overflow-hidden">
          <div
            className="w-[120%] h-[120%] rotate-12 opacity-80 bg-cover bg-center"
            style={{ backgroundImage: `url('${banner.image}')` }}
          />
        </div>
      </div>
      {/* Dots */}
      <div className="absolute bottom-4 left-16 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === active ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}
