// Catalog groups shown as tabs in the dropdown header
export const CATALOG_GROUPS = [
  { id: "belanja", name: "Belanja" },
  { id: "kebutuhan-harian", name: "Kebutuhan Harian" },
  { id: "tagihan", name: "Tagihan" },
  { id: "top-up", name: "Top-Up" },
  { id: "keuangan", name: "Tokopedia Keuangan" },
  { id: "pajak", name: "Pajak & Pendidikan" },
  { id: "halal", name: "Halal Corner" },
  { id: "lainnya", name: "Lain - Lain" },
];

export interface CatL3 { name: string; slug: string }
export interface CatL2 { name: string; slug: string; children: CatL3[] }
export interface CatL1 { id: string; name: string; slug: string; icon?: string; children: CatL2[] }

export const CATEGORY_DATA: Record<string, CatL1[]> = {
  "belanja": [
    {
      id: "virtual", name: "Virtual Products", slug: "virtual-products", icon: "🎁",
      children: [
        { name: "Voucher", slug: "voucher", children: [
          { name: "Discount and Shipping Coupon", slug: "discount-coupon" },
          { name: "Voucher Belanja", slug: "voucher-belanja" },
        ]},
      ],
    },
    {
      id: "rumah", name: "Rumah Tangga", slug: "rumah-tangga", icon: "🏠",
      children: [
        { name: "Peralatan Kebersihan", slug: "peralatan-kebersihan", children: [
          { name: "Sapu & Kemoceng", slug: "sapu" },
          { name: "Ember & Gayung", slug: "ember" },
        ]},
        { name: "Dekorasi Rumah", slug: "dekorasi", children: [
          { name: "Bantal & Guling", slug: "bantal" },
          { name: "Karpet & Permadani", slug: "karpet" },
        ]},
      ],
    },
    {
      id: "audio", name: "Audio, Kamera & Elektronik Lainnya", slug: "audio-kamera", icon: "📷",
      children: [
        { name: "Kamera Digital", slug: "kamera-digital", children: [
          { name: "DSLR", slug: "dslr" },
          { name: "Mirrorless", slug: "mirrorless" },
          { name: "Kamera Action", slug: "action-cam" },
        ]},
        { name: "Audio", slug: "audio", children: [
          { name: "Speaker Bluetooth", slug: "speaker-bt" },
          { name: "Headphone", slug: "headphone" },
        ]},
      ],
    },
    {
      id: "buku", name: "Buku", slug: "buku", icon: "📚",
      children: [
        { name: "Buku Pelajaran", slug: "buku-pelajaran", children: [
          { name: "SD & SMP", slug: "buku-sd-smp" },
          { name: "SMA & SMK", slug: "buku-sma" },
          { name: "Perguruan Tinggi", slug: "buku-pt" },
        ]},
        { name: "Novel & Fiksi", slug: "novel", children: [
          { name: "Roman", slug: "roman" },
          { name: "Thriller", slug: "thriller" },
        ]},
      ],
    },
    {
      id: "dapur", name: "Dapur", slug: "dapur", icon: "🍳",
      children: [
        { name: "Aksesoris Dapur", slug: "aksesoris-dapur", children: [
          { name: "Alat Pemotong Serbaguna", slug: "alat-pemotong" },
          { name: "Capit Makanan", slug: "capit" },
          { name: "Celemek", slug: "celemek" },
          { name: "Chopper", slug: "chopper" },
          { name: "Grinder", slug: "grinder" },
          { name: "Gunting Dapur", slug: "gunting-dapur" },
          { name: "Korek Kompor", slug: "korek-kompor" },
          { name: "Magnet Kulkas", slug: "magnet-kulkas" },
          { name: "Parutan", slug: "parutan" },
          { name: "Peeler", slug: "peeler" },
          { name: "Pelindung Tangan", slug: "pelindung-tangan" },
          { name: "Pengasah Pisau", slug: "pengasah-pisau" },
          { name: "Pisau Dapur", slug: "pisau-dapur" },
        ]},
        { name: "Bekal", slug: "bekal", children: [
          { name: "Botol Minum", slug: "botol-minum" },
          { name: "Cetakan Bento", slug: "cetakan-bento" },
          { name: "Cup Bento", slug: "cup-bento" },
          { name: "Kotak Makan", slug: "kotak-makan" },
          { name: "Lunch Box Set", slug: "lunch-box" },
          { name: "Partisi Bento", slug: "partisi-bento" },
          { name: "Rantang", slug: "rantang" },
          { name: "Tas Bekal", slug: "tas-bekal" },
          { name: "Tas Botol", slug: "tas-botol" },
          { name: "Termos Air", slug: "termos" },
          { name: "Tusuk Bento", slug: "tusuk-bento" },
        ]},
        { name: "Penyimpanan Makanan", slug: "penyimpanan", children: [
          { name: "Aluminium Foil", slug: "alu-foil" },
          { name: "Box Telur", slug: "box-telur" },
          { name: "Cooler Box", slug: "cooler-box" },
          { name: "Food Display", slug: "food-display" },
          { name: "Food Warmer", slug: "food-warmer" },
          { name: "Plastic Wrap", slug: "plastic-wrap" },
          { name: "Sealer Makanan", slug: "sealer" },
          { name: "Tempat Buah & Sayur", slug: "tempat-buah" },
          { name: "Tempat Bumbu", slug: "tempat-bumbu" },
          { name: "Tempat Roti", slug: "tempat-roti" },
          { name: "Tempat Saos & Kecap", slug: "tempat-saos" },
        ]},
        { name: "Peralatan Dapur", slug: "peralatan-dapur", children: [
          { name: "Alat Pembuka Botol", slug: "pembuka-botol" },
          { name: "Alat Pembuka Kaleng", slug: "pembuka-kaleng" },
          { name: "Dispenser Air", slug: "dispenser-air" },
          { name: "Pompa Galon", slug: "pompa-galon" },
          { name: "Rak Dapur", slug: "rak-dapur" },
          { name: "Rak Piring & Gelas", slug: "rak-piring" },
          { name: "Regulator & Penghematan Gas", slug: "regulator" },
          { name: "Sarung Galon", slug: "sarung-galon" },
          { name: "Sarung Kulkas", slug: "sarung-kulkas" },
          { name: "Timbangan Dapur", slug: "timbangan" },
          { name: "Water Purifier", slug: "water-purifier" },
        ]},
        { name: "Peralatan Masak", slug: "peralatan-masak", children: [
          { name: "Cetakan Es, Puding, Coklat", slug: "cetakan-es" },
          { name: "Cobek", slug: "cobek" },
          { name: "Deep Fryer", slug: "deep-fryer" },
          { name: "Gelas Takar", slug: "gelas-takar" },
          { name: "Gilingan Daging", slug: "gilingan" },
          { name: "Griller", slug: "griller" },
          { name: "Kompor", slug: "kompor" },
          { name: "Oven Gas", slug: "oven-gas" },
          { name: "Panci", slug: "panci" },
          { name: "Presto", slug: "presto" },
          { name: "Saringan Masak", slug: "saringan" },
          { name: "Sendok Takar", slug: "sendok-takar" },
          { name: "Spatula & Sutil", slug: "spatula" },
        ]},
      ],
    },
    {
      id: "elektronik", name: "Elektronik", slug: "elektronik", icon: "⚡",
      children: [
        { name: "Televisi", slug: "televisi", children: [
          { name: "Smart TV", slug: "smart-tv" },
          { name: "LED TV", slug: "led-tv" },
          { name: "OLED TV", slug: "oled-tv" },
        ]},
        { name: "AC & Pendingin Udara", slug: "ac", children: [
          { name: "AC Split", slug: "ac-split" },
          { name: "Kipas Angin", slug: "kipas" },
        ]},
        { name: "Mesin Cuci", slug: "mesin-cuci", children: [
          { name: "Top Loading", slug: "top-loading" },
          { name: "Front Loading", slug: "front-loading" },
        ]},
      ],
    },
    {
      id: "fashion-anak", name: "Fashion Anak & Bayi", slug: "fashion-anak-bayi", icon: "👶",
      children: [
        { name: "Pakaian Bayi", slug: "pakaian-bayi", children: [
          { name: "Baju Bayi Newborn", slug: "baju-newborn" },
          { name: "Jumpsuit Bayi", slug: "jumpsuit-bayi" },
        ]},
        { name: "Sepatu Anak", slug: "sepatu-anak", children: [
          { name: "Sepatu Sekolah", slug: "sepatu-sekolah" },
          { name: "Sandal Anak", slug: "sandal-anak" },
        ]},
      ],
    },
    {
      id: "fashion-muslim", name: "Fashion Muslim", slug: "fashion-muslim", icon: "🕌",
      children: [
        { name: "Hijab & Kerudung", slug: "hijab", children: [
          { name: "Hijab Instan", slug: "hijab-instan" },
          { name: "Pashmina", slug: "pashmina" },
        ]},
        { name: "Gamis", slug: "gamis", children: [
          { name: "Gamis Casual", slug: "gamis-casual" },
          { name: "Gamis Pesta", slug: "gamis-pesta" },
        ]},
      ],
    },
    {
      id: "fashion-pria", name: "Fashion Pria", slug: "fashion-pria", icon: "👔",
      children: [
        { name: "Kemeja Pria", slug: "kemeja-pria", children: [
          { name: "Kemeja Casual", slug: "kemeja-casual" },
          { name: "Kemeja Formal", slug: "kemeja-formal" },
          { name: "Kemeja Batik", slug: "kemeja-batik" },
        ]},
        { name: "Kaos Pria", slug: "kaos-pria", children: [
          { name: "Kaos Polos", slug: "kaos-polos" },
          { name: "Kaos Bergambar", slug: "kaos-bergambar" },
        ]},
        { name: "Celana Pria", slug: "celana-pria", children: [
          { name: "Celana Jeans", slug: "celana-jeans" },
          { name: "Celana Chino", slug: "celana-chino" },
          { name: "Celana Jogger", slug: "celana-jogger" },
        ]},
      ],
    },
    {
      id: "fashion-wanita", name: "Fashion Wanita", slug: "fashion-wanita", icon: "👗",
      children: [
        { name: "Atasan Wanita", slug: "atasan-wanita", children: [
          { name: "Blouse", slug: "blouse" },
          { name: "Kaos Wanita", slug: "kaos-wanita" },
        ]},
        { name: "Dress & Rok", slug: "dress-rok", children: [
          { name: "Dress Casual", slug: "dress-casual" },
          { name: "Midi Dress", slug: "midi-dress" },
          { name: "Maxi Dress", slug: "maxi-dress" },
        ]},
      ],
    },
    {
      id: "film-musik", name: "Film & Musik", slug: "film-musik", icon: "🎵",
      children: [
        { name: "DVD & Blu-ray", slug: "dvd", children: [
          { name: "Film", slug: "dvd-film" },
          { name: "Serial TV", slug: "dvd-serial" },
        ]},
        { name: "Instrumen Musik", slug: "instrumen", children: [
          { name: "Gitar", slug: "gitar" },
          { name: "Keyboard & Piano", slug: "keyboard" },
        ]},
      ],
    },
    {
      id: "hp-tablet", name: "Handphone & Tablet", slug: "handphone-tablet", icon: "📱",
      children: [
        { name: "Smartphone", slug: "smartphone", children: [
          { name: "Android", slug: "android" },
          { name: "iPhone", slug: "iphone" },
          { name: "HP Second", slug: "hp-second" },
        ]},
        { name: "Tablet", slug: "tablet", children: [
          { name: "iPad", slug: "ipad" },
          { name: "Android Tablet", slug: "android-tablet" },
        ]},
        { name: "Aksesoris HP", slug: "aksesoris-hp", children: [
          { name: "Case & Cover", slug: "case-hp" },
          { name: "Charger & Kabel", slug: "charger" },
          { name: "Power Bank", slug: "power-bank" },
        ]},
      ],
    },
    {
      id: "kecantikan", name: "Kecantikan", slug: "kecantikan", icon: "💄",
      children: [
        { name: "Skincare", slug: "skincare", children: [
          { name: "Serum Wajah", slug: "serum" },
          { name: "Moisturizer", slug: "moisturizer" },
          { name: "Sunscreen", slug: "sunscreen" },
        ]},
        { name: "Makeup", slug: "makeup", children: [
          { name: "Lipstik", slug: "lipstik" },
          { name: "Foundation", slug: "foundation" },
          { name: "Mascara", slug: "mascara" },
        ]},
      ],
    },
    {
      id: "laptop", name: "Komputer & Laptop", slug: "komputer-laptop", icon: "💻",
      children: [
        { name: "Laptop", slug: "laptop", children: [
          { name: "Laptop Gaming", slug: "laptop-gaming" },
          { name: "Laptop Bisnis", slug: "laptop-bisnis" },
          { name: "Ultrabook", slug: "ultrabook" },
        ]},
        { name: "PC Desktop", slug: "pc-desktop", children: [
          { name: "PC Gaming", slug: "pc-gaming" },
          { name: "All-in-One PC", slug: "aio-pc" },
        ]},
        { name: "Aksesoris Komputer", slug: "aksesoris-komputer", children: [
          { name: "Mouse", slug: "mouse" },
          { name: "Keyboard", slug: "keyboard-pc" },
          { name: "Monitor", slug: "monitor" },
        ]},
      ],
    },
    {
      id: "olahraga", name: "Olahraga", slug: "olahraga", icon: "⚽",
      children: [
        { name: "Sepatu Olahraga", slug: "sepatu-olahraga", children: [
          { name: "Sepatu Running", slug: "sepatu-running" },
          { name: "Sepatu Futsal", slug: "sepatu-futsal" },
        ]},
        { name: "Perlengkapan Gym", slug: "perlengkapan-gym", children: [
          { name: "Dumbell & Barbell", slug: "dumbell" },
          { name: "Matras Yoga", slug: "matras-yoga" },
        ]},
      ],
    },
  ],
  "kebutuhan-harian": [
    {
      id: "makmin", name: "Makanan & Minuman", slug: "makanan-minuman", icon: "🍜",
      children: [
        { name: "Beras & Serealia", slug: "beras", children: [
          { name: "Beras Putih", slug: "beras-putih" },
          { name: "Beras Merah", slug: "beras-merah" },
        ]},
        { name: "Minyak Goreng", slug: "minyak-goreng", children: [
          { name: "Minyak Kelapa Sawit", slug: "minyak-sawit" },
          { name: "Minyak Zaitun", slug: "minyak-zaitun" },
        ]},
      ],
    },
    {
      id: "perawatan", name: "Perawatan Pribadi", slug: "perawatan-pribadi", icon: "🧴",
      children: [
        { name: "Sabun & Shampo", slug: "sabun-shampo", children: [
          { name: "Sabun Mandi", slug: "sabun-mandi" },
          { name: "Shampo", slug: "shampo" },
        ]},
      ],
    },
  ],
};
