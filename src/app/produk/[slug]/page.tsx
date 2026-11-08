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
        <div className="breadcrumb">Beranda / Produk / {product.category} / {product.name}</div>
      </div>
      <section className="container product-detail">
        <div>
          <div className="image-placeholder detail-image" role="img" aria-label={`Foto ${product.category.toLowerCase()}`}>
            Foto produk akan ditambahkan
          </div>
          <p className="helper">Foto dan detail visual perlu menggunakan materi produk yang telah disetujui.</p>
        </div>
        <div>
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="lead">{product.description}</p>
          <p className="muted">
            Gunakan referensi ini sebagai titik awal diskusi. Spesifikasi,
            kemungkinan kustomisasi, dan penawaran harga dikonfirmasi saat konsultasi.
          </p>
          <div className="spec-list">
            <div><span>Minimum pemesanan (MOQ)</span><strong>{product.moq}</strong></div>
            <div><span>Material</span><strong>{product.material}</strong></div>
            <div><span>Ukuran</span><strong>{product.size}</strong></div>
          </div>
          <Link href={`/konsultasi?produk=${encodeURIComponent(product.name)}`} className="button button-dark button-full">Konsultasikan Produk Ini →</Link>
          <Link href="/faq-kontak" className="button button-outline button-full">Lihat Informasi Kontak ↗</Link>
          <p className="helper">Belum mengetahui jumlah atau ukuran? Anda tetap dapat memulai konsultasi.</p>
        </div>
      </section>
      <section className="section-soft">
        <div className="container">
          <h2>Detail yang dapat dibahas</h2>
          <p className="section-desc">Informasi berikut menjadi bahan konsultasi dan bukan spesifikasi yang sudah disepakati.</p>
          <div className="info-grid three">
            {[
              ["Material & Ukuran", "Diskusikan bahan dan dimensi yang sesuai dengan fungsi produk."],
              ["Bentuk & Konstruksi", "Jelaskan bentuk, struktur, atau cara penggunaan produk yang dibutuhkan."],
              ["Cetak & Finishing", "Bahas kebutuhan tampilan visual dan detail akhir produk."],
            ].map(([title, text]) => (
              <article className="info-card" key={title}><h3>{title}</h3><p>{text}</p><small>Dikonfirmasi saat konsultasi</small></article>
            ))}
          </div>
          <p className="notice">Ketersediaan setiap opsi produksi perlu dikonfirmasi berdasarkan kategori dan kebutuhan produk.</p>
        </div>
      </section>
      <section className="section container">
        <h2>Jelajahi kategori lainnya</h2>
        <p className="section-desc">Bandingkan referensi lain untuk membantu menjelaskan kebutuhan Anda.</p>
        <Link href="/produk" className="text-link">Kembali ke katalog produk →</Link>
      </section>
      <CtaBand />
    </>
  );
}
