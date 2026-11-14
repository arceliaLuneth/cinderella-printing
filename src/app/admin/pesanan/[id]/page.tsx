"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FilePlus2, Pencil, Trash2 } from "lucide-react";
import type { OrderStatus } from "@/types/admin";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { OrderFormModal } from "@/components/admin/order-form";
import {
  AdminPageHeader,
  ConfirmDialog,
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
  const router = useRouter();
  const { orders, invoices, updateOrderStatus, deleteOrder } = useAdminData();
  const { notify } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const order = orders.find((item) => item.id === params.id);
  const relatedInvoices = invoices.filter((invoice) => invoice.orderId === order?.id);

  if (!order) {
    return (
      <>
        <AdminPageHeader title="Pesanan tidak ditemukan" description="Data pesanan tidak tersedia pada sesi ini." />
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

  function handleStatusChange(status: OrderStatus) {
    if (!order) return;
    updateOrderStatus(order.id, status);
    notify(`Status ${order.number} diubah menjadi ${orderStatusMeta[status].label}.`, "info");
  }

  function handleDelete() {
    if (!order) return;
    const result = deleteOrder(order.id);
    if (!result.ok) {
      notify(result.message, "danger");
      setDeleteOpen(false);
      return;
    }
    notify(`Pesanan ${order.number} dihapus.`, "info");
    router.push("/admin/pesanan");
  }

  return (
    <>
      <Link href="/admin/pesanan" className="admin-back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Kembali ke pesanan
      </Link>

      <AdminPageHeader
        eyebrow={`Pesanan · ${formatDate(order.orderDate)}`}
        title={order.number}
        description={`${order.customerCompany || order.customerName} · ${order.items.length} item · ${formatCurrency(total)}`}
        actions={
          <div className="admin-page-actions">
            <Link href={`/admin/invoice/baru?order=${order.id}`} className="admin-btn admin-btn--primary">
              <FilePlus2 size={16} aria-hidden="true" />
              Buat invoice
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--outline"
              onClick={() => setEditOpen(true)}
            >
              <Pencil size={15} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--danger-text"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={15} aria-hidden="true" />
              Hapus
            </button>
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
              onChange={(event) => handleStatusChange(event.target.value as OrderStatus)}
            >
              {orderStatusOptions.map(([value, meta]) => (
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
            <Link href={`/admin/invoice/baru?order=${order.id}`} className="admin-text-link">
              Buat invoice baru
            </Link>
          </div>
          {relatedInvoices.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Invoice</th>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Jatuh tempo</th>
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
        <OrderFormModal order={order} onClose={() => setEditOpen(false)} />
      )}
      {deleteOpen && (
        <ConfirmDialog
          title="Hapus pesanan?"
          message={`Pesanan ${order.number} akan dihapus. Pesanan dengan invoice terkait tidak dapat dihapus.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}
