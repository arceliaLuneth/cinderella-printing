"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProductCategory } from "@/types";
import { categories, portfolioItems, products } from "@/lib/site-data";

function PlaceholderImage({ label = "Gambar produk", className = "" }: { label?: string; className?: string }) {
  return <div className={`image-placeholder ${className}`} role="img" aria-label={label}><span>{label}</span></div>;
}

export function ProductGrid({ limit }: { limit?: number }) {
  const shown = limit ? products.slice(0, limit) : products;
  return <div className="product-grid">{shown.map((product) => <article className="product-card" key={product.id}><PlaceholderImage /><div className="card-body"><h3>{product.name}</h3><p>{product.description}</p><small>Kategori: {product.category}</small><small>MOQ: {product.moq}</small><Link href={`/produk/${product.slug}`} className="text-link">Lihat Detail →</Link></div></article>)}</div>;
}

export function CategoryGrid() {
  const copy: Record<ProductCategory, string> = {
    "Packaging Makanan": "Jelajahi kategori ini dan diskusikan ukuran, bahan, serta desain yang sesuai kebutuhan.",
    Pouch: "Jelajahi kategori ini dan diskusikan ukuran, bahan, serta desain yang sesuai kebutuhan.",
    Cup: "Jelajahi kategori ini dan diskusikan ukuran, bahan, serta desain yang sesuai kebutuhan.",
    "Custom Packaging": "Punya kebutuhan di luar kategori yang ada? Ceritakan bentuk kemasan yang Anda bayangkan.",
  };
  return <div className="category-grid">{categories.map((category) => <article className="category-card" key={category}><PlaceholderImage /><div className="card-body"><h3>{category}</h3><p>{copy[category]}</p><Link href={`/produk?kategori=${encodeURIComponent(category)}`} className="text-link">Jelajahi produk →</Link></div></article>)}</div>;
}

export function CatalogBrowser() {
  const [category, setCategory] = useState<string>("Semua Produk");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => products.filter((item) => (category === "Semua Produk" || item.category === category) && `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <div className="catalog-layout">
    <aside className="filter-panel"><h3>Kategori produk</h3>{["Semua Produk", ...categories].map((name) => <label className="filter-option" key={name}><input type="radio" checked={category === name} onChange={() => setCategory(name)} />{name}</label>)}<p className="muted small">Belum tahu kategori yang tepat?</p><Link href="/cari-produk" className="button button-outline button-full">Bantu Saya Memilih</Link></aside>
    <div><label className="field-label" htmlFor="product-search">Cari produk</label><input id="product-search" className="text-input" placeholder="Cari nama atau kebutuhan produk…" value={query} onChange={(e) => setQuery(e.target.value)} /><div className="result-meta"><span>{filtered.length} contoh kartu produk • {category}</span><span>Katalog untuk konsultasi</span></div>{filtered.length ? <div className="product-grid catalog-products">{filtered.map((product) => <article className="product-card" key={product.id}><PlaceholderImage /><div className="card-body"><h3>{product.name}</h3><p>{product.description}</p><small>Kategori: {product.category}</small><small>MOQ: {product.moq}</small><Link href={`/produk/${product.slug}`} className="text-link">Lihat Detail →</Link></div></article>)}</div> : <div className="empty-state">Produk tidak ditemukan. Coba kata kunci atau kategori lain.</div>}<p className="notice">Spesifikasi pada katalog perlu dikonfirmasi saat konsultasi. Tidak ada pembelian langsung; harga diberikan melalui penawaran sesuai kebutuhan.</p></div>
  </div>;
}

export function PortfolioBrowser() {
  const [category, setCategory] = useState("Semua");
  const filtered = category === "Semua" ? portfolioItems : portfolioItems.filter((item) => item.category === category);
  return <><div className="filter-chips">{["Semua", ...categories].map((item) => <button key={item} className={`chip ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="product-grid portfolio-grid">{filtered.map((item) => <article className="product-card" key={item.id}><PlaceholderImage label="Gambar proyek" /><div className="card-body"><h3>{item.title}</h3><small>{item.category}</small><p>{item.description}</p><Link href={`/konsultasi?referensi=${encodeURIComponent(item.title)}`} className="text-link">Jadikan referensi konsultasi →</Link></div></article>)}</div></>;
}

const blankDraft = { product: "", quantity: "", size: "", material: "", shape: "", budget: "", name: "", whatsapp: "", referenceFileName: "" };

export function ConsultationForm() {
  const [draft, setDraft] = useState(blankDraft);
  function update(field: keyof typeof blankDraft, value: string) { setDraft((current) => ({ ...current, [field]: value })); }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try { sessionStorage.setItem("cinderella-consultation", JSON.stringify(draft)); } catch { /* storage may be unavailable */ }
    window.location.href = "/konfirmasi";
  }
  return <form className="consultation-form" onSubmit={submit}>
    <div className="form-section"><h2>Kebutuhan produk</h2><p className="muted">Tidak perlu lengkap. Mulai dari hal yang Anda tahu.</p>
      <label className="field-label">Produk / kategori<select className="text-input" value={draft.product} onChange={(e) => update("product", e.target.value)}><option value="">Pilih produk atau Belum Tahu</option>{categories.map((item) => <option key={item}>{item}</option>)}<option>Belum Tahu</option></select></label>
      <div className="form-grid"><label className="field-label">Jumlah kebutuhan<input className="text-input" placeholder="Tulis jumlah atau Belum Tahu" value={draft.quantity} onChange={(e) => update("quantity", e.target.value)} /></label><label className="field-label">Ukuran<input className="text-input" placeholder="Tulis ukuran atau Belum Tahu" value={draft.size} onChange={(e) => update("size", e.target.value)} /></label><label className="field-label">Material<input className="text-input" placeholder="Pilih material atau Belum Tahu" value={draft.material} onChange={(e) => update("material", e.target.value)} /></label><label className="field-label">Bentuk / potongan<input className="text-input" placeholder="Tulis bentuk atau Belum Tahu" value={draft.shape} onChange={(e) => update("shape", e.target.value)} /></label></div>
      <p className="helper">Minimum pemesanan dikonfirmasi saat konsultasi. Boleh menyebut perkiraan ukuran.</p>
      <label className="field-label">Perkiraan anggaran<input className="text-input" placeholder="Tulis anggaran atau Belum Tahu" value={draft.budget} onChange={(e) => update("budget", e.target.value)} /></label><p className="helper">Opsional. Digunakan sebagai bahan diskusi, bukan harga produk.</p>
    </div>
    <div className="form-section"><h2>Desain atau referensi</h2><p className="muted">Opsional — lewati jika belum memiliki desain.</p><label className="upload-box">Tambahkan desain atau gambar referensi<input type="file" accept="image/*,.pdf" onChange={(e) => update("referenceFileName", e.target.files?.[0]?.name ?? "")} /><span className="button button-outline">Pilih File</span><small>{draft.referenceFileName || "Belum ada file dipilih"}</small></label></div>
    <div className="form-section"><h2>Bagaimana kami menghubungi Anda?</h2><p className="muted">Lengkapi kontak jika ingin melanjutkan lewat formulir, atau pilih WhatsApp di samping.</p><div className="form-grid"><label className="field-label">Nama<input className="text-input" placeholder="Nama Anda" value={draft.name} onChange={(e) => update("name", e.target.value)} /></label><label className="field-label">Nomor WhatsApp<input className="text-input" placeholder="Nomor WhatsApp aktif" value={draft.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} /></label></div><p className="helper">Kontak digunakan untuk membahas kebutuhan yang Anda sampaikan.</p></div>
    <button className="button button-dark" type="submit">Tinjau Ringkasan →</button><p className="helper">Anda dapat memeriksa ringkasan sebelum melanjutkan percakapan. Tidak ada pembayaran pada tahap ini.</p>
  </form>;
}

export function ConsultationSummary() {
  const [draft] = useState(() => {
    if (typeof window === "undefined") return blankDraft;
    try { return { ...blankDraft, ...JSON.parse(sessionStorage.getItem("cinderella-consultation") || "{}") }; } catch { return blankDraft; }
  });
  const fields: [string, string][] = [["Produk / kategori", draft.product], ["Jumlah kebutuhan", draft.quantity], ["Ukuran", draft.size], ["Material", draft.material], ["Bentuk / potongan", draft.shape], ["Perkiraan anggaran", draft.budget], ["Desain / referensi", draft.referenceFileName], ["Nama", draft.name], ["Nomor WhatsApp", draft.whatsapp]];
  return <div className="summary-layout"><section className="summary-card"><h2>Ringkasan kebutuhan</h2><p className="muted">Tinjau informasi yang ingin Anda diskusikan.</p>{fields.map(([label, value]) => <div className="summary-row" key={label}><span>{label}</span><strong>{value || "Belum Tahu"}</strong></div>)}<Link href="/konsultasi" className="button button-outline">← Ubah Informasi</Link></section><aside className="summary-aside"><h2>Lanjutkan percakapan</h2><p>Gunakan ringkasan ini sebagai bahan diskusi. Spesifikasi yang belum pasti dan penawaran harga dibahas saat konsultasi.</p><a className="button button-dark button-full" href="/faq-kontak">Lanjutkan ke WhatsApp ↗</a><p className="helper">Nomor WhatsApp perlu dikonfigurasi oleh pengelola website. Melanjutkan percakapan bukan persetujuan pesanan atau pembayaran.</p></aside></div>;
}

export function FaqList() {
  const faqs = [
    ["Bagaimana cara mulai memesan?", "Mulai dengan mencari produk atau menceritakan kebutuhan melalui WhatsApp. Spesifikasi dibahas dalam konsultasi sebelum penawaran harga."],
    ["Apakah harus tahu semua spesifikasi?", "Tidak. Anda dapat memilih Belum Tahu untuk jumlah, ukuran, material, bentuk, atau anggaran. Informasi yang belum pasti dapat dibahas saat konsultasi."],
    ["Berapa minimum pemesanannya?", "Minimum pemesanan sesuai produk dan perlu dikonfirmasi saat konsultasi."],
    ["Bagaimana mengetahui harga produk?", "Harga diberikan melalui penawaran berdasarkan spesifikasi dan kebutuhan yang didiskusikan."],
    ["Apakah bisa konsultasi tanpa desain final?", "Bisa. Gambar, sketsa, atau contoh dapat menjadi bahan diskusi. Desain final belum diperlukan untuk memulai konsultasi."],
    ["Berapa lama proses produksinya?", "Jadwal produksi dikonfirmasi setelah spesifikasi dan desain disepakati."],
    ["Apa pilihan material dan ukuran yang tersedia?", "Pilihan material dan ukuran perlu dikonfirmasi sesuai produk dan kebutuhan."],
    ["Bagaimana proses pengirimannya?", "Pengiriman dibahas sesuai kebutuhan pesanan setelah proses produksi dan kontrol kualitas."],
  ];
  return <div className="faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>;
}
