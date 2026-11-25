import Image from "next/image";
import type { Invoice } from "@/types/admin";
import {
  calculateInvoiceTotals,
  formatCurrency,
  formatDate,
  formatNumber,
  invoiceStatusMeta,
} from "@/lib/admin/format";
import { lineTotal } from "@/lib/admin/format";

export function InvoicePreview({
  invoice,
  orderNumber,
}: {
  invoice: Invoice;
  orderNumber?: string;
}) {
  const totals = calculateInvoiceTotals(invoice);
  const paidAmount = invoice.paidAmount;
  const remaining = Math.max(0, totals.total - paidAmount);
  const status = invoiceStatusMeta[invoice.status];

  return (
    <article className="invoice-paper" aria-label={`Invoice ${invoice.number}`}>
      <header className="invoice-head">
        <div className="invoice-brand">
          <Image
            src="/admin-logo.png"
            alt="Cinderella Printing"
            width={48}
            height={48}
            className="invoice-logo-img"
            priority
          />
          <div>
            <strong>{invoice.business.business_name}</strong>
          </div>
        </div>
        <div className="invoice-title">
          <h1>INVOICE</h1>
          <p>{invoice.number}</p>
          {invoice.revision > 1 && <p>Revisi {invoice.revision} · {formatDate(invoice.revisedAt ?? "")}</p>}
          <span className={`invoice-status invoice-status--${invoice.status}`}>{status.label}</span>
        </div>
      </header>

      <div className="invoice-company">
        <p>{invoice.business.address}</p>
        <p>
          {[invoice.business.phone, invoice.business.email].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="invoice-parties">
        <section>
          <h2>Ditagihkan kepada</h2>
          <strong>{invoice.customerCompany || invoice.customerName}</strong>
          {invoice.customerCompany && <p>{invoice.customerName}</p>}
          <p>{invoice.customerAddress}</p>
          <p>{invoice.customerPhone}</p>
        </section>
        <section>
          <h2>Detail invoice</h2>
          <dl className="invoice-meta">
            <div>
              <dt>Tanggal invoice</dt>
              <dd>{formatDate(invoice.issueDate)}</dd>
            </div>
            <div>
              <dt>Target selesai pesanan</dt>
              <dd>{formatDate(invoice.dueDate)}</dd>
            </div>
            {orderNumber && (
              <div>
                <dt>Pesanan</dt>
                <dd>{orderNumber}</dd>
              </div>
            )}
            <div>
              <dt>Status</dt>
              <dd>{status.label}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="invoice-table-scroll" role="region" aria-label="Rincian produk invoice" tabIndex={0}>
      <table className="invoice-table">
        <thead>
          <tr>
            <th scope="col">Deskripsi</th>
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
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                <div>Ukuran {item.specifications.size}</div>
                <div>Bahan {item.specifications.material}</div>
                {item.specifications.finishing && <div>Finishing {item.specifications.finishing}</div>}
                {item.specifications.notes && <div>Catatan {item.specifications.notes}</div>}
              </td>
              <td className="num">{formatNumber(item.quantity)} {item.unit}</td>
              <td className="num">{formatCurrency(item.unitPrice)}</td>
              <td className="num">{formatCurrency(lineTotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="invoice-bottom">
        <section className="invoice-notes">
          <h2>Catatan</h2>
          <p>{invoice.notes || "—"}</p>
        </section>
        <dl className="invoice-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatCurrency(totals.subtotal)}</dd>
          </div>
          <div>
            <dt>Diskon</dt>
            <dd>-{formatCurrency(totals.discount)}</dd>
          </div>
          {totals.additionalCost > 0 && <div><dt>Biaya tambahan</dt><dd>{formatCurrency(totals.additionalCost)}</dd></div>}
          <div className="invoice-grand-total">
            <dt>Total</dt>
            <dd>{formatCurrency(totals.total)}</dd>
          </div>
          <div>
            <dt>Pembayaran diterima</dt>
            <dd>{formatCurrency(paidAmount)}</dd>
          </div>
          <div className="invoice-grand-total">
            <dt>Sisa tagihan</dt>
            <dd>{formatCurrency(remaining)}</dd>
          </div>
        </dl>
      </div>

      {invoice.payments.length > 0 && (
        <section className="invoice-payment-history">
          <h2>Riwayat pembayaran</h2>
          <ul>
            {invoice.payments.map((payment) => (
              <li key={payment.id}>
                <span>{formatDate(payment.paidAt)} · {payment.method === "transfer" ? "Transfer" : "Tunai"}</span>
                <strong>{formatCurrency(payment.amount)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="invoice-foot">
        <div>
          <h2>Pembayaran</h2>
          <p>Hubungi admin untuk konfirmasi pembayaran.</p>
        </div>
        <div className="invoice-sign">
          <span>Hormat kami,</span>
          <strong>{invoice.business.business_name}</strong>
        </div>
      </footer>
    </article>
  );
}
