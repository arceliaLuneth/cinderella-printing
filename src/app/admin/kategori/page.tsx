"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import type { Category, CategoryStatus } from "@/types/admin";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { CategoryFormModal } from "@/components/admin/category-form";
import {
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  SearchField,
  StatusBadge,
} from "@/components/admin/ui";
import { categoryStatusMeta, categoryStatusOptions, formatDate } from "@/lib/admin/format";

type ModalState = { mode: "create" } | { mode: "edit"; category: Category } | null;

export default function AdminCategoriesPage() {
  const { categories, products, deleteCategory } = useAdminData();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CategoryStatus>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    return categories.filter((category) => {
      const matchesQuery = `${category.name} ${category.slug} ${category.description}`
        .toLocaleLowerCase("id-ID")
        .includes(normalized);
      const matchesStatus = status === "all" || category.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [categories, query, status]);

  function productCount(categoryId: string) {
    return products.filter((product) => product.categoryId === categoryId).length;
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const result = deleteCategory(deleteTarget.id);
    if (!result.ok) {
      notify(result.message, "danger");
      setDeleteTarget(null);
      return;
    }
    notify(`Kategori “${deleteTarget.name}” dihapus.`, "info");
    setDeleteTarget(null);
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Katalog"
        title="Kategori"
        description="Atur pengelompokan produk agar katalog mudah ditelusuri dan dikelola."
        actions={
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => setModal({ mode: "create" })}
          >
            <Plus size={16} aria-hidden="true" />
            Tambah kategori
          </button>
        }
      />

      <section className="admin-card">
        <div className="admin-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Cari nama kategori…"
            label="Cari kategori"
          />
          <div className="admin-toolbar-filters">
            <label className="admin-select">
              <span className="sr-only">Filter status kategori</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "all" | CategoryStatus)}
              >
                <option value="all">Semua status</option>
                {categoryStatusOptions.map(([value, meta]) => (
                  <option value={value} key={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="admin-result-meta" aria-live="polite">
          Menampilkan {filtered.length} dari {categories.length} kategori
          {(query || status !== "all") && (
            <button
              type="button"
              className="admin-text-button"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Hapus filter
            </button>
          )}
        </p>

        {filtered.length > 0 ? (
          <div className="admin-category-grid">
            {filtered.map((category) => {
              const meta = categoryStatusMeta[category.status];
              const count = productCount(category.id);
              return (
                <article className="admin-category-card" key={category.id}>
                  <div className="admin-category-card-head">
                    <span className="admin-category-icon" aria-hidden="true">
                      <Tags size={18} />
                    </span>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <h2>{category.name}</h2>
                  <p>{category.description || "Belum ada deskripsi kategori."}</p>
                  <div className="admin-category-meta">
                    <span>
                      {count} produk · dibuat {formatDate(category.createdAt)}
                    </span>
                    <code>{category.slug}</code>
                  </div>
                  <div className="admin-category-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => setModal({ mode: "edit", category })}
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm admin-btn--danger-text"
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Hapus
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Kategori tidak ditemukan"
            description="Ubah kata kunci atau filter status untuk melihat kategori lain."
            action={
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => setModal({ mode: "create" })}
              >
                <Plus size={16} aria-hidden="true" />
                Tambah kategori
              </button>
            }
          />
        )}
      </section>

      {modal && (
        <CategoryFormModal
          category={modal.mode === "edit" ? modal.category : undefined}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Hapus kategori?"
          message={
            productCount(deleteTarget.id) > 0
              ? `Kategori “${deleteTarget.name}” masih dipakai oleh ${productCount(
                  deleteTarget.id
                )} produk. Pindahkan produk ke kategori lain sebelum menghapus.`
              : `Kategori “${deleteTarget.name}” akan dihapus dari katalog.`
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
