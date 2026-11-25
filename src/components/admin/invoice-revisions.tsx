"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Modal, LoadingPanel } from "@/components/admin/ui";
import { adminRequest, adminResponse } from "@/lib/admin/client";
import { downloadInvoiceFile } from "@/lib/admin/download";
import { formatCurrency, formatDateTime } from "@/lib/admin/format";
import type { InvoiceRevision } from "@/types/admin";

export function InvoiceRevisions({ invoiceId, number, onClose }: {
  invoiceId: string;
  number: string;
  onClose: () => void;
}) {
  const [revisions, setRevisions] = useState<InvoiceRevision[]>();
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const path = `admin/invoices/${invoiceId}/revisions`;

  useEffect(() => {
    let active = true;
    adminRequest<{ data: InvoiceRevision[] }>(path).then(
      ({ data }) => { if (active) setRevisions(data); },
      (error: unknown) => { if (active) setError(error instanceof Error ? error.message : "Riwayat belum dapat dimuat."); },
    );
    return () => { active = false; };
  }, [path]);

  async function download(revision: InvoiceRevision) {
    if (downloading) return;
    setDownloading(true);
    setError("");
    try {
      const response = await adminResponse(`${path}/${revision.id}/pdf`);
      downloadInvoiceFile(await response.blob(), `${number}-rev-${revision.revision}.pdf`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Salinan PDF belum bisa diunduh.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Modal title="Riwayat revisi invoice" description={number} onClose={onClose}>
      {error && <p className="admin-field-error" role="alert">{error}</p>}
      {!revisions && !error && <LoadingPanel label="Memuat riwayat…" />}
      {revisions && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th scope="col">Versi</th><th scope="col">Digantikan</th><th scope="col">Total</th><th scope="col">Salinan</th></tr></thead>
            <tbody>{revisions.map((revision) => (
              <tr key={revision.id}>
                <td>Versi {revision.revision}</td>
                <td>{formatDateTime(revision.archived_at)}</td>
                <td>{formatCurrency(Number(revision.total))}</td>
                <td><button type="button" className="admin-icon-btn" disabled={downloading}
                  onClick={() => void download(revision)} aria-label={`Unduh PDF versi ${revision.revision}`}>
                  <Download size={16} aria-hidden="true" />
                </button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
