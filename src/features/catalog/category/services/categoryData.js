export const CATALOG_GROUPS = [
  { id: "belanja", name: "Belanja" },
  { id: "tagihan", name: "Top-Up & Tagihan" },
  { id: "travel", name: "Travel & Entertainment" },
  { id: "keuangan", name: "Keuangan" },
];

export const CATEGORY_DATA = {
  belanja: [
    {
      id: "dapur",
      name: "Dapur",
      icon: "🍳",
      children: [
        {
          slug: "aksesoris-dapur",
          name: "Aksesoris Dapur",
          children: [
            { slug: "alat-pemotong", name: "Alat Pemotong" },
            { slug: "celemek", name: "Celemek" },
            { slug: "chopper", name: "Chopper" },
            { slug: "grinder", name: "Grinder" },
          ],
        },
        {
          slug: "peralatan-baking",
          name: "Peralatan Baking",
          children: [
            { slug: "loyang", name: "Loyang" },
            { slug: "mixer", name: "Mixer" },
            { slug: "oven", name: "Oven" },
          ],
        },
      ],
    },
    {
      id: "elektronik",
      name: "Elektronik",
      icon: "📱",
      children: [
        {
          slug: "handphone-tablet",
          name: "Handphone & Tablet",
          children: [
            { slug: "smartphone", name: "Smartphone" },
            { slug: "tablet", name: "Tablet" },
            { slug: "aksesoris-hp", name: "Aksesoris HP" },
          ],
        },
        {
          slug: "komputer-laptop",
          name: "Komputer & Laptop",
          children: [
            { slug: "laptop", name: "Laptop" },
            { slug: "monitor", name: "Monitor" },
            { slug: "keyboard", name: "Keyboard" },
          ],
        },
      ],
    },
    {
      id: "fashion",
      name: "Fashion",
      icon: "👕",
      children: [
        {
          slug: "fashion-pria",
          name: "Fashion Pria",
          children: [
            { slug: "kaos-pria", name: "Kaos Pria" },
            { slug: "sepatu-pria", name: "Sepatu Pria" },
          ],
        },
        {
          slug: "fashion-wanita",
          name: "Fashion Wanita",
          children: [
            { slug: "dress", name: "Dress" },
            { slug: "tas-wanita", name: "Tas Wanita" },
          ],
        },
      ],
    },
  ],
  tagihan: [
    {
      id: "pulsa",
      name: "Pulsa & Paket Data",
      icon: "📶",
      children: [
        {
          slug: "pulsa",
          name: "Pulsa",
          children: [
            { slug: "telkomsel", name: "Telkomsel" },
            { slug: "indosat", name: "Indosat" },
          ],
        },
      ],
    },
  ],
  travel: [
    {
      id: "travel",
      name: "Travel",
      icon: "✈️",
      children: [
        {
          slug: "tiket",
          name: "Tiket",
          children: [
            { slug: "pesawat", name: "Pesawat" },
            { slug: "hotel", name: "Hotel" },
          ],
        },
      ],
    },
  ],
  keuangan: [
    {
      id: "keuangan",
      name: "Keuangan",
      icon: "💳",
      children: [
        {
          slug: "asuransi",
          name: "Asuransi",
          children: [
            { slug: "asuransi-kesehatan", name: "Asuransi Kesehatan" },
            { slug: "asuransi-kendaraan", name: "Asuransi Kendaraan" },
          ],
        },
      ],
    },
  ],
};
