import { CtaBand, PageIntro } from "@/components/site";
import { PortfolioBrowser } from "@/components/interactions";

export default function InspirationPage() {
  return (
    <>
      <PageIntro
        eyebrow="REFERENSI CETAK &amp; KEMASAN"
        title="Inspirasi Produk"
        description="Lihat referensi kategori untuk membantu menjelaskan bentuk, fungsi, dan arah desain produk yang ingin Anda diskusikan."
        breadcrumb="Inspirasi Produk"
      />
      <section className="section-soft">
        <div className="container portfolio-feature">
          <div className="image-placeholder feature-image" role="img" aria-label="Foto inspirasi produk akan ditambahkan">
            Foto inspirasi produk akan ditambahkan
          </div>
          <div>
            <p className="eyebrow">REFERENSI, BUKAN SPESIFIKASI FINAL</p>
            <h2>Gunakan contoh untuk menjelaskan ide Anda.</h2>
            <p className="muted">
              Referensi visual membantu menyamakan gambaran mengenai bentuk,
              fungsi, dan tampilan produk. Contoh pada halaman ini bukan janji
              bahwa setiap bentuk atau material pasti tersedia untuk diproduksi.
              Kelayakan dan detailnya perlu dikonfirmasi saat konsultasi.
            </p>
          </div>
        </div>
      </section>
      <section className="section container">
        <h2>Galeri inspirasi produk</h2>
        <p className="section-desc">Pilih kategori yang paling mendekati kebutuhan Anda, kemudian gunakan sebagai bahan konsultasi.</p>
        <PortfolioBrowser />
        <p className="notice">
          Galeri saat ini berisi referensi kategori. Foto proyek aktual, nama klien,
          dan detail pekerjaan hanya akan ditambahkan setelah materi serta izin
          publikasinya dikonfirmasi.
        </p>
      </section>
      <CtaBand title="Memiliki contoh atau desain sendiri?" text="Sampaikan ide, sketsa, atau file referensi saat konsultasi. Desain final tidak harus tersedia untuk memulai diskusi." />
    </>
  );
}
