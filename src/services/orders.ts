import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import type { z } from "zod";
import { audit, query, transaction } from "../lib/db";
import { ApiError, conflict, missing } from "../lib/errors";
import { orderTotals } from "../lib/money";
import { renderInvoice, type InvoiceSnapshot } from "../lib/pdf";
import type { OrderInput, changeStatus, verifyPayment } from "../lib/schemas";
import type { InvoiceRevision } from "../types/admin";

type OrderRow = {
  id: string; order_number: string; customer_id: string; source: string; status: string;
  edit_version: string;
  archived_at: Date | null;
  payment_status: string; subtotal: string; additional_cost: string; discount: string;
  total: string; notes: string; due_date: string | null; confirmed_at: Date | null;
};
type InvoiceRow = {
  id: string; order_id: string; invoice_number: string; issued_at: Date;
  snapshot: InvoiceSnapshot; total: string; amount_paid: string; payment_status: string; is_cancelled: boolean;
  pdf: Buffer; pdf_sha256: string; updated_at: Date; sent_at: Date | null;
  revision: number; revised_at: Date | null;
  archived_at: Date | null;
};
const invoiceFields = "id,order_id,invoice_number,issued_at,snapshot,total,amount_paid,payment_status,is_cancelled,pdf_sha256,updated_at,sent_at,revision,revised_at,archived_at";
const orderFields = "o.*, o.due_date::text AS due_date, o.updated_at::text AS edit_version";
const like = (s: string) => "%" + s.replace(/[\\%_]/g, "\\$&") + "%";

async function lockedOrder(db: PoolClient, id: string) {
  const { rows } = await db.query<OrderRow>("SELECT " + orderFields + " FROM printing.orders o WHERE id=$1 FOR UPDATE", [id]);
  return rows[0] || missing("Pesanan");
}
async function detail(db: PoolClient, id: string) {
  const { rows } = await db.query<OrderRow>("SELECT " + orderFields + " FROM printing.orders o WHERE id=$1", [id]);
  if (!rows[0]) missing("Pesanan");
  const items = await db.query("SELECT * FROM printing.order_items WHERE order_id=$1 AND retired_at IS NULL ORDER BY position", [id]);
  const invoices = await db.query("SELECT " + invoiceFields + " FROM printing.invoices WHERE order_id=$1", [id]);
  const payments = await db.query("SELECT * FROM printing.payments WHERE order_id=$1 ORDER BY verified_at, id", [id]);
  return { ...rows[0], items: items.rows, invoice: invoices.rows[0] ?? null, payments: payments.rows };
}
async function validateReferences(db: PoolClient, input: OrderInput, previous?: OrderRow) {
  const customer = await db.query("SELECT id, is_active FROM printing.customers WHERE id=$1 FOR SHARE", [input.customer_id]);
  if (!customer.rows[0] || (!customer.rows[0].is_active && previous?.customer_id !== input.customer_id)) {
    throw new ApiError(422, "INVALID_CUSTOMER", "Pilih pelanggan yang masih aktif.");
  }
  const productIds = [...new Set(input.items.map(item => item.product_id))].sort();
  const products = await db.query<{ id: string; name: string; unit: string; is_active: boolean; category_active: boolean }>(
    `SELECT p.id,p.name,p.unit,p.is_active,c.is_active AS category_active
     FROM printing.products p JOIN printing.categories c ON c.id=p.category_id
     WHERE p.id=ANY($1::uuid[]) ORDER BY p.id FOR SHARE OF p,c`, [productIds],
  );
  type ProductDescription = { name: string; unit: string };
  const history = previous ? await db.query<ProductDescription & { product_id: string }>(
    `SELECT DISTINCT ON (product_id) product_id,product_name AS name,unit
     FROM printing.order_items WHERE order_id=$1 AND retired_at IS NULL ORDER BY product_id,position`, [previous.id],
  ) : undefined;
  const existing = new Map(history?.rows.map((product) => [product.product_id, product]));
  if (products.rows.length !== productIds.length || products.rows.some(p => !existing.has(p.id) && (!p.is_active || !p.category_active))) {
    throw new ApiError(422, "INVALID_PRODUCT", "Produk baru dalam pesanan harus berasal dari kategori dan produk aktif.");
  }
  return new Map(products.rows.map(p => [p.id, existing.get(p.id) ?? p]));
}
async function insertItems(db: PoolClient, orderId: string, input: OrderInput, products: Awaited<ReturnType<typeof validateReferences>>) {
  for (let position = 0; position < input.items.length; position++) {
    const item = input.items[position], product = products.get(item.product_id)!;
    await db.query(
      `INSERT INTO printing.order_items
       (order_id,product_id,position,product_name,unit,specifications,quantity,unit_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [orderId,item.product_id,position,product.name,product.unit,JSON.stringify(item.specifications),item.quantity,item.unit_price],
    );
  }
}
export async function saveOrder(input: OrderInput, actorId: string, id?: string, expectedVersion?: string) {
  const totals = orderTotals(input);
  return transaction(async db => {
    const current = id ? await lockedOrder(db, id) : undefined;
    let invoice: InvoiceRow | undefined;
    if (current) {
      if (current.status === "dibatalkan") conflict("Pesanan yang dibatalkan tidak bisa diedit.");
      if (current.edit_version !== expectedVersion) {
        conflict("Pesanan sudah berubah. Muat ulang halaman sebelum mengedit lagi.");
      }
      invoice = (await db.query<InvoiceRow>(
        "SELECT " + invoiceFields + " FROM printing.invoices WHERE order_id=$1 FOR UPDATE", [current.id],
      )).rows[0];
      if (invoice) {
        if (invoice.is_cancelled) conflict("Invoice yang dibatalkan tidak bisa direvisi.");
        const paid = BigInt(invoice.amount_paid);
        if (BigInt(totals.total) < paid) {
          conflict("Total baru tidak boleh lebih kecil dari pembayaran yang sudah tercatat.");
        }
        if (paid > BigInt(0) && current.customer_id !== input.customer_id) {
          conflict("Pelanggan tidak bisa diganti setelah ada pembayaran.");
        }
        await db.query("SELECT set_config('printing.revising_order', $1, true)", [current.id]);
      }
    }
    const products = await validateReferences(db, input, current);
    const values = [input.customer_id,input.source,totals.subtotal,input.additional_cost,input.discount,totals.total,input.notes,input.due_date];
    let orderId = id;
    if (orderId) {
      await db.query(`UPDATE printing.orders SET customer_id=$1,source=$2,subtotal=$3,
        additional_cost=$4,discount=$5,total=$6,notes=$7,due_date=$8 WHERE id=$9`, [...values, orderId]);
      await db.query("UPDATE printing.order_items SET retired_at=now() WHERE order_id=$1 AND retired_at IS NULL", [orderId]);
    } else {
      const result = await db.query<{ id: string }>(
        `INSERT INTO printing.orders (customer_id,source,subtotal,additional_cost,discount,total,notes,due_date,created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, [...values,actorId]);
      orderId = result.rows[0].id;
    }
    await insertItems(db, orderId, input, products);
    if (invoice) await reviseInvoice(db, await lockedOrder(db, orderId), invoice, actorId);
    await audit(db, actorId, id ? "order.updated" : "order.created", "orders", orderId, { item_count: input.items.length });
    return detail(db, orderId);
  });
}
export async function getOrder(id: string) {
  return transaction(async db => {
    await db.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    return detail(db, id);
  });
}
export async function listOrders(filters: {
  page: number; limit: number; q?: string; status?: string; payment_status?: string; customer_id?: string; details?: string; archived?: string;
}) {
  const values: unknown[] = [], conditions: string[] = [];
  const bind = (v: unknown) => { values.push(v); return "$" + values.length; };
  if (filters.q) conditions.push("(o.order_number ILIKE " + bind(like(filters.q)) + " OR c.name ILIKE $" + values.length + ")");
  if (filters.archived) conditions.push(filters.archived === "true" ? "o.archived_at IS NOT NULL" : "o.archived_at IS NULL");
  for (const column of ["status", "payment_status", "customer_id"] as const) {
    if (filters[column]) conditions.push("o." + column + "=" + bind(filters[column]));
  }
  const from = " FROM printing.orders o JOIN printing.customers c ON c.id=o.customer_id";
  const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
  const count = await query<{ count: string }>("SELECT count(*)" + from + where, values);
  const limit = bind(filters.limit), offset = bind((filters.page-1)*filters.limit);
  const extra = filters.details === "true" ? `,
    COALESCE((SELECT jsonb_agg(to_jsonb(i) || jsonb_build_object('unit_price',i.unit_price::text) ORDER BY i.position)
      FROM printing.order_items i WHERE i.order_id=o.id AND i.retired_at IS NULL), '[]') AS items,
    (SELECT to_jsonb(i) || jsonb_build_object('amount_paid', i.amount_paid::text)
      FROM (SELECT ${invoiceFields} FROM printing.invoices WHERE order_id=o.id) i) AS invoice,
    COALESCE((SELECT jsonb_agg(to_jsonb(p) || jsonb_build_object('amount', p.amount::text) ORDER BY p.verified_at, p.id)
      FROM printing.payments p WHERE p.order_id=o.id), '[]') AS payments` : "";
  const { rows } = await query("SELECT " + orderFields + ", c.name AS customer_name" + extra + from + where +
    " ORDER BY o.created_at DESC,o.id LIMIT " + limit + " OFFSET " + offset, values);
  return { data: rows, meta: { page: filters.page, limit: filters.limit, total: Number(count.rows[0].count) } };
}
async function buildInvoiceSnapshot(db: PoolClient, order: OrderRow, previous?: InvoiceSnapshot): Promise<InvoiceSnapshot> {
  const profile = previous?.business ?? (await db.query<InvoiceSnapshot["business"]>(
    "SELECT business_name,address,phone,email FROM printing.company_profile WHERE id=true FOR SHARE")).rows[0];
  const customer = previous?.customer.id === order.customer_id
    ? previous.customer
    : (await db.query<InvoiceSnapshot["customer"]>(
        "SELECT id,name,phone,email,address FROM printing.customers WHERE id=$1 FOR SHARE", [order.customer_id],
      )).rows[0];
  const items = (await db.query<InvoiceSnapshot["items"][number]>(
    `SELECT product_id,product_name,unit,specifications,quantity::text,unit_price::text,line_total::text
     FROM printing.order_items WHERE order_id=$1 AND retired_at IS NULL ORDER BY position`, [order.id])).rows;
  if (!profile || !customer || items.length === 0) conflict("Data wajib untuk penerbitan invoice belum lengkap.");
  const subtotal = items.reduce((sum, item) => sum + BigInt(item.line_total), BigInt(0)).toString();
  if (subtotal !== order.subtotal || BigInt(order.total) !== BigInt(subtotal) + BigInt(order.additional_cost) - BigInt(order.discount)) {
    conflict("Total pesanan tidak sesuai rincian. Periksa data sebelum konfirmasi.");
  }
  return {
    version: 1, business: profile, customer,
    order: { id: order.id, order_number: order.order_number, source: order.source, due_date: order.due_date, notes: order.notes },
    items, subtotal: order.subtotal, additional_cost: order.additional_cost, discount: order.discount, total: order.total,
  };
}

async function issueInvoice(db: PoolClient, order: OrderRow, actorId: string) {
  const existing = await db.query<InvoiceRow>("SELECT * FROM printing.invoices WHERE order_id=$1", [order.id]);
  if (existing.rows[0]) return existing.rows[0];
  const snapshot = await buildInvoiceSnapshot(db, order);
  const issued = (await db.query<{ invoice_number: string; issued_at: Date }>(
    `SELECT 'INV-' || to_char(now() AT TIME ZONE 'Asia/Jakarta','YYYYMMDD') || '-' ||
     lpad(nextval('printing.invoice_number_seq')::text,8,'0') AS invoice_number, now() AS issued_at`)).rows[0];
  const pdf = await renderInvoice(issued.invoice_number, issued.issued_at, snapshot, order.payment_status);
  const result = await db.query<InvoiceRow>(
    `INSERT INTO printing.invoices (order_id,invoice_number,issued_at,snapshot,total,payment_status,pdf,pdf_sha256)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [order.id,issued.invoice_number,issued.issued_at,JSON.stringify(snapshot),order.total,order.payment_status,pdf,
      createHash("sha256").update(pdf).digest("hex")],
  );
  await db.query("UPDATE printing.orders SET confirmed_at=coalesce(confirmed_at,now()) WHERE id=$1", [order.id]);
  await audit(db, actorId, "invoice.issued", "invoices", result.rows[0].id, { order_id: order.id, number: issued.invoice_number });
  return result.rows[0];
}
async function reviseInvoice(db: PoolClient, order: OrderRow, invoice: InvoiceRow, actorId: string) {
  const snapshot = await buildInvoiceSnapshot(db, order, invoice.snapshot);
  const snapshotJson = JSON.stringify(snapshot);
  const result = await db.query<{ changed: boolean; revised_at: Date }>(
    "SELECT snapshot IS DISTINCT FROM $2::jsonb AS changed, now() AS revised_at FROM printing.invoices WHERE id=$1",
    [invoice.id, snapshotJson],
  );
  const { changed, revised_at: revisedAt } = result.rows[0];
  if (!changed) return;

  const paid = BigInt(invoice.amount_paid);
  const status = paid === BigInt(order.total) ? "lunas" : paid > BigInt(0) ? "dp" : "belum_bayar";
  const revision = invoice.revision + 1;
  const pdf = await renderInvoice(invoice.invoice_number, invoice.issued_at, snapshot,
    status, false, invoice.amount_paid, { number: revision, at: revisedAt });
  await db.query(
    `UPDATE printing.invoices SET snapshot=$1,total=$2,payment_status=$3,pdf=$4,pdf_sha256=$5,
      revision=$6,revised_at=$7,sent_at=NULL WHERE id=$8`,
    [snapshotJson,order.total,status,pdf,createHash("sha256").update(pdf).digest("hex"),revision,revisedAt,invoice.id],
  );
  await db.query("UPDATE printing.orders SET payment_status=$1 WHERE id=$2", [status, order.id]);
  await audit(db, actorId, "invoice.revised", "invoices", invoice.id, { revision, previous_total: invoice.total, total: order.total });
}
async function updateInvoiceDocument(db: PoolClient, invoice: InvoiceRow, status: string, cancelled: boolean, amountPaid = invoice.amount_paid) {
  const revision = invoice.revised_at ? { number: invoice.revision, at: invoice.revised_at } : undefined;
  const pdf = await renderInvoice(invoice.invoice_number, invoice.issued_at, invoice.snapshot, status, cancelled, amountPaid, revision);
  await db.query("UPDATE printing.invoices SET payment_status=$1,amount_paid=$2,is_cancelled=$3,pdf=$4,pdf_sha256=$5 WHERE id=$6",
    [status,amountPaid,cancelled,pdf,createHash("sha256").update(pdf).digest("hex"),invoice.id]);
}
export async function confirmOrder(id: string, actorId: string) {
  return transaction(async db => {
    const order = await lockedOrder(db, id);
    if (order.status === "dibatalkan") conflict("Pesanan telah dibatalkan.");
    if (order.archived_at && !order.confirmed_at) conflict("Pulihkan pesanan dari arsip sebelum menerbitkan invoice.");
    await issueInvoice(db, order, actorId);
    return detail(db, id);
  });
}
export async function verifyOrderPayment(id: string, input: z.infer<typeof verifyPayment>, actorId: string) {
  return transaction(async db => {
    const order = await lockedOrder(db, id);
    if (order.status === "dibatalkan") conflict("Pembayaran pesanan yang dibatalkan tidak dapat diverifikasi.");
    if (order.archived_at && !order.confirmed_at) conflict("Pulihkan pesanan dari arsip sebelum mencatat pembayaran pertama.");
    if (order.edit_version !== input.expected_version) {
      conflict("Pesanan atau pembayaran sudah berubah. Muat ulang untuk memeriksa saldo sebelum mencatat pembayaran.");
    }
    if (order.payment_status === "lunas") conflict("Invoice sudah lunas. Tidak ada pembayaran tambahan yang dicatat.");
    const paidBefore = BigInt((await db.query<{ amount: string }>(
      "SELECT COALESCE(sum(amount),0)::text AS amount FROM printing.payments WHERE order_id=$1", [id]
    )).rows[0].amount);
    const paidAfter = paidBefore + BigInt(input.amount);
    const total = BigInt(order.total);
    if (paidAfter > total) throw new ApiError(422, "PAYMENT_AMOUNT_EXCEEDS_BALANCE", "Nominal pembayaran melebihi sisa tagihan.");
    const paymentStatus = paidAfter === total ? "lunas" : "dp";
    await db.query(`INSERT INTO printing.payments (order_id,amount,method,reference,notes,verified_by)
      VALUES ($1,$2,$3,$4,$5,$6)`, [id,input.amount,input.method,input.reference,input.notes,actorId]);
    await db.query("UPDATE printing.orders SET payment_status=$1 WHERE id=$2", [paymentStatus,id]);
    order.payment_status = paymentStatus;
    const invoice = await issueInvoice(db, order, actorId);
    await updateInvoiceDocument(db, invoice, paymentStatus, false, paidAfter.toString());
    await audit(db, actorId, "payment.verified", "orders", id, { amount: input.amount, cumulative_amount: paidAfter.toString(), method: input.method });
    return detail(db, id);
  });
}
const transitions: Record<string, string[]> = {
  baru: ["diproses", "dibatalkan"],
  diproses: ["dikirim", "selesai", "dibatalkan"],
  dikirim: ["selesai", "dibatalkan"],
  selesai: [], dibatalkan: [],
};
export async function changeOrderStatus(id: string, input: z.infer<typeof changeStatus>, actorId: string) {
  return transaction(async db => {
    const order = await lockedOrder(db, id);
    if (order.status === input.status) return detail(db, id);
    if (!transitions[order.status].includes(input.status)) conflict("Perpindahan status pesanan tidak diperbolehkan.");
    if (input.status !== "dibatalkan" && !order.confirmed_at) conflict("Konfirmasi pesanan sebelum memulai pengerjaan.");
    await db.query(`UPDATE printing.orders SET status=$1,
      cancelled_at=CASE WHEN $1='dibatalkan' THEN now() ELSE cancelled_at END,
      cancellation_reason=CASE WHEN $1='dibatalkan' THEN $2 ELSE cancellation_reason END WHERE id=$3`,
    [input.status,input.reason ?? null,id]);
    if (input.status === "dibatalkan") {
      const invoices = await db.query<InvoiceRow>("SELECT * FROM printing.invoices WHERE order_id=$1", [id]);
      if (invoices.rows[0]) await updateInvoiceDocument(db, invoices.rows[0], order.payment_status, true);
    }
    await audit(db, actorId, "order.status_changed", "orders", id, { from: order.status, to: input.status });
    return detail(db, id);
  });
}
export async function getInvoice(id: string, includePdf = false) {
  const result = await query<InvoiceRow>("SELECT " + (includePdf ? "*" : invoiceFields) + " FROM printing.invoices WHERE id=$1", [id]);
  return result.rows[0] || missing("Invoice");
}
export async function listInvoiceRevisions(invoiceId: string) {
  const result = await query<InvoiceRevision>(
    "SELECT id,revision,archived_at,total FROM printing.invoice_revisions WHERE invoice_id=$1 ORDER BY revision DESC",
    [invoiceId],
  );
  return result.rows;
}
export async function getInvoiceRevisionPdf(invoiceId: string, revisionId: string) {
  const result = await query<Pick<InvoiceRow, "invoice_number" | "pdf" | "pdf_sha256" | "revision">>(
    `SELECT i.invoice_number,r.pdf,r.pdf_sha256,r.revision
     FROM printing.invoice_revisions r JOIN printing.invoices i ON i.id=r.invoice_id
     WHERE r.invoice_id=$1 AND r.id=$2`, [invoiceId, revisionId],
  );
  return result.rows[0] || missing("Revisi invoice");
}
export async function updateInvoiceDelivery(id: string, sent: boolean, actorId: string) {
  return transaction(async (db) => {
    const result = await db.query<Pick<InvoiceRow, "sent_at" | "is_cancelled">>(
      "SELECT sent_at,is_cancelled FROM printing.invoices WHERE id=$1 FOR UPDATE", [id],
    );
    const invoice = result.rows[0] || missing("Invoice");
    if (invoice.is_cancelled) conflict("Status pengiriman invoice yang dibatalkan tidak dapat diubah.");
    if (Boolean(invoice.sent_at) === sent) return { id, sent_at: invoice.sent_at };

    const updated = await db.query<Pick<InvoiceRow, "id" | "sent_at">>(
      "UPDATE printing.invoices SET sent_at=CASE WHEN $1 THEN now() ELSE NULL END WHERE id=$2 RETURNING id,sent_at",
      [sent, id],
    );
    await audit(db, actorId, "invoice.delivery_updated", "invoices", id, { sent });
    return updated.rows[0];
  });
}
export async function setArchive(resource: "orders" | "invoices", id: string, archived: boolean, actorId: string) {
  return transaction(async (db) => {
    type ArchiveRow = { id: string; archived_at: Date | null; edit_version: string };
    const fields = "id,archived_at,updated_at::text AS edit_version";
    const from = resource === "orders" ? "printing.orders" : "printing.invoices";
    const { rows } = await db.query<ArchiveRow>(`SELECT ${fields} FROM ${from} WHERE id=$1 FOR UPDATE`, [id]);
    const current = rows[0] || missing(resource === "orders" ? "Pesanan" : "Invoice");
    if (Boolean(current.archived_at) === archived) return current;
    const result = await db.query<ArchiveRow>(
      `UPDATE ${from} SET archived_at=CASE WHEN $2 THEN now() ELSE NULL END WHERE id=$1 RETURNING ${fields}`, [id, archived],
    );
    await audit(db, actorId, resource + (archived ? ".archived" : ".restored"), resource, id);
    return result.rows[0];
  });
}

export async function listInvoices(filters: { page: number; limit: number; q?: string; payment_status?: string; archived?: string }) {
  const values: unknown[] = [], conditions: string[] = [];
  const bind = (v: unknown) => { values.push(v); return "$" + values.length; };
  if (filters.q) conditions.push("invoice_number ILIKE " + bind(like(filters.q)));
  if (filters.payment_status) conditions.push("payment_status=" + bind(filters.payment_status));
  if (filters.archived) conditions.push(filters.archived === "true" ? "archived_at IS NOT NULL" : "archived_at IS NULL");
  const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
  const count = await query<{ count: string }>("SELECT count(*) FROM printing.invoices" + where, values);
  const limit = bind(filters.limit), offset = bind((filters.page-1)*filters.limit);
  const { rows } = await query("SELECT id,order_id,invoice_number,issued_at,total,amount_paid,payment_status,is_cancelled,pdf_sha256,updated_at,sent_at,revision,revised_at,archived_at" +
    " FROM printing.invoices" + where + " ORDER BY issued_at DESC,id LIMIT " + limit + " OFFSET " + offset, values);
  return { data: rows, meta: { page: filters.page, limit: filters.limit, total: Number(count.rows[0].count) } };
}
