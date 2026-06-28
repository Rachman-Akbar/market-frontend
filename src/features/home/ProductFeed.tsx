"use client";
import { useState } from "react";
import { ProductCard } from "@/features/product/ProductCard";

const TABS = ["For You", "Elektronik", "Fashion", "Otomotif", "Kebutuhan Harian", "Olahraga", "Kecantikan"];

const PRODUCTS = [
  {
    slug: "scarlett-facial-wash",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjOnxalT0nkYQ4vIUl6slQ63O07AEyQUZHjgLcjgQIXJIc2y08TQ2CKcUjxldsZI7BhA8ZV2smAWKwKJ4jD0XXXtSEXt_7CPdD-U7q3P-MPSye9CbnpjYaGlrvmFFM_UmbQkHecMF7bp36jjC80sUnQz4rMrafPb8At-xwFWjgHXLkHDixkGAOUjaQshFHxXvjbsXUsl_K0qxnsAqP9BEk8ew29KIC9zFv_kuPCluN9NiVhOA5tBmF3_k_S0tPB3fdmjgMhQrEKsyh",
    badge: "OFFICIAL",
    title: "Scarlett Whitening Facial Wash 100ml Original",
    price: "Rp65.000",
    discountPct: "15%",
    originalPrice: "Rp75.000",
    rating: "4.9",
    sold: "100+",
  },
  {
    slug: "mechanical-keyboard-60",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlOWmULJdLITIf7GX2zt9YKS14uIG5RgpUzTshzs4kCOQJELvC-dj9u8BKYH76xoH_BbPKrs5A5LzQqHIMIz2G-IhyzgpVGP4__YyQQFFfs-5l8PCCJ258lnMKjm_sT746AnGBVWeBMuAfwOyyfuOkMBVbLD3N7kU4KlZxa6AohRemjeS6wxpzF1e7I-kBmxHR_GxOcUKlkUR2JQLzSnRUkIT3DIFQP9qchvuNWyy4d4XWoN7ezE8GfkbZFFUOjTNXdTc11UxYbTjG",
    title: "Mechanical Keyboard 60% Layout Wired Gaming",
    price: "Rp450.000",
    rating: "4.8",
    sold: "50+",
    location: "Jakarta Utara",
  },
  {
    slug: "lifestyle-white-sneakers",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiV_217qUqrYxzibo8VH0snSl3Sr0a9tHSzUTa3lGhXVzzb81W3z5W9l7p9qrVMPpfvYeDB4lwv_U3Mm3BOZbfuyXY1t3u9xq_26YKuAAJLUhH7hivt5p2QJz92adb23aNxBxcfWy7tTpTyvpnCgit_LCDIJ8Kzi0kBatBbXQfmcbOxkI7DIReENVNJsKT0QaNzFmM5iRSFHSmEOxIsnTE6mHWs0W9D1GSkP7t5u2uTLVAHNp3H76NzQJ1gsyDa9-Jfx2YQDvZizMH",
    badge: "FLASH SALE",
    badgeVariant: "flash" as const,
    title: "Lifestyle White Sneakers - Limited Edition",
    price: "Rp299.000",
    rating: "5.0",
    sold: "20+",
  },
  {
    slug: "wireless-headphones-anc",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9g8TAueZpOG52DaWTa5PvX-Ney2daHFw4JOCr5IFGvCcio3lV5GhzCpRzIs42uO32WWHdV2YmYa1-Vz1qJEWOucWVIaBgVgg16S2YOTu0gYmyId3UmeOr16E6sP82iEKmATAyna5rI-V9-ytYQloLYKD4yTcSErd2DTXnFPgJyIOteI6XQzi3BwaDUWJTvOuzT7B17httykmbSdkogdvz98QUa2lxKeuF9pBIMOQTaR7EupV9fN5pFibNexF0NkHZI14-r4o3k38t",
    title: "Wireless Over-Ear ANC Headphones Matte Black",
    price: "Rp1.250.000",
    rating: "4.7",
    sold: "10+",
  },
  {
    slug: "sunco-minyak-goreng",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3SeGOng6SofW6LCc91SwbZo6OCM1T2J5bUQtdJwfZffqpCRbkA1sJswPyEBLW078fKf27D0MAWoO4zgKoxIVIxdSFrKD_0g5pKcfFi6JwBzfBb68_tpXknLiainNoQ9rx9Pc82Vp6EZ_OYE3S_SUd1huhSVAUtOjQqkLLFREJG8lbsxq8qpoQk63TQUBKCHSFIasyJ6sw0CEn8Hq2GT12VlDY0k-KdIhArs_0nCAHJyuj3C8lkH_Q8xy01zGt-wq9ybRcZytu6ouC",
    title: "Sunco Minyak Goreng Botol 1L Hemat Banget",
    price: "Rp33.000",
    rating: "4.9",
    sold: "5rb+",
  },
  {
    slug: "digital-air-fryer-4l",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbhYlGeSi9kXV-2ArftF996xK8bQ1FHoVnspTE6nts-NVd2TJ-MqvvMdgBSZEoV-u_NHkp8qDjynnFJ7Qsb2chJN04otWUTH3gibXM6ZhxbZKgogm5b2lfqROLvaGxHm8vcUPLXMH6TNFW3phCTZjtPSQM1h39T_ovp2MYLgxOKTNbbIofNqJmDcy_d3I7ze3k5pURFgCNOjIInu-IBn1ATXyVjSII_3WKN0zqmRm5TbobN-Y22sZy9jwg8b6Da2-xxRHkDB-YSnWT",
    title: "Digital Air Fryer 4L Capacity 800W Eco Mode",
    price: "Rp899.000",
    rating: "4.8",
    sold: "200+",
    wishlistBtn: true,
  },
];

export function ProductFeed() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar border-b border-[#bccbb4] pb-2">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`whitespace-nowrap pb-2 text-base transition-colors ${
              i === activeTab
                ? "font-bold text-[#006e04] border-b-2 border-[#006e04]"
                : "text-[#3e4a39] hover:text-[#006e04]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.slug} {...p} />
        ))}
      </div>

      {/* View More */}
      <div className="flex justify-center py-4">
        <button className="px-12 py-2 border border-[#bccbb4] text-[#1b1c1c] font-bold rounded-lg hover:bg-[#f6f3f2] transition-all">
          Lihat Selengkapnya
        </button>
      </div>
    </section>
  );
}
