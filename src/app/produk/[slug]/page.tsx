import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site";
import { products } from "@/lib/site-data";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  return (
    <>
      <div className="container page-intro">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link> / <Link href="/produk">Produk</Link> / <span aria-current="page">{product.category}</span>
        </nav>
      </div>
      <section className="container product-detail">
        <div>
          <div className="image-placeholder detail-image" role="img" aria-label={`Foto ${product.category} akan ditambahkan`}>
            Foto {product.category.toLowerCase()} akan ditambahkan
          </div>
          <p className="helper">Foto produk resmi akan ditambahkan setelah materi dari pihak usaha tersedia.</p>
        </div>
        <div>
          <p className="eyebrow">KATEGORI PRODUK</p>
          <h1>{product.category}</h1>
          <p className="lead">{product.description}</p>
          <p className="muted">
            Halaman ini membantu mengidentifikasi kebutuhan awal. Detail produksi
            dan ketersediaan opsi perlu diperiksa bersama pihak Cinderella Printing.
          </p>
          <div className="spec-list">
            <div><span>Jumlah minimum</span><strong>{product.moq}</strong></div>
            <div><span>Pilihan bahan</span><strong>{product.material}</strong></div>
            <div><span>Ukuran</span><strong>{product.size}</strong></div>
          </div>
          <Link href={`/konsultasi?produk=${encodeURIComponent(product.name)}`} className="button button-dark button-full">Bahas Kategori Ini →</Link>
          <Link href="/faq-kontak" className="button button-outline button-full">Lihat FAQ &amp; Kontak</Link>
          <p className="helper">Belum mengetahui jumlah, bahan, atau ukuran? Informasi tersebut boleh dibahas saat konsultasi.</p>
        </div>
      </section>
      <section className="section-soft">
        <div className="container">
          <h2>Informasi yang perlu dibahas</h2>
          <p className="section-desc">Informasi berikut membantu menentukan spesifikasi. Ketersediaannya belum dapat diasumsikan dari contoh kategori.</p>
          <div className="info-grid three">
            <article className="info-card"><h3>Fungsi dan penggunaan</h3><p>Jelaskan produk yang akan dikemas dan kondisi penggunaannya.</p></article>
            <article className="info-card"><h3>Bahan dan ukuran</h3><p>Bahas pilihan bahan dan dimensi yang sesuai dengan kebutuhan produk.</p></article>
            <article className="info-card"><h3>Cetak dan tampilan akhir</h3><p>Diskusikan kebutuhan desain, warna, dan hasil akhir yang diinginkan.</p></article>
          </div>
        </div>
      </section>
      <section className="section container">
        <h2>Jelajahi kategori lainnya</h2>
        <p className="section-desc">Bandingkan referensi kategori lain sebelum menyiapkan konsultasi.</p>
        <Link href="/produk" className="text-link">Kembali ke katalog produk →</Link>
      </section>
      <CtaBand />
    </>
  );
}
