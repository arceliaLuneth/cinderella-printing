import type { Invoice } from "@/types/admin";
import {
  calculateInvoiceTotals,
  formatCurrency,
  formatDate,
  formatNumber,
  invoiceStatusMeta,
} from "@/lib/admin/format";
import { COMPANY_PROFILE } from "@/lib/admin/company";

export function InvoicePreview({
  invoice,
  orderNumber,
}: {
  invoice: Invoice;
  orderNumber?: string;
}) {
  const totals = calculateInvoiceTotals(invoice);
  const status = invoiceStatusMeta[invoice.status];

  return (
    <article className="invoice-paper" aria-label={`Invoice ${invoice.number}`}>
      <header className="invoice-head">
        <div className="invoice-brand">
          <span className="invoice-logo" aria-hidden="true">
            C
          </span>
          <div>
            <strong>{COMPANY_PROFILE.name}</strong>
            <small>{COMPANY_PROFILE.tagline}</small>
          </div>
        </div>
        <div className="invoice-title">
          <h1>INVOICE</h1>
          <p>{invoice.number}</p>
          <span className={`invoice-status invoice-status--${invoice.status}`}>{status.label}</span>
        </div>
      </header>

      <div className="invoice-company">
        <p>{COMPANY_PROFILE.address}</p>
        <p>
          {COMPANY_PROFILE.phone} · {COMPANY_PROFILE.email}
        </p>
        <p>{COMPANY_PROFILE.website}</p>
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
              <dt>Jatuh tempo</dt>
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
              <td>{item.name}</td>
              <td className="num">{formatNumber(item.quantity)}</td>
              <td className="num">{formatCurrency(item.unitPrice)}</td>
              <td className="num">{formatCurrency(item.quantity * item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-bottom">
        <section className="invoice-notes">
          <h2>Catatan</h2>
          <p>{invoice.notes || COMPANY_PROFILE.paymentNote}</p>
          <p className="invoice-demo-note">
            Dokumen contoh untuk simulasi frontend. Bukan invoice transaksi sebenarnya.
          </p>
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
          <div>
            <dt>Pajak ({invoice.taxPercent}%)</dt>
            <dd>{formatCurrency(totals.tax)}</dd>
          </div>
          <div className="invoice-grand-total">
            <dt>Total</dt>
            <dd>{formatCurrency(totals.total)}</dd>
          </div>
        </dl>
      </div>

      <footer className="invoice-foot">
        <div>
          <h2>Pembayaran</h2>
          <p>{COMPANY_PROFILE.paymentNote}</p>
        </div>
        <div className="invoice-sign">
          <span>Hormat kami,</span>
          <strong>{COMPANY_PROFILE.name}</strong>
        </div>
      </footer>
    </article>
  );
}
