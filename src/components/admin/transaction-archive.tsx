"use client";

import { useState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { useAdminData } from "@/components/admin/data-provider";
import { useToast } from "@/components/admin/toast";
import { ConfirmDialog } from "@/components/admin/ui";

export function TransactionArchive({ resource, id, number, archivedAt }: {
  resource: "orders" | "invoices";
  id: string;
  number: string;
  archivedAt: string | null;
}) {
  const { archiveOrder, archiveInvoice } = useAdminData();
  const { notify } = useToast();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const isArchived = Boolean(archivedAt);
  const label = resource === "orders" ? "Pesanan" : "Invoice";

  async function save(archived: boolean) {
    if (pending) return;
    setPending(true);
    try {
      if (resource === "orders") await archiveOrder(id, archived);
      else await archiveInvoice(id, archived);
      notify(`${label} ${number} ${archived ? "diarsipkan" : "dipulihkan"}.`);
      setConfirm(false);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Status arsip belum tersimpan.", "danger");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn--outline" disabled={pending}
        onClick={() => { if (isArchived) void save(false); else setConfirm(true); }}>
        {isArchived ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}
        {isArchived ? "Pulihkan dari arsip" : "Arsipkan"}
      </button>
      {confirm && (
        <ConfirmDialog title={`Arsipkan ${label.toLowerCase()}?`}
          message={`${label} ${number} dipindahkan ke daftar Arsip. Riwayat dan pembayaran tetap tercatat. Data bisa dipulihkan dari detailnya.`}
          confirmLabel="Arsipkan"
          pending={pending}
          onConfirm={() => void save(true)}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  );
}
