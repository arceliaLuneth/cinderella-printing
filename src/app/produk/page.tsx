import { CtaBand, PageIntro } from "@/components/site";
import { CatalogBrowser } from "@/components/interactions";

export default function ProductsPage() {
  return (
    <>
      <PageIntro
        eyebrow="EKSPLORASI PRODUK"
        title="Katalog Produk"
        description="Jelajahi referensi cetak dan kemasan untuk kebutuhan bisnis Anda. Ukuran, material, jumlah, dan penawaran harga dibahas melalui konsultasi."
        breadcrumb="Produk"
      />
      <section className="section container"><CatalogBrowser /></section>
      <CtaBand title="Belum menemukan kategori yang sesuai?" text="Sampaikan fungsi dan bentuk produk yang Anda butuhkan. Kebutuhan custom dapat dibahas melalui konsultasi." />
    </>
  );
}
