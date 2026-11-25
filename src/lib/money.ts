import { ApiError } from "./errors";
import type { OrderInput } from "./schemas";

export function lineTotal(quantity: string, unitPrice: string): bigint {
  const [whole, fraction = ""] = quantity.split(".");
  const milli = BigInt(whole) * BigInt(1000) + BigInt(fraction.padEnd(3, "0"));
  // Round half up per baris; sama dengan round(numeric) PostgreSQL.
  return (milli * BigInt(unitPrice) + BigInt(500)) / BigInt(1000);
}
export function orderTotals(input: OrderInput) {
  const subtotal = input.items.reduce((sum, item) => sum + lineTotal(item.quantity, item.unit_price), BigInt(0));
  const total = subtotal + BigInt(input.additional_cost) - BigInt(input.discount);
  if (total < BigInt(0)) throw new ApiError(422, "INVALID_DISCOUNT", "Diskon melebihi subtotal dan biaya tambahan.");
  return { subtotal: subtotal.toString(), total: total.toString() };
}
export function rupiah(value: string) {
  return "Rp" + BigInt(value).toLocaleString("id-ID");
}
