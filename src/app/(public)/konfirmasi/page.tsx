import Link from "next/link";
import { PageIntro } from "@/components/site";
import { ConsultationSummary } from "@/components/interactions";

export default function ConfirmationPage() {
  return (
    <>
      <PageIntro
        eyebrow="TINJAU SEBELUM MENGHUBUNGI"
        title="Periksa ringkasan kebutuhan"
        description="Pastikan informasi yang ditampilkan sudah sesuai. Anda dapat kembali untuk mengubahnya sebelum melanjutkan percakapan."
        breadcrumb="Konsultasi / Ringkasan"
      />
      <div className="container">
        <p className="notice">
          Ringkasan tersimpan sementara pada sesi browser ini. Data belum masuk ke
          database dan belum menjadi pesanan. Setelah WhatsApp terbuka, periksa pesan
          dan lampirkan file referensi secara manual jika diperlukan.
        </p>
        <section className="section"><ConsultationSummary /></section>
        <p className="section-desc"><Link href="/produk" className="text-link">Kembali menjelajahi katalog →</Link></p>
      </div>
    </>
  );
}
