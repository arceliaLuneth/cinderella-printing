"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Product, ProductStatus } from "@/types/admin";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { ProductFormModal } from "@/components/admin/product-form";
import {
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  SearchField,
  StatusBadge,
} from "@/components/admin/ui";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  productStatusMeta,
  productStatusOptions,
} from "@/lib/admin/format";

type ModalState = { mode: "create" } | { mode: "edit"; product: Product } | null;

export default function AdminProductsPage() {
  const { products, categories, deleteProduct } = useAdminData();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    return products.filter((product) => {
      const category = categories.find((item) => item.id === product.categoryId);
      const matchesQuery = `${product.name} ${product.sku} ${product.description} ${category?.name ?? ""}`
        .toLocaleLowerCase("id-ID")
        .includes(normalized);
      const matchesCategory = categoryId === "all" || product.categoryId === categoryId;
      const matchesStatus = status === "all" || product.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, categories, query, categoryId, status]);

  const activeCount = products.filter((product) => product.status === "aktif").length;

  function handleDelete() {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    notify(`Produk “${deleteTarget.name}” dihapus.`, "info");
    setDeleteTarget(null);
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Katalog"
        title="Produk"
        description="Kelola daftar produk, harga, jumlah minimum, dan status tampil di katalog."
        actions={
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => setModal({ mode: "create" })}
          >
            <Plus size={16} aria-hidden="true" />
            Tambah produk
          </button>
        }
      />

      <div className="admin-summary-strip">
        <div>
          <span>Total produk</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Produk aktif</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>Draft</span>
          <strong>{products.filter((product) => product.status === "draft").length}</strong>
        </div>
        <div>
          <span>Kategori</span>
          <strong>{categories.length}</strong>
        </div>
      </div>

      <section className="admin-card">
        <div className="admin-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Cari nama, SKU, atau kategori…"
            label="Cari produk"
          />
          <div className="admin-toolbar-filters">
            <label className="admin-select">
              <span className="sr-only">Filter kategori</span>
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                <option value="all">Semua kategori</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-select">
              <span className="sr-only">Filter status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "all" | ProductStatus)}
              >
                <option value="all">Semua status</option>
                {productStatusOptions.map(([value, meta]) => (
                  <option value={value} key={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="admin-result-meta" aria-live="polite">
          Menampilkan {filtered.length} dari {products.length} produk
          {(query || categoryId !== "all" || status !== "all") && (
            <button
              type="button"
              className="admin-text-button"
              onClick={() => {
                setQuery("");
                setCategoryId("all");
                setStatus("all");
              }}
            >
              Hapus filter
            </button>
          )}
        </p>

        {filtered.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Produk</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Harga</th>
                  <th scope="col">Min. order</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="admin-table-actions-col">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const category = categories.find((item) => item.id === product.categoryId);
                  const meta = productStatusMeta[product.status];
                  return (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        <small>
                          {product.sku} · ditambahkan {formatDate(product.createdAt)}
                        </small>
                      </td>
                      <td>{category?.name ?? "Tanpa kategori"}</td>
                      <td>
                        <strong>{formatCurrency(product.price)}</strong>
                        <small>per {product.unit}</small>
                      </td>
                      <td>
                        {formatNumber(product.minOrder)} {product.unit}
                      </td>
                      <td>
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </td>
                      <td className="admin-table-actions-col">
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-icon-btn"
                            onClick={() => setModal({ mode: "edit", product })}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--danger"
                            onClick={() => setDeleteTarget(product)}
                            aria-label={`Hapus ${product.name}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Produk tidak ditemukan"
            description="Ubah kata kunci atau filter, atau tambahkan produk baru ke katalog."
            action={
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => setModal({ mode: "create" })}
              >
                <Plus size={16} aria-hidden="true" />
                Tambah produk
              </button>
            }
          />
        )}
      </section>

      {modal && (
        <ProductFormModal
          product={modal.mode === "edit" ? modal.product : undefined}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Hapus produk?"
          message={`Produk “${deleteTarget.name}” akan dihapus dari katalog. Riwayat item pada pesanan dan invoice tetap tersimpan.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
