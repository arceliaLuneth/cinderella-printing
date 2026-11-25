import { z } from "zod";
import { ADMIN_USERNAME } from "./admin-login";

export const uuid = z.uuid();
const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).default("");
const httpUrl = z.string().url().refine(value => {
  try { return ["https:", "http:"].includes(new URL(value).protocol); }
  catch { return false; }
}, "URL harus http/https");
const emptyUrl = z.union([httpUrl, z.literal("")]).default("");
export const money = z.string().regex(/^(0|[1-9]\d{0,9})$/, "Rupiah harus string bilangan bulat non-negatif")
  .refine(s => Number(s) <= 1000000000, "Maksimum Rp1.000.000.000");
const adjustment = z.string().regex(/^(0|[1-9]\d{0,12})$/)
  .refine(s => Number(s) <= 1000000000000, "Maksimum Rp1.000.000.000.000");
export const quantity = z.string().regex(/^(0|[1-9]\d{0,6})(\.\d{1,3})?$/, "Jumlah berupa string desimal, maksimum 3 angka pecahan")
  .refine(s => Number(s) > 0 && Number(s) <= 1000000, "Jumlah harus > 0 dan <= 1.000.000");
export const orderStatus = z.enum(["baru", "diproses", "dikirim", "selesai", "dibatalkan"]);
export const paymentStatus = z.enum(["belum_bayar", "dp", "lunas"]);
const slug = z.string().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const categoryCreate = z.object({
  name: text(120), slug, description: optionalText(2000), is_active: z.boolean().default(true),
}).strict();
// Hilangkan default sebelum partial: PATCH tidak boleh mereset field yang tidak dikirim.
export const categoryUpdate = categoryCreate.extend({
  description: categoryCreate.shape.description.removeDefault(),
  is_active: categoryCreate.shape.is_active.removeDefault(),
}).partial().refine(v => Object.keys(v).length > 0, "Tidak ada perubahan");
export const productCreate = z.object({
  category_id: uuid, name: text(180), slug, description: optionalText(5000),
  image_url: httpUrl.nullable().default(null), unit: text(30),
  reference_price: money.nullable().default(null), is_active: z.boolean().default(true),
  sku: text(80).nullable().optional(),
  min_order: z.number().int().min(1).max(1000000).optional(),
  is_draft: z.boolean().optional(),
}).strict();
export const productUpdate = productCreate.extend({
  description: productCreate.shape.description.removeDefault(),
  image_url: productCreate.shape.image_url.removeDefault(),
  reference_price: productCreate.shape.reference_price.removeDefault(),
  is_active: productCreate.shape.is_active.removeDefault(),
}).partial().refine(v => Object.keys(v).length > 0, "Tidak ada perubahan");
export const customerCreate = z.object({
  name: text(160), phone: z.string().trim().min(6).max(30).regex(/^[+0-9 ()-]+$/),
  email: z.string().email().max(254).nullable().default(null),
  address: optionalText(1000), notes: optionalText(2000), is_active: z.boolean().default(true),
}).strict();
export const customerUpdate = customerCreate.extend({
  email: customerCreate.shape.email.removeDefault(),
  address: customerCreate.shape.address.removeDefault(),
  notes: customerCreate.shape.notes.removeDefault(),
  is_active: customerCreate.shape.is_active.removeDefault(),
}).partial().refine(v => Object.keys(v).length > 0, "Tidak ada perubahan");
export const companyUpdate = z.object({
  business_name: text(160), about: optionalText(10000), address: optionalText(1000),
  phone: optionalText(30), whatsapp: z.string().regex(/^\d{8,15}$|^$/).default(""),
  email: z.union([z.string().email().max(254), z.literal("")]).default(""),
  website: emptyUrl, logo_url: emptyUrl, opening_hours: optionalText(500),
  services: z.array(z.object({ title: text(160), description: optionalText(2000) }).strict()).max(50).default([]),
  portfolio: z.array(z.object({ title: text(160), description: optionalText(2000), image_url: httpUrl }).strict()).max(100).default([]),
  how_to_order: z.array(text(2000)).max(20).default([]),
  faqs: z.array(z.object({ question: text(500), answer: text(3000) }).strict()).max(50).default([]),
}).strict();
export const inspirationInput = z.object({
  title: text(160), description: optionalText(2000),
  image_url: httpUrl, is_active: z.boolean().default(true),
}).strict();
export const invoiceDelivery = z.object({ sent: z.boolean() }).strict();
export const archiveStatus = z.object({ archived: z.boolean() }).strict();
export const orderItem = z.object({
  product_id: uuid,
  specifications: z.object({
    size: text(200), material: text(200), finishing: optionalText(300), notes: optionalText(1000),
  }).strict(),
  quantity, unit_price: money,
}).strict();
export const orderCreate = z.object({
  customer_id: uuid, source: z.enum(["whatsapp", "langsung"]),
  items: z.array(orderItem).min(1).max(100),
  additional_cost: adjustment.default("0"), discount: adjustment.default("0"),
  notes: optionalText(3000), due_date: z.iso.date().nullable().default(null),
}).strict();
const expectedVersion = z.string().min(1).max(80);
export const orderUpdate = orderCreate.extend({ expected_version: expectedVersion });
export const changeStatus = z.object({
  status: orderStatus, reason: z.string().trim().max(1000).optional(),
}).strict().refine(v => v.status !== "dibatalkan" || (v.reason?.length ?? 0) > 0, "Alasan pembatalan wajib diisi");
export const verifyPayment = z.object({
  expected_version: expectedVersion,
  amount: z.string().regex(/^[1-9]\d{0,17}$/),
  method: z.enum(["tunai", "transfer"]),
  reference: optionalText(200), notes: optionalText(1000),
}).strict().refine(v => v.method !== "transfer" || v.reference.length > 0, "Referensi transfer wajib diisi");
const password = z.string().min(1).max(200);
export const loginBody = z.union([
  z.object({ email: z.email().max(254), password }).strict(),
  z.object({ username: z.literal(ADMIN_USERNAME), password }).strict(),
]);
export const refreshBody = z.object({ refresh_token: z.string().min(1).max(4096) }).strict();
export const pagination = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(120).optional(),
});
export const catalogQuery = pagination.extend({
  category_id: uuid.optional(), active: z.enum(["true", "false"]).optional(),
}).strict();
export const customerQuery = pagination.extend({ active: z.enum(["true", "false"]).optional() }).strict();
export const categoryQuery = pagination.extend({ active: z.enum(["true", "false"]).optional() }).strict();
export const orderQuery = pagination.extend({
  status: orderStatus.optional(), payment_status: paymentStatus.optional(), customer_id: uuid.optional(),
  details: z.enum(["true", "false"]).optional(),
  archived: z.enum(["true", "false"]).optional(),
}).strict();
export const invoiceQuery = pagination.extend({
  payment_status: paymentStatus.optional(), archived: z.enum(["true", "false"]).optional(),
}).strict();
export const reportQuery = z.object({
  from: z.iso.date().optional(), to: z.iso.date().optional(),
}).strict().refine(v => !v.from || !v.to || v.from <= v.to, "Tanggal from harus <= to");

export type OrderInput = z.infer<typeof orderCreate>;
export type CompanyInput = z.infer<typeof companyUpdate>;
export type Admin = { id: string; name: string; email: string; role: "owner" | "admin" };
