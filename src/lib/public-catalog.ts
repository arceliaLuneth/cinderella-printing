import "server-only";
import { connection } from "next/server";
import { query } from "@/lib/db";
import { readCatalogVersion } from "@/services/catalog-version";

export type CatalogCategory = { id: string; slug: string; name: string; description: string };
export type CatalogProduct = {
  id: string; slug: string; name: string; category_id: string; category_name: string;
  description: string; image_url: string | null; reference_price: string | null;
  min_order: number; unit: string;
};

export async function readPageCatalogVersion() {
  await connection();
  return readCatalogVersion().catch(() => null);
}

export async function readCatalog() {
  await connection();
  try {
    const [categories, products] = await Promise.all([
      query<CatalogCategory>("SELECT id, slug, name, description FROM printing.categories WHERE is_active ORDER BY name, id"),
      query<CatalogProduct>(`SELECT p.id, p.slug, p.name, p.category_id, c.name AS category_name, p.description, p.image_url,
        p.reference_price, p.min_order, p.unit FROM printing.products p
        JOIN printing.categories c ON c.id = p.category_id
        WHERE p.is_active AND c.is_active ORDER BY p.created_at DESC, p.id`),
    ]);
    return { categories: categories.rows, products: products.rows };
  } catch {
    return null;
  }
}
