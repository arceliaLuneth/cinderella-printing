import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { rupiah } from "./money";

export type InvoiceSnapshot = {
  version: 1;
  business: { business_name: string; address: string; phone: string; email: string };
  customer: { id: string; name: string; phone: string; email: string | null; address: string };
  order: { id: string; order_number: string; source: string; due_date: string | null; notes: string };
  items: {
    product_id: string; product_name: string; unit: string; quantity: string; unit_price: string; line_total: string;
    specifications: { size: string; material: string; finishing: string; notes: string };
  }[];
  subtotal: string; additional_cost: string; discount: string; total: string;
};

function safeText(value: string, supported: Set<number>) {
  return [...value.normalize("NFC")].map(char => {
    if (/\s/.test(char)) return " ";
    const code = char.codePointAt(0)!;
    return code >= 32 && supported.has(code) ? char : "?";
  }).join("");
}
function wrap(value: string, font: PDFFont, size: number, width: number, supported: Set<number>): string[] {
  const words = safeText(value, supported).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (font.widthOfTextAtSize((line ? line + " " : "") + word, size) <= width) {
      line = (line ? line + " " : "") + word;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    for (const char of word) {
      if (font.widthOfTextAtSize(line + char, size) > width) {
        lines.push(line); line = "";
      }
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export async function renderInvoice(
  number: string, issuedAt: Date, snapshot: InvoiceSnapshot,
  paymentStatus: string, cancelled = false, amountPaid = "0",
  revision?: { number: number; at: Date },
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const supported = new Set(font.getCharacterSet());
  const navy = rgb(0.08, 0.17, 0.27), muted = rgb(0.34, 0.39, 0.45), border = rgb(0.84, 0.88, 0.91);
  let page = doc.addPage([595.28, 841.89]);
  let y = 794;
  const draw = (value: string, x: number, at: number, size = 10, color = navy) =>
    page.drawText(safeText(value, supported), { x, y: at, size, font, color });
  function ensure(height: number) {
    if (y - height >= 60) return;
    page = doc.addPage([595.28, 841.89]);
    draw("INVOICE  " + number + "  |  lanjutan", 44, 800, 10, muted);
    y = 772;
  }
  function paragraph(value: string, size = 10, color = navy, width = 507) {
    for (const line of wrap(value, font, size, width, supported)) {
      ensure(size + 7); draw(line, 44, y, size, color); y -= size + 6;
    }
  }
  function rule() {
    ensure(16);
    page.drawLine({ start: { x: 44, y }, end: { x: 551, y }, thickness: 0.7, color: border });
    y -= 17;
  }
  function right(value: string, end: number, at: number, size = 9) {
    const text = safeText(value, supported);
    draw(text, end - font.widthOfTextAtSize(text, size), at, size);
  }
  paragraph(snapshot.business.business_name, 19);
  paragraph("INVOICE  " + number + (revision ? "  |  REVISI " + revision.number : ""), 12);
  const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });
  const date = dateFormat.format(issuedAt);
  paragraph("Tanggal terbit: " + date + "  |  Pesanan: " + snapshot.order.order_number, 9, muted);
  if (revision) paragraph("Tanggal revisi: " + dateFormat.format(revision.at), 9, muted);
  if (snapshot.business.address) paragraph(snapshot.business.address, 9, muted);
  if (snapshot.business.phone || snapshot.business.email) {
    paragraph([snapshot.business.phone, snapshot.business.email].filter(Boolean).join("  |  "), 9, muted);
  }
  y -= 8; rule();
  paragraph("Ditagihkan kepada", 10, muted);
  paragraph(snapshot.customer.name, 12);
  paragraph([snapshot.customer.phone, snapshot.customer.email].filter(Boolean).join("  |  "), 9);
  if (snapshot.customer.address) paragraph(snapshot.customer.address, 9);
  if (snapshot.order.due_date) paragraph("Target selesai: " + snapshot.order.due_date, 9);
  y -= 6;
  paragraph("Status pembayaran: " + (paymentStatus === "lunas" ? "LUNAS" : paymentStatus === "dp" ? "DP DITERIMA" : "BELUM BAYAR"), 11);
  if (paymentStatus === "dp" || paymentStatus === "lunas") {
    paragraph("Telah dibayar: " + rupiah(amountPaid) + "  |  Sisa tagihan: " + rupiah((BigInt(snapshot.total) - BigInt(amountPaid)).toString()), 9, muted);
  }
  if (cancelled) paragraph("DIBATALKAN - Dokumen disimpan sebagai riwayat transaksi.", 10, rgb(0.7, 0.13, 0.12));
  y -= 6; rule();
  ensure(40);
  draw("PRODUK DAN SPESIFIKASI", 44, y, 9, muted);
  right("JUMLAH", 355, y, 8);
  right("HARGA", 438, y, 8);
  right("SUBTOTAL", 551, y, 8);
  y -= 22;
  for (let index = 0; index < snapshot.items.length; index++) {
    const item = snapshot.items[index];
    const specs = item.specifications;
    const description = [
      (index + 1) + ". " + item.product_name,
      "Ukuran: " + specs.size + " | Bahan: " + specs.material,
      ...(specs.finishing ? ["Finishing: " + specs.finishing] : []),
      ...(specs.notes ? ["Catatan: " + specs.notes] : []),
    ].flatMap((s, i) => wrap(s, font, i === 0 ? 10 : 9, 244, supported).map(line => ({ line, size: i === 0 ? 10 : 9 })));
    const unitLines = wrap(item.unit, font, 8, 66, supported);
    while (description.length < unitLines.length + 1) description.push({ line: "", size: 9 });
    ensure(Math.max(42, (unitLines.length + 1) * 13));
    const qty = item.quantity.includes(".") ? item.quantity.replace(/0+$/, "").replace(/\.$/, "") : item.quantity;
    // Nilai numerik dipisah dari deskripsi sehingga spesifikasi panjang dapat berlanjut ke halaman berikutnya.
    right(qty, 355, y, 8);
    unitLines.forEach((line, i) => right(line, 355, y - (i + 1) * 12, 8));
    right(rupiah(item.unit_price), 438, y, 8);
    right(rupiah(item.line_total), 551, y, 8);
    for (const { line, size } of description) {
      ensure(17); draw(line, 44, y, size); y -= 15;
    }
    y -= 4; rule();
  }
  ensure(120);
  for (const [label, amount] of [
    ["Subtotal", snapshot.subtotal], ["Biaya tambahan", snapshot.additional_cost],
    ["Diskon", snapshot.discount], ["TOTAL", snapshot.total],
  ]) {
    draw(label, 325, y, label === "TOTAL" ? 12 : 10);
    right(rupiah(amount), 551, y, label === "TOTAL" ? 12 : 10);
    y -= 23;
  }
  if (snapshot.order.notes) {
    y -= 4; paragraph("Catatan pesanan", 10, muted); paragraph(snapshot.order.notes, 9);
  }
  const pages = doc.getPages();
  for (let i = 0; i < pages.length; i++) {
    pages[i].drawText(number + "  |  " + (i + 1) + " / " + pages.length, {
      x: 44, y: 30, size: 8, font, color: muted,
    });
  }
  doc.setTitle("Invoice " + number);
  doc.setAuthor(snapshot.business.business_name);
  doc.setCreationDate(issuedAt);
  return Buffer.from(await doc.save());
}
