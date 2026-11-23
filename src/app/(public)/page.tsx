import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Layers3, MessageCircle, PackageCheck } from "lucide-react";
import { WhatsAppLink } from "@/components/site";
import { CategoryGrid, ProductGrid } from "@/components/interactions";
import { products } from "@/lib/site-data";

const processSteps = [
  ["01", "Konsultasi", "Ceritakan produk, fungsi kemasan, dan perkiraan jumlah yang dibutuhkan."],
  ["02", "Penawaran harga", "Ukuran, bahan, desain, dan jumlah dibahas sebagai dasar penawaran."],
  ["03", "Persetujuan desain", "Tinjau dan setujui desain serta rincian sebelum pengerjaan dimulai."],
  ["04", "Pra-produksi & produksi", "Persiapan dan proses produksi mengikuti kesepakatan pesanan."],
  ["05", "Quality control", "Hasil produksi diperiksa sebelum disiapkan untuk pengiriman."],
  ["06", "Pengiriman", "Metode dan jadwal dibahas sesuai jumlah serta lokasi tujuan."],
];

export default function HomePage() {
  const heroProduct = products[1];

  return (
    <>
      <section className="container hero hero-editorial">
        <div className="hero-copy">
          <p className="eyebrow">CINDERELLA PRINTING · CUSTOM PRINTING &amp; PACKAGING</p>
          <h1 className="hero-title" aria-label="Cetak dan kemasan untuk kebutuhan bisnis Anda.">
            <span className="motion-word-wrap"><span className="motion-word">Cetak dan kemasan</span></span>
            <span className="motion-word-wrap"><span className="motion-word">untuk kebutuhan</span></span>
            <span className="motion-word-wrap hero-title__accent"><span className="motion-word">bisnis Anda.</span></span>
          </h1>
          <p className="lead">
            Jelajahi hasil produksi, temukan kategori yang sesuai, lalu diskusikan
            ukuran, bahan, desain, dan jumlah bersama Cinderella Printing sebelum penawaran disusun.
          </p>
          <div className="button-row">
            <Link href="/produk" className="button button-dark">Jelajahi Katalog <ArrowUpRight size={16} /></Link>
            <WhatsAppLink label="Konsultasi via WhatsApp" />
          </div>
          <p className="helper">Belum memiliki desain atau ukuran? Anda tetap dapat memulai dari kebutuhan produk.</p>
        </div>
        <Link href={`/produk/${heroProduct.slug}`} className="hero-visual hero-visual--photo" aria-label={`Lihat ${heroProduct.name}`}>
          <Image
            src={heroProduct.image}
            alt={heroProduct.imageAlt}
            fill
            priority
            sizes="(max-width: 760px) 92vw, 48vw"
            className="hero-visual__image"
          />
          <span className="hero-photo-caption">
            <span>HASIL PRODUKSI</span>
            <strong>{heroProduct.name}</strong>
          </span>
        </Link>
      </section>

      <section className="trust-strip" data-motion="reveal">
        <div className="container trust-strip__grid">
          <div><PackageCheck size={20} /><span><strong>Custom printing</strong><small>Desain dan ukuran dibahas sesuai kebutuhan</small></span></div>
          <div><Layers3 size={20} /><span><strong>Pilihan bahan</strong><small>Referensi Ivory, Duplex, dan Kraft</small></span></div>
          <div><MessageCircle size={20} /><span><strong>Konsultasi packaging</strong><small>Mulai dari informasi yang sudah diketahui</small></span></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading" data-motion="reveal">
          <div>
            <p className="eyebrow">JELAJAHI LAYANAN</p>
            <h2>Kebutuhan cetak dalam berbagai kategori.</h2>
            <p>Pilih kategori yang paling mendekati tujuan bisnis Anda. Detail produk dan ketersediaan dibahas saat konsultasi.</p>
          </div>
          <Link href="/produk" className="button button-outline">Semua Kategori <ArrowUpRight size={15} /></Link>
        </div>
        <CategoryGrid />
        <div className="center-action"><Link href="/cari-produk" className="text-link">Belum yakin memilih? Gunakan panduan produk →</Link></div>
      </section>

      <section className="section-soft">
        <div className="container">
          <div className="section-heading" data-motion="reveal">
            <div>
              <p className="eyebrow">DOKUMENTASI PRODUK</p>
              <h2>Contoh hasil produksi.</h2>
              <p>Foto produk asli membantu Anda melihat contoh bentuk dan tampilan hasil cetak.</p>
            </div>
            <Link href="/portofolio" className="button button-outline">Lihat Semua Hasil <ArrowUpRight size={15} /></Link>
          </div>
          <ProductGrid limit={3} />
        </div>
      </section>

      <section className="section container">
        <div className="section-heading" data-motion="reveal">
          <div>
            <p className="eyebrow">ALUR LAYANAN</p>
            <h2>Dari konsultasi sampai pengiriman.</h2>
            <p>Rangkaian berikut merupakan gambaran umum. Rincian dan ketentuan dikonfirmasi untuk setiap pesanan.</p>
          </div>
          <Link href="/tentang#alur-pemesanan" className="text-link">Pelajari alur lengkap →</Link>
        </div>
        <div className="home-process-grid" data-motion-group>
          {processSteps.map(([number, title, text]) => (
            <article className="home-process-card" key={number} data-motion-item>
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
        <p className="notice">Untuk kebutuhan berulang, opsi pembagian pengiriman dan sistem re-stock dapat dibahas sesuai jenis produk dan kesepakatan.</p>
      </section>

      <section className="section-soft home-consult-band">
        <div className="container home-consult-inner" data-motion="reveal">
          <div>
            <p className="eyebrow">MULAI DARI KEBUTUHAN ANDA</p>
            <h2>Masih mencari bentuk kemasan yang tepat?</h2>
            <p>Jawab dua langkah singkat untuk membantu mengarahkan konsultasi. Tidak perlu mengetahui semua spesifikasi sejak awal.</p>
          </div>
          <div className="button-row">
            <Link href="/cari-produk" className="button button-dark">Bantu Saya Memilih →</Link>
            <WhatsAppLink label="Tanya langsung" />
          </div>
        </div>
      </section>
    </>
  );
}
