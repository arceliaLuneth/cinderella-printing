import type {
  CategoryStatus,
  Invoice,
  InvoiceStatus,
  InvoiceTotals,
  LineItem,
  Order,
  OrderStatus,
  ProductStatus,
} from "@/types/admin";

export type Tone = "neutral" | "info" | "warning" | "progress" | "success" | "danger";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export function formatCurrency(value: number) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

export function formatCurrencyPlain(value: number) {
  return formatCurrency(value).replace(/\u00A0/g, " ");
}

export function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function formatDateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${formatDate(value)} · ${new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date)}`;
}

export function todayISO() {
  const parts = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function addDaysISO(value: string, days: number) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return value;
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function lineTotal(item: Pick<LineItem, "quantity" | "unitPrice">) {
  return item.quantity * item.unitPrice;
}

export function itemsTotal(items: Pick<LineItem, "quantity" | "unitPrice">[]) {
  return items.reduce((total, item) => total + lineTotal(item), 0);
}

export function orderTotal(order: Order) {
  return itemsTotal(order.items);
}

export function calculateInvoiceTotals(invoice: {
  items: Pick<LineItem, "quantity" | "unitPrice">[];
  taxPercent?: number;
  discount: number;
}): InvoiceTotals {
  const subtotal = itemsTotal(invoice.items);
  const discount = Math.min(Math.max(invoice.discount, 0), subtotal);
  return { subtotal, discount, tax: 0, total: subtotal - discount };
}

export function invoiceTotal(invoice: Invoice) {
  return calculateInvoiceTotals(invoice).total;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(Number.isFinite(value) ? value : 0);
}

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const orderStatusMeta: Record<OrderStatus, { label: string; tone: Tone }> = {
  baru: { label: "Baru", tone: "info" },
  dikonfirmasi: { label: "Dikonfirmasi", tone: "warning" },
  produksi: { label: "Produksi", tone: "progress" },
  "siap-kirim": { label: "Siap kirim", tone: "info" },
  selesai: { label: "Selesai", tone: "success" },
  dibatalkan: { label: "Dibatalkan", tone: "danger" },
};

export const invoiceStatusMeta: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  terkirim: { label: "Terkirim", tone: "info" },
  lunas: { label: "Lunas", tone: "success" },
  "jatuh-tempo": { label: "Jatuh tempo", tone: "danger" },
  dibatalkan: { label: "Dibatalkan", tone: "neutral" },
};

export const productStatusMeta: Record<ProductStatus, { label: string; tone: Tone }> = {
  aktif: { label: "Aktif", tone: "success" },
  draft: { label: "Draft", tone: "warning" },
  nonaktif: { label: "Nonaktif", tone: "neutral" },
};

export const categoryStatusMeta: Record<CategoryStatus, { label: string; tone: Tone }> = {
  aktif: { label: "Aktif", tone: "success" },
  nonaktif: { label: "Nonaktif", tone: "neutral" },
};

export const orderStatusOptions = Object.entries(orderStatusMeta) as [
  OrderStatus,
  { label: string; tone: Tone },
][];

export const invoiceStatusOptions = Object.entries(invoiceStatusMeta) as [
  InvoiceStatus,
  { label: string; tone: Tone },
][];

export const productStatusOptions = Object.entries(productStatusMeta) as [
  ProductStatus,
  { label: string; tone: Tone },
][];

export const categoryStatusOptions = Object.entries(categoryStatusMeta) as [
  CategoryStatus,
  { label: string; tone: Tone },
][];

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
