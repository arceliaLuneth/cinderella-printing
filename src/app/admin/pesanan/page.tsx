"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import type { Order, OrderStatus } from "@/types/admin";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { OrderFormModal } from "@/components/admin/order-form";
import {
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  SearchField,
  StatusBadge,
} from "@/components/admin/ui";
import {
  formatCurrency,
  formatDate,
  orderStatusMeta,
  orderStatusOptions,
  orderTotal,
} from "@/lib/admin/format";

type ModalState = { mode: "create" } | { mode: "edit"; order: Order } | null;

export default function AdminOrdersPage() {
  const { orders, deleteOrder } = useAdminData();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    return [...orders]
      .filter((order) => {
        const matchesQuery = `${order.number} ${order.customerName} ${order.customerCompany} ${order.notes}`
          .toLocaleLowerCase("id-ID")
          .includes(normalized);
        const matchesStatus = status === "all" || order.status === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }, [orders, query, status]);

  const activeCount = orders.filter(
    (order) => order.status !== "selesai" && order.status !== "dibatalkan"
  ).length;

  function handleDelete() {
    if (!deleteTarget) return;
    const result = deleteOrder(deleteTarget.id);
    if (!result.ok) {
      notify(result.message, "danger");
      setDeleteTarget(null);
      return;
    }
    notify(`Pesanan ${deleteTarget.number} dihapus.`, "info");
    setDeleteTarget(null);
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Transaksi"
        title="Pesanan"
        description="Catat pesanan pelanggan, pantau progres produksi, dan ubah status pesanan."
        actions={
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => setModal({ mode: "create" })}
          >
            <Plus size={16} aria-hidden="true" />
            Buat pesanan
          </button>
        }
      />

      <div className="admin-summary-strip">
        <div>
          <span>Total pesanan</span>
          <strong>{orders.length}</strong>
        </div>
        <div>
          <span>Pesanan aktif</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>Selesai</span>
          <strong>{orders.filter((order) => order.status === "selesai").length}</strong>
        </div>
        <div>
          <span>Dibatalkan</span>
          <strong>{orders.filter((order) => order.status === "dibatalkan").length}</strong>
        </div>
      </div>

      <section className="admin-card">
        <div className="admin-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Cari nomor pesanan atau pelanggan…"
            label="Cari pesanan"
          />
          <div className="admin-toolbar-filters">
            <label className="admin-select">
              <span className="sr-only">Filter status pesanan</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "all" | OrderStatus)}
              >
                <option value="all">Semua status</option>
                {orderStatusOptions.map(([value, meta]) => (
                  <option value={value} key={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="admin-result-meta" aria-live="polite">
          Menampilkan {filtered.length} dari {orders.length} pesanan
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
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Pesanan</th>
                  <th scope="col">Pelanggan</th>
                  <th scope="col">Item</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="admin-table-actions-col">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const meta = orderStatusMeta[order.status];
                  return (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/admin/pesanan/${order.id}`} className="admin-table-title">
                          {order.number}
                        </Link>
                        <small>
                          {formatDate(order.orderDate)} · tenggat {formatDate(order.dueDate)}
                        </small>
                      </td>
                      <td>
                        <strong>{order.customerCompany || order.customerName}</strong>
                        <small>{order.customerName}</small>
                      </td>
                      <td>
                        <strong>{order.items.length} item</strong>
                        <small>
                          {order.items
                            .slice(0, 2)
                            .map((item) => item.name)
                            .join(", ")}
                          {order.items.length > 2 ? ", …" : ""}
                        </small>
                      </td>
                      <td>
                        <strong>{formatCurrency(orderTotal(order))}</strong>
                      </td>
                      <td>
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </td>
                      <td className="admin-table-actions-col">
                        <div className="admin-row-actions">
                          <Link
                            href={`/admin/pesanan/${order.id}`}
                            className="admin-icon-btn"
                            aria-label={`Lihat pesanan ${order.number}`}
                          >
                            <Eye size={15} aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            onClick={() => setModal({ mode: "edit", order })}
                            aria-label={`Edit pesanan ${order.number}`}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--danger"
                            onClick={() => setDeleteTarget(order)}
                            aria-label={`Hapus pesanan ${order.number}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Pesanan tidak ditemukan"
            description="Ubah kata kunci atau filter status, atau buat pesanan baru."
            action={
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => setModal({ mode: "create" })}
              >
                <Plus size={16} aria-hidden="true" />
                Buat pesanan
              </button>
            }
          />
        )}
      </section>

      {modal && (
        <OrderFormModal
          order={modal.mode === "edit" ? modal.order : undefined}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Hapus pesanan?"
          message={`Pesanan ${deleteTarget.number} akan dihapus. Pesanan yang memiliki invoice terkait tidak dapat dihapus.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
