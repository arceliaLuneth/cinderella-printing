import { CtaBand, PageIntro, WhatsAppLink } from "@/components/site";

const discussionPoints = [
  ["Jenis produk", "Produk yang akan dicetak atau jenis barang yang akan dikemas."],
  ["Jumlah dan ukuran", "Perkiraan jumlah serta dimensi yang dibutuhkan. Informasi awal sudah cukup untuk memulai diskusi."],
  ["Bahan dan bentuk", "Bahan atau bentuk yang diinginkan, apabila sudah diketahui."],
  ["Desain dan referensi", "Desain, sketsa, atau contoh visual untuk membantu menjelaskan arah produk."],
];

const process = [
  ["Konsultasi", "Kebutuhan awal dan tujuan penggunaan produk dibahas bersama."],
  ["Penawaran harga", "Penawaran disusun berdasarkan rincian produk dan spesifikasi yang telah dibahas."],
  ["Persetujuan desain", "Pelanggan meninjau dan menyetujui desain sebelum pengerjaan."],
  ["Produksi", "Pengerjaan mengikuti rincian dan desain yang disepakati."],
  ["Pemeriksaan kualitas", "Hasil produksi diperiksa sebelum disiapkan untuk pengiriman."],
  ["Pengiriman", "Metode dan jadwal dibahas sesuai lokasi serta detail pesanan."],
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="MENGENAL CINDERELLA PRINTING"
        title="Tentang Cinderella Printing"
        description="Kenali layanan cetak dan kemasan, informasi yang dapat disiapkan, serta alur pembahasan kebutuhan sebelum pesanan disepakati."
        breadcrumb="Tentang Kami"
      />

      <section className="section container about-feature">
        <div className="image-placeholder feature-image" role="img" aria-label="Foto produk atau kegiatan Cinderella Printing akan ditambahkan">
          Foto produk atau kegiatan usaha akan ditambahkan
        </div>
        <div>
          <p className="eyebrow">CETAK &amp; KEMASAN CUSTOM</p>
          <h2>Informasi yang jelas membantu kebutuhan dibahas dengan tepat.</h2>
          <p>
            Cinderella Printing merupakan UMKM percetakan yang menjadi objek
            pengembangan website ini. Situs publik disiapkan sebagai tempat untuk
            mengenal usaha, menjelajahi kategori produk, melihat referensi, dan
            memulai konsultasi kebutuhan cetak maupun kemasan.
          </p>
          <p>
            Setiap permintaan dapat memiliki kebutuhan yang berbeda. Karena itu,
            jenis produk, jumlah, ukuran, bahan, desain, dan penawaran perlu
            dibahas serta dikonfirmasi sebelum pesanan dicatat oleh admin.
          </p>
          <WhatsAppLink label="Tanya tentang kebutuhan produk" />
        </div>
      </section>

      <section className="section-soft">
        <div className="container">
          <h2>Informasi yang dapat disiapkan</h2>
          <p className="section-desc">Tidak harus lengkap. Informasi berikut membantu konsultasi menjadi lebih terarah.</p>
          <div className="info-grid two">
            {discussionPoints.map(([title, text]) => (
              <article className="info-card" key={title}><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>Alur konsultasi dan pemesanan</h2>
        <p className="section-desc">Berikut gambaran umum tahapan yang dibahas. Ketentuan, waktu, dan detail aktual dikonfirmasi untuk setiap pesanan.</p>
        <ol className="process-list">
          {process.map(([title, text], index) => (
            <li className="process-item" key={title}>
              <span className="process-number">{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </li>
          ))}
        </ol>
        <p className="notice">
          Jumlah minimum pemesanan, pilihan bahan, estimasi waktu produksi, biaya,
          dan ketentuan pengiriman tidak disamaratakan. Pastikan semuanya dikonfirmasi
          sebelum menyetujui pesanan.
        </p>
      </section>

      <CtaBand title="Mulai dari informasi yang sudah Anda miliki." text="Pilih kategori produk atau sampaikan kebutuhan awal melalui konsultasi." />
    </>
  );
}
