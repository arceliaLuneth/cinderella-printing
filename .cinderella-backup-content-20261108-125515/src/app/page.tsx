import Link from "next/link";
import { CtaBand, WhatsAppLink } from "@/components/site";
import { CategoryGrid, ProductGrid } from "@/components/interactions";

const steps = [
  ["1. Konsultasi", "Ceritakan kebutuhan produk, jumlah, dan spesifikasi yang sudah Anda ketahui."],
  ["2. Penawaran Harga", "Spesifikasi dibahas untuk menyusun penawaran harga."],
  ["3. Persetujuan Desain", "Tinjau dan setujui desain sebelum proses produksi."],
  ["4. Produksi", "Produk dibuat berdasarkan spesifikasi dan desain yang disepakati."],
  ["5. Kontrol Kualitas (QC)", "Hasil produksi diperiksa sebelum proses pengiriman."],
  ["6. Pengiriman", "Pengiriman dibahas sesuai kebutuhan pesanan."],
];

export default function HomePage() {
  return <>
    <section className="container hero"><div className="hero-copy"><p className="eyebrow">CINDERELLA PRINTING</p><h1>Cetak &amp; kemasan custom untuk kebutuhan bisnis Anda.</h1><p className="lead">Temukan pilihan produk, jelajahi referensi, lalu diskusikan kebutuhan Anda untuk mendapatkan penawaran harga.</p><div className="button-row"><Link href="/cari-produk" className="button button-dark">Cari Produk →</Link><WhatsAppLink label="Konsultasi via WhatsApp" /></div><p className="helper">Belum tahu spesifikasinya? Tidak apa-apa. Mulai dari kebutuhan Anda.</p></div><div className="hero-visual"><span>Gambar produk / kemasan utama</span></div></section>
    <section className="section-soft"><div className="container"><h2>Mulai dari kebutuhan, bukan kerumitan.</h2><div className="info-grid three">{[["Temukan arah produk", "Jelajahi kategori untuk memperjelas kebutuhan bisnis Anda."], ["Diskusikan spesifikasi", "Ukuran, bahan, dan desain dapat dibahas saat konsultasi."], ["Minta penawaran harga", "Penawaran disusun berdasarkan kebutuhan yang didiskusikan."]].map(([title, text]) => <article className="info-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    <section className="section container"><div className="section-heading"><div><h2>Cari produk yang Anda butuhkan</h2><p>Pilih kategori sebagai langkah awal. Detail produk dan spesifikasi dikonfirmasi saat konsultasi.</p></div></div><CategoryGrid /><div className="center-action"><Link href="/cari-produk" className="text-link">Saya Belum Tahu — bantu saya memilih →</Link></div></section>
    <section className="section-soft"><div className="container"><div className="section-heading"><div><h2>Referensi portofolio</h2><p>Jadikan referensi untuk mendiskusikan kebutuhan Anda.</p></div><Link href="/portofolio" className="button button-outline">Lihat Portofolio →</Link></div><ProductGrid limit={3} /></div></section>
    <section className="section container"><div className="section-heading"><div><h2>Cara memesan</h2><p>Dari diskusi awal hingga pengiriman. Detail dan jadwal pesanan dibahas bersama.</p></div></div><div className="info-grid three">{steps.map(([title, text]) => <article className="info-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <CtaBand />
  </>;
}
