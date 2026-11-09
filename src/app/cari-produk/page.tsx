import Link from "next/link";
import { CtaBand, PageIntro } from "@/components/site";
import { CategoryGrid } from "@/components/interactions";

export default function DiscoveryPage() {
  return (
    <>
      <PageIntro
        eyebrow="BANTU MENENTUKAN KATEGORI"
        title="Mulai dari kebutuhan produk"
        description="Pilih kategori yang paling mendekati kebutuhan Anda. Jika belum tahu nama atau spesifikasinya, mulai dari fungsi produk yang ingin dibuat."
        breadcrumb="Bantu Saya Memilih"
      />
      <section className="section container">
        <h2>Pilih kategori awal</h2>
        <p className="section-desc">Pilihan ini membantu mengarahkan konsultasi, bukan membatasi bentuk produk yang dapat ditanyakan.</p>
        <CategoryGrid />
        <div className="notice notice-row">
          <div><h2>Belum yakin kategori mana yang tepat?</h2><p>Ceritakan fungsi produk atau barang yang akan dikemas. Detail dapat dibahas kemudian.</p></div>
          <Link href="/konsultasi" className="button button-dark">Siapkan Konsultasi →</Link>
        </div>
      </section>
      <CtaBand title="Lebih nyaman bertanya langsung?" text="Hubungi Cinderella Printing melalui informasi kontak yang telah dikonfirmasi." />
    </>
  );
}
