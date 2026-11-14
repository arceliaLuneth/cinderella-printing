"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@/types/admin";
import { createId, formatCurrency } from "@/lib/admin/format";

export interface DraftItem {
  id: string;
  productId: string;
  name: string;
  quantity: string;
  unitPrice: string;
}

export function emptyDraftItem(products: Product[]): DraftItem {
  const product = products[0];
  return {
    id: createId("draft"),
    productId: product?.id ?? "",
    name: product?.name ?? "",
    quantity: product ? String(product.minOrder) : "1",
    unitPrice: product ? String(product.price) : "",
  };
}

export function itemsToDraft(
  items: { productId: string; name: string; quantity: number; unitPrice: number }[],
  products: Product[]
): DraftItem[] {
  if (items.length === 0) return [emptyDraftItem(products)];
  return items.map((item) => ({
    id: createId("draft"),
    productId: item.productId,
    name: item.name,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
  }));
}

export function draftItemTotal(item: DraftItem) {
  return (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
}

export function LineItemsEditor({
  items,
  products,
  onChange,
}: {
  items: DraftItem[];
  products: Product[];
  onChange: (items: DraftItem[]) => void;
}) {
  function updateItem(id: string, patch: Partial<DraftItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function selectProduct(id: string, productId: string) {
    const product = products.find((item) => item.id === productId);
    updateItem(id, {
      productId,
      name: product?.name ?? "",
      unitPrice: product ? String(product.price) : "",
      quantity: product ? String(product.minOrder) : "1",
    });
  }

  function removeItem(id: string) {
    if (items.length === 1) return;
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="admin-line-items">
      <div className="admin-line-items-head">
        <span>Produk</span>
        <span>Jumlah</span>
        <span>Harga satuan</span>
        <span>Subtotal</span>
        <span aria-hidden="true" />
      </div>
      {items.map((item) => (
        <div className="admin-line-item" key={item.id}>
          <label className="admin-field admin-field--compact">
            <span className="sr-only">Produk</span>
            <select
              value={item.productId}
              onChange={(event) => selectProduct(item.id, event.target.value)}
            >
              {!products.some((product) => product.id === item.productId) && item.productId && (
                <option value={item.productId}>{item.name} (tidak tersedia)</option>
              )}
              {products.map((product) => (
                <option value={product.id} key={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field admin-field--compact">
            <span className="sr-only">Jumlah</span>
            <input
              type="number"
              min="1"
              step="1"
              value={item.quantity}
              onChange={(event) => updateItem(item.id, { quantity: event.target.value })}
            />
          </label>
          <label className="admin-field admin-field--compact">
            <span className="sr-only">Harga satuan</span>
            <input
              type="number"
              min="0"
              step="100"
              value={item.unitPrice}
              onChange={(event) => updateItem(item.id, { unitPrice: event.target.value })}
            />
          </label>
          <p className="admin-line-total">{formatCurrency(draftItemTotal(item))}</p>
          <button
            type="button"
            className="admin-icon-btn admin-icon-btn--danger"
            onClick={() => removeItem(item.id)}
            disabled={items.length === 1}
            aria-label={`Hapus ${item.name || "item"}`}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--sm"
        onClick={() => onChange([...items, emptyDraftItem(products)])}
      >
        <Plus size={15} aria-hidden="true" />
        Tambah item
      </button>
    </div>
  );
}
