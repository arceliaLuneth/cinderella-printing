"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import type { InvoiceStatus } from "@/types/admin";
import { useAdminData } from "@/components/admin/data-provider";
import {
  AdminPageHeader,
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
  const { invoices } = useAdminData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | InvoiceStatus>("all");
  const [view, setView] = useState<"main" | "archive">("main");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    return [...invoices]
      .filter((invoice) => {
        const matchesQuery = `${invoice.number} ${invoice.customerName} ${invoice.customerCompany} ${invoice.notes}`
          .toLocaleLowerCase("id-ID")
          .includes(normalized);
        const matchesStatus = status === "all" || invoice.status === status;
        return matchesQuery && matchesStatus && Boolean(invoice.archivedAt) === (view === "archive");
      })
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }, [invoices, query, status, view]);

  const active = invoices.filter((invoice) => invoice.status !== "dibatalkan");
  const paid = active.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const outstanding = active.reduce((sum, invoice) => sum + calculateInvoiceTotals(invoice).total - invoice.paidAmount, 0);
  const viewCount = invoices.filter((invoice) => Boolean(invoice.archivedAt) === (view === "archive")).length;

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
          <span>Pembayaran diterima</span>
          <strong>{formatCurrency(paid)}</strong>
        </div>
        <div>
          <span>Piutang</span>
          <strong>{formatCurrency(outstanding)}</strong>
        </div>
        <div>
          <span>DP diterima</span>
          <strong>{invoices.filter((invoice) => invoice.status === "dp").length}</strong>
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
              <span className="sr-only">Tampilan daftar invoice</span>
              <select value={view} onChange={(event) => setView(event.target.value === "archive" ? "archive" : "main")}>
                <option value="main">Daftar utama</option>
                <option value="archive">Arsip</option>
              </select>
            </label>
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
          Menampilkan {filtered.length} dari {viewCount} invoice
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
                  <th scope="col">Target selesai pesanan</th>
                  <th scope="col">Total</th>
                  <th scope="col">Pembayaran</th>
                  <th scope="col">Pengiriman</th>
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
                        {invoice.revision > 1 && <small>Revisi {invoice.revision}</small>}
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
                      <td>
                        {invoice.status === "dibatalkan" ? "—" : (
                          <StatusBadge label={invoice.sentAt ? "Terkirim" : "Belum dikirim"} tone={invoice.sentAt ? "success" : "neutral"} />
                        )}
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
            title={view === "archive" ? "Tidak ada invoice di arsip ini" : "Invoice tidak ditemukan"}
            description={view === "archive" ? "Invoice yang diarsipkan dapat dipulihkan dari halaman detailnya." : "Ubah kata kunci atau filter status, atau buat invoice baru dari data pesanan."}
            action={view === "main" && (
              <Link href="/admin/invoice/baru" className="admin-btn admin-btn--primary">
                <Plus size={16} aria-hidden="true" />
                Buat invoice
              </Link>
            )}
          />
        )}
      </section>

    </>
  );
}
