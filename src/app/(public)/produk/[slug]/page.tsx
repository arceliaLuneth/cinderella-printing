import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogUnavailable } from "@/components/catalog";
import { ProductPhoto } from "@/components/catalog-grid";
import { CatalogSync } from "@/components/catalog-sync";
import { PageIntro, CtaBand } from "@/components/site";
import { readCatalog, readPageCatalogVersion } from "@/lib/public-catalog";

async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const revision = await readPageCatalogVersion();
  const [{ slug }, catalog] = await Promise.all([params, readCatalog()]);
  if (!catalog) return <section className="section container"><CatalogSync revision={null} /><CatalogUnavailable /></section>;
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product) notFound();

  return (
    <>
      <CatalogSync revision={revision} />
      <PageIntro eyebrow={product.category_name} title={product.name} description={product.description} breadcrumb={product.name} />
      <section className={`section container${product.image_url ? " product-detail" : ""}`}>
        <ProductPhoto product={product} className="catalog-detail-photo" />
        <div>
          <dl className="spec-list">
            <div><dt>Jumlah minimum</dt><dd>{product.min_order} {product.unit}</dd></div>
            {product.reference_price !== null && (
              <div>
                <dt>Harga referensi</dt>
                <dd>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(BigInt(product.reference_price))} / {product.unit}</dd>
              </div>
            )}
          </dl>
          <div className="button-row">
            <Link href={`/konsultasi?produk=${product.slug}`} className="button button-dark">Bahas produk ini →</Link>
            <Link href="/produk" className="button button-outline">Kembali ke katalog</Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<p className="section container" role="status">Memuat produk…</p>}><ProductDetails params={params} /></Suspense>;
}
