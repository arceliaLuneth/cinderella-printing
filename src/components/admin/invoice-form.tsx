"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import type { Invoice, InvoiceStatus, LineItem, Order } from "@/types/admin";
import {
  addDaysISO,
  calculateInvoiceTotals,
  formatCurrency,
  invoiceStatusOptions,
  todayISO,
} from "@/lib/admin/format";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import {
  draftItemTotal,
  itemsToDraft,
  LineItemsEditor,
  type DraftItem,
} from "@/components/admin/line-items-editor";

export function InvoiceForm({
  invoice,
  initialOrder,
  onSaved,
  onCancel,
}: {
  invoice?: Invoice;
  initialOrder?: Order;
  onSaved: (invoice: Invoice) => void;
  onCancel: () => void;
}) {
  const { customers, orders, products, addInvoice, updateInvoice } = useAdminData();
  const { notify } = useToast();
  const id = useId();
  const sourceOrder = invoice
    ? orders.find((order) => order.id === invoice.orderId)
    : initialOrder;
  const [orderId, setOrderId] = useState(sourceOrder?.id ?? "");
  const [customerId, setCustomerId] = useState(
    invoice?.customerId ?? sourceOrder?.customerId ?? customers[0]?.id ?? ""
  );
  const [issueDate, setIssueDate] = useState(invoice?.issueDate ?? todayISO());
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? addDaysISO(todayISO(), 14));
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "draft");
  const [taxPercent, setTaxPercent] = useState(String(invoice?.taxPercent ?? 11));
  const [discount, setDiscount] = useState(String(invoice?.discount ?? 0));
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [items, setItems] = useState<DraftItem[]>(() =>
    invoice
      ? itemsToDraft(invoice.items, products)
      : sourceOrder
        ? itemsToDraft(sourceOrder.items, products)
        : itemsToDraft([], products)
  );
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + draftItemTotal(item), 0),
    [items]
  );
  const numericTax = Number(taxPercent) || 0;
  const numericDiscount = Number(discount) || 0;
  const previewTotals = calculateInvoiceTotals({
    items: items.map((item) => ({
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
    })),
    taxPercent: numericTax,
    discount: numericDiscount,
  });

  function selectOrder(value: string) {
    setOrderId(value);
    const order = orders.find((item) => item.id === value);
    if (!order) return;
    setCustomerId(order.customerId);
    setItems(itemsToDraft(order.items, products));
    setNotes(order.notes);
    setIssueDate(todayISO());
    setDueDate(addDaysISO(todayISO(), 14));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) {
      setError("Pilih pelanggan untuk invoice ini.");
      return;
    }
    if (!issueDate || !dueDate) {
      setError("Tanggal invoice dan jatuh tempo wajib diisi.");
      return;
    }
    if (numericTax < 0) {
      setError("Persentase pajak tidak boleh negatif.");
      return;
    }
    if (numericDiscount < 0 || numericDiscount > subtotal) {
      setError("Diskon tidak boleh negatif atau melebihi subtotal.");
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
      setError("Periksa item invoice. Jumlah harus lebih dari 0 dan harga tidak boleh negatif.");
      return;
    }

    const input = {
      orderId,
      customerId,
      issueDate,
      dueDate,
      taxPercent: numericTax,
      discount: numericDiscount,
      notes: notes.trim(),
      status,
      items: cleanItems as Omit<LineItem, "id">[],
    };

    if (invoice) {
      updateInvoice(invoice.id, input);
      notify(`Invoice ${invoice.number} diperbarui.`);
      onSaved({
        ...invoice,
        ...input,
        items: cleanItems.map((item, index) => ({
          ...item,
          id: invoice.items[index]?.id ?? `item-${index}`,
        })),
      });
    } else {
      const created = addInvoice(input);
      notify(`Invoice ${created.number} berhasil dibuat.`);
      onSaved(created);
    }
  }

  return (
    <form className="admin-invoice-form" onSubmit={handleSubmit}>
      <div className="admin-invoice-form-main">
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Informasi invoice</h2>
              <p>
                {invoice
                  ? `Nomor ${invoice.number}`
                  : "Nomor invoice dibuat otomatis saat data disimpan."}
              </p>
            </div>
          </div>
          <div className="admin-form">
            <div className="admin-form-grid">
              <label className="admin-field" htmlFor={`${id}-order`}>
                <span>Buat dari pesanan</span>
                <select
                  id={`${id}-order`}
                  value={orderId}
                  onChange={(event) => selectOrder(event.target.value)}
                >
                  <option value="">Tanpa pesanan terkait</option>
                  {orders.map((order) => (
                    <option value={order.id} key={order.id}>
                      {order.number} — {order.customerCompany}
                    </option>
                  ))}
                </select>
              </label>
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
            </div>

            <div className="admin-form-grid admin-form-grid--three">
              <label className="admin-field" htmlFor={`${id}-issue`}>
                <span>Tanggal invoice</span>
                <input
                  id={`${id}-issue`}
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
                />
              </label>
              <label className="admin-field" htmlFor={`${id}-due`}>
                <span>Jatuh tempo</span>
                <input
                  id={`${id}-due`}
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </label>
              <label className="admin-field" htmlFor={`${id}-status`}>
                <span>Status invoice</span>
                <select
                  id={`${id}-status`}
                  value={status}
                  onChange={(event) => setStatus(event.target.value as InvoiceStatus)}
                >
                  {invoiceStatusOptions.map(([value, meta]) => (
                    <option value={value} key={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Item invoice</h2>
              <p>Harga satuan dapat disesuaikan dengan penawaran yang disetujui.</p>
            </div>
            <span className="admin-card-meta">{items.length} item</span>
          </div>
          <LineItemsEditor items={items} products={products} onChange={setItems} />
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Pajak dan catatan</h2>
              <p>Atur diskon, pajak, serta instruksi pembayaran pada invoice.</p>
            </div>
          </div>
          <div className="admin-form">
            <div className="admin-form-grid">
              <label className="admin-field" htmlFor={`${id}-tax`}>
                <span>Pajak (%)</span>
                <input
                  id={`${id}-tax`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={taxPercent}
                  onChange={(event) => setTaxPercent(event.target.value)}
                />
              </label>
              <label className="admin-field" htmlFor={`${id}-discount`}>
                <span>Diskon (Rp)</span>
                <input
                  id={`${id}-discount`}
                  type="number"
                  min="0"
                  step="1000"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                />
              </label>
            </div>
            <label className="admin-field" htmlFor={`${id}-notes`}>
              <span>Catatan invoice</span>
              <textarea
                id={`${id}-notes`}
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Contoh: pembayaran paling lambat 14 hari setelah invoice diterbitkan."
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="admin-invoice-form-aside">
        <div className="admin-card admin-summary-card">
          <h2>Ringkasan</h2>
          <dl className="admin-summary-list">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatCurrency(previewTotals.subtotal)}</dd>
            </div>
            <div>
              <dt>Diskon</dt>
              <dd>-{formatCurrency(previewTotals.discount)}</dd>
            </div>
            <div>
              <dt>Pajak ({numericTax}%)</dt>
              <dd>{formatCurrency(previewTotals.tax)}</dd>
            </div>
            <div className="admin-summary-total">
              <dt>Total</dt>
              <dd>{formatCurrency(previewTotals.total)}</dd>
            </div>
          </dl>
          {error && (
            <p className="admin-field-error" role="alert">
              {error}
            </p>
          )}
          <div className="admin-form-actions admin-form-actions--stack">
            <button type="submit" className="admin-btn admin-btn--primary admin-btn--full">
              {invoice ? "Simpan perubahan" : "Simpan invoice"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--full"
              onClick={onCancel}
            >
              Batal
            </button>
          </div>
          <p className="admin-form-hint">
            Pastikan data invoice sudah benar sebelum disimpan.
          </p>
        </div>
      </aside>
    </form>
  );
}
