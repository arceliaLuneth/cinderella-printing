"use client";

import { useId, useState, type FormEvent } from "react";
import type { Product, ProductStatus } from "@/types/admin";
import { formatCurrency, productStatusOptions } from "@/lib/admin/format";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { Modal } from "@/components/admin/ui";

export function ProductFormModal({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const { categories, addProduct, updateProduct } = useAdminData();
  const { notify } = useToast();
  const id = useId();
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [unit, setUnit] = useState(product?.unit ?? "pcs");
  const [minOrder, setMinOrder] = useState(product ? String(product.minOrder) : "100");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "aktif");
  const [error, setError] = useState("");

  const numericPrice = Number(price);
  const numericMinOrder = Number(minOrder);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    if (!sku.trim()) {
      setError("SKU wajib diisi agar produk mudah dicari.");
      return;
    }
    if (!categoryId) {
      setError("Pilih kategori produk.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Harga harus lebih dari 0.");
      return;
    }
    if (!Number.isFinite(numericMinOrder) || numericMinOrder <= 0) {
      setError("Jumlah minimum harus lebih dari 0.");
      return;
    }

    const input = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      categoryId,
      description: description.trim(),
      price: numericPrice,
      unit: unit.trim() || "pcs",
      minOrder: numericMinOrder,
      status,
    };

    if (product) {
      updateProduct(product.id, input);
      notify(`Produk “${input.name}” diperbarui.`);
    } else {
      addProduct(input);
      notify(`Produk “${input.name}” ditambahkan.`);
    }
    onClose();
  }

  return (
    <Modal
      title={product ? "Edit produk" : "Tambah produk"}
      description="Lengkapi informasi produk. Harga dan jumlah minimum dapat diubah kapan saja."
      onClose={onClose}
      size="lg"
    >
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label className="admin-field" htmlFor={`${id}-name`}>
            <span>Nama produk</span>
            <input
              id={`${id}-name`}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              placeholder="Contoh: Box Makanan Kraft"
              autoFocus
            />
          </label>
          <label className="admin-field" htmlFor={`${id}-sku`}>
            <span>SKU</span>
            <input
              id={`${id}-sku`}
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="CP-BX-001"
            />
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field" htmlFor={`${id}-category`}>
            <span>Kategori</span>
            <select
              id={`${id}-category`}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field" htmlFor={`${id}-status`}>
            <span>Status</span>
            <select
              id={`${id}-status`}
              value={status}
              onChange={(event) => setStatus(event.target.value as ProductStatus)}
            >
              {productStatusOptions.map(([value, meta]) => (
                <option value={value} key={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-form-grid admin-form-grid--three">
          <label className="admin-field" htmlFor={`${id}-price`}>
            <span>Harga satuan</span>
            <input
              id={`${id}-price`}
              type="number"
              min="0"
              step="100"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="3500"
            />
            {numericPrice > 0 && (
              <small className="admin-form-hint">{formatCurrency(numericPrice)} / satuan</small>
            )}
          </label>
          <label className="admin-field" htmlFor={`${id}-unit`}>
            <span>Satuan</span>
            <input
              id={`${id}-unit`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="pcs"
            />
          </label>
          <label className="admin-field" htmlFor={`${id}-min`}>
            <span>Jumlah minimum</span>
            <input
              id={`${id}-min`}
              type="number"
              min="1"
              step="1"
              value={minOrder}
              onChange={(event) => setMinOrder(event.target.value)}
            />
          </label>
        </div>

        <label className="admin-field" htmlFor={`${id}-description`}>
          <span>Deskripsi</span>
          <textarea
            id={`${id}-description`}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Bahan, ukuran, finishing, atau catatan produksi."
          />
        </label>

        {error && (
          <p className="admin-field-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="admin-btn admin-btn--primary">
            {product ? "Simpan perubahan" : "Tambah produk"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
