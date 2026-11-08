import { CtaBand, PageIntro } from "@/components/site";
import { PortfolioBrowser } from "@/components/interactions";

export default function PortfolioPage() {
  return (
    <>
      <PageIntro
        eyebrow="REFERENSI PRODUK & KEMASAN"
        title="Inspirasi Produk"
        description="Jelajahi kategori referensi untuk membantu menjelaskan bentuk, fungsi, dan kebutuhan desain saat konsultasi."
        breadcrumb="Portofolio"
      />
      <section className="section-soft">
        <div className="container portfolio-feature">
          <div className="image-placeholder feature-image" role="img" aria-label="Referensi produk dan kemasan">
            Foto referensi produk akan ditambahkan
          </div>
          <div>
            <p className="eyebrow">REFERENSI CETAK &amp; KEMASAN</p>
            <h2>Mulai dari contoh, kembangkan sesuai kebutuhan.</h2>
            <p className="muted">
              Referensi membantu Anda menjelaskan jenis produk, bentuk kemasan,
              dan arah desain yang diinginkan. Gunakan contoh sebagai bahan diskusi,
              bukan sebagai spesifikasi atau hasil produksi yang dijanjikan.
            </p>
          </div>
        </div>
      </section>
      <section className="section container">
        <h2>Galeri referensi produk</h2>
        <p className="section-desc">Pilih kategori yang paling mendekati kebutuhan Anda, lalu gunakan sebagai bahan konsultasi.</p>
        <PortfolioBrowser />
        <p className="notice">
          Galeri ini berisi referensi kategori awal. Foto hasil produksi dan detail
          proyek aktual perlu ditambahkan setelah materi resmi tersedia.
        </p>
      </section>
      <CtaBand title="Punya contoh atau desain sendiri?" text="Sampaikan ide, sketsa, atau gambar referensi Anda saat konsultasi. Desain final belum diperlukan untuk memulai diskusi." />
    </>
  );
}
