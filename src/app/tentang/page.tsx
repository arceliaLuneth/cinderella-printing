import { CtaBand, PageIntro, WhatsAppLink } from "@/components/site";

const principles = [
  ["Mulai dari Kebutuhan", "Pelanggan dapat memulai konsultasi dari fungsi produk, ide, atau referensi yang sudah dimiliki."],
  ["Spesifikasi Dibahas Bersama", "Jumlah, ukuran, material, bentuk, dan desain dapat diperjelas dalam pembahasan kebutuhan."],
  ["Penawaran Berdasarkan Kebutuhan", "Penawaran harga disusun setelah detail produk dan kebutuhan kustomisasi dibahas."],
];

const steps = [
  ["01 / CONSULTATION", "Konsultasi", "Sampaikan produk yang dibutuhkan, perkiraan jumlah, dan spesifikasi awal."],
  ["02 / QUOTATION", "Penawaran Harga", "Kebutuhan dan spesifikasi dibahas sebagai dasar penawaran harga."],
  ["03 / DESIGN APPROVAL", "Persetujuan Desain", "Tinjau dan setujui desain sebelum proses produksi."],
  ["04 / PRODUCTION", "Produksi", "Produksi dilakukan berdasarkan spesifikasi dan desain yang disepakati."],
  ["05 / QUALITY CONTROL", "Kontrol Kualitas", "Hasil produksi diperiksa sebelum memasuki tahap pengiriman."],
  ["06 / DELIVERY", "Pengiriman", "Metode dan jadwal pengiriman dibahas sesuai kebutuhan pesanan."],
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="MENGENAL CINDERELLA PRINTING"
        title="Tentang Cinderella Printing"
        description="Kenali pendekatan layanan cetak dan kemasan custom, serta pahami tahapan konsultasi sebelum kebutuhan produksi disepakati."
        breadcrumb="Tentang Kami"
      />

      <section className="section container about-feature">
        <div className="image-placeholder feature-image" role="img" aria-label="Foto produk atau aktivitas Cinderella Printing">
          Foto produk atau aktivitas perusahaan
        </div>
        <div>
          <p className="eyebrow">CUSTOM PRINTING &amp; PACKAGING</p>
          <h2>Cetak dan kemasan yang berangkat dari kebutuhan bisnis.</h2>
          <p>
            Cinderella Printing berfokus pada kebutuhan cetak dan kemasan custom.
            Website ini menjadi media informasi bagi pelanggan untuk mengenal
            kategori produk, melihat referensi, dan menyiapkan kebutuhan sebelum
            berdiskusi lebih lanjut.
          </p>
          <p className="muted">
            Setiap kebutuhan dapat memiliki spesifikasi yang berbeda. Karena itu,
            ukuran, material, jumlah, desain, dan penawaran dibahas melalui proses konsultasi.
          </p>
          <WhatsAppLink label="Diskusikan Kebutuhan Anda" />
        </div>
      </section>

      <section className="section-soft">
        <div className="container">
          <h2>Pendekatan kami</h2>
          <p className="section-desc">Proses dimulai dari informasi yang sudah Anda miliki, tanpa mengharuskan semua spesifikasi tersedia sejak awal.</p>
          <div className="info-grid three">
            {principles.map(([title, text]) => (
              <article className="info-card" key={title}><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>Bagaimana proses pemesanan berlangsung?</h2>
        <p className="section-desc">Dari konsultasi awal hingga pengiriman, detail dan jadwal dibahas berdasarkan kebutuhan pesanan.</p>
        <div className="info-grid three">
          {steps.map(([eyebrow, title, text]) => (
            <article className="info-card" key={eyebrow}>
              <small>{eyebrow}</small><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
        <p className="notice">
          MOQ, ketersediaan material, spesifikasi produksi, estimasi waktu, dan
          ketentuan pengiriman harus dikonfirmasi saat konsultasi serta penawaran.
        </p>
      </section>

      <CtaBand title="Mari mulai dari kebutuhan produk Anda." text="Pilih kategori produk atau hubungi Cinderella Printing untuk membahas ide dan spesifikasi awal." />
    </>
  );
}
