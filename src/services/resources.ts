import type { PoolClient } from "pg";
import { query, transaction, audit } from "../lib/db";
import { missing } from "../lib/errors";
import type { CompanyInput } from "../lib/schemas";

type Row = Record<string, unknown>;
type Filters = { page: number; limit: number; q?: string; active?: string; category_id?: string };
type Resource = "categories" | "products" | "customers";
const jsonColumns = new Set(["services", "portfolio", "how_to_order", "faqs"]);
const like = (value: string) => "%" + value.replace(/[\\%_]/g, "\\$&") + "%";

export async function company() {
  const { rows } = await query("SELECT * FROM printing.company_profile WHERE id=true");
  const profile = rows[0] || missing("Profil usaha");
  const whatsapp = String(profile.whatsapp || "");
  return { ...profile, whatsapp_url: whatsapp ? "https://wa.me/" + whatsapp : null };
}
export async function updateCompany(input: CompanyInput, actorId: string) {
  return transaction(async db => {
    const entries = Object.entries(input);
    const { rows } = await db.query(
      "UPDATE printing.company_profile SET " + entries.map(([key], i) => key + "=$" + (i + 1)).join(",") + " WHERE id=true RETURNING *",
      entries.map(([key, value]) => jsonColumns.has(key) ? JSON.stringify(value) : value),
    );
    await audit(db, actorId, "company.updated", "company_profile", "true");
    return rows[0];
  });
}
export async function listResource(resource: Resource, filters: Filters, publicOnly = false) {
  const values: unknown[] = [];
  const conditions: string[] = [];
  const bind = (v: unknown) => { values.push(v); return "$" + values.length; };
  const alias = "r";
  if (publicOnly) {
    conditions.push("r.is_active=true");
    if (resource === "products") conditions.push("c.is_active=true");
  } else if (filters.active) {
    conditions.push("r.is_active=" + bind(filters.active === "true"));
  }
  if (filters.q) {
    const p = bind(like(filters.q));
    conditions.push(resource === "customers" ? "(r.name ILIKE " + p + " OR r.phone ILIKE " + p + ")" : "r.name ILIKE " + p);
  }
  if (resource === "products" && filters.category_id) conditions.push("r.category_id=" + bind(filters.category_id));
  const from = " FROM printing." + resource + " " + alias +
    (resource === "products" ? " JOIN printing.categories c ON c.id=r.category_id" : "");
  const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
  const count = await query<{ count: string }>("SELECT count(*)" + from + where, values);
  const limit = bind(filters.limit), offset = bind((filters.page - 1) * filters.limit);
  const result = await query(
    "SELECT r.*" + (resource === "products" ? ", c.name AS category_name, c.slug AS category_slug" : "") +
    from + where + " ORDER BY r.created_at DESC, r.id LIMIT " + limit + " OFFSET " + offset, values,
  );
  return { data: result.rows, meta: { page: filters.page, limit: filters.limit, total: Number(count.rows[0].count) } };
}
export async function getResource(resource: Resource, id: string, publicOnly = false) {
  const { rows } = await query("SELECT r.*" + (resource === "products" ? ", c.name AS category_name" : "") +
    " FROM printing." + resource + " r" +
    (resource === "products" ? " JOIN printing.categories c ON c.id=r.category_id" : "") +
    " WHERE r.id=$1" + (publicOnly ? " AND r.is_active=true" + (resource === "products" ? " AND c.is_active=true" : "") : ""), [id]);
  const row = rows[0] || missing();
  if (publicOnly && resource === "products") {
    const profile = await company();
    return { ...row, whatsapp_url: profile.whatsapp_url
      ? profile.whatsapp_url + "?text=" + encodeURIComponent("Halo, saya ingin konsultasi produk " + row.name + ".")
      : null };
  }
  return row;
}
async function categoryExists(db: PoolClient, id: unknown) {
  const { rows } = await db.query("SELECT id FROM printing.categories WHERE id=$1 FOR SHARE", [id]);
  if (!rows[0]) missing("Kategori");
}
export async function createResource(resource: Resource, input: Row, actorId: string) {
  return transaction(async db => {
    if (resource === "products") await categoryExists(db, input.category_id);
    const entries = Object.entries(input);
    const { rows } = await db.query("INSERT INTO printing." + resource + " (" + entries.map(e => e[0]).join(",") +
      ") VALUES (" + entries.map((_, i) => "$" + (i + 1)).join(",") + ") RETURNING *", entries.map(e => e[1]));
    await audit(db, actorId, resource + ".created", resource, rows[0].id);
    return rows[0];
  });
}
export async function updateResource(resource: Resource, id: string, input: Row, actorId: string) {
  return transaction(async db => {
    if (resource === "products" && input.category_id) await categoryExists(db, input.category_id);
    const entries = Object.entries(input);
    const { rows } = await db.query("UPDATE printing." + resource + " SET " +
      entries.map(([key], i) => key + "=$" + (i + 1)).join(",") + " WHERE id=$" + (entries.length + 1) + " RETURNING *",
      [...entries.map(e => e[1]), id]);
    if (!rows[0]) missing();
    await audit(db, actorId, resource + ".updated", resource, id, { fields: entries.map(e => e[0]) });
    return rows[0];
  });
}
