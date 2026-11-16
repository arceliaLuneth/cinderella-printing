"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types/admin";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import {
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  SearchField,
  StatusBadge,
} from "@/components/admin/ui";
import {
  calculateInvoiceTotals,
  formatCurrency,
  formatDate,
  invoiceStatusMeta,
  invoiceStatusOptions,
} from "@/lib/admin/format";

export default function AdminInvoicesPage() {
  const { invoices, deleteInvoice } = useAdminData();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | InvoiceStatus>("all");
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    return [...invoices]
      .filter((invoice) => {
        const matchesQuery = `${invoice.number} ${invoice.customerName} ${invoice.customerCompany} ${invoice.notes}`
          .toLocaleLowerCase("id-ID")
          .includes(normalized);
        const matchesStatus = status === "all" || invoice.status === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }, [invoices, query, status]);

  const paid = invoices
    .filter((invoice) => invoice.status === "lunas")
    .reduce((total, invoice) => total + calculateInvoiceTotals(invoice).total, 0);
  const outstanding = invoices
    .filter((invoice) => invoice.status === "terkirim" || invoice.status === "jatuh-tempo")
    .reduce((total, invoice) => total + calculateInvoiceTotals(invoice).total, 0);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteInvoice(deleteTarget.id);
    notify(`Invoice ${deleteTarget.number} dihapus.`, "info");
    setDeleteTarget(null);
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Transaksi"
        title="Invoice"
        description="Buat, kelola, cetak, dan unduh invoice dari data pesanan pelanggan."
        actions={
          <Link href="/admin/invoice/baru" className="admin-btn admin-btn--primary">
            <Plus size={16} aria-hidden="true" />
            Buat invoice
          </Link>
        }
      />

      <div className="admin-summary-strip">
        <div>
          <span>Total invoice</span>
          <strong>{invoices.length}</strong>
        </div>
        <div>
          <span>Nilai lunas</span>
          <strong>{formatCurrency(paid)}</strong>
        </div>
        <div>
          <span>Piutang</span>
          <strong>{formatCurrency(outstanding)}</strong>
        </div>
        <div>
          <span>Draft</span>
          <strong>{invoices.filter((invoice) => invoice.status === "draft").length}</strong>
        </div>
      </div>

      <section className="admin-card">
        <div className="admin-toolbar">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Cari nomor invoice atau pelanggan…"
            label="Cari invoice"
          />
          <div className="admin-toolbar-filters">
            <label className="admin-select">
              <span className="sr-only">Filter status invoice</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "all" | InvoiceStatus)}
              >
                <option value="all">Semua status</option>
                {invoiceStatusOptions.map(([value, meta]) => (
                  <option value={value} key={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="admin-result-meta" aria-live="polite">
          Menampilkan {filtered.length} dari {invoices.length} invoice
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
                  <th scope="col">Invoice</th>
                  <th scope="col">Pelanggan</th>
                  <th scope="col">Jatuh tempo</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="admin-table-actions-col">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => {
                  const meta = invoiceStatusMeta[invoice.status];
                  const totals = calculateInvoiceTotals(invoice);
                  return (
                    <tr key={invoice.id}>
                      <td>
                        <Link href={`/admin/invoice/${invoice.id}`} className="admin-table-title">
                          {invoice.number}
                        </Link>
                        <small>Terbit {formatDate(invoice.issueDate)}</small>
                      </td>
                      <td>
                        <strong>{invoice.customerCompany || invoice.customerName}</strong>
                        <small>{invoice.customerName}</small>
                      </td>
                      <td>{formatDate(invoice.dueDate)}</td>
                      <td>
                        <strong>{formatCurrency(totals.total)}</strong>
                      </td>
                      <td>
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </td>
                      <td className="admin-table-actions-col">
                        <div className="admin-row-actions">
                          <Link
                            href={`/admin/invoice/${invoice.id}`}
                            className="admin-icon-btn"
                            aria-label={`Lihat invoice ${invoice.number}`}
                          >
                            <Eye size={15} aria-hidden="true" />
                          </Link>
                          <Link
                            href={`/admin/invoice/${invoice.id}/edit`}
                            className="admin-icon-btn"
                            aria-label={`Edit invoice ${invoice.number}`}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            className="admin-icon-btn admin-icon-btn--danger"
                            onClick={() => setDeleteTarget(invoice)}
                            aria-label={`Hapus invoice ${invoice.number}`}
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
            title="Invoice tidak ditemukan"
            description="Ubah kata kunci atau filter status, atau buat invoice baru dari data pesanan."
            action={
              <Link href="/admin/invoice/baru" className="admin-btn admin-btn--primary">
                <Plus size={16} aria-hidden="true" />
                Buat invoice
              </Link>
            }
          />
        )}
      </section>

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus invoice?"
          message={`Invoice ${deleteTarget.number} akan dihapus permanen dari sesi ini.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
