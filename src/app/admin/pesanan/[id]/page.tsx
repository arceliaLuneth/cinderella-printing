"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FilePlus2, Pencil, Trash2 } from "lucide-react";
import type { OrderStatus } from "@/types/admin";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { OrderFormModal } from "@/components/admin/order-form";
import { TransactionArchive } from "@/components/admin/transaction-archive";
import {
  AdminPageHeader,
  Modal,
  EmptyState,
  StatusBadge,
} from "@/components/admin/ui";
import {
  calculateInvoiceTotals,
  formatCurrency,
  formatDate,
  formatNumber,
  invoiceStatusMeta,
  orderStatusMeta,
  orderStatusOptions,
  orderTotal,
} from "@/lib/admin/format";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { orders, invoices, updateOrderStatus } = useAdminData();
  const { notify } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  const order = orders.find((item) => item.id === params.id);
  const relatedInvoices = invoices.filter((invoice) => invoice.orderId === order?.id);

  if (!order) {
    return (
      <>
        <AdminPageHeader title="Pesanan tidak ditemukan" description="Periksa tautan atau buka daftar pesanan." />
        <div className="admin-card">
          <EmptyState
            title="Pesanan tidak ditemukan"
            description="Pesanan mungkin sudah dihapus atau tautan tidak valid."
            action={
              <Link href="/admin/pesanan" className="admin-btn admin-btn--primary">
                Kembali ke daftar pesanan
              </Link>
            }
          />
        </div>
      </>
    );
  }

  const statusMeta = orderStatusMeta[order.status];
  const total = orderTotal(order);

  const canCancel = order.status !== "selesai" && order.status !== "dibatalkan";
  const options = new Set<OrderStatus>([order.status]);
  if (order.confirmed) {
    if (order.status === "baru") options.add("diproses");
    if (order.status === "diproses") { options.add("dikirim"); options.add("selesai"); }
    if (order.status === "dikirim") options.add("selesai");
  }

  async function handleStatusChange(status: OrderStatus, reason?: string) {
    if (!order || pending) return;
    setPending(true);
    try {
      await updateOrderStatus(order.id, status, reason);
      notify(`Status ${order.number} diubah menjadi ${orderStatusMeta[status].label}.`, "info");
      setCancelOpen(false);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Status belum berubah.", "danger");
    } finally {
      setPending(false);
    }
  }

  function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason.trim()) void handleStatusChange("dibatalkan", reason.trim());
  }

  return (
    <>
      <Link href="/admin/pesanan" className="admin-back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Kembali ke pesanan
      </Link>

      <AdminPageHeader
        eyebrow={`Pesanan · ${formatDate(order.orderDate)}${order.archivedAt ? " · Arsip" : ""}`}
        title={order.number}
        description={`${order.customerCompany || order.customerName} · ${order.items.length} item · ${formatCurrency(total)}`}
        actions={
          <div className="admin-page-actions">
            {(order.confirmed || (canCancel && !order.archivedAt)) && <Link href={`/admin/invoice/baru?order=${order.id}`} className="admin-btn admin-btn--primary">
              <FilePlus2 size={16} aria-hidden="true" />
              {order.confirmed ? "Lihat invoice" : "Buat invoice"}
            </Link>}
            <button
              type="button"
              className="admin-btn admin-btn--outline"
              onClick={() => setEditOpen(true)}
              disabled={order.status === "dibatalkan"}
            >
              <Pencil size={15} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--danger-text"
              onClick={() => setCancelOpen(true)}
              disabled={!canCancel || pending}
            >
              <Trash2 size={15} aria-hidden="true" />
              Batalkan pesanan
            </button>
            <TransactionArchive resource="orders" id={order.id} number={order.number} archivedAt={order.archivedAt} />
          </div>
        }
      />

      <div className="admin-detail-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Informasi pesanan</h2>
              <p>Status dan jadwal pengerjaan pesanan.</p>
            </div>
            <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
          </div>
          <dl className="admin-detail-list">
            <div>
              <dt>Tanggal pesanan</dt>
              <dd>{formatDate(order.orderDate)}</dd>
            </div>
            <div>
              <dt>Tenggat</dt>
              <dd>{formatDate(order.dueDate)}</dd>
            </div>
            <div>
              <dt>Jumlah item</dt>
              <dd>{order.items.length} produk</dd>
            </div>
            <div>
              <dt>Total pesanan</dt>
              <dd>
                <strong>{formatCurrency(total)}</strong>
              </dd>
            </div>
          </dl>
          <label className="admin-field">
            <span>Ubah status</span>
            <select
              value={order.status}
              disabled={options.size === 1 || pending}
              onChange={(event) => handleStatusChange(event.target.value as OrderStatus)}
            >
              {orderStatusOptions.filter(([value]) => options.has(value)).map(([value, meta]) => (
                <option value={value} key={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Pelanggan</h2>
              <p>Informasi kontak yang dipakai pada pesanan ini.</p>
            </div>
          </div>
          <dl className="admin-detail-list">
            <div>
              <dt>Nama</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>Usaha</dt>
              <dd>{order.customerCompany || "—"}</dd>
            </div>
            <div>
              <dt>Telepon</dt>
              <dd>{order.customerPhone || "—"}</dd>
            </div>
            <div>
              <dt>Alamat</dt>
              <dd>{order.customerAddress || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-card admin-card--wide">
          <div className="admin-card-head">
            <div>
              <h2>Item pesanan</h2>
              <p>Rincian produk, jumlah, dan harga yang disepakati.</p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Produk</th>
                  <th scope="col" className="num">
                    Jumlah
                  </th>
                  <th scope="col" className="num">
                    Harga satuan
                  </th>
                  <th scope="col" className="num">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="num">{formatNumber(item.quantity)}</td>
                    <td className="num">{formatCurrency(item.unitPrice)}</td>
                    <td className="num">{formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={3} scope="row">
                    Total
                  </th>
                  <td className="num">
                    <strong>{formatCurrency(total)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="admin-detail-notes">
            <h3>Catatan</h3>
            <p>{order.notes || "Tidak ada catatan tambahan."}</p>
          </div>
        </section>

        <section className="admin-card admin-card--wide">
          <div className="admin-card-head">
            <div>
              <h2>Invoice terkait</h2>
              <p>Invoice yang dibuat dari pesanan ini.</p>
            </div>

          </div>
          {relatedInvoices.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Invoice</th>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Target selesai pesanan</th>
                    <th scope="col">Total</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="admin-table-action">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {relatedInvoices.map((invoice) => {
                    const meta = invoiceStatusMeta[invoice.status];
                    const totals = calculateInvoiceTotals(invoice);
                    return (
                      <tr key={invoice.id}>
                        <td>
                          <Link
                            href={`/admin/invoice/${invoice.id}`}
                            className="admin-table-title"
                          >
                            {invoice.number}
                          </Link>
                        </td>
                        <td>{formatDate(invoice.issueDate)}</td>
                        <td>{formatDate(invoice.dueDate)}</td>
                        <td>{formatCurrency(totals.total)}</td>
                        <td>
                          <StatusBadge label={meta.label} tone={meta.tone} />
                        </td>
                        <td className="admin-table-action">
                          <Link
                            href={`/admin/invoice/${invoice.id}`}
                            className="admin-text-link"
                          >
                            Lihat
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-inline-empty">Belum ada invoice untuk pesanan ini.</p>
          )}
        </section>
      </div>

      {editOpen && (
        <OrderFormModal
          order={order}
          onClose={() => setEditOpen(false)}
        />
      )}
      {cancelOpen && (
        <Modal title="Batalkan pesanan" description="Pesanan dan invoice terkait akan tetap tercatat." onClose={() => { if (!pending) setCancelOpen(false); }} size="sm">
          <form className="admin-form" onSubmit={handleCancel}>
            <label className="admin-field">
              <span>Alasan pembatalan</span>
              <textarea required maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} disabled={pending} />
            </label>
            <button className="admin-btn admin-btn--danger" type="submit" disabled={pending || !reason.trim()}>Batalkan pesanan</button>
          </form>
        </Modal>
      )}
    </>
  );
}
