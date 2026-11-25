import { query } from "../lib/db";

export async function readCatalogVersion() {
  const { rows } = await query<{ revision: string }>(
    "SELECT revision::text FROM printing.catalog_revision WHERE id",
  );
  return rows[0].revision;
}
