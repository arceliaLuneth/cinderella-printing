import type { Product, ProductCategory } from "@/types";

/** Category names and descriptions are based on the supplied Cinderella Printing digital catalogue. */
export const categories: ProductCategory[] = [
  "Packaging",
  "Branding",
  "Promosi",
  "Office",
  "Kemasan Khusus",
  "Label & Sleeve",
  "Lainnya",
];

export const categoryDescriptions: Record<ProductCategory, string> = {
  Packaging:
    "Beragam kebutuhan kemasan makanan dan minuman, seperti box makanan, pizza box, paper tray, cup holder, paper bowl, dan paper bag.",
  Branding:
    "Media pendukung identitas produk dan merek, seperti sticker, hang tag, label, paper sleeve, dan belly band.",
  Promosi:
    "Materi promosi cetak untuk kebutuhan komunikasi bisnis, seperti flyer, brosur, poster, X-banner, banner, dan kartu nama.",
  Office:
    "Kebutuhan cetak untuk aktivitas kantor dan perusahaan, seperti buku, company profile, kalender, map, kop surat, dan nota.",
  "Kemasan Khusus":
    "Kemasan untuk kebutuhan khusus, seperti box kosmetik, gift box, cake box, dan hampers. Bentuk dan detail dibahas saat konsultasi.",
  "Label & Sleeve":
    "Pilihan label dan pelengkap kemasan, seperti label botol, sticker produk, paper sleeve, dan shrink sleeve.",
  Lainnya:
    "Kebutuhan cetak lain seperti amplop, paper divider, nota, undangan, dan paper insert dapat didiskusikan sesuai kebutuhan.",
};

/**
 * These six entries are real product photographs supplied for this website.
 * Technical specifications, MOQ, dimensions, and prices are intentionally not inferred from photographs.
 */
export const products: Product[] = [
  {
    id: "work-001",
    slug: "kemasan-roti-bakar-katalji-rasa",
    name: "Kemasan Roti Bakar — Katalji Rasa",
    category: "Packaging",
    description:
      "Dokumentasi box roti bakar dengan ilustrasi dan identitas merek pada beberapa sisi kemasan.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dikonfirmasi sesuai kebutuhan produk",
    size: "Dapat dibahas untuk kebutuhan custom",
    image: "/images/portfolio/roti-bakar-katalji-rasa.webp",
    imageAlt:
      "Foto box roti bakar Katalji Rasa dengan desain ilustrasi roti dan identitas merek.",
  },
  {
    id: "work-002",
    slug: "kemasan-fried-chicken-neko-gurintik",
    name: "Kemasan Fried Chicken — Neko Gurintik",
    category: "Packaging",
    description:
      "Dokumentasi box ayam goreng dengan desain dominan kuning dan elemen grafis berwarna.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dikonfirmasi sesuai kebutuhan produk",
    size: "Dapat dibahas untuk kebutuhan custom",
    image: "/images/portfolio/neko-gurintik-fried-chicken.webp",
    imageAlt:
      "Foto box fried chicken kuning dengan desain Neko Gurintik.",
  },
  {
    id: "work-003",
    slug: "kemasan-martabak-boland-kubang",
    name: "Kemasan Martabak — Boland Kubang",
    category: "Packaging",
    description:
      "Dokumentasi box martabak dengan desain full-color pada bagian tutup dan sisi kemasan.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dikonfirmasi sesuai kebutuhan produk",
    size: "Dapat dibahas untuk kebutuhan custom",
    image: "/images/portfolio/martabak-boland-kubang.webp",
    imageAlt:
      "Foto box martabak Boland Kubang berwarna merah dan kuning.",
  },
  {
    id: "work-004",
    slug: "kemasan-pizza-panjang",
    name: "Kemasan Pizza Panjang",
    category: "Packaging",
    description:
      "Dokumentasi kemasan pizza berbentuk memanjang dengan desain cetak pada bagian tutup.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dikonfirmasi sesuai kebutuhan produk",
    size: "Dapat dibahas untuk kebutuhan custom",
    image: "/images/portfolio/pizza-panjang.webp",
    imageAlt:
      "Foto box pizza berbentuk panjang dengan desain Pizza Panjang.",
  },
  {
    id: "work-005",
    slug: "kemasan-pizza-delicious",
    name: "Kemasan Pizza — Delicious",
    category: "Packaging",
    description:
      "Dokumentasi box pizza bernuansa kraft dengan pola ilustrasi makanan dan identitas produk.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dikonfirmasi sesuai kebutuhan produk",
    size: "Dapat dibahas untuk kebutuhan custom",
    image: "/images/portfolio/pizza-delicious.webp",
    imageAlt:
      "Foto box kraft Pizza Delicious dengan pola ilustrasi pizza.",
  },
  {
    id: "work-006",
    slug: "kemasan-martabak-aa",
    name: "Kemasan Martabak — A&A",
    category: "Packaging",
    description:
      "Dokumentasi box martabak dengan desain dominan kuning dan elemen visual produk.",
    moq: "Dikonfirmasi saat konsultasi",
    material: "Dikonfirmasi sesuai kebutuhan produk",
    size: "Dapat dibahas untuk kebutuhan custom",
    image: "/images/portfolio/martabak-aa.webp",
    imageAlt:
      "Foto box martabak A&A dengan desain kuning dan ilustrasi produk.",
  },
];

export const portfolioItems = products;

// Public contact details supplied in the Cinderella Printing digital catalogue.
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281511693137"
).replace(/\D/g, "");
export const INSTAGRAM_HANDLE =
  process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "@cinderella.printing";
export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/cinderella.printing/";
export const BUSINESS_EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "";
export const BUSINESS_ADDRESS =
  process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ??
  "Komp. GBA Barat A6 No. 15, Bojongsoang, Kab. Bandung";
export const BUSINESS_MEETING_NOTE =
  "Pertemuan dan konsultasi dilakukan dengan janji temu.";
export const BUSINESS_HOURS = process.env.NEXT_PUBLIC_BUSINESS_HOURS ?? "";
