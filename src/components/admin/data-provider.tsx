"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Category,
  CategoryInput,
  Customer,
  Invoice,
  InvoiceInput,
  InvoiceStatus,
  LineItem,
  Order,
  OrderInput,
  OrderStatus,
  Product,
  ProductInput,
} from "@/types/admin";
import {
  mockCategories,
  mockCustomers,
  mockInvoices,
  mockOrders,
  mockProducts,
} from "@/lib/admin/mock-data";
import { createId, slugify } from "@/lib/admin/format";

const STORAGE_KEY = "cinderella-admin-v3";

interface AdminDataState {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  invoices: Invoice[];
}

export type MutationResult = { ok: true } | { ok: false; message: string };

interface AdminDataContextValue extends AdminDataState {
  hydrated: boolean;
  addCategory: (input: CategoryInput) => Category;
  updateCategory: (id: string, input: CategoryInput) => void;
  deleteCategory: (id: string) => MutationResult;
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, input: ProductInput) => void;
  deleteProduct: (id: string) => void;
  addOrder: (input: OrderInput) => Order;
  updateOrder: (id: string, input: OrderInput) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => MutationResult;
  addInvoice: (input: InvoiceInput) => Invoice;
  updateInvoice: (id: string, input: InvoiceInput) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  deleteInvoice: (id: string) => void;
  resetData: () => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

function seedData(): AdminDataState {
  return {
    categories: structuredClone(mockCategories),
    products: structuredClone(mockProducts),
    customers: structuredClone(mockCustomers),
    orders: structuredClone(mockOrders),
    invoices: structuredClone(mockInvoices),
  };
}

function loadInitialData(): AdminDataState {
  if (typeof window === "undefined") return seedData();
  try {
    sessionStorage.removeItem("cinderella-admin-demo-v1");
    sessionStorage.removeItem("cinderella-admin-data-v2");
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw) as Partial<AdminDataState>;
    if (
      Array.isArray(parsed.categories) &&
      Array.isArray(parsed.products) &&
      Array.isArray(parsed.customers) &&
      Array.isArray(parsed.orders) &&
      Array.isArray(parsed.invoices)
    ) {
      const cleanOrders = parsed.orders.filter(
        (o) => !o.id.startsWith("ord-") && !o.number?.startsWith("CP-2026-01")
      );
      const cleanInvoices = parsed.invoices.filter(
        (i) => !i.id.startsWith("inv-") && !i.number?.startsWith("INV/2026/")
      );
      return {
        categories: parsed.categories,
        products: parsed.products,
        customers: parsed.customers,
        orders: cleanOrders,
        invoices: cleanInvoices,
      };
    }
  } catch {
    // A corrupt or unavailable store should not block the demo.
  }
  return seedData();
}

function customerFields(customers: Customer[], customerId: string) {
  const customer = customers.find((item) => item.id === customerId);
  return {
    customerId,
    customerName: customer?.name ?? "Pelanggan",
    customerCompany: customer?.company ?? "",
    customerPhone: customer?.phone ?? "",
    customerAddress: customer?.address ?? "",
  };
}

function buildLineItems(items: Omit<LineItem, "id">[]): LineItem[] {
  return items.map((item) => ({ ...item, id: createId("itm") }));
}

function nextOrderNumber(orders: Order[]) {
  const year = new Date().getFullYear();
  const highest = orders.reduce((max, order) => {
    const match = order.number.match(/(\d+)$/);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);
  return `CP-${year}-${String(highest + 1).padStart(4, "0")}`;
}

function nextInvoiceNumber(invoices: Invoice[], issueDate: string) {
  const [year, month] = issueDate.split("-");
  const prefix = `INV/${year}/${month}/`;
  const highest = invoices
    .filter((invoice) => invoice.number.startsWith(prefix))
    .reduce((max, invoice) => {
      const match = invoice.number.match(/(\d+)$/);
      return Math.max(max, match ? Number(match[1]) : 0);
    }, 0);
  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

function uniqueSlug(base: string, categories: Category[], excludeId?: string) {
  const root = slugify(base) || "kategori";
  let candidate = root;
  let counter = 2;
  while (
    categories.some((category) => category.slug === candidate && category.id !== excludeId)
  ) {
    candidate = `${root}-${counter}`;
    counter += 1;
  }
  return candidate;
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  // Server and first client render both start from the same deterministic seed.
  const [data, setData] = useState<AdminDataState>(() => seedData());
  const [hydrated, setHydrated] = useState(false);

  // Restore browser-only session data after hydration. Do not read sessionStorage in a state initializer.
  useEffect(() => {
    let cancelled = false;
    const restored = loadInitialData();
    if (!cancelled) {
      setData(restored);
      setHydrated(true);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist only after the initial browser data has been restored.
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Persistence is optional; in-memory state keeps the demo usable.
    }
  }, [data, hydrated]);

  const value = useMemo<AdminDataContextValue>(() => {
    return {
      ...data,
      hydrated,
      addCategory(input) {
        const category: Category = {
          ...input,
          id: createId("cat"),
          slug: uniqueSlug(input.name, data.categories),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setData((current) => ({ ...current, categories: [category, ...current.categories] }));
        return category;
      },
      updateCategory(id, input) {
        setData((current) => ({
          ...current,
          categories: current.categories.map((category) =>
            category.id === id
              ? {
                  ...category,
                  ...input,
                  slug: uniqueSlug(input.name, current.categories, id),
                }
              : category
          ),
        }));
      },
      deleteCategory(id) {
        if (data.products.some((product) => product.categoryId === id)) {
          return {
            ok: false,
            message: "Kategori masih dipakai produk. Pindahkan produk terlebih dahulu.",
          };
        }
        setData((current) => ({
          ...current,
          categories: current.categories.filter((category) => category.id !== id),
        }));
        return { ok: true };
      },
      addProduct(input) {
        const product: Product = {
          ...input,
          id: createId("prd"),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setData((current) => ({ ...current, products: [product, ...current.products] }));
        return product;
      },
      updateProduct(id, input) {
        setData((current) => ({
          ...current,
          products: current.products.map((product) =>
            product.id === id ? { ...product, ...input } : product
          ),
        }));
      },
      deleteProduct(id) {
        setData((current) => ({
          ...current,
          products: current.products.filter((product) => product.id !== id),
        }));
      },
      addOrder(input) {
        const order: Order = {
          ...input,
          ...customerFields(data.customers, input.customerId),
          id: createId("ord"),
          number: nextOrderNumber(data.orders),
          items: buildLineItems(input.items),
        };
        const invoice: Invoice = {
          id: createId("inv"),
          number: nextInvoiceNumber(data.invoices, order.orderDate),
          orderId: order.id,
          customerId: order.customerId,
          customerName: order.customerName,
          customerCompany: order.customerCompany,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          items: buildLineItems(input.items),
          issueDate: order.orderDate,
          dueDate: order.dueDate,
          taxPercent: 0,
          discount: 0,
          notes: order.notes,
          status: "draft",
          createdAt: new Date().toISOString(),
        };
        setData((current) => ({
          ...current,
          orders: [order, ...current.orders],
          invoices: [invoice, ...current.invoices],
        }));
        return order;
      },
      updateOrder(id, input) {
        setData((current) => ({
          ...current,
          orders: current.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  ...input,
                  ...customerFields(current.customers, input.customerId),
                  items: buildLineItems(input.items),
                }
              : order
          ),
        }));
      },
      updateOrderStatus(id, status) {
        setData((current) => ({
          ...current,
          orders: current.orders.map((order) =>
            order.id === id ? { ...order, status } : order
          ),
        }));
      },
      deleteOrder(id) {
        setData((current) => ({
          ...current,
          orders: current.orders.filter((order) => order.id !== id),
          invoices: current.invoices.filter((invoice) => invoice.orderId !== id),
        }));
        return { ok: true };
      },
      addInvoice(input) {
        const invoice: Invoice = {
          ...input,
          ...customerFields(data.customers, input.customerId),
          id: createId("inv"),
          number: nextInvoiceNumber(data.invoices, input.issueDate),
          items: buildLineItems(input.items),
          createdAt: new Date().toISOString(),
        };
        setData((current) => ({ ...current, invoices: [invoice, ...current.invoices] }));
        return invoice;
      },
      updateInvoice(id, input) {
        setData((current) => ({
          ...current,
          invoices: current.invoices.map((invoice) =>
            invoice.id === id
              ? {
                  ...invoice,
                  ...input,
                  ...customerFields(current.customers, input.customerId),
                  items: buildLineItems(input.items),
                }
              : invoice
          ),
        }));
      },
      updateInvoiceStatus(id, status) {
        setData((current) => ({
          ...current,
          invoices: current.invoices.map((invoice) =>
            invoice.id === id ? { ...invoice, status } : invoice
          ),
        }));
      },
      deleteInvoice(id) {
        setData((current) => ({
          ...current,
          invoices: current.invoices.filter((invoice) => invoice.id !== id),
        }));
      },
      resetData() {
        setData(seedData());
      },
    };
  }, [data, hydrated]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData harus dipakai di dalam AdminDataProvider.");
  }
  return context;
}
