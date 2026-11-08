import Link from "next/link";
import { PageIntro } from "@/components/site";
import { ConsultationSummary } from "@/components/interactions";

export default function ConfirmationPage() {
  return <><PageIntro eyebrow="CONTOH TAMPILAN RINGKASAN" title="Periksa kebutuhan sebelum berdiskusi." description="Ini adalah ringkasan konsultasi, bukan konfirmasi pengiriman permintaan. Belum ada data pelanggan atau pesanan yang dikirim." breadcrumb="Konsultasi / Ringkasan" /><div className="container"><p className="notice">Contoh wireframe • Kolom yang belum diketahui dapat tetap “Belum Tahu” dan dibahas melalui WhatsApp.</p><section className="section"><ConsultationSummary /></section><p className="section-desc"><Link href="/produk" className="text-link">Masih ingin mencari referensi? Kembali ke Katalog Produk →</Link></p></div></>;
}
