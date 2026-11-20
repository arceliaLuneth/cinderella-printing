import Image from "next/image";
import { CtaBand, PageIntro, WhatsAppLink } from "@/components/site";

const materials = [
  {
    name: "Ivory",
    label: "Putih di luar dan dalam",
    description:
      "Katalog memperkenalkan Ivory dengan tampilan putih pada kedua sisi dan kesan bersih serta premium. Kesesuaian untuk kontak pangan tetap perlu dipastikan berdasarkan spesifikasi bahan aktual.",
    tone: "ivory",
  },
  {
    name: "Duplex",
    label: "Putih di luar, abu-abu di dalam",
    description:
      "Katalog menjelaskan Duplex sebagai pilihan yang lebih ekonomis dibanding Ivory, dengan sisi luar putih dan bagian dalam abu-abu.",
    tone: "duplex",
  },
  {
    name: "Kraft",
    label: "Warna cokelat alami",
    description:
      "Katalog menampilkan Kraft dengan warna cokelat alami dan karakter visual yang natural. Pilihan bahan dan kesesuaiannya dibahas menurut kebutuhan produk.",
    tone: "kraft",
  },
];

const process = [
  ["01", "Konsultasi", "Kebutuhan produk, fungsi kemasan, dan perkiraan jumlah dibahas bersama."],
  ["02", "Penawaran harga", "Rincian spesifikasi digunakan sebagai dasar penyusunan penawaran."],
  ["03", "Persetujuan desain", "Desain dan detail pesanan ditinjau sebelum masuk ke tahap berikutnya."],
  ["04", "Pra-produksi", "Persiapan produksi dilakukan sesuai jenis produk dan ketentuan yang disepakati."],
  ["05", "Produksi", "Pengerjaan mengikuti spesifikasi dan desain yang telah disetujui."],
  ["06", "Quality control", "Hasil produksi diperiksa sebelum disiapkan untuk pengiriman."],
  ["07", "Pengiriman pertama", "Pengiriman awal mengikuti jumlah dan jadwal yang disepakati."],
  ["08", "Analisis re-stock", "Untuk kebutuhan berulang, kebutuhan stok berikutnya dapat dibahas bersama."],
  ["09", "Pengiriman selanjutnya", "Pengiriman lanjutan dilakukan sesuai pembagian dan kesepakatan pesanan."],
  ["10", "Re-stock berikutnya", "Siklus pengadaan ulang dapat direncanakan sesuai kebutuhan bisnis."],
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="MENGENAL CINDERELLA PRINTING"
        title="Cetak dan kemasan untuk kebutuhan bisnis."
        description="Kenali ragam layanan, pilihan bahan yang diperkenalkan dalam katalog, serta alur konsultasi dan pemesanan Cinderella Printing."
        breadcrumb="Tentang Kami"
      />

      <section className="section container about-feature about-feature--editorial" id="layanan">
        <div className="about-feature__visual about-feature__visual--photo" data-motion-image>
          <Image
            src="/images/portfolio/roti-bakar-katalji-rasa.webp"
            alt="Dokumentasi kemasan roti bakar Katalji Rasa sebagai contoh hasil produksi Cinderella Printing."
            fill
            sizes="(max-width: 760px) 92vw, 42vw"
            className="about-feature__photo"
          />
          <span>DOCUMENTED PRINT &amp; PACKAGING WORK</span>
        </div>
        <div data-motion="reveal">
          <p className="eyebrow">CUSTOM PRINTING &amp; PACKAGING</p>
          <h2>Setiap produk memiliki kebutuhan kemasan yang berbeda.</h2>
          <p>
            Cinderella Printing menyediakan beragam kebutuhan cetak dan kemasan untuk bisnis,
            mulai dari packaging, branding, materi promosi, kebutuhan office, hingga kemasan khusus.
          </p>
          <p>
            Pengunjung dapat menjelajahi kategori dan melihat dokumentasi produk sebagai referensi.
            Ukuran, bahan, desain, jumlah, serta penawaran dibahas dan dikonfirmasi sebelum pesanan dicatat.
          </p>
          <WhatsAppLink label="Diskusikan kebutuhan Anda →" />
        </div>
      </section>

      <section className="section-soft material-story">
        <div className="container material-story__grid">
          <aside className="material-story__visual">
            <div className="material-story__sticky">
              <p className="eyebrow">PANDUAN BAHAN</p>
              <h2>Kenali karakter bahan sebelum memilih.</h2>
              <p className="muted">Tiga nama bahan berikut diperkenalkan dalam katalog Cinderella Printing. Ketersediaan dan kesesuaian bahan perlu dikonfirmasi untuk tiap produk.</p>
              <div className="material-swatches" aria-label="Ilustrasi karakter warna bahan">
                <span className="swatch swatch--ivory" title="Ilustrasi Ivory" />
                <span className="swatch swatch--duplex" title="Ilustrasi Duplex" />
                <span className="swatch swatch--kraft" title="Ilustrasi Kraft" />
              </div>
              <p className="helper">Ilustrasi warna, bukan foto atau sampel fisik bahan.</p>
            </div>
          </aside>
          <div className="material-story__steps">
            {materials.map((material, index) => (
              <article className="material-step" key={material.name} data-motion-step>
                <span className={`material-step__swatch swatch--${material.tone}`} aria-hidden="true" />
                <div>
                  <p className="card-kicker">BAHAN 0{index + 1}</p>
                  <h3>{material.name}</h3>
                  <strong>{material.label}</strong>
                  <p>{material.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container" id="alur-pemesanan">
        <div className="section-heading" data-motion="reveal">
          <div>
            <p className="eyebrow">ALUR PEMESANAN &amp; RE-STOCK</p>
            <h2>Proses yang dibahas sejak konsultasi.</h2>
            <p>Berikut tahapan yang ditampilkan dalam katalog digital. Detail dan penerapan setiap tahap mengikuti jenis produk dan kesepakatan pesanan.</p>
          </div>
        </div>
        <div className="process-timeline" data-motion-timeline data-motion-group>
          <span className="process-timeline__track" aria-hidden="true" />
          <span className="process-timeline__progress" aria-hidden="true" />
          {process.map(([number, title, description]) => (
            <article className="process-timeline__item" key={number} data-motion-item>
              <span className="process-timeline__number">{number}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </article>
          ))}
        </div>
        <div className="restock-example" data-motion="reveal">
          <div>
            <p className="eyebrow">CONTOH ILUSTRATIF DI KATALOG</p>
            <h3>Pembagian pengiriman untuk kebutuhan berulang.</h3>
            <p>Contoh katalog: kebutuhan 3.000 pcs dapat dibagi menjadi 2.500 pcs pada pengiriman pertama dan 500 pcs pada pengiriman berikutnya ketika stok diperlukan.</p>
            <p className="helper">Jumlah, jadwal, biaya, dan persediaan harus disepakati secara khusus. Contoh ini bukan ketentuan otomatis untuk semua pesanan.</p>
          </div>
          <div className="restock-example__numbers">
            <div><span>Total contoh</span><strong>3.000 <small>pcs</small></strong></div>
            <div><span>Pengiriman pertama</span><strong>2.500 <small>pcs</small></strong></div>
            <div><span>Pengiriman lanjutan</span><strong>500 <small>pcs</small></strong></div>
          </div>
        </div>
        <div className="notice notice-preproduction" data-motion="reveal">
          <strong>Pra-produksi:</strong> katalog menyebut biaya pembuatan pisau pond dan plat cetak tidak dikenakan untuk jenis produk dan kondisi yang berlaku. Konfirmasikan ketentuannya pada saat penawaran.
        </div>
      </section>
      <CtaBand title="Mulai dari diskusi kebutuhan Anda." text="Ceritakan jenis produk, perkiraan jumlah, atau referensi desain. Spesifikasi dan penawaran dibahas sebelum pesanan disepakati." />
    </>
  );
}
