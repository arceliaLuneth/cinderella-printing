import Link from "next/link";
import type { CatalogProduct } from "@/lib/public-catalog";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function ProductPhoto({ product, className }: { product: CatalogProduct; className?: string }) {
  if (!product.image_url) return null;
  // Storage images are already compressed and served by Supabase.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={product.image_url} alt={product.name} className={className ?? "catalog-photo"} loading="lazy" />;
}

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  if (!products.length) return <p className="muted" role="status">Belum ada produk yang ditampilkan.</p>;
  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <ProductPhoto product={product} />
          <div className="card-body">
            <p className="card-kicker">{product.category_name}</p>
            <h3>{product.name}</h3>
            {product.description && <p>{product.description}</p>}
            {product.reference_price !== null && <p>Harga referensi {rupiah.format(BigInt(product.reference_price))} / {product.unit}</p>}
            <Link href={`/produk/${product.slug}`} className="text-link">Lihat detail →</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
