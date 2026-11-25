"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus } from "lucide-react";
import { useAdminData } from "@/components/admin/data-provider";
import { AdminPageHeader, EmptyState, Modal, SearchField, StatusBadge } from "@/components/admin/ui";
import { useToast } from "@/components/admin/toast";
import type { Customer } from "@/types/admin";

function CustomerForm({ customer, onClose }: { customer?: Customer; onClose: () => void }) {
  const { addCustomer, updateCustomer } = useAdminData();
  const { notify } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const input = {
      name: String(data.get("name")).trim(),
      phone: String(data.get("phone")).trim(),
      email: String(data.get("email")).trim() || null,
      address: String(data.get("address")).trim(),
      notes: String(data.get("notes")).trim(),
      is_active: data.get("active") === "true",
    };
    setPending(true);
    setError("");
    try {
      if (customer) await updateCustomer(customer.id, input);
      else await addCustomer(input);
      notify(customer ? "Perubahan pelanggan tersimpan." : "Pelanggan ditambahkan.");
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Pelanggan belum tersimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal title={customer ? "Edit pelanggan" : "Tambah pelanggan"} onClose={() => { if (!pending) onClose(); }}>
      <form onSubmit={submit}>
        <fieldset className="admin-form" disabled={pending}>
          <div className="admin-form-grid">
            <label className="admin-field"><span>Nama</span><input name="name" defaultValue={customer?.name} required maxLength={160} autoFocus /></label>
            <label className="admin-field"><span>Nomor telepon</span><input name="phone" type="tel" defaultValue={customer?.phone} required minLength={6} maxLength={30} /></label>
            <label className="admin-field"><span>Email (opsional)</span><input name="email" type="email" defaultValue={customer?.email} maxLength={254} /></label>
            <label className="admin-field"><span>Alamat (opsional)</span><input name="address" defaultValue={customer?.address} maxLength={1000} /></label>
          </div>
          <label className="admin-field"><span>Catatan (opsional)</span><textarea name="notes" defaultValue={customer?.notes} rows={3} maxLength={2000} /></label>
          <label className="admin-field">
            <span>Status pelanggan</span>
            <select name="active" defaultValue={customer?.active === false ? "false" : "true"}>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
            <small className="admin-form-hint">Pelanggan nonaktif disembunyikan dari pilihan pesanan baru.</small>
          </label>
          {error && <p className="admin-field-error" role="alert">{error}</p>}
          <div className="admin-form-actions">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>Batal</button>
            <button type="submit" className="admin-btn admin-btn--primary">{pending ? "Menyimpan…" : "Simpan pelanggan"}</button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

export default function CustomersPage() {
  const { customers } = useAdminData();
  const [editing, setEditing] = useState<Customer | "new">();
  const [query, setQuery] = useState("");
  const key = query.trim().toLocaleLowerCase("id-ID");
  const visible = customers.filter((customer) => [customer.name, customer.phone, customer.email, customer.address]
    .some((value) => value.toLocaleLowerCase("id-ID").includes(key)));

  return (
    <>
      <AdminPageHeader title="Pelanggan" description="Kelola kontak pelanggan untuk pesanan dan invoice."
        actions={<button type="button" className="admin-btn admin-btn--primary" onClick={() => setEditing("new")}>
          <Plus size={16} aria-hidden="true" /> Tambah pelanggan
        </button>}
      />
      <section className="admin-card">
        <div className="admin-toolbar"><SearchField value={query} onChange={setQuery} label="Cari pelanggan" placeholder="Cari nama, kontak, atau alamat…" /></div>
        {visible.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th scope="col">Nama</th><th scope="col">Telepon</th><th scope="col">Email</th><th scope="col">Alamat</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead>
              <tbody>{visible.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || "—"}</td>
                  <td>{customer.address || "—"}</td>
                  <td><StatusBadge label={customer.active ? "Aktif" : "Nonaktif"} tone={customer.active ? "success" : "neutral"} /></td>
                  <td>
                    <button type="button" className="admin-icon-btn" aria-label={`Edit ${customer.name}`} onClick={() => setEditing(customer)}>
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState title={key ? "Pelanggan tidak ditemukan" : "Belum ada pelanggan"} description={key ? "Coba kata kunci lain." : "Tambahkan kontak pelanggan untuk mencatat pesanan."} />}
      </section>
      {editing && <CustomerForm key={editing === "new" ? "new" : editing.id} customer={editing === "new" ? undefined : editing} onClose={() => setEditing(undefined)} />}
    </>
  );
}
