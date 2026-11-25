import { Suspense } from "react";
import { CtaBand, PageIntro } from "@/components/site";
import { CatalogContent } from "@/components/catalog";

export default function InspirationPage() {
  return (
    <>
      <PageIntro
        eyebrow="CETAK & KEMASAN"
        title="Inspirasi Produk"
        description="Lihat foto produk yang tersedia untuk membantu Anda menyiapkan konsultasi."
        breadcrumb="Inspirasi Produk"
      />
      <section className="section container">
        <Suspense fallback={<p role="status">Memuat foto produk…</p>}><CatalogContent view="photos" /></Suspense>
      </section>
      <CtaBand />
    </>
  );
}
