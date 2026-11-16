"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import type { Order, OrderStatus } from "@/types/admin";
import {
  addDaysISO,
  formatCurrency,
  orderStatusOptions,
  todayISO,
} from "@/lib/admin/format";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { Modal } from "@/components/admin/ui";
import {
  draftItemTotal,
  itemsToDraft,
  LineItemsEditor,
  type DraftItem,
} from "@/components/admin/line-items-editor";

export function OrderFormModal({
  order,
  onClose,
  onSaved,
}: {
  order?: Order;
  onClose: () => void;
  onSaved?: (order: Order) => void;
}) {
  const { customers, products, addOrder, updateOrder } = useAdminData();
  const { notify } = useToast();
  const id = useId();
  const [customerId, setCustomerId] = useState(order?.customerId ?? customers[0]?.id ?? "");
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "baru");
  const [orderDate, setOrderDate] = useState(order?.orderDate ?? todayISO());
  const [dueDate, setDueDate] = useState(order?.dueDate ?? addDaysISO(todayISO(), 14));
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [items, setItems] = useState<DraftItem[]>(() =>
    order ? itemsToDraft(order.items, products) : itemsToDraft([], products)
  );
  const [error, setError] = useState("");

  const total = useMemo(
    () => items.reduce((sum, item) => sum + draftItemTotal(item), 0),
    [items]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) {
      setError("Pilih pelanggan terlebih dahulu.");
      return;
    }
    if (!orderDate || !dueDate) {
      setError("Tanggal pesanan dan tenggat wajib diisi.");
      return;
    }
    const cleanItems = items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name ?? item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      };
    });
    if (
      cleanItems.some(
        (item) =>
          !item.productId ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.unitPrice) ||
          item.unitPrice < 0
      )
    ) {
      setError("Periksa item pesanan. Jumlah harus lebih dari 0 dan harga tidak boleh negatif.");
      return;
    }

    const input = { customerId, status, orderDate, dueDate, notes: notes.trim(), items: cleanItems };
    if (order) {
      updateOrder(order.id, input);
      notify(`Pesanan ${order.number} diperbarui.`);
      onSaved?.({ ...order, ...input, items: order.items });
    } else {
      const created = addOrder(input);
      notify(`Pesanan ${created.number} dan invoice terkait berhasil dibuat.`);
      onSaved?.(created);
    }
    onClose();
  }

  return (
    <Modal
      title={order ? `Edit pesanan ${order.number}` : "Buat pesanan baru"}
      description="Pilih pelanggan, susun item pesanan, lalu tentukan status awal."
      onClose={onClose}
      size="lg"
    >
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label className="admin-field" htmlFor={`${id}-customer`}>
            <span>Pelanggan</span>
            <select
              id={`${id}-customer`}
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
            >
              {customers.map((customer) => (
                <option value={customer.id} key={customer.id}>
                  {customer.company} — {customer.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field" htmlFor={`${id}-status`}>
            <span>Status pesanan</span>
            <select
              id={`${id}-status`}
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus)}
            >
              {orderStatusOptions.map(([value, meta]) => (
                <option value={value} key={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field" htmlFor={`${id}-date`}>
            <span>Tanggal pesanan</span>
            <input
              id={`${id}-date`}
              type="date"
              value={orderDate}
              onChange={(event) => {
                setOrderDate(event.target.value);
                if (!order) setDueDate(addDaysISO(event.target.value, 14));
              }}
            />
          </label>
          <label className="admin-field" htmlFor={`${id}-due`}>
            <span>Tenggat</span>
            <input
              id={`${id}-due`}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>

        <div className="admin-form-section">
          <div className="admin-form-section-head">
            <h3>Item pesanan</h3>
            <span>Total: {formatCurrency(total)}</span>
          </div>
          <LineItemsEditor items={items} products={products} onChange={setItems} />
        </div>

        <label className="admin-field" htmlFor={`${id}-notes`}>
          <span>Catatan</span>
          <textarea
            id={`${id}-notes`}
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Instruksi desain, pengiriman, atau catatan produksi."
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
            {order ? "Simpan perubahan" : "Buat pesanan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
