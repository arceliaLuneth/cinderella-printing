"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
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
  const { categories, addProduct, updateProduct, uploadPhoto } = useAdminData();
  const { notify } = useToast();
  const id = useId();
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [photo, setPhoto] = useState<{ file: File; preview: string }>();
  const [pending, setPending] = useState(false);
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [unit, setUnit] = useState(product?.unit ?? "pcs");
  const [minOrder, setMinOrder] = useState(product ? String(product.minOrder) : "100");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "aktif");
  const [error, setError] = useState("");

  const numericPrice = price.trim() ? Number(price) : null;
  const numericMinOrder = Number(minOrder);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.preview); }, [photo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    if (!categoryId) {
      setError("Pilih kategori produk.");
      return;
    }
    if (numericPrice !== null && (!Number.isSafeInteger(numericPrice) || numericPrice < 0 || numericPrice > 1000000000)) {
      setError("Masukkan harga dalam rupiah, maksimal Rp1.000.000.000.");
      return;
    }
    if (!Number.isSafeInteger(numericMinOrder) || numericMinOrder < 1 || numericMinOrder > 1000000) {
      setError("Jumlah minimum harus antara 1 dan 1.000.000.");
      return;
    }

    const input = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      categoryId,
      description: description.trim(),
      imageUrl,
      price: numericPrice,
      unit: unit.trim() || "pcs",
      minOrder: numericMinOrder,
      status,
    };

    setPending(true);
    setError("");
    try {
      if (photo) {
        input.imageUrl = await uploadPhoto(photo.file);
        setImageUrl(input.imageUrl);
        setPhoto(undefined);
      }
      if (product) await updateProduct(product.id, input);
      else await addProduct(input);
      notify(`Produk “${input.name}” disimpan.`);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Produk belum tersimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      title={product ? "Edit produk" : "Tambah produk"}
      description="Lengkapi informasi produk. Harga dan jumlah minimum dapat diubah kapan saja."
      onClose={() => { if (!pending) onClose(); }}
      size="lg"
    >
      <form className="admin-form" onSubmit={handleSubmit}>
        <fieldset className="admin-form" disabled={pending}>
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
              <span>Harga referensi (opsional)</span>
            <input
              id={`${id}-price`}
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="3500"
            />
            {numericPrice !== null && numericPrice > 0 && (
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

        <div className="admin-field">
          <label htmlFor={`${id}-photo`}>Foto produk</label>
          {(photo || imageUrl) && (
            <div className="admin-product-photo-preview">
              {/* eslint-disable-next-line @next/next/no-img-element -- Data URL foto dipilih langsung dari perangkat admin. */}
              <img src={photo?.preview || imageUrl} alt="Pratinjau foto produk" />
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => { setPhoto(undefined); setImageUrl(""); }}>Hapus foto</button>
            </div>
          )}
          <input
            id={`${id}-photo`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                setError("Pilih file gambar JPG, PNG, atau WebP.");
                event.target.value = "";
                return;
              }
              if (file.size > 5 * 1024 * 1024) {
                setError("Ukuran foto maksimal 5 MB.");
                event.target.value = "";
                return;
              }
              setPhoto({ file, preview: URL.createObjectURL(file) });
              setError("");
              event.target.value = "";
            }}
          />
          <small className="admin-form-hint">JPG, PNG, atau WebP. Maksimal 5 MB.</small>
        </div>

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
            {pending ? "Menyimpan…" : product ? "Simpan perubahan" : "Tambah produk"}
          </button>
        </div>
        </fieldset>
      </form>
    </Modal>
  );
}
