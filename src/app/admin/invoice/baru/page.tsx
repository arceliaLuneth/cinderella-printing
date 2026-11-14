"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAdminData } from "@/components/admin/data-provider";
import { InvoiceForm } from "@/components/admin/invoice-form";
import { useClientReady } from "@/components/admin/use-client-ready";
import { AdminPageHeader, LoadingPanel } from "@/components/admin/ui";

export default function AdminNewInvoicePage() {
  const router = useRouter();
  const { orders } = useAdminData();
  const ready = useClientReady();
  const orderId = useSearchParams().get("order");

  if (!ready) return <LoadingPanel label="Menyiapkan formulir invoice…" />;

  const initialOrder = orderId ? orders.find((order) => order.id === orderId) : undefined;

  return (
    <>
      <Link href="/admin/invoice" className="admin-back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Kembali ke invoice
      </Link>

      <AdminPageHeader
        eyebrow="Transaksi"
        title="Buat invoice"
        description={
          initialOrder
            ? `Data pelanggan dan item diambil dari pesanan ${initialOrder.number}.`
            : "Isi data invoice secara manual atau pilih pesanan sebagai sumber data."
        }
      />

      <InvoiceForm
        initialOrder={initialOrder}
        onSaved={(invoice) => router.push(`/admin/invoice/${invoice.id}`)}
        onCancel={() => router.push("/admin/invoice")}
      />
    </>
  );
}
