import Image from "next/image";
import { CtaBand, PageIntro } from "@/components/site";
import { PortfolioBrowser } from "@/components/interactions";
import { products } from "@/lib/site-data";

export default function PortfolioPage() {
  const featured = products[4];
  return (
    <>
      <PageIntro
        eyebrow="DOKUMENTASI PRODUK"
        title="Hasil cetak dan kemasan."
        description="Lihat beberapa contoh hasil produksi Cinderella Printing. Gunakan foto sebagai referensi awal untuk menjelaskan bentuk dan tampilan yang Anda inginkan."
        breadcrumb="Portofolio"
      />
      <section className="section-soft">
        <div className="container portfolio-feature portfolio-feature--large">
          <div className="portfolio-feature__image" data-motion-image>
            <Image src={featured.image} alt={featured.imageAlt} fill priority sizes="(max-width: 760px) 92vw, 50vw" className="portfolio-feature__photo" />
          </div>
          <div data-motion="reveal">
            <p className="eyebrow">PILIHAN HASIL PRODUKSI</p>
            <h2>{featured.name}</h2>
            <p>{featured.description}</p>
            <p className="muted">Foto menampilkan hasil fisik produk. Bahan, ukuran, finishing, dan detail spesifikasi tidak disimpulkan dari gambar.</p>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading" data-motion="reveal">
          <div>
            <p className="eyebrow">GALERI PRODUK</p>
            <h2>Jelajahi dokumentasi hasil produksi.</h2>
            <p>Geser galeri untuk melihat contoh produk lainnya. Pilih salah satu sebagai referensi konsultasi.</p>
          </div>
        </div>
        <PortfolioBrowser />
      </section>
      <CtaBand title="Punya referensi atau desain sendiri?" text="Kirimkan gambar, sketsa, atau ide saat konsultasi. Desain final tidak harus tersedia untuk memulai diskusi." />
    </>
  );
}
