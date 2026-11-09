import type { Product, ProductCategory } from "@/types";

export const categories: ProductCategory[] = [
  "Packaging Makanan",
  "Pouch",
  "Cup",
  "Custom Packaging",
];

// Keterangan berikut adalah panduan awal kategori, bukan spesifikasi final.
// Harga, MOQ, material, ukuran, dan opsi produksi wajib dikonfirmasi oleh bisnis.
export const categoryDescriptions: Record<ProductCategory, string> = {
  "Packaging Makanan":
    "Untuk kebutuhan kemasan makanan. Bentuk, ukuran, bahan, dan kebutuhan cetak dibahas sesuai karakter produk yang akan dikemas.",
  Pouch:
    "Untuk kebutuhan kemasan berbentuk pouch. Sampaikan jenis produk, perkiraan isi, dan referensi bentuk agar pilihan dapat dibahas lebih terarah.",
  Cup:
    "Untuk kebutuhan produk berbentuk cup. Ukuran, fungsi penggunaan, dan kebutuhan desain perlu disesuaikan dengan produk serta dikonfirmasi saat konsultasi.",
  "Custom Packaging":
    "Untuk kebutuhan kemasan di luar kategori yang tersedia. Jelaskan fungsi, bentuk, atau contoh referensi yang ingin diwujudkan.",
};

// Empat entri ini mewakili kategori katalog awal. Ganti dengan daftar produk
// resmi setelah nama, foto, dan spesifikasi dikonfirmasi oleh Cinderella Printing.
export const products: Product[] = categories.map((category, index) => {
  const slugByCategory: Record<ProductCategory, string> = {
    "Packaging Makanan": "referensi-packaging-makanan",
    Pouch: "referensi-pouch",
    Cup: "referensi-cup",
    "Custom Packaging": "referensi-custom-packaging",
  };
  return {
    id: `category-${index + 1}`,
    slug: slugByCategory[category],
    name: `Referensi ${category}`,
    category,
    description: categoryDescriptions[category],
    moq: "Dikonfirmasi saat konsultasi",
    material: "Pilihan bahan dibahas sesuai kebutuhan",
    size: "Ukuran dibahas sesuai kebutuhan",
  };
});

// Konten ini sengaja disebut inspirasi/referensi, bukan portofolio proyek selesai.
// Foto dan proyek aktual dapat menggantikannya setelah mendapat persetujuan pemilik.
export const portfolioItems = categories.map((category, index) => ({
  id: `reference-${index + 1}`,
  title: `Inspirasi ${category}`,
  category,
  description: categoryDescriptions[category],
}));

// Isi melalui .env.local setelah nomor dan kontak resmi dikonfirmasi.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
export const BUSINESS_EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "";
export const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "";
export const BUSINESS_HOURS = process.env.NEXT_PUBLIC_BUSINESS_HOURS ?? "";
