import Link from "next/link";
import { CtaBand, WhatsAppLink } from "@/components/site";
import { CategoryGrid, ProductGrid } from "@/components/interactions";

const processSteps = [
  ["01", "Konsultasi", "Ceritakan jenis produk, jumlah, dan kebutuhan yang sudah Anda ketahui."],
  ["02", "Penawaran Harga", "Spesifikasi dibahas sebagai dasar penyusunan penawaran."],
  ["03", "Persetujuan Desain", "Tinjau dan sepakati desain sebelum proses produksi dimulai."],
  ["04", "Produksi", "Produk diproses berdasarkan spesifikasi dan desain yang telah disepakati."],
  ["05", "Kontrol Kualitas", "Hasil produksi melalui pemeriksaan sebelum dikirim."],
  ["06", "Pengiriman", "Metode dan jadwal pengiriman dibahas sesuai kebutuhan pesanan."],
];

export default function HomePage() {
  return (
    <>
      <section className="container hero">
        <div className="hero-copy">
          <p className="eyebrow">CINDERELLA PRINTING</p>
          <h1>Kemasan yang tepat dimulai dari kebutuhan bisnis Anda.</h1>
          <p className="lead">
            Temukan pilihan produk cetak dan kemasan, jelajahi referensi desain,
            lalu diskusikan ukuran, material, dan kebutuhan produksi untuk
            mendapatkan penawaran yang sesuai.
          </p>
          <div className="button-row">
            <Link href="/produk" className="button button-dark">Jelajahi Katalog →</Link>
            <WhatsAppLink label="Mulai Konsultasi" />
          </div>
          <p className="helper">Belum memiliki spesifikasi lengkap? Mulai dari ide dan kebutuhan produk Anda.</p>
        </div>
        <div className="hero-visual" role="img" aria-label="Area foto produk dan kemasan Cinderella Printing">
          <span>Foto produk dan kemasan akan ditampilkan di sini</span>
        </div>
      </section>

      <section className="section-soft">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Mulai dari kebutuhan, bukan kerumitan.</h2>
              <p>Proses konsultasi membantu memperjelas pilihan sebelum penawaran disusun.</p>
            </div>
          </div>
          <div className="info-grid three">
            {[
              ["Temukan Pilihan Produk", "Jelajahi kategori cetak dan kemasan untuk menemukan titik awal yang sesuai."],
              ["Bahas Spesifikasi", "Diskusikan jumlah, ukuran, material, dan desain berdasarkan kebutuhan produk."],
              ["Dapatkan Penawaran", "Penawaran harga dibahas setelah kebutuhan dan spesifikasi dikonfirmasi."],
            ].map(([title, text]) => (
              <article className="info-card" key={title}><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <h2>Temukan kategori produk</h2>
            <p>Pilih kategori sebagai langkah awal. Detail dan spesifikasi dikonfirmasi saat konsultasi.</p>
          </div>
          <Link href="/produk" className="button button-outline">Lihat Semua Produk →</Link>
        </div>
        <CategoryGrid />
        <div className="center-action"><Link href="/cari-produk" className="text-link">Belum yakin harus memilih yang mana? Bantu saya memilih →</Link></div>
      </section>

      <section className="section-soft">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Referensi produk &amp; kemasan</h2>
              <p>Gunakan contoh kategori sebagai bahan untuk menjelaskan kebutuhan Anda.</p>
            </div>
            <Link href="/portofolio" className="button button-outline">Lihat Referensi →</Link>
          </div>
          <ProductGrid limit={3} />
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <h2>Alur konsultasi hingga pengiriman</h2>
            <p>Setiap tahap dibahas agar kebutuhan dan ekspektasi pesanan lebih jelas.</p>
          </div>
        </div>
        <div className="info-grid three">
          {processSteps.map(([number, title, text]) => (
            <article className="info-card" key={number}>
              <small>{number} / CINDERELLA PRINTING</small>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <CtaBand title="Punya ide untuk produk atau kemasan Anda?" text="Ceritakan kebutuhan awal Anda. Detail yang belum pasti dapat dibahas bersama melalui konsultasi." />
    </>
  );
}
