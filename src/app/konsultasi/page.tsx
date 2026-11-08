import { BUSINESS_HOURS } from "@/lib/site-data";
import { CtaBand, PageIntro, WhatsAppLink } from "@/components/site";
import { ConsultationForm } from "@/components/interactions";

export default function ConsultationPage() {
  return (
    <>
      <PageIntro
        eyebrow="MULAI PERCAKAPAN"
        title="Ceritakan Kebutuhan Anda"
        description="Isi informasi yang sudah Anda ketahui. Spesifikasi yang belum pasti dapat dilengkapi melalui diskusi."
        breadcrumb="Konsultasi"
      />
      <section className="container section consultation-layout">
        <div>
          <p className="notice">Formulir ini menyiapkan ringkasan untuk konsultasi, bukan pemesanan langsung. Harga dan spesifikasi final dibahas melalui penawaran.</p>
          <ConsultationForm />
        </div>
        <aside className="summary-aside">
          <h2>Ingin Bertanya Langsung?</h2>
          <p>Ceritakan produk yang dibutuhkan atau siapkan gambar referensi untuk bahan diskusi.</p>
          <WhatsAppLink label="Hubungi Cinderella Printing" className="button button-dark button-full" />
          {BUSINESS_HOURS && <p className="helper">Jam operasional: {BUSINESS_HOURS}</p>}
          <h3>Bahan Diskusi Awal</h3>
          <ul><li>Jenis produk atau kemasan yang dibutuhkan</li><li>Perkiraan jumlah dan ukuran</li><li>Material atau desain referensi, jika tersedia</li></ul>
          <p className="helper">Belum mengetahui detailnya juga tidak masalah.</p>
        </aside>
      </section>
      <CtaBand title="Masih ingin melihat pilihan produk?" text="Jelajahi katalog untuk menemukan referensi sebelum melanjutkan konsultasi." />
    </>
  );
}
