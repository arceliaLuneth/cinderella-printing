import Link from "next/link";
import { CtaBand, PageIntro } from "@/components/site";
import { CategoryGrid } from "@/components/interactions";

export default function DiscoveryPage() {
  return (
    <>
      <PageIntro
        eyebrow="TEMUKAN ARAH PRODUK"
        title="Apa yang Anda Butuhkan?"
        description="Pilih kategori yang paling mendekati kebutuhan Anda. Tidak perlu mengetahui seluruh spesifikasi untuk memulai konsultasi."
        breadcrumb="Cari Produk"
      />
      <section className="section container">
        <h2>Mulai dari kategori</h2>
        <p className="section-desc">Jelajahi referensi produk, lihat detail, atau konsultasikan kebutuhan khusus Anda.</p>
        <CategoryGrid />
        <div className="notice notice-row">
          <div><h2>Belum Menentukan Produk?</h2><p>Ceritakan fungsi produk atau jenis kemasan yang Anda butuhkan. Spesifikasi dapat dibahas bersama.</p></div>
          <Link href="/konsultasi" className="button button-dark">Bantu Saya Memilih →</Link>
        </div>
      </section>
      <CtaBand title="Lebih nyaman bertanya langsung?" text="Siapkan kebutuhan awal Anda dan lanjutkan melalui kanal konsultasi Cinderella Printing." />
    </>
  );
}
