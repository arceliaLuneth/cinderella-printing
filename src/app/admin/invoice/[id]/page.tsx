"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, History, MessageCircle, Pencil, Printer, Wallet } from "lucide-react";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { InvoicePreview } from "@/components/admin/invoice-preview";
import { InvoiceRevisions } from "@/components/admin/invoice-revisions";
import { OrderFormModal } from "@/components/admin/order-form";
import { TransactionArchive } from "@/components/admin/transaction-archive";
import {
  AdminPageHeader,
  EmptyState,
  Modal,
  StatusBadge,
} from "@/components/admin/ui";
import {
  calculateInvoiceTotals,
  formatCurrency,
  formatDate,
  invoiceStatusMeta,
} from "@/lib/admin/format";
import { downloadInvoiceFile } from "@/lib/admin/download";

export default function AdminInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const { invoices, orders, getInvoicePdf, recordInvoicePayment, updateInvoiceDelivery } = useAdminData();
  const { notify } = useToast();
  const [shareFile, setShareFile] = useState<File>();
  const [pending, setPending] = useState(false);
  const [editingOrder, setEditingOrder] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [paymentVersion, setPaymentVersion] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "transfer">("transfer");
  const [paymentReference, setPaymentReference] = useState("");

  const invoice = invoices.find((item) => item.id === params.id);
  const order = orders.find((item) => item.id === invoice?.orderId);

  if (!invoice) {
    return (
      <>
        <AdminPageHeader title="Invoice tidak ditemukan" />
        <div className="admin-card">
          <EmptyState
            title="Invoice tidak ditemukan"
            description="Periksa nomor invoice atau pilih invoice dari daftar."
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
  const paidAmount = invoice.paidAmount ?? (invoice.status === "lunas" ? totals.total : 0);
  const remaining = Math.max(0, totals.total - paidAmount);

  function handlePrint() {
    window.print();
  }

  async function handleDownload() {
    if (!invoice) return;
    try {
      downloadInvoiceFile(await getInvoicePdf(invoice.id), filename);
      notify("PDF invoice sedang diunduh.", "info");
    } catch {
      notify("PDF belum bisa diunduh. Coba lagi atau gunakan tombol cetak.", "danger");
    }
  }

  const filename = invoice.number + (invoice.revision > 1 ? `-rev-${invoice.revision}` : "") + ".pdf";
  const phone = invoice.customerPhone.replace(/\D/g, "").replace(/^0/, "62");
  const message = [
    `Halo ${invoice.customerName}, berikut invoice ${invoice.number}${invoice.revision > 1 ? ` revisi ${invoice.revision}` : ""} dari Cinderella Printing.`,
    `Total ${formatCurrency(totals.total)}`,
    `Pembayaran diterima ${formatCurrency(paidAmount)}`,
    `Sisa tagihan ${formatCurrency(remaining)}`,
    `Target selesai pesanan ${formatDate(invoice.dueDate)}`,
  ].join("\n");

  async function prepareShare() {
    if (!invoice || pending) return;
    setPending(true);
    try {
      setShareFile(new File([await getInvoicePdf(invoice.id)], filename, { type: "application/pdf" }));
    } catch (error) {
      notify(error instanceof Error ? error.message : "PDF belum bisa disiapkan.", "danger");
    } finally {
      setPending(false);
    }
  }

  async function sharePdf(file: File) {
    try {
      await navigator.share({ title: filename, files: [file] });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        notify("Gunakan Unduh PDF untuk membagikan file.", "info");
      }
    }
  }

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invoice || !order || pending) return;
    const amount = Number(paymentAmount);
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > remaining) {
      notify(`Masukkan nominal pembayaran antara Rp1 dan ${formatCurrency(remaining)}.`, "danger");
      return;
    }
    if (paymentMethod === "transfer" && !paymentReference.trim()) {
      notify("Referensi transfer wajib diisi.", "danger");
      return;
    }
    setPending(true);
    try {
      const updated = await recordInvoicePayment(invoice.orderId, paymentVersion, { amount, method: paymentMethod, reference: paymentReference.trim() });
      notify(`Pembayaran tercatat. Sisa tagihan ${formatCurrency(totals.total - updated.paidAmount)}.`, "success");
      setPaymentVersion("");
      setPaymentAmount("");
      setPaymentReference("");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Pembayaran belum tercatat.", "danger");
    } finally {
      setPending(false);
    }
  }

  async function changeDelivery(sent: boolean) {
    if (!invoice || pending) return;
    setPending(true);
    try {
      await updateInvoiceDelivery(invoice.id, sent);
      notify(sent ? "Invoice ditandai terkirim." : "Invoice ditandai belum dikirim.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Status pengiriman belum tersimpan.", "danger");
    } finally {
      setPending(false);
    }
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
          {invoice.archivedAt && <StatusBadge label="Arsip" tone="neutral" />}
          {order && order.status !== "dibatalkan" && invoice.status !== "dibatalkan" && (
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => setEditingOrder(true)} disabled={pending}>
              <Pencil size={15} aria-hidden="true" /> Edit pesanan
            </button>
          )}
          {invoice.revision > 1 && (
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => setHistoryOpen(true)} disabled={pending}>
              <History size={15} aria-hidden="true" /> Riwayat revisi
            </button>
          )}
          {invoice.status !== "dibatalkan" && (
            <label className="admin-field admin-field--compact">
              <span>Status pengiriman</span>
              <select value={invoice.sentAt ? "sent" : "unsent"} disabled={pending}
                onChange={(event) => void changeDelivery(event.target.value === "sent")}>
                <option value="unsent">Belum dikirim</option>
                <option value="sent">Terkirim</option>
              </select>
            </label>
          )}
          <button type="button" className="admin-btn admin-btn--outline" onClick={handlePrint}>
            <Printer size={15} aria-hidden="true" />
            Cetak
          </button>
          <button type="button" className="admin-btn admin-btn--outline" onClick={prepareShare} disabled={pending}>
            <MessageCircle size={15} aria-hidden="true" />
            Bagikan invoice
          </button>
          {remaining > 0 && invoice.status !== "dibatalkan" && (
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => setPaymentVersion(order?.editVersion ?? "")} disabled={pending || !order}>
              <Wallet size={15} aria-hidden="true" />
              Catat pembayaran
            </button>
          )}
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleDownload}>
            <Download size={15} aria-hidden="true" />
            Unduh PDF
          </button>
          <TransactionArchive resource="invoices" id={invoice.id} number={invoice.number} archivedAt={invoice.archivedAt} />
        </div>
      </div>

      <AdminPageHeader
        eyebrow={invoice.revision > 1 ? `Invoice · Revisi ${invoice.revision}` : `Invoice · ${formatDate(invoice.issueDate)}`}
        title={invoice.number}
        description={`${invoice.customerCompany || invoice.customerName} · ${formatCurrency(
          totals.total
        )} · target selesai pesanan ${formatDate(invoice.dueDate)}`}
      />

      <div className="admin-invoice-preview-wrap">
        <InvoicePreview invoice={invoice} orderNumber={order?.number} />
      </div>
      {editingOrder && order && <OrderFormModal order={order} onClose={() => setEditingOrder(false)} />}
      {historyOpen && <InvoiceRevisions invoiceId={invoice.id} number={invoice.number} onClose={() => setHistoryOpen(false)} />}

      {paymentVersion && (
        <Modal title="Catat pembayaran / DP" description={`Sisa tagihan ${formatCurrency(remaining)}.`} onClose={() => { if (!pending) setPaymentVersion(""); }} size="sm">
          <form className="admin-form" onSubmit={handlePayment}>
            <label className="admin-field">
              <span>Nominal diterima (Rp)</span>
              <input type="number" min="1" max={remaining} step="1" required value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} autoFocus />
            </label>
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => setPaymentAmount(String(remaining))} disabled={pending}>
              Isi sisa tagihan
            </button>
            <label className="admin-field">
              <span>Metode</span>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "tunai" | "transfer")}>
                <option value="transfer">Transfer</option>
                <option value="tunai">Tunai</option>
              </select>
            </label>
            {paymentMethod === "transfer" && (
              <label className="admin-field">
                <span>Referensi transfer</span>
                <input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} required placeholder="Nomor bukti / berita transfer" />
              </label>
            )}
            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn--ghost" disabled={pending} onClick={() => setPaymentVersion("")}>Batal</button>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>{pending ? "Menyimpan…" : "Simpan pembayaran"}</button>
            </div>
          </form>
        </Modal>
      )}

      {shareFile && (
        <Modal title="Bagikan invoice" onClose={() => setShareFile(undefined)} size="sm">
          <div className="button-row">
            {navigator.canShare?.({ files: [shareFile] }) && (
              <button type="button" className="admin-btn admin-btn--primary" onClick={() => void sharePdf(shareFile)}>Bagikan PDF</button>
            )}
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => downloadInvoiceFile(shareFile, filename)}>Unduh PDF</button>
            {phone && <a className="admin-btn admin-btn--outline" href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
              target="_blank" rel="noopener noreferrer">Buka WhatsApp</a>}
          </div>
          <p className="admin-form-hint">Jika WhatsApp dibuka lewat tautan, lampirkan PDF sebelum mengirim.</p>
        </Modal>
      )}
    </div>
  );
}
