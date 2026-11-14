"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useAdminData } from "@/components/admin/data-provider";
import { AdminPageHeader, StatCard, StatusBadge } from "@/components/admin/ui";
import {
  calculateInvoiceTotals,
  formatCurrency,
  formatDate,
  invoiceStatusMeta,
  orderStatusMeta,
  orderTotal,
} from "@/lib/admin/format";

export default function AdminDashboardPage() {
  const { orders, invoices, products, categories } = useAdminData();

  const activeOrders = orders.filter(
    (order) => order.status !== "selesai" && order.status !== "dibatalkan"
  );
  const paidInvoices = invoices.filter((invoice) => invoice.status === "lunas");
  const revenue = paidInvoices.reduce(
    (total, invoice) => total + calculateInvoiceTotals(invoice).total,
    0
  );
  const receivable = invoices
    .filter((invoice) => invoice.status === "terkirim" || invoice.status === "jatuh-tempo")
    .reduce((total, invoice) => total + calculateInvoiceTotals(invoice).total, 0);
  const activeProducts = products.filter((product) => product.status === "aktif");

  const recentOrders = [...orders]
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    .slice(0, 5);

  const statusCounts = Object.keys(orderStatusMeta).map((status) => {
    const key = status as keyof typeof orderStatusMeta;
    return {
      key,
      label: orderStatusMeta[key].label,
      tone: orderStatusMeta[key].tone,
      count: orders.filter((order) => order.status === key).length,
    };
  });
  const maxStatusCount = Math.max(...statusCounts.map((entry) => entry.count), 1);

  const attentionInvoices = invoices
    .filter((invoice) => invoice.status === "terkirim" || invoice.status === "jatuh-tempo")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  orders
    .filter((order) => order.status !== "dibatalkan")
    .forEach((order) => {
      order.items.forEach((item) => {
        const current = productSales.get(item.productId) ?? {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        productSales.set(item.productId, {
          name: item.name,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.quantity * item.unitPrice,
        });
      });
    });
  const topProducts = [...productSales.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);
  const maxProductQuantity = Math.max(...topProducts.map((item) => item.quantity), 1);

  return (
    <>
      <AdminPageHeader
        eyebrow="Ringkasan operasional"
        title="Dashboard"
        description="Pantau pesanan aktif, pendapatan, dan invoice yang perlu ditindaklanjuti."
        actions={
          <Link href="/admin/pesanan" className="admin-btn admin-btn--primary">
            <ShoppingCart size={16} aria-hidden="true" />
            Kelola pesanan
          </Link>
        }
      />

      <div className="admin-stats">
        <StatCard
          label="Pesanan aktif"
          value={String(activeOrders.length)}
          hint={`${orders.length} total pesanan`}
          icon={<ShoppingCart size={20} />}
          tone="info"
        />
        <StatCard
          label="Pendapatan lunas"
          value={formatCurrency(revenue)}
          hint={`${paidInvoices.length} invoice lunas`}
          icon={<Wallet size={20} />}
          tone="success"
        />
        <StatCard
          label="Piutang berjalan"
          value={formatCurrency(receivable)}
          hint="Invoice terkirim dan jatuh tempo"
          icon={<TrendingUp size={20} />}
          tone="warning"
        />
        <StatCard
          label="Produk aktif"
          value={String(activeProducts.length)}
          hint={`${categories.length} kategori terdaftar`}
          icon={<Package size={20} />}
          tone="neutral"
        />
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Pesanan terbaru</h2>
              <p>Lima pesanan dengan tanggal terbaru.</p>
            </div>
            <Link href="/admin/pesanan" className="admin-text-link">
              Lihat semua <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Pesanan</th>
                  <th scope="col">Pelanggan</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="admin-table-action">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const meta = orderStatusMeta[order.status];
                  return (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/admin/pesanan/${order.id}`} className="admin-table-title">
                          {order.number}
                        </Link>
                        <small>{formatDate(order.orderDate)}</small>
                      </td>
                      <td>
                        <strong>{order.customerCompany || order.customerName}</strong>
                        <small>{order.customerName}</small>
                      </td>
                      <td>{formatCurrency(orderTotal(order))}</td>
                      <td>
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </td>
                      <td className="admin-table-action">
                        <Link
                          href={`/admin/pesanan/${order.id}`}
                          className="admin-icon-btn"
                          aria-label={`Lihat pesanan ${order.number}`}
                        >
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      Belum ada pesanan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Status pesanan</h2>
              <p>Distribusi seluruh pesanan saat ini.</p>
            </div>
          </div>
          <ul className="admin-status-list">
            {statusCounts.map((entry) => (
              <li key={entry.key}>
                <div className="admin-status-list-head">
                  <StatusBadge label={entry.label} tone={entry.tone} />
                  <span>{entry.count}</span>
                </div>
                <div className="admin-meter" aria-hidden="true">
                  <span style={{ width: `${(entry.count / maxStatusCount) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Invoice perlu perhatian</h2>
              <p>Invoice terkirim atau sudah melewati jatuh tempo.</p>
            </div>
            <Link href="/admin/invoice" className="admin-text-link">
              Lihat invoice <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <ul className="admin-activity-list">
            {attentionInvoices.map((invoice) => {
              const meta = invoiceStatusMeta[invoice.status];
              const totals = calculateInvoiceTotals(invoice);
              return (
                <li key={invoice.id}>
                  <span className="admin-activity-icon" aria-hidden="true">
                    {invoice.status === "jatuh-tempo" ? (
                      <AlertCircle size={17} />
                    ) : (
                      <FileText size={17} />
                    )}
                  </span>
                  <div className="admin-activity-body">
                    <Link href={`/admin/invoice/${invoice.id}`}>{invoice.number}</Link>
                    <span>
                      {invoice.customerCompany || invoice.customerName} · jatuh tempo{" "}
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>
                  <div className="admin-activity-meta">
                    <strong>{formatCurrency(totals.total)}</strong>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                </li>
              );
            })}
            {attentionInvoices.length === 0 && (
              <li className="admin-activity-empty">
                Tidak ada invoice yang menunggu pembayaran.
              </li>
            )}
          </ul>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <h2>Produk paling banyak dipesan</h2>
              <p>Berdasarkan jumlah unit pada pesanan yang tidak dibatalkan.</p>
            </div>
            <Link href="/admin/produk" className="admin-text-link">
              Kelola produk <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <ul className="admin-ranking">
            {topProducts.map((product, index) => (
              <li key={product.name}>
                <span className="admin-rank">{index + 1}</span>
                <div className="admin-rank-body">
                  <div className="admin-rank-head">
                    <strong>{product.name}</strong>
                    <span>{product.quantity.toLocaleString("id-ID")} pcs</span>
                  </div>
                  <div className="admin-meter" aria-hidden="true">
                    <span style={{ width: `${(product.quantity / maxProductQuantity) * 100}%` }} />
                  </div>
                  <small>{formatCurrency(product.revenue)}</small>
                </div>
              </li>
            ))}
            {topProducts.length === 0 && (
              <li className="admin-activity-empty">Belum ada item pesanan.</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
