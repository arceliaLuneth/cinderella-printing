import Link from "next/link";
import { CtaBand, WhatsAppLink } from "@/components/site";
import { CategoryGrid, ProductGrid } from "@/components/interactions";

const steps = [
  ["01", "Konsultasi kebutuhan", "Sampaikan jenis produk, fungsi kemasan, dan perkiraan jumlah yang dibutuhkan."],
  ["02", "Pembahasan spesifikasi dan penawaran", "Ukuran, bahan, desain, dan jumlah diperjelas sebagai dasar penawaran harga."],
  ["03", "Persetujuan desain dan pesanan", "Tinjau detail dan desain. Proses dilanjutkan setelah rincian pesanan disepakati."],
  ["04", "Produksi dan pemeriksaan", "Pengerjaan mengikuti spesifikasi yang disetujui dan melalui pemeriksaan sebelum pengiriman."],
  ["05", "Pengiriman", "Metode dan jadwal pengiriman dibahas sesuai detail pesanan dan lokasi tujuan."],
];

export default function HomePage() {
  return (
    <>
      <section className="container hero">
        <div className="hero-copy">
          <p className="eyebrow">CINDERELLA PRINTING · CETAK &amp; KEMASAN</p>
          <h1>Temukan kemasan yang sesuai dengan kebutuhan produk Anda.</h1>
          <p className="lead">
            Jelajahi kategori cetak dan kemasan, lihat referensi produk, lalu
            diskusikan jumlah, ukuran, bahan, dan desain bersama Cinderella Printing
            sebelum penawaran disusun.
          </p>
          <div className="button-row">
            <Link href="/produk" className="button button-dark">Lihat Katalog Produk →</Link>
            <WhatsAppLink label="Tanya via WhatsApp" />
          </div>
          <p className="helper">Belum tahu ukuran atau bahan? Tidak masalah. Mulai dari jenis produk atau kebutuhan Anda.</p>
        </div>
        <div className="hero-visual" role="img" aria-label="Area foto contoh produk dan kemasan Cinderella Printing">
          <span>Foto produk dan kemasan akan ditambahkan</span>
        </div>
      </section>

      <section className="section-soft">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Mulai dari kebutuhan Anda</h2>
              <p>Website ini membantu Anda memahami pilihan awal sebelum berdiskusi mengenai spesifikasi dan harga.</p>
            </div>
          </div>
          <div className="info-grid three">
            <article className="info-card"><h3>1. Pilih kategori</h3><p>Mulai dari jenis kemasan atau produk yang paling mendekati kebutuhan Anda.</p></article>
            <article className="info-card"><h3>2. Siapkan informasi</h3><p>Isi perkiraan jumlah, ukuran, bahan, atau lampirkan referensi jika sudah tersedia.</p></article>
            <article className="info-card"><h3>3. Lanjutkan konsultasi</h3><p>Gunakan ringkasan sebagai bahan diskusi untuk memperjelas spesifikasi dan penawaran.</p></article>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <h2>Jelajahi kategori produk</h2>
            <p>Pilih kategori untuk melihat referensi awal. Ketersediaan dan detail produk dikonfirmasi saat konsultasi.</p>
          </div>
          <Link href="/produk" className="button button-outline">Semua Kategori →</Link>
        </div>
        <CategoryGrid />
        <div className="center-action"><Link href="/cari-produk" className="text-link">Belum yakin memilih kategori? Bantu saya memilih →</Link></div>
      </section>

      <section className="section-soft">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Inspirasi produk</h2>
              <p>Gunakan referensi kategori untuk menjelaskan bentuk dan kebutuhan produk yang Anda inginkan.</p>
            </div>
            <Link href="/portofolio" className="button button-outline">Lihat Inspirasi →</Link>
          </div>
          <ProductGrid limit={3} />
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <h2>Bagaimana prosesnya?</h2>
            <p>Alur umum dari konsultasi hingga pengiriman. Rincian dan ketentuan setiap pesanan dikonfirmasi bersama pihak usaha.</p>
          </div>
        </div>
        <div className="info-grid three">
          {steps.map(([number, title, text]) => (
            <article className="info-card" key={number}>
              <small>{number} / TAHAP</small><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <CtaBand
        title="Punya kebutuhan cetak atau kemasan?"
        text="Pilih kategori, siapkan informasi awal, lalu lanjutkan konsultasi untuk membahas spesifikasi dan penawaran."
      />
    </>
  );
}
