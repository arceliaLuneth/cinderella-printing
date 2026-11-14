"use client";

import { useId, useState, type FormEvent } from "react";
import type { Category, CategoryStatus } from "@/types/admin";
import { categoryStatusOptions, slugify } from "@/lib/admin/format";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { Modal } from "@/components/admin/ui";

export function CategoryFormModal({
  category,
  onClose,
}: {
  category?: Category;
  onClose: () => void;
}) {
  const { addCategory, updateCategory } = useAdminData();
  const { notify } = useToast();
  const id = useId();
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [status, setStatus] = useState<CategoryStatus>(category?.status ?? "aktif");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }
    const input = { name: name.trim(), description: description.trim(), status };
    if (category) {
      updateCategory(category.id, input);
      notify(`Kategori “${input.name}” diperbarui.`);
    } else {
      addCategory(input);
      notify(`Kategori “${input.name}” ditambahkan.`);
    }
    onClose();
  }

  return (
    <Modal
      title={category ? "Edit kategori" : "Tambah kategori"}
      description="Nama kategori dipakai sebagai pengelompokan produk di katalog."
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-field" htmlFor={`${id}-name`}>
          <span>Nama kategori</span>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
            placeholder="Contoh: Packaging Makanan"
            autoFocus
          />
        </label>
        <p className="admin-form-hint">
          Slug: <code>{slugify(name) || "kategori-baru"}</code>
        </p>

        <label className="admin-field" htmlFor={`${id}-description`}>
          <span>Deskripsi</span>
          <textarea
            id={`${id}-description`}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Jelaskan jenis produk yang masuk ke kategori ini."
          />
        </label>

        <label className="admin-field" htmlFor={`${id}-status`}>
          <span>Status</span>
          <select
            id={`${id}-status`}
            value={status}
            onChange={(event) => setStatus(event.target.value as CategoryStatus)}
          >
            {categoryStatusOptions.map(([value, meta]) => (
              <option value={value} key={value}>
                {meta.label}
              </option>
            ))}
          </select>
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
            {category ? "Simpan perubahan" : "Tambah kategori"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
