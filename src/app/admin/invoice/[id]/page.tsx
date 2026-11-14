"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Pencil, Printer, Trash2 } from "lucide-react";
import type { InvoiceStatus } from "@/types/admin";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { InvoicePreview } from "@/components/admin/invoice-preview";
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
  invoiceStatusMeta,
  invoiceStatusOptions,
} from "@/lib/admin/format";
import { downloadInvoicePdf } from "@/lib/admin/pdf";

export default function AdminInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { invoices, orders, updateInvoiceStatus, deleteInvoice } = useAdminData();
  const { notify } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const invoice = invoices.find((item) => item.id === params.id);
  const order = orders.find((item) => item.id === invoice?.orderId);

  if (!invoice) {
    return (
      <>
        <AdminPageHeader title="Invoice tidak ditemukan" />
        <div className="admin-card">
          <EmptyState
            title="Invoice tidak ditemukan"
            description="Invoice mungkin sudah dihapus atau tautan tidak valid."
            action={
              <Link href="/admin/invoice" className="admin-btn admin-btn--primary">
                Kembali ke daftar invoice
              </Link>
            }
          />
        </div>
      </>
    );
  }

  const meta = invoiceStatusMeta[invoice.status];
  const totals = calculateInvoiceTotals(invoice);

  function handleStatusChange(status: InvoiceStatus) {
    if (!invoice) return;
    updateInvoiceStatus(invoice.id, status);
    notify(`Status ${invoice.number} diubah menjadi ${invoiceStatusMeta[status].label}.`, "info");
  }

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    if (!invoice) return;
    try {
      downloadInvoicePdf(invoice, order?.number);
      notify("PDF invoice sedang diunduh.", "info");
    } catch {
      notify("PDF tidak dapat dibuat di browser ini. Gunakan tombol cetak.", "danger");
    }
  }

  function handleDelete() {
    if (!invoice) return;
    deleteInvoice(invoice.id);
    notify(`Invoice ${invoice.number} dihapus.`, "info");
    router.push("/admin/invoice");
  }

  return (
    <div className="admin-invoice-page">
      <div className="admin-invoice-toolbar">
        <Link href="/admin/invoice" className="admin-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          Kembali ke invoice
        </Link>
        <div className="admin-invoice-toolbar-actions">
          <StatusBadge label={meta.label} tone={meta.tone} />
          <label className="admin-select admin-select--compact">
            <span className="sr-only">Ubah status invoice</span>
            <select
              value={invoice.status}
              onChange={(event) => handleStatusChange(event.target.value as InvoiceStatus)}
            >
              {invoiceStatusOptions.map(([value, option]) => (
                <option value={value} key={value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="admin-btn admin-btn--outline" onClick={handlePrint}>
            <Printer size={15} aria-hidden="true" />
            Cetak
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleDownload}>
            <Download size={15} aria-hidden="true" />
            Unduh PDF
          </button>
          <Link href={`/admin/invoice/${invoice.id}/edit`} className="admin-btn admin-btn--ghost">
            <Pencil size={15} aria-hidden="true" />
            Edit
          </Link>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--danger-text"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={15} aria-hidden="true" />
            Hapus
          </button>
        </div>
      </div>

      <AdminPageHeader
        eyebrow={`Invoice · ${formatDate(invoice.issueDate)}`}
        title={invoice.number}
        description={`${invoice.customerCompany || invoice.customerName} · ${formatCurrency(
          totals.total
        )} · jatuh tempo ${formatDate(invoice.dueDate)}`}
      />

      <div className="admin-invoice-preview-wrap">
        <InvoicePreview invoice={invoice} orderNumber={order?.number} />
      </div>

      {deleteOpen && (
        <ConfirmDialog
          title="Hapus invoice?"
          message={`Invoice ${invoice.number} akan dihapus permanen dari sesi ini.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
        />
      )}
    </div>
  );
}
