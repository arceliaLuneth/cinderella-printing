export type CategoryStatus = "aktif" | "nonaktif";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  createdAt: string;
}

export type ProductStatus = "aktif" | "draft" | "nonaktif";

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  description: string;
  imageUrl?: string;
  price: number | null;
  unit: string;
  minOrder: number;
  status: ProductStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  active: boolean;
}

export interface LineItem {
  unit?: string;
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  specifications: { size: string; material: string; finishing: string; notes: string };
}

export type OrderStatus =
  | "baru"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerAddress: string;
  items: LineItem[];
  status: OrderStatus;
  orderDate: string;
  dueDate: string;
  notes: string;
  source: "whatsapp" | "langsung";
  confirmed: boolean;
  editVersion: string;
  archivedAt: string | null;
  paidAmount: number;
  discount: number;
  additionalCost: number;
}

export type InvoiceStatus = "belum_bayar" | "dp" | "lunas" | "dibatalkan";

export interface Invoice {
  id: string;
  number: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerAddress: string;
  items: LineItem[];
  issueDate: string;
  dueDate: string;
  discount: number;
  additionalCost: number;
  notes: string;
  status: InvoiceStatus;
  sentAt: string | null;
  revision: number;
  revisedAt: string | null;
  archivedAt: string | null;
  paidAmount: number;
  payments: InvoicePayment[];
  business: { business_name: string; address: string; phone: string; email: string };
}

export interface InvoicePayment {
  id: string;
  amount: number;
  method: "tunai" | "transfer";
  reference: string;
  paidAt: string;
}

export type InvoiceRevision = {
  id: string;
  revision: number;
  archived_at: string;
  total: string;
};

export type CategoryInput = Pick<Category, "name" | "description" | "status">;

export type ProductInput = Pick<
  Product,
  "name" | "sku" | "categoryId" | "description" | "imageUrl" | "price" | "unit" | "minOrder" | "status"
>;

export type CustomerInput = { name: string; phone: string; email: string | null; address: string; notes: string; is_active: boolean };

export type OrderInput = Pick<Order, "customerId" | "source" | "dueDate" | "notes" | "discount" | "additionalCost"> & {
  items: Omit<LineItem, "id">[];
};

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  additionalCost: number;
  total: number;
}
