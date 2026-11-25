"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ImagePlus, Pencil } from "lucide-react";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { AdminPageHeader, EmptyState, LoadingPanel, Modal, StatusBadge } from "@/components/admin/ui";
import { adminRequest, jsonRequest } from "@/lib/admin/client";
import type { InspirationPhoto } from "@/types/inspiration";

function PhotoForm({ photo, onSave, onClose }: {
  photo?: InspirationPhoto;
  onSave: (photo: InspirationPhoto) => void;
  onClose: () => void;
}) {
  const { uploadPhoto } = useAdminData();
  const [title, setTitle] = useState(photo?.title ?? "");
  const [description, setDescription] = useState(photo?.description ?? "");
  const [active, setActive] = useState(photo?.is_active ?? true);
  const [url, setUrl] = useState(photo?.image_url ?? "");
  const [file, setFile] = useState<{ image: File; preview: string }>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => () => { if (file) URL.revokeObjectURL(file.preview); }, [file]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!title.trim() || (!url && !file)) {
      setError("Isi judul dan pilih foto.");
      return;
    }
    setPending(true);
    setError("");
    try {
      let imageUrl = url;
      if (file) {
        imageUrl = await uploadPhoto(file.image);
        setUrl(imageUrl);
        setFile(undefined);
      }
      const { data } = await adminRequest<{ data: InspirationPhoto }>(
        photo ? `admin/inspiration/${photo.id}` : "admin/inspiration",
        jsonRequest(photo ? "PUT" : "POST", {
          title: title.trim(), description: description.trim(), image_url: imageUrl, is_active: active,
        }),
      );
      onSave(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Foto belum tersimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal title={photo ? "Edit foto inspirasi" : "Tambah foto inspirasi"} onClose={() => { if (!pending) onClose(); }}>
      <form onSubmit={save}>
        <fieldset className="admin-form" disabled={pending}>
          <label className="admin-field">
            <span>Judul</span>
            <input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
          </label>
          <label className="admin-field">
            <span>Deskripsi (opsional)</span>
            <textarea rows={3} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Foto</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
              const image = event.target.files?.[0];
              event.target.value = "";
              if (!image) return;
              if (!["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size > 5 * 1024 * 1024 || !image.size) {
                setError("Pilih foto JPG, PNG, atau WebP hingga 5 MB.");
                return;
              }
              setFile({ image, preview: URL.createObjectURL(image) });
              setError("");
            }} />
            <small className="admin-form-hint">JPG, PNG, atau WebP hingga 5 MB.</small>
          </label>
          {(file || url) && (
            <div className="admin-product-photo-preview">
              {/* eslint-disable-next-line @next/next/no-img-element -- The preview may be a local blob. */}
              <img src={file?.preview || url} alt="Pratinjau foto inspirasi" />
            </div>
          )}
          <label className="admin-field">
            <span>Status</span>
            <select value={active ? "active" : "hidden"} onChange={(event) => setActive(event.target.value === "active")}>
              <option value="active">Tampil di Inspirasi Produk</option>
              <option value="hidden">Disembunyikan</option>
            </select>
          </label>
          {error && <p className="admin-field-error" role="alert">{error}</p>}
          <div className="admin-form-actions">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>Batal</button>
            <button type="submit" className="admin-btn admin-btn--primary">{pending ? "Menyimpan…" : "Simpan foto"}</button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

export default function InspirationAdminPage() {
  const [photos, setPhotos] = useState<InspirationPhoto[]>();
  const [editing, setEditing] = useState<InspirationPhoto | "new">();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const { notify } = useToast();

  useEffect(() => {
    let current = true;
    adminRequest<{ data: InspirationPhoto[] }>("admin/inspiration").then(
      ({ data }) => { if (current) setPhotos(data); },
      (error: unknown) => { if (current) setError(error instanceof Error ? error.message : "Foto belum dapat dimuat."); },
    );
    return () => { current = false; };
  }, [attempt]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Katalog"
        title="Inspirasi Produk"
        description="Unggah foto untuk galeri Inspirasi Produk."
        actions={<button type="button" className="admin-btn admin-btn--primary" onClick={() => setEditing("new")} disabled={!photos}>
          <ImagePlus size={16} aria-hidden="true" /> Tambah foto
        </button>}
      />
      <section className="admin-card">
        {error ? (
          <div role="alert">
            <p>{error}</p>
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>Coba lagi</button>
          </div>
        ) : !photos ? <LoadingPanel label="Memuat foto inspirasi…" /> : photos.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th scope="col">Foto</th><th scope="col">Judul</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead>
              <tbody>{photos.map((photo) => (
                <tr key={photo.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element -- Photos are served directly from Supabase Storage. */}
                    <img className="admin-product-table-photo" loading="lazy" src={photo.image_url} alt="" />
                  </td>
                  <td><strong>{photo.title}</strong>{photo.description && <small>{photo.description}</small>}</td>
                  <td><StatusBadge label={photo.is_active ? "Tampil" : "Disembunyikan"} tone={photo.is_active ? "success" : "neutral"} /></td>
                  <td><button type="button" className="admin-icon-btn" onClick={() => setEditing(photo)} aria-label={`Edit ${photo.title}`}>
                    <Pencil size={16} aria-hidden="true" />
                  </button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState title="Belum ada foto inspirasi" description="Gunakan Tambah foto untuk mulai mengisi galeri." />}
      </section>
      {editing && <PhotoForm
        key={editing === "new" ? "new" : editing.id}
        photo={editing === "new" ? undefined : editing}
        onClose={() => setEditing(undefined)}
        onSave={(photo) => {
          setPhotos((current) => {
            const list = current ?? [];
            return list.some((item) => item.id === photo.id)
              ? list.map((item) => item.id === photo.id ? photo : item)
              : [photo, ...list];
          });
          setEditing(undefined);
          notify("Foto inspirasi tersimpan.");
        }}
      />}
    </>
  );
}
