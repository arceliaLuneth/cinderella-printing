"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Order } from "@/types/admin";
import { addDaysISO, formatCurrency, todayISO } from "@/lib/admin/format";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { Modal } from "@/components/admin/ui";
import { draftItemTotal, itemsToDraft, LineItemsEditor } from "@/components/admin/line-items-editor";

export function OrderFormModal({ order, onClose, onSaved }: {
  order?: Order;
  onClose: () => void;
  onSaved?: (order: Order) => void;
}) {
  const { customers, categories, products, addOrder, updateOrder } = useAdminData();
  const { notify } = useToast();
  const lockedCustomer = (order?.paidAmount ?? 0) > 0;
  const activeCustomers = customers.filter((customer) => customer.id === order?.customerId || (!lockedCustomer && customer.active));
  const existingItems = new Map(order?.items.map((item) => [item.productId, item]));
  const activeProducts = products.flatMap((product) => {
    const existing = existingItems.get(product.id);
    if (existing) return [{ ...product, name: existing.name }];
    const activeCategory = categories.some((category) => category.id === product.categoryId && category.status === "aktif");
    return product.status === "aktif" && activeCategory ? [product] : [];
  });
  const [customerId, setCustomerId] = useState(order?.customerId ?? "");
  const [source, setSource] = useState<Order["source"]>(order?.source ?? "whatsapp");
  const [dueDate, setDueDate] = useState(order?.dueDate ?? addDaysISO(todayISO(), 14));
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [discount, setDiscount] = useState(String(order?.discount ?? 0));
  const [additionalCost, setAdditionalCost] = useState(String(order?.additionalCost ?? 0));
  const [items, setItems] = useState(() => itemsToDraft(order?.items ?? [], activeProducts));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [originalVersion] = useState(order?.editVersion ?? "");
  const total = items.reduce((sum, entry) => sum + draftItemTotal(entry), 0) + Number(additionalCost) - Number(discount);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!customerId || items.some((entry) => !entry.productId)) {
      setError("Pilih pelanggan dan produk.");
      return;
    }
    if (total < (order?.paidAmount ?? 0)) {
      setError("Total baru tidak boleh lebih kecil dari pembayaran yang sudah tercatat.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const input = {
        customerId, source, dueDate, notes: notes.trim(), discount: Number(discount), additionalCost: Number(additionalCost),
        items: items.map((entry) => ({
          productId: entry.productId, name: entry.name, quantity: Number(entry.quantity),
          unitPrice: Number(entry.unitPrice), specifications: entry.specifications,
        })),
      };
      const saved = order ? await updateOrder(order.id, input, originalVersion) : await addOrder(input);
      notify(`Pesanan ${saved.number} tersimpan.`);
      onSaved?.(saved);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Pesanan belum tersimpan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal title={order ? `Edit pesanan ${order.number}` : "Buat pesanan"}
      description={order?.confirmed ? "Jika rincian berubah, invoice direvisi dan versi sebelumnya masuk ke riwayat." : undefined}
      onClose={() => { if (!pending) onClose(); }} size="lg">
      <form onSubmit={handleSubmit}>
        <fieldset className="admin-form" disabled={pending}>
          {!activeCustomers.length && <p>Tambahkan <Link href="/admin/pelanggan" className="admin-text-link">pelanggan</Link> terlebih dahulu.</p>}
          {!activeProducts.length && <p>Tambahkan <Link href="/admin/produk" className="admin-text-link">produk aktif</Link> dalam kategori aktif.</p>}
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Pelanggan</span>
              <select required value={customerId} onChange={(event) => setCustomerId(event.target.value)} disabled={lockedCustomer}>
                <option value="">Pilih pelanggan</option>
                {activeCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}
              </select>
              {lockedCustomer && <small className="admin-form-hint">Pelanggan terkunci setelah pembayaran tercatat.</small>}
            </label>
            <label className="admin-field">
              <span>Sumber pesanan</span>
              <select value={source} onChange={(event) => setSource(event.target.value as Order["source"])}>
                <option value="whatsapp">WhatsApp</option>
                <option value="langsung">Datang langsung</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Tenggat (opsional)</span>
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </label>
          </div>
          <div className="admin-form-section">
            <div className="admin-form-section-head"><h3>Item pesanan</h3><span>Total: {formatCurrency(total)}</span></div>
            <LineItemsEditor items={items} products={activeProducts} onChange={setItems} />
          </div>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Biaya tambahan (Rp)</span>
              <input type="number" min={0} max={1000000000000} step={1} value={additionalCost} onChange={(event) => setAdditionalCost(event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Diskon (Rp)</span>
              <input type="number" min={0} max={1000000000000} step={1} value={discount} onChange={(event) => setDiscount(event.target.value)} />
            </label>
          </div>
          <label className="admin-field">
            <span>Catatan pesanan</span>
            <textarea rows={3} maxLength={3000} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          {error && <p className="admin-field-error" role="alert">{error}</p>}
          {!!order?.paidAmount && <p className="admin-form-hint">Pembayaran tercatat {formatCurrency(order.paidAmount)}.</p>}
          <div className="admin-form-actions">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>Tutup</button>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={!activeCustomers.length || !activeProducts.length}>
              {pending ? "Menyimpan…" : "Simpan pesanan"}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
