import { CtaBand, PageIntro } from "@/components/site";
import { CatalogBrowser } from "@/components/interactions";

export default function ProductsPage() {
  return (
    <>
      <PageIntro
        eyebrow="JELAJAHI KATEGORI"
        title="Katalog Produk"
        description="Temukan kategori cetak dan kemasan yang mendekati kebutuhan Anda. Informasi bahan, ukuran, jumlah minimum, dan harga dikonfirmasi melalui konsultasi."
        breadcrumb="Produk"
      />
      <section className="section container"><CatalogBrowser /></section>
      <CtaBand title="Belum menemukan kategori yang sesuai?" text="Jelaskan fungsi atau bentuk produk yang Anda butuhkan. Kebutuhan khusus dapat dibahas bersama." />
    </>
  );
}
