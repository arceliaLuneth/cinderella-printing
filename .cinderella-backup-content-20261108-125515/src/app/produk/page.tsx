import { CtaBand, PageIntro } from "@/components/site";
import { CatalogBrowser } from "@/components/interactions";

export default function ProductsPage() {
  return <><PageIntro eyebrow="EKSPLORASI PRODUK" title="Katalog Produk" description="Temukan referensi produk untuk kebutuhan bisnis Anda. Spesifikasi dan penawaran harga dibahas melalui konsultasi." breadcrumb="Produk" /><section className="section container"><CatalogBrowser /></section><CtaBand title="Tidak menemukan produk yang sesuai?" text="Ceritakan kebutuhan custom Anda. Ukuran, bentuk, bahan, dan jumlah dapat dibahas saat konsultasi." /></>;
}
