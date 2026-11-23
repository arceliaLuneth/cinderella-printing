import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppLink } from "@/components/site";
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
          <Link href="/">Beranda</Link> / <Link href="/produk">Produk</Link> / <span aria-current="page">{product.name}</span>
        </nav>
      </div>
      <section className="container product-detail product-detail--editorial">
        <div className="product-detail__visual" data-motion-image>
          <Image src={product.image} alt={product.imageAlt} fill priority sizes="(max-width: 760px) 92vw, 50vw" className="product-detail__image" />
          <span className="product-detail__image-label">DOKUMENTASI HASIL PRODUKSI</span>
        </div>
        <div className="product-detail__copy" data-motion="reveal">
          <p className="eyebrow">{product.category.toUpperCase()} · HASIL PRODUKSI</p>
          <h1>{product.name}</h1>
          <p className="lead">{product.description}</p>
          <p className="muted">Foto ini merupakan referensi tampilan produk. Spesifikasi teknis dan kemungkinan produksi untuk kebutuhan Anda perlu dibahas secara terpisah.</p>
          <div className="spec-list">
            <div><span>Jumlah minimum</span><strong>{product.moq}</strong></div>
            <div><span>Pilihan bahan</span><strong>{product.material}</strong></div>
            <div><span>Ukuran</span><strong>{product.size}</strong></div>
          </div>
          <div className="button-row product-detail__actions">
            <Link href={`/konsultasi?produk=${encodeURIComponent(product.name)}`} className="button button-dark">Bahas Produk Ini →</Link>
            <WhatsAppLink label="WhatsApp" />
          </div>
          <p className="helper">Belum mengetahui jumlah, bahan, atau ukuran? Informasi tersebut dapat dibahas saat konsultasi.</p>
        </div>
      </section>
      <section className="section-soft">
        <div className="container">
          <h2>Hal yang dapat dibahas saat konsultasi</h2>
          <p className="section-desc">Gunakan foto sebagai referensi visual. Kebutuhan produksi ditentukan berdasarkan produk yang akan dikemas.</p>
          <div className="info-grid three" data-motion-group>
            <article className="info-card" data-motion-item><h3>Fungsi produk</h3><p>Jelaskan jenis produk dan cara kemasan akan digunakan.</p></article>
            <article className="info-card" data-motion-item><h3>Ukuran dan bahan</h3><p>Diskusikan dimensi, bahan, dan kebutuhan struktur kemasan.</p></article>
            <article className="info-card" data-motion-item><h3>Desain dan finishing</h3><p>Sampaikan desain, warna, dan tampilan akhir yang diharapkan.</p></article>
          </div>
        </div>
      </section>
      <section className="section container">
        <Link href="/produk" className="text-link">← Kembali ke katalog produk</Link>
      </section>
    </>
  );
}
