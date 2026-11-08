import type { Product, ProductCategory } from "@/types";

export const categories: ProductCategory[] = [
  "Packaging Makanan",
  "Pouch",
  "Cup",
  "Custom Packaging",
];

// Isi dengan data resmi Cinderella Printing setelah dikonfirmasi oleh pihak UMKM.
export const products: Product[] = [
  { id: "p1", slug: "contoh-packaging-makanan", name: "Contoh Packaging Makanan", category: "Packaging Makanan", description: "Contoh konten untuk referensi produk. Detail spesifikasi dikonfirmasi saat konsultasi.", moq: "Dikonfirmasi saat konsultasi", material: "Pilihan material dibahas saat konsultasi", size: "Ukuran dikonfirmasi saat konsultasi" },
  { id: "p2", slug: "contoh-pouch", name: "Contoh Pouch", category: "Pouch", description: "Contoh konten untuk referensi produk. Detail spesifikasi dikonfirmasi saat konsultasi.", moq: "Dikonfirmasi saat konsultasi", material: "Pilihan material dibahas saat konsultasi", size: "Ukuran dikonfirmasi saat konsultasi" },
  { id: "p3", slug: "contoh-cup", name: "Contoh Cup", category: "Cup", description: "Contoh konten untuk referensi produk. Detail spesifikasi dikonfirmasi saat konsultasi.", moq: "Dikonfirmasi saat konsultasi", material: "Pilihan material dibahas saat konsultasi", size: "Ukuran dikonfirmasi saat konsultasi" },
  { id: "p4", slug: "contoh-custom-packaging", name: "Contoh Custom Packaging", category: "Custom Packaging", description: "Contoh konten untuk referensi produk. Detail spesifikasi dikonfirmasi saat konsultasi.", moq: "Dikonfirmasi saat konsultasi", material: "Pilihan material dibahas saat konsultasi", size: "Ukuran dikonfirmasi saat konsultasi" },
  { id: "p5", slug: "contoh-kemasan-kustom", name: "Contoh Kemasan Kustom", category: "Packaging Makanan", description: "Contoh konten untuk referensi produk. Detail spesifikasi dikonfirmasi saat konsultasi.", moq: "Dikonfirmasi saat konsultasi", material: "Pilihan material dibahas saat konsultasi", size: "Ukuran dikonfirmasi saat konsultasi" },
  { id: "p6", slug: "contoh-pouch-kustom", name: "Contoh Pouch Kustom", category: "Pouch", description: "Contoh konten untuk referensi produk. Detail spesifikasi dikonfirmasi saat konsultasi.", moq: "Dikonfirmasi saat konsultasi", material: "Pilihan material dibahas saat konsultasi", size: "Ukuran dikonfirmasi saat konsultasi" },
];

export const portfolioItems = [
  { id: "w1", title: "Contoh Proyek Packaging", category: "Packaging Makanan", description: "Placeholder deskripsi proyek dan detail kustomisasi." },
  { id: "w2", title: "Contoh Proyek Pouch", category: "Pouch", description: "Placeholder deskripsi proyek dan detail kustomisasi." },
  { id: "w3", title: "Contoh Proyek Cup", category: "Cup", description: "Placeholder deskripsi proyek dan detail kustomisasi." },
  { id: "w4", title: "Contoh Custom Packaging", category: "Custom Packaging", description: "Placeholder deskripsi proyek dan detail kustomisasi." },
  { id: "w5", title: "Contoh Kemasan Bisnis", category: "Packaging Makanan", description: "Placeholder deskripsi proyek dan detail kustomisasi." },
  { id: "w6", title: "Contoh Pouch Produk", category: "Pouch", description: "Placeholder deskripsi proyek dan detail kustomisasi." },
];

// Nomor WhatsApp sengaja belum diisi karena PDF hanya memuat placeholder.
export const WHATSAPP_NUMBER = "";
export const BUSINESS_EMAIL = "[Alamat email]";
export const BUSINESS_ADDRESS = "[Alamat lengkap perusahaan]";
export const BUSINESS_HOURS = "[Hari dan jam operasional]";
