import { CtaBand, PageIntro } from "@/components/site";
import { CatalogBrowser } from "@/components/interactions";

export default function ProductsPage() {
  return (
    <>
      <PageIntro
        eyebrow="KATALOG DIGITAL"
        title="Temukan produk untuk kebutuhan bisnis."
        description="Jelajahi kategori cetak dan kemasan. Foto yang tersedia menampilkan contoh hasil produksi; spesifikasi, ukuran, bahan, finishing, dan harga dibahas melalui konsultasi."
        breadcrumb="Produk"
      />
      <section className="section container"><CatalogBrowser /></section>
      <CtaBand title="Belum menemukan produk yang dicari?" text="Kebutuhan branding, promosi, office, label, atau kemasan khusus dapat ditanyakan meskipun foto contohnya belum tersedia di galeri." />
    </>
  );
}
