import type { Product, ProductCategory } from "@/types";

export const categories: ProductCategory[] = [
  "Packaging Makanan",
  "Pouch",
  "Cup",
  "Custom Packaging",
];

// Data berikut adalah referensi katalog awal. MOQ, bahan, ukuran, dan opsi produksi
// sengaja tidak diasumsikan; semuanya perlu dikonfirmasi saat konsultasi.
export const products: Product[] = [
  {
    id: "p1",
    slug: "referensi-packaging-makanan",
    name: "Referensi Packaging Makanan",
    category: "Packaging Makanan",
    description: "Jelajahi referensi kemasan makanan dan diskusikan ukuran, material, serta kebutuhan desain yang sesuai dengan produk Anda.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dibahas sesuai kebutuhan produk",
    size: "Dikonfirmasi saat konsultasi",
  },
  {
    id: "p2",
    slug: "referensi-pouch",
    name: "Referensi Pouch",
    category: "Pouch",
    description: "Temukan referensi kemasan pouch untuk kebutuhan produk Anda. Pilihan material, ukuran, dan detail cetak dibahas saat konsultasi.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dibahas sesuai kebutuhan produk",
    size: "Dikonfirmasi saat konsultasi",
  },
  {
    id: "p3",
    slug: "referensi-cup",
    name: "Referensi Cup",
    category: "Cup",
    description: "Lihat referensi produk cup dan diskusikan ukuran, desain, serta kebutuhan penggunaannya bersama tim Cinderella Printing.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dibahas sesuai kebutuhan produk",
    size: "Dikonfirmasi saat konsultasi",
  },
  {
    id: "p4",
    slug: "custom-packaging",
    name: "Custom Packaging",
    category: "Custom Packaging",
    description: "Untuk kebutuhan kemasan di luar kategori yang tersedia, sampaikan bentuk, fungsi, dan referensi yang Anda inginkan.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dibahas sesuai kebutuhan produk",
    size: "Dikonfirmasi saat konsultasi",
  },
  {
    id: "p5",
    slug: "referensi-kemasan-kustom",
    name: "Referensi Kemasan Kustom",
    category: "Packaging Makanan",
    description: "Gunakan contoh kategori ini sebagai titik awal untuk membicarakan fungsi kemasan, ukuran, dan kebutuhan identitas produk.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dibahas sesuai kebutuhan produk",
    size: "Dikonfirmasi saat konsultasi",
  },
  {
    id: "p6",
    slug: "referensi-pouch-kustom",
    name: "Referensi Pouch Kustom",
    category: "Pouch",
    description: "Jadikan referensi pouch ini sebagai bahan diskusi awal. Detail konstruksi, material, ukuran, dan cetak perlu dikonfirmasi.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dibahas sesuai kebutuhan produk",
    size: "Dikonfirmasi saat konsultasi",
  },
];

// Item di bawah adalah referensi kategori, bukan klaim proyek pelanggan yang telah selesai.
export const portfolioItems = [
  { id: "w1", title: "Referensi Packaging Makanan", category: "Packaging Makanan", description: "Contoh kategori untuk membantu membahas bentuk, fungsi, dan kebutuhan kemasan makanan." },
  { id: "w2", title: "Referensi Pouch", category: "Pouch", description: "Contoh kategori untuk membicarakan material, ukuran, dan kebutuhan kemasan pouch." },
  { id: "w3", title: "Referensi Cup", category: "Cup", description: "Contoh kategori untuk mendiskusikan bentuk cup dan kebutuhan desain." },
  { id: "w4", title: "Referensi Custom Packaging", category: "Custom Packaging", description: "Ruang diskusi untuk kebutuhan kemasan dengan bentuk atau fungsi khusus." },
  { id: "w5", title: "Referensi Kemasan Produk", category: "Packaging Makanan", description: "Inspirasi awal untuk menjelaskan kebutuhan produk dan presentasi kemasannya." },
  { id: "w6", title: "Referensi Pouch Produk", category: "Pouch", description: "Inspirasi awal untuk menyampaikan kebutuhan pouch dan detail kustomisasi." },
];

// Isi melalui .env.local setelah data resmi diperoleh dari pihak Cinderella Printing.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
export const BUSINESS_EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "";
export const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "";
export const BUSINESS_HOURS = process.env.NEXT_PUBLIC_BUSINESS_HOURS ?? "";
