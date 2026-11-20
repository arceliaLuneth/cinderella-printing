import { CtaBand, PageIntro } from "@/components/site";
import { GuidedDiscovery } from "@/components/interactions";

export default function DiscoveryPage() {
  return (
    <>
      <PageIntro
        eyebrow="PANDUAN MEMILIH PRODUK"
        title="Mulai dari kebutuhan bisnis Anda."
        description="Jawab dua langkah singkat untuk membantu menentukan kategori awal dan menyiapkan informasi konsultasi."
        breadcrumb="Bantu Saya Memilih"
      />
      <section className="section container">
        <GuidedDiscovery />
        <p className="notice">Panduan ini membantu mengarahkan konsultasi, bukan menentukan spesifikasi produksi secara otomatis. Ketersediaan produk, bahan, dan ukuran tetap dikonfirmasi bersama Cinderella Printing.</p>
      </section>
      <CtaBand title="Lebih nyaman berdiskusi langsung?" text="Anda dapat melewati panduan dan menghubungi Cinderella Printing melalui WhatsApp." />
    </>
  );
}
