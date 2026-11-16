"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAdminData } from "@/components/admin/data-provider";
import { InvoiceForm } from "@/components/admin/invoice-form";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";

export default function AdminEditInvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { invoices } = useAdminData();
  const invoice = invoices.find((item) => item.id === params.id);

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

  return (
    <>
      <Link href={`/admin/invoice/${invoice.id}`} className="admin-back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Kembali ke invoice
      </Link>

      <AdminPageHeader
        eyebrow="Transaksi"
        title={`Edit ${invoice.number}`}
        description="Perbarui pelanggan, item, atau status invoice."
      />

      <InvoiceForm
        key={invoice.id}
        invoice={invoice}
        onSaved={() => router.push("/admin/invoice")}
        onCancel={() => router.push("/admin/invoice")}
      />
    </>
  );
}
