import Link from "next/link";
import { PageIntro } from "@/components/site";
import { ConsultationSummary } from "@/components/interactions";

export default function ConfirmationPage() {
  return (
    <>
      <PageIntro
        eyebrow="RINGKASAN KONSULTASI"
        title="Tinjau Kebutuhan Anda"
        description="Periksa informasi awal yang telah Anda isi sebelum menggunakannya sebagai bahan diskusi dengan Cinderella Printing."
        breadcrumb="Konsultasi / Ringkasan"
      />
      <div className="container">
        <p className="notice">
          Ringkasan ini disimpan sementara di browser Anda. Informasi belum dikirim
          ke server, belum menjadi pesanan, dan tidak mencakup pembayaran.
        </p>
        <section className="section"><ConsultationSummary /></section>
        <p className="section-desc">
          <Link href="/produk" className="text-link">Kembali ke katalog produk →</Link>
        </p>
      </div>
    </>
  );
}
