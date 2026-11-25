import { randomUUID } from "node:crypto";
import { z, ZodError } from "zod";
import { apiConfig } from "../lib/env";
import { query } from "../lib/db";
import { ApiError } from "../lib/errors";
import { ok, jsonBody, readBytes } from "../lib/http";
import { requireAdmin, login, refresh, logout, authRateLimit } from "../lib/auth";
import { ADMIN_AUTH_EMAIL } from "../lib/admin-login";
import * as s from "../lib/schemas";
import * as resources from "../services/resources";
import * as orders from "../services/orders";
import * as inspiration from "../services/inspiration";
import { readCatalogVersion } from "../services/catalog-version";
import { dashboard, salesReport, salesCsv } from "../services/reports";
import { uploadImage } from "../services/uploads";
import { openapiSpec } from "./openapi";

type Context = { request: Request; params: Record<string, string>; admin?: s.Admin };
export type Endpoint = {
  method: string; path: string; summary: string; admin?: boolean; owner?: boolean;
  body?: z.ZodType; query?: z.ZodType; multipart?: boolean;
  execute: (context: Context) => Promise<Response>;
};
export const endpoints: Endpoint[] = [];
function add<B = undefined, Q = undefined>(
  method: string, path: string, summary: string,
  options: { admin?: boolean; owner?: boolean; body?: z.ZodType<B>; query?: z.ZodType<Q>; multipart?: boolean },
  handler: (context: Context, body: B, query: Q) => Promise<Response>,
) {
  endpoints.push({ method, path, summary, ...options, execute: async context => {
    const body = options.body ? await jsonBody(context.request, options.body) : undefined as B;
    const parsedQuery = options.query ? options.query.parse(Object.fromEntries(new URL(context.request.url).searchParams)) : undefined as Q;
    return handler(context, body, parsedQuery);
  } });
}
add("GET", "/", "Informasi layanan", {}, async () => ok({ service: "Cinderella Printing Backend", version: "1.0.0", openapi: "/api/v1/openapi.json" }));
add("GET", "/health", "Liveness", {}, async () => ok({ status: "ok" }));
add("GET", "/ready", "Readiness PostgreSQL dan migrasi", {}, async () => {
  await query("SELECT 1 FROM printing.company_profile LIMIT 1");
  return ok({ status: "ready", database: "postgresql" });
});
add("GET", "/openapi.json", "Dokumentasi OpenAPI", {}, async () => Response.json(openapiSpec(endpoints)));
add("POST", "/auth/login", "Login admin melalui Supabase Auth", { body: s.loginBody }, async (c, input) => {
  const email = "email" in input ? input.email.toLowerCase() : ADMIN_AUTH_EMAIL;
  await authRateLimit(c.request, email);
  return ok(await login(email, input.password));
});
add("POST", "/auth/refresh", "Perbarui token sesi", { body: s.refreshBody }, async (c, input) => {
  await authRateLimit(c.request);
  return ok(await refresh(input.refresh_token));
});
add("POST", "/auth/logout", "Cabut refresh token sesi aktif", { admin: true }, async c => ok(await logout(c.request)));
add("GET", "/auth/me", "Identitas admin aktif", { admin: true }, async c => ok(c.admin));
add("GET", "/public/company", "Profil, layanan, portofolio, cara pesan, FAQ dan kontak", {}, async () => ok(await resources.company()));
add("GET", "/public/catalog-version", "Versi katalog publik", {}, async () => ok({ revision: await readCatalogVersion() }));
add("GET", "/public/inspiration", "Daftar foto inspirasi aktif", {}, async () => ok(await inspiration.listPhotos(true)));
add("GET", "/public/categories", "Kategori aktif", { query: s.categoryQuery.omit({ active: true }) },
  async (_c, _input, filters) => Response.json(await resources.listResource("categories", filters, true)));
add("GET", "/public/products", "Katalog publik dengan pencarian dan filter", { query: s.catalogQuery.omit({ active: true }) },
  async (_c, _input, filters) => Response.json(await resources.listResource("products", filters, true)));
add("GET", "/public/products/{id}", "Detail produk aktif dan tautan konsultasi WhatsApp", {},
  async c => ok(await resources.getResource("products", c.params.id, true)));
add("GET", "/admin/company", "Baca profil usaha", { admin: true }, async () => ok(await resources.company()));
add("PUT", "/admin/company", "Simpan seluruh profil dan konten publik", { admin: true, body: s.companyUpdate },
  async (c, input) => ok(await resources.updateCompany(input, c.admin!.id)));
add("GET", "/admin/inspiration", "Daftar foto inspirasi", { admin: true }, async () => ok(await inspiration.listPhotos()));
add("POST", "/admin/inspiration", "Tambah foto inspirasi", { admin: true, body: s.inspirationInput },
  async (c, input) => ok(await inspiration.savePhoto(input, c.admin!.id), 201));
add("PUT", "/admin/inspiration/{id}", "Perbarui atau sembunyikan foto inspirasi", { admin: true, body: s.inspirationInput },
  async (c, input) => ok(await inspiration.savePhoto(input, c.admin!.id, c.params.id)));

function resourceRoutes(
  resource: "categories" | "products" | "customers",
  create: z.ZodType<Record<string, unknown>>,
  update: z.ZodType<Record<string, unknown>>,
  filters: z.ZodType<{ page: number; limit: number; q?: string; active?: string; category_id?: string }>,
) {
  const base = "/admin/" + resource;
  add("GET", base, "Daftar " + resource, { admin: true, query: filters },
    async (_c, _input, params) => Response.json(await resources.listResource(resource, params)));
  add("POST", base, "Tambah " + resource, { admin: true, body: create },
    async (c, input) => ok(await resources.createResource(resource, input, c.admin!.id), 201));
  add("GET", base + "/{id}", "Detail " + resource, { admin: true },
    async c => ok(await resources.getResource(resource, c.params.id)));
  add("PATCH", base + "/{id}", "Ubah " + resource, { admin: true, body: update },
    async (c, input) => ok(await resources.updateResource(resource, c.params.id, input, c.admin!.id)));
}
resourceRoutes("categories", s.categoryCreate, s.categoryUpdate, s.categoryQuery);
resourceRoutes("products", s.productCreate, s.productUpdate, s.catalogQuery);
resourceRoutes("customers", s.customerCreate, s.customerUpdate, s.customerQuery);
add("GET", "/admin/orders", "Daftar dan filter pesanan", { admin: true, query: s.orderQuery },
  async (_c, _input, filters) => Response.json(await orders.listOrders(filters)));
add("POST", "/admin/orders", "Catat pesanan beserta seluruh rincian", { admin: true, body: s.orderCreate },
  async (c, input) => ok(await orders.saveOrder(input, c.admin!.id), 201));
add("GET", "/admin/orders/{id}", "Pesanan, rincian, invoice dan pembayaran", { admin: true },
  async c => ok(await orders.getOrder(c.params.id)));
add("PUT", "/admin/orders/{id}", "Ubah pesanan dan revisi invoice yang sudah terbit", { admin: true, body: s.orderUpdate },
  async (c, input) => ok(await orders.saveOrder(input, c.admin!.id, c.params.id, input.expected_version)));
add("POST", "/admin/orders/{id}/confirm", "Konfirmasi dan terbitkan tepat satu invoice", { admin: true },
  async c => ok(await orders.confirmOrder(c.params.id, c.admin!.id)));
add("PATCH", "/admin/orders/{id}/status", "Perbarui status pengerjaan atau batalkan pesanan", { admin: true, body: s.changeStatus },
  async (c, input) => ok(await orders.changeOrderStatus(c.params.id, input, c.admin!.id)));
add("PATCH", "/admin/orders/{id}/archive", "Arsipkan atau pulihkan pesanan", { admin: true, body: s.archiveStatus },
  async (c, input) => ok(await orders.setArchive("orders", c.params.id, input.archived, c.admin!.id)));
add("POST", "/admin/orders/{id}/payments/verify", "Catat DP atau pembayaran hingga lunas dan terbitkan/perbarui invoice", { admin: true, body: s.verifyPayment },
  async (c, input) => ok(await orders.verifyOrderPayment(c.params.id, input, c.admin!.id)));
add("GET", "/admin/invoices", "Daftar invoice", { admin: true, query: s.invoiceQuery },
  async (_c, _input, filters) => Response.json(await orders.listInvoices(filters)));
add("GET", "/admin/invoices/{id}", "Snapshot invoice tanpa berkas biner", { admin: true },
  async c => ok(await orders.getInvoice(c.params.id)));
add("PATCH", "/admin/invoices/{id}/delivery", "Ubah status pengiriman invoice", { admin: true, body: s.invoiceDelivery },
  async (c, input) => ok(await orders.updateInvoiceDelivery(c.params.id, input.sent, c.admin!.id)));
add("PATCH", "/admin/invoices/{id}/archive", "Arsipkan atau pulihkan invoice", { admin: true, body: s.archiveStatus },
  async (c, input) => ok(await orders.setArchive("invoices", c.params.id, input.archived, c.admin!.id)));
add("GET", "/admin/invoices/{id}/pdf", "Unduh PDF tersimpan dengan nomor tetap", { admin: true }, async c => {
  const invoice = await orders.getInvoice(c.params.id, true);
  return invoicePdf(invoice);
});
add("GET", "/admin/invoices/{id}/revisions", "Daftar versi invoice terdahulu", { admin: true },
  async c => ok(await orders.listInvoiceRevisions(c.params.id)));
add("GET", "/admin/invoices/{id}/revisions/{revisionId}/pdf", "Unduh salinan PDF invoice terdahulu", { admin: true },
  async c => invoicePdf(await orders.getInvoiceRevisionPdf(c.params.id, c.params.revisionId)));

function invoicePdf(invoice: { invoice_number: string; revision: number; pdf: Buffer; pdf_sha256: string }) {
  const filename = invoice.invoice_number + (invoice.revision > 1 ? "-rev-" + invoice.revision : "") + ".pdf";
  return new Response(new Uint8Array(invoice.pdf), { headers: {
    "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="' + filename + '"',
    ETag: '"' + invoice.pdf_sha256 + '"',
  } });
}
add("GET", "/admin/dashboard", "Ringkasan operasional dan tagihan", { admin: true, query: s.reportQuery },
  async (_c, _input, range) => ok(await dashboard(range)));
add("GET", "/admin/reports/sales", "Rekap penjualan per tanggal terbit invoice", { admin: true, query: s.reportQuery },
  async (_c, _input, range) => ok(await salesReport(range)));
add("GET", "/admin/reports/sales.csv", "Ekspor rekap penjualan CSV", { admin: true, query: s.reportQuery },
  async (_c, _input, range) => new Response(salesCsv((await salesReport(range)).data), { headers: {
    "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="rekap-penjualan.csv"',
  } }));
add("GET", "/admin/audit-logs", "Riwayat aktivitas khusus owner", { admin: true, owner: true, query: s.pagination.omit({ q: true }).strict() },
  async (_c, _input, filters) => {
    const count = await query<{ count: string }>("SELECT count(*) FROM printing.audit_logs");
    const { rows } = await query("SELECT * FROM printing.audit_logs ORDER BY created_at DESC,id DESC LIMIT $1 OFFSET $2",
      [filters.limit,(filters.page-1)*filters.limit]);
    return Response.json({ data: rows, meta: { ...filters, total: Number(count.rows[0].count) } });
  });
add("POST", "/admin/uploads", "Upload gambar katalog/portofolio PNG, JPEG atau WebP", { admin: true, multipart: true }, async c => {
  const contentType = c.request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data;")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Gunakan multipart/form-data dengan field file.");
  }
  const bytes = await readBytes(c.request, apiConfig().UPLOAD_LIMIT_BYTES + 65536);
  let form: FormData;
  try { form = await new Response(bytes, { headers: { "Content-Type": contentType } }).formData(); }
  catch { throw new ApiError(400, "INVALID_MULTIPART", "Format unggahan tidak valid."); }
  const file = form.get("file");
  if (!(file instanceof File) || [...form.keys()].length !== 1) {
    throw new ApiError(422, "INVALID_FILE", "Kirim tepat satu field file.");
  }
  return ok(await uploadImage(new Uint8Array(await file.arrayBuffer()), file.type, c.admin!.id), 201);
});

function matchPath(pattern: string, path: string) {
  const actual = path.split("/").filter(Boolean), expected = pattern.split("/").filter(Boolean);
  if (actual.length !== expected.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < expected.length; i++) {
    const token = expected[i];
    if (token.startsWith("{")) params[token.slice(1,-1)] = actual[i];
    else if (token !== actual[i]) return null;
  }
  return params;
}
export async function dispatch(request: Request, segments: string[]) {
  const requestId = randomUUID(), origin = request.headers.get("origin");
  let allowedOrigin: string | undefined, response: Response;
  try {
    const config = apiConfig();
    if (origin) {
      if (origin !== new URL(request.url).origin && !config.origins.includes(origin)) {
        throw new ApiError(403, "ORIGIN_NOT_ALLOWED", "Origin tidak diizinkan.");
      }
      allowedOrigin = origin;
    }
    const path = "/" + segments.join("/");
    const matches = endpoints.map(route => ({ route, params: matchPath(route.path, path) })).filter(m => m.params !== null);
    if (!matches.length) throw new ApiError(404, "NOT_FOUND", "Endpoint tidak ditemukan.");
    if (request.method === "OPTIONS") {
      response = new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Methods": [...new Set(matches.map(m => m.route.method)), "OPTIONS"].join(", "),
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "600",
      } });
    } else {
      const found = matches.find(m => m.route.method === request.method);
      if (!found) throw new ApiError(405, "METHOD_NOT_ALLOWED", "Metode HTTP tidak tersedia.", undefined,
        { Allow: [...new Set(matches.map(m => m.route.method)), "OPTIONS"].join(", ") });
      const context: Context = { request, params: found.params! };
      // Verifikasi akses sebelum membaca isi permintaan atau memvalidasi ID privat.
      if (found.route.admin) context.admin = await requireAdmin(request);
      if (found.route.owner && context.admin?.role !== "owner") throw new ApiError(403, "FORBIDDEN", "Akses khusus owner.");
      for (const [key, value] of Object.entries(context.params)) context.params[key] = s.uuid.parse(value);
      response = await found.route.execute(context);
    }
  } catch (error) {
    let failure: ApiError;
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (error instanceof ApiError) failure = error;
    else if (error instanceof ZodError) failure = new ApiError(422, "VALIDATION_ERROR", "Masukan tidak valid.",
      error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })));
    else if (code === "23505") failure = new ApiError(409, "DUPLICATE_DATA", "Data unik tersebut sudah digunakan.");
    else if (code === "23503") failure = new ApiError(409, "REFERENCE_CONFLICT", "Data masih digunakan atau referensinya tidak tersedia.");
    else if (["23514","22003","22P02"].includes(code)) failure = new ApiError(422, "INVALID_DATA", "Data melanggar batasan database.");
    else if (["ECONNREFUSED","ETIMEDOUT","ENOTFOUND","57P01","53300","57014","42P01","3F000"].includes(code)) {
      failure = new ApiError(503, "DATABASE_UNAVAILABLE", "Database belum siap atau belum dapat dihubungi.");
    } else if (["40P01","40001"].includes(code)) failure = new ApiError(409, "RETRY_TRANSACTION", "Transaksi bertabrakan. Silakan ulangi.");
    else {
      failure = new ApiError(500, "INTERNAL_ERROR", "Permintaan belum berhasil diproses.");
      console.error(JSON.stringify({ event: "request_failed", request_id: requestId, code,
        error_type: error instanceof Error ? error.name : "unknown" }));
    }
    response = Response.json({ error: { code: failure.code, message: failure.message,
      ...(failure.details ? { details: failure.details } : {}) }, request_id: requestId },
    { status: failure.status, headers: failure.headers });
  }
  response.headers.set("X-Request-ID", requestId);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  response.headers.set("Vary", "Origin");
  if (allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Expose-Headers", "X-Request-ID, Content-Disposition, ETag");
  }
  return response;
}
