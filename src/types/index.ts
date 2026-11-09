export type ProductCategory =
  | "Packaging Makanan"
  | "Pouch"
  | "Cup"
  | "Custom Packaging";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  moq: string;
  material: string;
  size: string;
  image?: string;
}

export interface ConsultationDraft {
  product: string;
  quantity: string;
  size: string;
  material: string;
  shape: string;
  budget: string;
  name: string;
  whatsapp: string;
  referenceFileName: string;
  notes: string;
}
