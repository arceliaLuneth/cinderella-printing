import Link from "next/link";
import { connection } from "next/server";
import { readCatalog, readPageCatalogVersion, type CatalogCategory } from "@/lib/public-catalog";
import { listPhotos } from "@/services/inspiration";
import { CatalogBrowser, ConsultationForm } from "./interactions";
import { ProductGrid } from "./catalog-grid";
import { CatalogSync } from "./catalog-sync";

function CategoryGrid({ categories }: { categories: CatalogCategory[] }) {
  if (!categories.length) return <p className="muted" role="status">Belum ada kategori yang ditampilkan.</p>;
  return (
    <div className="product-grid">
      {categories.map((category) => (
        <article className="product-card" key={category.id}>
          <div className="card-body">
            <h3>{category.name}</h3>
            {category.description && <p>{category.description}</p>}
            <Link href={`/produk?kategori=${category.slug}`} className="text-link">Lihat produk →</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CatalogUnavailable() {
  return <p className="notice" role="status">Katalog sedang tidak tersedia. Silakan coba lagi atau hubungi kami untuk konsultasi.</p>;
}

type CatalogView = "home" | "categories" | "products" | "photos";

export async function CatalogContent({ view }: { view: CatalogView | "consultation" }) {
  if (view === "consultation") {
    const catalog = await readCatalog();
    return <ConsultationForm categories={catalog?.categories ?? []} products={catalog?.products ?? []} />;
  }

  // Read the revision first so a concurrent write cannot hide a change from the browser.
  const revision = await readPageCatalogVersion();
  return <><CatalogSync revision={revision} /><PublicCatalogView view={view} /></>;
}

async function PublicCatalogView({ view }: { view: CatalogView }) {
  if (view === "photos") return <InspirationGallery />;
  const catalog = await readCatalog();
  if (!catalog) return <CatalogUnavailable />;
  if (view === "categories") return <CategoryGrid categories={catalog.categories} />;
  if (view === "products") return <CatalogBrowser {...catalog} />;
  return (
    <>
      <h2>Kategori produk</h2>
      <CategoryGrid categories={catalog.categories} />
      <h2 className="catalog-section-title">Produk terbaru</h2>
      <ProductGrid products={catalog.products.slice(0, 6)} />
    </>
  );
}

async function InspirationGallery() {
  await connection();
  const [gallery, catalog] = await Promise.all([listPhotos(true).catch(() => null), readCatalog()]);
  if (!gallery && !catalog) return <CatalogUnavailable />;

  const photos = gallery ?? [];
  const galleryUrls = new Set(photos.map((photo) => photo.image_url));
  const products = catalog?.products.filter((product) => product.image_url && !galleryUrls.has(product.image_url)) ?? [];
  if (!photos.length && !products.length) {
    return gallery ? <p className="muted" role="status">Belum ada foto inspirasi.</p> : <CatalogUnavailable />;
  }
  return (
    <>
      {photos.length > 0 && (
        <div className="product-grid">
          {photos.map((photo) => (
            <article className="product-card" key={photo.id}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Photos are served directly from Supabase Storage. */}
              <img className="catalog-photo" src={photo.image_url} alt={photo.title} loading="lazy" />
              <div className="card-body">
                <h3>{photo.title}</h3>
                {photo.description && <p>{photo.description}</p>}
                <Link href={`/konsultasi?referensi=${encodeURIComponent(photo.title)}`} className="text-link">Bahas referensi ini →</Link>
              </div>
            </article>
          ))}
        </div>
      )}
      {products.length > 0 && (
        <>
          {photos.length > 0 && <h2 className="catalog-section-title">Foto dari katalog</h2>}
          <ProductGrid products={products} />
        </>
      )}
    </>
  );
}
