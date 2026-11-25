import { query } from "../lib/db";

type Range = { from?: string; to?: string };
function dateRange(range: Range, column: string) {
  const values: unknown[] = [], parts: string[] = [];
  if (range.from) { values.push(range.from); parts.push(column + ">=$" + values.length + "::date::timestamp AT TIME ZONE 'Asia/Jakarta'"); }
  if (range.to) { values.push(range.to); parts.push(column + "<($" + values.length + "::date+1)::timestamp AT TIME ZONE 'Asia/Jakarta'"); }
  return { where: parts.length ? " WHERE " + parts.join(" AND ") : "", values };
}
export async function dashboard(range: Range) {
  const ordersRange = dateRange(range, "created_at"), invoicesRange = dateRange(range, "issued_at");
  const [orders, finances, products, customers, recent] = await Promise.all([
    query("SELECT status,count(*)::integer AS count FROM printing.orders" + ordersRange.where + " GROUP BY status", ordersRange.values),
    query(`SELECT count(*)::integer AS invoice_count,
      coalesce(sum(total) FILTER (WHERE NOT is_cancelled),0)::text AS confirmed_total,
      coalesce(sum(amount_paid) FILTER (WHERE NOT is_cancelled),0)::text AS paid_total,
      coalesce(sum(total-amount_paid) FILTER (WHERE NOT is_cancelled),0)::text AS unpaid_total,
      coalesce(sum(amount_paid) FILTER (WHERE is_cancelled),0)::text AS cancelled_paid_total
      FROM printing.invoices` + invoicesRange.where, invoicesRange.values),
    query<{ count: number }>("SELECT count(*)::integer AS count FROM printing.products WHERE is_active"),
    query<{ count: number }>("SELECT count(*)::integer AS count FROM printing.customers WHERE is_active"),
    query("SELECT id,order_number,total,status,payment_status,created_at FROM printing.orders" +
      ordersRange.where + " ORDER BY created_at DESC,id LIMIT 5", ordersRange.values),
  ]);
  return {
    range: { from: range.from ?? null, to: range.to ?? null, timezone: "Asia/Jakarta" },
    orders_by_status: orders.rows, finance: finances.rows[0],
    active_products: products.rows[0].count, active_customers: customers.rows[0].count, recent_orders: recent.rows,
  };
}
export async function salesReport(range: Range) {
  const filter = dateRange(range, "issued_at");
  const { rows } = await query(`SELECT (issued_at AT TIME ZONE 'Asia/Jakarta')::date::text AS date,
    count(*)::integer AS invoice_count,
    coalesce(sum(total) FILTER (WHERE NOT is_cancelled),0)::text AS sales_total,
    coalesce(sum(amount_paid) FILTER (WHERE NOT is_cancelled),0)::text AS paid_total,
    coalesce(sum(total-amount_paid) FILTER (WHERE NOT is_cancelled),0)::text AS unpaid_total,
    count(*) FILTER (WHERE is_cancelled)::integer AS cancelled_count
    FROM printing.invoices` + filter.where +
    " GROUP BY (issued_at AT TIME ZONE 'Asia/Jakarta')::date ORDER BY date DESC", filter.values);
  return { range: { ...range, timezone: "Asia/Jakarta", basis: "invoice_issued_at" }, data: rows };
}
export function salesCsv(rows: Record<string, unknown>[]) {
  const columns = ["date","invoice_count","sales_total","paid_total","unpaid_total","cancelled_count"];
  const cell = (value: unknown) => {
    let s = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return "\uFEFF" + [columns.join(","), ...rows.map(row => columns.map(c => cell(row[c])).join(","))].join("\r\n");
}
