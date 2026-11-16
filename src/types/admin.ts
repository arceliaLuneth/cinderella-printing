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
  price: number;
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
}

export interface LineItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | "baru"
  | "dikonfirmasi"
  | "produksi"
  | "siap-kirim"
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
}

export type InvoiceStatus = "draft" | "terkirim" | "lunas" | "jatuh-tempo" | "dibatalkan";

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
  taxPercent: number;
  discount: number;
  notes: string;
  status: InvoiceStatus;
  createdAt: string;
}

export type CategoryInput = Pick<Category, "name" | "description" | "status">;

export type ProductInput = Pick<
  Product,
  "name" | "sku" | "categoryId" | "description" | "price" | "unit" | "minOrder" | "status"
>;

export type OrderInput = Pick<Order, "customerId" | "status" | "orderDate" | "dueDate" | "notes"> & {
  items: Omit<LineItem, "id">[];
};

export type InvoiceInput = Pick<
  Invoice,
  | "orderId"
  | "customerId"
  | "issueDate"
  | "dueDate"
  | "taxPercent"
  | "discount"
  | "notes"
  | "status"
> & {
  items: Omit<LineItem, "id">[];
};

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}
