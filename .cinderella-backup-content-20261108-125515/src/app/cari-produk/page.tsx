import Link from "next/link";
import { CtaBand, PageIntro, WhatsAppLink } from "@/components/site";
import { CategoryGrid } from "@/components/interactions";

export default function DiscoveryPage() {
  return <><PageIntro eyebrow="TEMUKAN ARAH PRODUK" title="Apa yang Anda Butuhkan?" description="Pilih kebutuhan yang paling mendekati. Anda tidak perlu tahu semua spesifikasi untuk mulai berdiskusi." breadcrumb="Cari Produk" /><section className="section container"><h2>Mulai dengan kategori</h2><p className="section-desc">Jelajahi pilihan, lihat detail, atau konsultasikan kebutuhan khusus Anda.</p><CategoryGrid /><div className="notice notice-row"><div><h2>Saya Belum Tahu</h2><p>Cukup ceritakan apa yang ingin dikemas atau dicetak. Spesifikasi bisa dibahas bersama.</p></div><Link href="/konsultasi" className="button button-dark">Bantu Saya Memilih →</Link></div></section><CtaBand title="Lebih nyaman bertanya langsung?" text="Lewati pilihan kategori dan mulai percakapan melalui WhatsApp. Tidak perlu mengisi formulir panjang." /></>;
}
