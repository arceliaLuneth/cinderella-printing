"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminData } from "@/components/admin/data-provider";
import { OrderFormModal } from "@/components/admin/order-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { formatCurrency, formatDate, formatNumber, lineTotal, orderTotal } from "@/lib/admin/format";

function CreateInvoice() {
  const router = useRouter();
  const params = useSearchParams();
  const { orders, invoices, createInvoice } = useAdminData();
  const eligible = orders.filter((order) => order.status === "baru" && !order.confirmed && !order.archivedAt);
  const [orderId, setOrderId] = useState(params.get("order") ?? "");
  const [editingOrder, setEditingOrder] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const existing = invoices.find((invoice) => invoice.orderId === orderId);
  const selected = eligible.find((order) => order.id === orderId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || pending || editingOrder) return;
    setPending(true);
    setError("");
    try {
      const invoice = await createInvoice(selected.id);
      router.replace(`/admin/invoice/${invoice.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invoice belum terbit.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AdminPageHeader title="Terbitkan invoice" description="Pilih pesanan dan periksa rinciannya sebelum menerbitkan invoice." />
      {existing ? (
        <Link className="admin-btn admin-btn--primary" href={`/admin/invoice/${existing.id}`}>Buka invoice {existing.number}</Link>
      ) : eligible.length ? (
        <form className="admin-card admin-form" onSubmit={submit}>
          <label className="admin-field">
            <span>Pesanan</span>
            <select required value={selected?.id ?? ""} onChange={(event) => { setOrderId(event.target.value); setError(""); }} disabled={pending}>
              <option value="">Pilih pesanan</option>
              {eligible.map((order) => <option key={order.id} value={order.id}>{order.number} · {order.customerName}</option>)}
            </select>
          </label>
          {selected && (
            <section className="admin-form-section" aria-label="Ringkasan pesanan">
              <div className="admin-form-section-head">
                <h3>{selected.number} · {selected.customerName}</h3>
                <button type="button" className="admin-btn admin-btn--outline" disabled={pending}
                  onClick={() => { setError(""); setEditingOrder(true); }}>Edit pesanan</button>
              </div>
              <p>Tenggat {formatDate(selected.dueDate)}</p>
              <ul>
                {selected.items.map((item) => (
                  <li key={item.id}>{item.name} · {formatNumber(item.quantity)} × {formatCurrency(item.unitPrice)} = {formatCurrency(lineTotal(item))}</li>
                ))}
              </ul>
              <p><strong>Total {formatCurrency(orderTotal(selected))}</strong></p>
            </section>
          )}
          {error && <p className="admin-field-error" role="alert">{error}</p>}
          <div className="admin-form-actions">
            <button className="admin-btn admin-btn--primary" type="submit" disabled={pending || !selected || editingOrder}>{pending ? "Menerbitkan…" : "Konfirmasi dan terbitkan"}</button>
          </div>
        </form>
      ) : <Link href="/admin/pesanan" className="admin-btn admin-btn--primary">Buka daftar pesanan</Link>}
      {editingOrder && selected && <OrderFormModal order={selected} onClose={() => setEditingOrder(false)} />}
    </>
  );
}

export default function NewInvoicePage() {
  return <Suspense fallback={<p role="status">Memuat daftar pesanan…</p>}><CreateInvoice /></Suspense>;
}
