import { jsPDF } from "jspdf";
import type { Invoice } from "@/types/admin";
import { calculateInvoiceTotals, formatCurrencyPlain, formatDate, formatNumber } from "@/lib/admin/format";
import { COMPANY_PROFILE } from "@/lib/admin/company";

const BRAND: [number, number, number] = [0, 160, 224];
const INK: [number, number, number] = [48, 54, 59];
const MUTED: [number, number, number] = [104, 112, 120];
const LINE: [number, number, number] = [217, 222, 223];
const SOFT: [number, number, number] = [242, 247, 248];

function safe(value: string) {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[·•]/g, "-")
    .replace(/[—–]/g, "-")
    .replace(/\u00A0/g, " ");
}

async function loadLogo(): Promise<HTMLImageElement | null> {
  if (typeof window === "undefined") return null;
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/admin-logo.png";
  });
}

export async function downloadInvoicePdf(invoice: Invoice, orderNumber?: string) {
  const logoImg = await loadLogo();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const right = pageWidth - margin;
  const totals = calculateInvoiceTotals(invoice);
  let y = 0;

  function drawTopBar() {
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageWidth, 5, "F");
  }

  function drawFirstPageHeader() {
    drawTopBar();
    let cursor = 18;

    if (logoImg) {
      doc.addImage(logoImg, "PNG", margin, cursor, 11, 11);
    } else {
      doc.setFillColor(...BRAND);
      doc.roundedRect(margin, cursor, 11, 11, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("C", margin + 5.5, cursor + 7.3, { align: "center" });
    }

    doc.setTextColor(...INK);
    doc.setFontSize(15);
    doc.text(COMPANY_PROFILE.name, margin + 15, cursor + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(safe(COMPANY_PROFILE.tagline), margin + 15, cursor + 10);

    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const companyLines = [
      safe(COMPANY_PROFILE.address),
      `${safe(COMPANY_PROFILE.phone)}  |  ${safe(COMPANY_PROFILE.email)}`,
      safe(COMPANY_PROFILE.website),
    ];
    companyLines.forEach((line, index) => {
      doc.text(line, right, cursor + 2 + index * 4.6, { align: "right" });
    });

    cursor += 22;
    doc.setDrawColor(...LINE);
    doc.line(margin, cursor, right, cursor);
    cursor += 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...INK);
    doc.text("INVOICE", margin, cursor);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(safe(invoice.number), right, cursor - 5, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND);
    doc.text(invoice.status.toUpperCase().replace("-", " "), right, cursor, { align: "right" });

    cursor += 12;
    doc.setDrawColor(...LINE);
    doc.line(margin, cursor, right, cursor);
    cursor += 10;

    const columnWidth = (right - margin - 10) / 2;
    const detailsX = margin + columnWidth + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("DITAGIHKAN KEPADA", margin, cursor);
    doc.text("DETAIL INVOICE", detailsX, cursor);

    cursor += 6;
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(safe(invoice.customerCompany || invoice.customerName), margin, cursor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);

    const billLines = [
      invoice.customerCompany ? invoice.customerName : "",
      invoice.customerAddress,
      invoice.customerPhone,
    ].filter(Boolean);
    billLines.forEach((line, index) => {
      doc.text(safe(line), margin, cursor + 5 + index * 4.4);
    });

    const meta: [string, string][] = [
      ["Tanggal invoice", formatDate(invoice.issueDate)],
      ["Jatuh tempo", formatDate(invoice.dueDate)],
      ["Status", invoice.status.replace("-", " ")],
      ...(orderNumber ? ([["Pesanan", orderNumber]] as [string, string][]) : []),
    ];
    meta.forEach(([label, value], index) => {
      doc.setTextColor(...MUTED);
      doc.text(safe(label), detailsX, cursor + 5 + index * 5);
      doc.setTextColor(...INK);
      doc.text(safe(value), right, cursor + 5 + index * 5, { align: "right" });
    });

    cursor += 14 + Math.max(billLines.length, meta.length) * 5;
    return cursor;
  }

  function drawTableHeader(cursor: number) {
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, cursor, right - margin, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("DESKRIPSI", margin + 3, cursor + 5.8);
    doc.text("JUMLAH", 124, cursor + 5.8, { align: "right" });
    doc.text("HARGA SATUAN", 162, cursor + 5.8, { align: "right" });
    doc.text("SUBTOTAL", right - 3, cursor + 5.8, { align: "right" });
    return cursor + 9;
  }

  function drawFooter() {
    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(...LINE);
      doc.line(margin, pageHeight - 16, right, pageHeight - 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text(`Halaman ${page} dari ${totalPages}`, right, pageHeight - 11, { align: "right" });
    }
  }

  y = drawFirstPageHeader();
  y = drawTableHeader(y);

  doc.setFont("helvetica", "normal");
  invoice.items.forEach((item) => {
    const nameLines = doc.splitTextToSize(safe(item.name), 92);
    const rowHeight = Math.max(9, nameLines.length * 4.4 + 4.5);

    if (y + rowHeight > pageHeight - 70) {
      doc.setDrawColor(...LINE);
      doc.line(margin, y, right, y);
      doc.addPage();
      drawTopBar();
      y = 22;
      y = drawTableHeader(y);
    }

    doc.setFontSize(9);
    doc.setTextColor(...INK);
    nameLines.forEach((line: string, index: number) => {
      doc.text(line, margin + 3, y + 6 + index * 4.4);
    });

    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(formatNumber(item.quantity), 124, y + 6, { align: "right" });
    doc.text(formatCurrencyPlain(item.unitPrice), 162, y + 6, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrencyPlain(item.quantity * item.unitPrice), right - 3, y + 6, {
      align: "right",
    });

    y += rowHeight;
    doc.setDrawColor(...LINE);
    doc.line(margin, y, right, y);
  });

  const summaryWidth = 78;
  const summaryX = right - summaryWidth;
  if (y + 62 > pageHeight - 22) {
    doc.addPage();
    drawTopBar();
    y = 22;
  }

  y += 8;
  const noteLines = doc.splitTextToSize(
    safe(invoice.notes || COMPANY_PROFILE.paymentNote),
    92
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("CATATAN", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  noteLines.forEach((line: string, index: number) => {
    doc.text(line, margin, y + 5.5 + index * 4.2);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const rows: [string, string][] = [
    ["Subtotal", formatCurrencyPlain(totals.subtotal)],
    ["Diskon", `-${formatCurrencyPlain(totals.discount)}`],
  ];
  rows.forEach(([label, value], index) => {
    doc.text(label, summaryX, y + 5.5 + index * 5);
    doc.setTextColor(...INK);
    doc.text(value, right - 2, y + 5.5 + index * 5, { align: "right" });
    doc.setTextColor(...MUTED);
  });

  const totalY = y + 5.5 + rows.length * 5 + 1;
  doc.setFillColor(...SOFT);
  doc.rect(summaryX - 3, totalY - 4, summaryWidth + 5, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text("TOTAL", summaryX, totalY + 2.5);
  doc.text(formatCurrencyPlain(totals.total), right - 2, totalY + 2.5, { align: "right" });

  const footerY = Math.max(totalY + 24, y + 44);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("PEMBAYARAN", margin, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.splitTextToSize(safe(COMPANY_PROFILE.paymentNote), 90).forEach((line: string, index: number) => {
    doc.text(line, margin, footerY + 5.5 + index * 4.2);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Hormat kami,", right - 2, footerY, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text(safe(COMPANY_PROFILE.name), right - 2, footerY + 16, { align: "right" });

  drawFooter();

  const filename = `Invoice-${invoice.number.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;
  doc.save(filename);
}
