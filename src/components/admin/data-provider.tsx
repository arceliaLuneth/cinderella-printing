"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CategoryInput, CustomerInput, InvoicePayment, OrderInput, OrderStatus, ProductInput } from "@/types/admin";
import { adminRequest, adminResponse, jsonRequest } from "@/lib/admin/client";
import { mapCategory, mapCustomer, mapInvoice, mapOrder, mapProduct,
  type CategoryRow, type CustomerRow, type OrderRow, type ProductRow } from "@/lib/admin/records";
import { slugify } from "@/lib/admin/format";

type State = { categories: CategoryRow[]; products: ProductRow[]; customers: CustomerRow[]; orders: OrderRow[] };
const empty: State = { categories: [], products: [], customers: [], orders: [] };

async function allRows<T>(resource: string, extra = "") {
  const rows: T[] = [];
  for (let page = 1; ; page += 1) {
    const result = await adminRequest<{ data: T[]; meta: { total: number } }>(
      `admin/${resource}?limit=100&page=${page}${extra}`,
    );
    rows.push(...result.data);
    if (rows.length >= result.meta.total || !result.data.length) return rows;
  }
}

function putRow<T extends { id: string }>(rows: T[], row: T) {
  return rows.some(({ id }) => id === row.id) ? rows.map((entry) => entry.id === row.id ? row : entry) : [row, ...rows];
}

function slug(value: string, fallback: string) {
  return (slugify(value).slice(0, 146).replace(/-$/, "") || fallback) + "-" + crypto.randomUUID().slice(0, 8);
}

function orderBody(input: OrderInput) {
  return {
    customer_id: input.customerId, source: input.source, due_date: input.dueDate || null, notes: input.notes,
    discount: String(input.discount), additional_cost: String(input.additionalCost),
    items: input.items.map((item) => ({
      product_id: item.productId, quantity: String(item.quantity), unit_price: String(item.unitPrice),
      specifications: item.specifications,
    })),
  };
}

function useAdminStore() {
  const [rows, setRows] = useState<State>(empty);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [categories, products, customers, orders] = await Promise.all([
          allRows<CategoryRow>("categories"), allRows<ProductRow>("products"),
          allRows<CustomerRow>("customers"), allRows<OrderRow>("orders", "&details=true"),
        ]);
        if (active) {
          setRows({ categories, products, customers, orders });
          setHydrated(true);
        }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Data admin belum dapat dimuat.");
      }
    }
    void load();
    return () => { active = false; };
  }, [retry]);

  const categories = rows.categories.map(mapCategory);
  const products = rows.products.map(mapProduct);
  const customers = rows.customers.map(mapCustomer);
  const orders = rows.orders.map((row) => mapOrder(row, customers));
  const invoices = rows.orders.flatMap((row) => row.invoice ? [mapInvoice(row.invoice, row.payments)] : []);

  async function saveOrder(path: string, options: RequestInit) {
    const { data } = await adminRequest<{ data: OrderRow }>("admin/orders" + path, options);
    setRows((current) => ({ ...current, orders: putRow(current.orders, data) }));
    return data;
  }

  async function saveCategory(input: CategoryInput, id?: string) {
    const { data } = await adminRequest<{ data: CategoryRow }>(id ? `admin/categories/${id}` : "admin/categories",
      jsonRequest(id ? "PATCH" : "POST", {
        name: input.name, description: input.description, is_active: input.status === "aktif",
        ...(id ? {} : { slug: slug(input.name, "kategori") }),
      }));
    setRows((current) => ({ ...current, categories: putRow(current.categories, data) }));
  }

  async function saveProduct(input: ProductInput, id?: string) {
    const { data } = await adminRequest<{ data: ProductRow }>(id ? `admin/products/${id}` : "admin/products",
      jsonRequest(id ? "PATCH" : "POST", {
        name: input.name, sku: input.sku || null, category_id: input.categoryId, description: input.description,
        image_url: input.imageUrl || null, unit: input.unit, min_order: input.minOrder,
        reference_price: input.price === null ? null : String(input.price),
        is_active: input.status === "aktif", is_draft: input.status === "draft",
        ...(id ? {} : { slug: slug(input.name, "produk") }),
      }));
    setRows((current) => ({ ...current, products: putRow(current.products, data) }));
  }

  async function saveCustomer(input: CustomerInput, id?: string) {
    const { data } = await adminRequest<{ data: CustomerRow }>(id ? `admin/customers/${id}` : "admin/customers",
      jsonRequest(id ? "PATCH" : "POST", input));
    setRows((current) => ({ ...current, customers: putRow(current.customers, data) }));
    return mapCustomer(data);
  }

  async function archiveTransaction(resource: "orders" | "invoices", id: string, archived: boolean) {
    const { data } = await adminRequest<{ data: { id: string; archived_at: string | null; edit_version: string } }>(
      `admin/${resource}/${id}/archive`, jsonRequest("PATCH", { archived }),
    );
    setRows((current) => ({
      ...current,
      orders: current.orders.map((row) => {
        if (resource === "orders" && row.id === data.id) {
          return { ...row, archived_at: data.archived_at, edit_version: data.edit_version };
        }
        if (resource === "invoices" && row.invoice?.id === data.id) {
          return { ...row, invoice: { ...row.invoice, archived_at: data.archived_at } };
        }
        return row;
      }),
    }));
  }

  return {
    categories, products, orders, invoices, customers, hydrated, loadError,
    retry() { setLoadError(""); setRetry((value) => value + 1); },
    addCategory: (input: CategoryInput) => saveCategory(input),
    updateCategory: (id: string, input: CategoryInput) => saveCategory(input, id),
    async deactivateCategory(id: string) {
      const { data } = await adminRequest<{ data: CategoryRow }>(
        `admin/categories/${id}`, jsonRequest("PATCH", { is_active: false }),
      );
      setRows((current) => ({ ...current, categories: putRow(current.categories, data) }));
    },
    addProduct: (input: ProductInput) => saveProduct(input),
    updateProduct: (id: string, input: ProductInput) => saveProduct(input, id),
    async deactivateProduct(id: string) {
      const { data } = await adminRequest<{ data: ProductRow }>(
        `admin/products/${id}`, jsonRequest("PATCH", { is_active: false, is_draft: false }),
      );
      setRows((current) => ({ ...current, products: putRow(current.products, data) }));
    },
    async uploadPhoto(file: File) {
      const body = new FormData();
      body.set("file", file);
      const { data } = await adminRequest<{ data: { url: string } }>("admin/uploads", { method: "POST", body });
      return data.url;
    },
    addCustomer: (input: CustomerInput) => saveCustomer(input),
    updateCustomer: (id: string, input: CustomerInput) => saveCustomer(input, id),
    async addOrder(input: OrderInput) {
      return mapOrder(await saveOrder("", jsonRequest("POST", orderBody(input))), customers);
    },
    async updateOrder(id: string, input: OrderInput, expectedVersion: string) {
      const body = { ...orderBody(input), expected_version: expectedVersion };
      return mapOrder(await saveOrder(`/${id}`, jsonRequest("PUT", body)), customers);
    },
    async updateOrderStatus(id: string, status: OrderStatus, reason?: string) {
      await saveOrder(`/${id}/status`, jsonRequest("PATCH", { status, reason }));
    },
    async createInvoice(orderId: string) {
      const row = await saveOrder(`/${orderId}/confirm`, { method: "POST" });
      if (!row.invoice) throw new Error("Invoice belum tersedia.");
      return mapInvoice(row.invoice, row.payments);
    },
    async recordInvoicePayment(orderId: string, expectedVersion: string, payment: Pick<InvoicePayment, "amount" | "method" | "reference">) {
      const row = await saveOrder(`/${orderId}/payments/verify`, jsonRequest("POST", { ...payment, amount: String(payment.amount), expected_version: expectedVersion }));
      if (!row.invoice) throw new Error("Invoice belum tersedia.");
      return mapInvoice(row.invoice, row.payments);
    },
    async updateInvoiceDelivery(id: string, sent: boolean) {
      const { data } = await adminRequest<{ data: { id: string; sent_at: string | null } }>(
        `admin/invoices/${id}/delivery`, jsonRequest("PATCH", { sent }),
      );
      setRows((current) => ({
        ...current,
        orders: current.orders.map((row) => row.invoice?.id === data.id
          ? { ...row, invoice: { ...row.invoice, sent_at: data.sent_at } }
          : row),
      }));
    },
    async getInvoicePdf(id: string) {
      return (await adminResponse(`admin/invoices/${id}/pdf`)).blob();
    },
    archiveOrder: (id: string, archived: boolean) => archiveTransaction("orders", id, archived),
    archiveInvoice: (id: string, archived: boolean) => archiveTransaction("invoices", id, archived),
  };
}

const AdminDataContext = createContext<ReturnType<typeof useAdminStore> | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const value = useAdminStore();
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const data = useContext(AdminDataContext);
  if (!data) throw new Error("AdminDataProvider diperlukan.");
  return data;
}
