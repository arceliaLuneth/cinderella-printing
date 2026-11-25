import type { Category, Customer, Invoice, InvoicePayment, LineItem, Order, Product } from "@/types/admin";
import type { InvoiceSnapshot } from "@/lib/pdf";

export type CategoryRow = { id: string; name: string; slug: string; description: string; is_active: boolean; created_at: string };
export type ProductRow = {
  id: string; name: string; sku: string | null; category_id: string; description: string; image_url: string | null;
  reference_price: string | null; min_order: number; unit: string; is_active: boolean; is_draft: boolean; created_at: string;
};
export type CustomerRow = { id: string; name: string; phone: string; email: string | null; address: string; notes: string; is_active: boolean };
type ItemRow = {
  unit?: string;
  id?: string; product_id: string; product_name: string; quantity: string | number; unit_price: string | number;
  specifications: LineItem["specifications"];
};
type PaymentRow = { id: string; amount: string | number; method: InvoicePayment["method"]; reference: string; verified_at: string };
type InvoiceRow = {
  id: string; order_id: string; invoice_number: string; issued_at: string; is_cancelled: boolean;
  sent_at: string | null;
  revision: number; revised_at: string | null;
  archived_at: string | null;
  amount_paid: string | number; payment_status: "belum_bayar" | "dp" | "lunas"; snapshot: InvoiceSnapshot;
};
export type OrderRow = {
  id: string; order_number: string; customer_id: string; status: Order["status"]; due_date: string | null;
  notes: string; created_at: string; source: Order["source"]; confirmed_at: string | null;
  edit_version: string;
  archived_at: string | null;
  discount: string; additional_cost: string; items: ItemRow[]; invoice: InvoiceRow | null; payments: PaymentRow[];
};

export function mapCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, slug: row.slug, description: row.description,
    status: row.is_active ? "aktif" : "nonaktif", createdAt: row.created_at };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id, name: row.name, sku: row.sku ?? "", categoryId: row.category_id,
    description: row.description, imageUrl: row.image_url ?? undefined,
    price: row.reference_price === null ? null : Number(row.reference_price), unit: row.unit, minOrder: row.min_order,
    status: row.is_active ? "aktif" : row.is_draft ? "draft" : "nonaktif", createdAt: row.created_at,
  };
}

export function mapCustomer(row: CustomerRow): Customer {
  return { id: row.id, name: row.name, company: "", address: row.address, notes: row.notes,
    email: row.email ?? "", phone: row.phone, active: row.is_active };
}

function item(row: ItemRow, index: number): LineItem {
  return { id: row.id ?? String(index), productId: row.product_id, name: row.product_name,
    quantity: Number(row.quantity), unit: row.unit, unitPrice: Number(row.unit_price), specifications: row.specifications };
}

export function mapOrder(row: OrderRow, customers: Customer[]): Order {
  const customer = customers.find(({ id }) => id === row.customer_id);
  return {
    id: row.id, number: row.order_number, customerId: row.customer_id,
    customerName: customer?.name ?? "", customerCompany: customer?.company ?? "",
    customerPhone: customer?.phone ?? "", customerAddress: customer?.address ?? "",
    items: row.items.map(item), status: row.status, orderDate: row.created_at,
    dueDate: row.due_date ?? "", notes: row.notes, source: row.source, confirmed: !!row.confirmed_at,
    editVersion: row.edit_version,
    archivedAt: row.archived_at,
    paidAmount: Number(row.invoice?.amount_paid ?? 0),
    discount: Number(row.discount), additionalCost: Number(row.additional_cost),
  };
}

export function mapInvoice(row: InvoiceRow, payments: PaymentRow[]): Invoice {
  const { snapshot } = row;
  return {
    id: row.id, number: row.invoice_number, orderId: row.order_id, customerId: snapshot.customer.id,
    customerName: snapshot.customer.name, customerCompany: "", customerPhone: snapshot.customer.phone,
    customerAddress: snapshot.customer.address, items: snapshot.items.map(item), issueDate: row.issued_at,
    dueDate: snapshot.order.due_date ?? "", discount: Number(snapshot.discount), additionalCost: Number(snapshot.additional_cost),
    notes: snapshot.order.notes, paidAmount: Number(row.amount_paid), business: snapshot.business,
    status: row.is_cancelled ? "dibatalkan" : row.payment_status,
    sentAt: row.sent_at,
    revision: row.revision,
    revisedAt: row.revised_at,
    archivedAt: row.archived_at,
    payments: payments.map((entry) => ({
      id: entry.id, amount: Number(entry.amount), method: entry.method, reference: entry.reference, paidAt: entry.verified_at,
    })),
  };
}
