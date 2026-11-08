"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import type { ProductCategory } from "@/types";
import { categories, portfolioItems, products } from "@/lib/site-data";

function PlaceholderImage({
  label = "Foto produk akan ditambahkan",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`image-placeholder ${className}`} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}

export function ProductGrid({ limit }: { limit?: number }) {
  const shown = limit ? products.slice(0, limit) : products;
  return (
    <div className="product-grid">
      {shown.map((product) => (
        <article className="product-card" key={product.id}>
          <PlaceholderImage label={`Foto ${product.category.toLowerCase()}`} />
          <div className="card-body">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <small>Kategori: {product.category}</small>
            <small>MOQ: {product.moq}</small>
            <Link href={`/produk/${product.slug}`} className="text-link">Lihat Detail →</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CategoryGrid() {
  const copy: Record<ProductCategory, string> = {
    "Packaging Makanan": "Jelajahi referensi kemasan makanan dan diskusikan ukuran, material, serta kebutuhan desain yang sesuai dengan produk Anda.",
    Pouch: "Temukan referensi kemasan pouch. Detail material, ukuran, dan kebutuhan cetak dapat dibahas saat konsultasi.",
    Cup: "Lihat referensi cup dan diskusikan ukuran serta desain yang sesuai dengan kebutuhan bisnis Anda.",
    "Custom Packaging": "Memiliki kebutuhan di luar kategori yang tersedia? Ceritakan bentuk, fungsi, dan referensi kemasan yang Anda bayangkan.",
  };

  return (
    <div className="category-grid">
      {categories.map((category) => (
        <article className="category-card" key={category}>
          <PlaceholderImage label={`Referensi ${category.toLowerCase()}`} />
          <div className="card-body">
            <h3>{category}</h3>
            <p>{copy[category]}</p>
            <Link href={`/produk?kategori=${encodeURIComponent(category)}`} className="text-link">Jelajahi produk →</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CatalogBrowser() {
  const [category, setCategory] = useState("Semua Produk");
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => products.filter((item) =>
      (category === "Semua Produk" || item.category === category) &&
      `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())
    ),
    [category, query]
  );

  return (
    <div className="catalog-layout">
      <aside className="filter-panel">
        <h3>Kategori Produk</h3>
        {["Semua Produk", ...categories].map((name) => (
          <label className="filter-option" key={name}>
            <input type="radio" name="product-category" checked={category === name} onChange={() => setCategory(name)} />
            {name}
          </label>
        ))}
        <p className="muted small">Belum yakin kategori yang tepat?</p>
        <Link href="/cari-produk" className="button button-outline button-full">Bantu Saya Memilih</Link>
      </aside>
      <div>
        <label className="field-label" htmlFor="product-search">Cari Produk</label>
        <input
          id="product-search"
          className="text-input"
          placeholder="Cari nama produk atau kebutuhan Anda…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="result-meta">
          <span>{filtered.length} referensi produk · {category}</span>
          <span>Katalog konsultasi</span>
        </div>
        {filtered.length ? (
          <div className="product-grid catalog-products">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <PlaceholderImage label={`Referensi ${product.category.toLowerCase()}`} />
                <div className="card-body">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <small>Kategori: {product.category}</small>
                  <small>MOQ: {product.moq}</small>
                  <Link href={`/produk/${product.slug}`} className="text-link">Lihat Detail →</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">Produk tidak ditemukan. Coba kata kunci atau kategori lain.</div>
        )}
        <p className="notice">
          Katalog ini merupakan referensi awal. Spesifikasi dan penawaran harga
          dikonfirmasi melalui konsultasi; website tidak memproses checkout atau pembayaran.
        </p>
      </div>
    </div>
  );
}

export function PortfolioBrowser() {
  const [category, setCategory] = useState("Semua");
  const filtered = category === "Semua"
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === category);

  return (
    <>
      <div className="filter-chips" aria-label="Filter kategori referensi">
        {["Semua", ...categories].map((item) => (
          <button
            type="button"
            key={item}
            className={`chip ${category === item ? "active" : ""}`}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="product-grid portfolio-grid">
        {filtered.map((item) => (
          <article className="product-card" key={item.id}>
            <PlaceholderImage label={`Referensi ${item.category.toLowerCase()}`} />
            <div className="card-body">
              <h3>{item.title}</h3>
              <small>{item.category}</small>
              <p>{item.description}</p>
              <Link href={`/konsultasi?referensi=${encodeURIComponent(item.title)}`} className="text-link">Gunakan sebagai referensi →</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

const blankDraft = {
  product: "",
  quantity: "",
  size: "",
  material: "",
  shape: "",
  budget: "",
  name: "",
  whatsapp: "",
  referenceFileName: "",
};

type ConsultationDraft = typeof blankDraft;

export function ConsultationForm() {
  const [draft, setDraft] = useState<ConsultationDraft>(blankDraft);

  function update(field: keyof ConsultationDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      sessionStorage.setItem("cinderella-consultation", JSON.stringify(draft));
    } catch {
      // Continue to the summary even when browser storage is unavailable.
    }
    window.location.href = "/konfirmasi";
  }

  return (
    <form className="consultation-form" onSubmit={submit}>
      <div className="form-section">
        <h2>Kebutuhan Produk</h2>
        <p className="muted">Isi informasi yang sudah Anda ketahui. Detail yang belum pasti dapat dibahas nanti.</p>
        <label className="field-label">
          Produk / kategori
          <select className="text-input" value={draft.product} onChange={(event) => update("product", event.target.value)}>
            <option value="">Pilih produk atau Belum Tahu</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
            <option>Belum Tahu</option>
          </select>
        </label>
        <div className="form-grid">
          <label className="field-label">Jumlah kebutuhan<input className="text-input" placeholder="Perkiraan jumlah atau Belum Tahu" value={draft.quantity} onChange={(event) => update("quantity", event.target.value)} /></label>
          <label className="field-label">Ukuran<input className="text-input" placeholder="Ukuran atau Belum Tahu" value={draft.size} onChange={(event) => update("size", event.target.value)} /></label>
          <label className="field-label">Material<input className="text-input" placeholder="Material atau Belum Tahu" value={draft.material} onChange={(event) => update("material", event.target.value)} /></label>
          <label className="field-label">Bentuk / potongan<input className="text-input" placeholder="Bentuk atau Belum Tahu" value={draft.shape} onChange={(event) => update("shape", event.target.value)} /></label>
        </div>
        <p className="helper">Minimum pemesanan dan pilihan produksi dikonfirmasi saat konsultasi.</p>
        <label className="field-label">Perkiraan anggaran<input className="text-input" placeholder="Anggaran atau Belum Tahu" value={draft.budget} onChange={(event) => update("budget", event.target.value)} /></label>
        <p className="helper">Opsional. Informasi ini menjadi bahan diskusi, bukan harga penawaran.</p>
      </div>
      <div className="form-section">
        <h2>Desain atau Referensi</h2>
        <p className="muted">Opsional. Anda dapat melewati bagian ini jika belum memiliki desain.</p>
        <label className="upload-box">
          Tambahkan desain atau gambar referensi
          <input type="file" accept="image/*,.pdf" onChange={(event) => update("referenceFileName", event.target.files?.[0]?.name ?? "")} />
          <span className="button button-outline">Pilih File</span>
          <small>{draft.referenceFileName || "Belum ada file dipilih"}</small>
        </label>
      </div>
      <div className="form-section">
        <h2>Informasi Kontak</h2>
        <p className="muted">Isi kontak jika ingin mencantumkannya dalam ringkasan konsultasi.</p>
        <div className="form-grid">
          <label className="field-label">Nama<input className="text-input" placeholder="Nama Anda" value={draft.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label className="field-label">Nomor WhatsApp<input className="text-input" placeholder="Nomor WhatsApp aktif" value={draft.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} /></label>
        </div>
        <p className="helper">Formulir ini menyiapkan ringkasan di browser; belum mengirim data ke server atau membuat pesanan.</p>
      </div>
      <button className="button button-dark" type="submit">Tinjau Ringkasan →</button>
      <p className="helper">Anda dapat memeriksa ringkasan sebelum melanjutkan percakapan. Tidak ada pembayaran pada tahap ini.</p>
    </form>
  );
}

export function ConsultationSummary() {
  const [draft, setDraft] = useState<ConsultationDraft>(blankDraft);

  // Read sessionStorage after hydration so the server and first client render match.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("cinderella-consultation");
      if (stored) setDraft({ ...blankDraft, ...JSON.parse(stored) });
    } catch {
      setDraft(blankDraft);
    }
  }, []);

  const fields: [string, string][] = [
    ["Produk / kategori", draft.product],
    ["Jumlah kebutuhan", draft.quantity],
    ["Ukuran", draft.size],
    ["Material", draft.material],
    ["Bentuk / potongan", draft.shape],
    ["Perkiraan anggaran", draft.budget],
    ["Desain / referensi", draft.referenceFileName],
    ["Nama", draft.name],
    ["Nomor WhatsApp", draft.whatsapp],
  ];

  return (
    <div className="summary-layout">
      <section className="summary-card">
        <h2>Ringkasan Kebutuhan</h2>
        <p className="muted">Periksa kembali informasi yang ingin Anda diskusikan.</p>
        {fields.map(([label, value]) => (
          <div className="summary-row" key={label}>
            <span>{label}</span>
            <strong>{value || "Belum Tahu"}</strong>
          </div>
        ))}
        <Link href="/konsultasi" className="button button-outline">← Ubah Informasi</Link>
      </section>
      <aside className="summary-aside">
        <h2>Lanjutkan Konsultasi</h2>
        <p>Gunakan ringkasan ini sebagai bahan diskusi. Spesifikasi dan penawaran harga dibahas bersama pihak Cinderella Printing.</p>
        <Link className="button button-dark button-full" href="/faq-kontak">Lanjutkan ke Kontak ↗</Link>
        <p className="helper">Ringkasan ini belum dikirim sebagai pesanan dan tidak merupakan persetujuan pembayaran.</p>
      </aside>
    </div>
  );
}

export function FaqList() {
  const faqs: [string, string][] = [
    ["Bagaimana cara mulai memesan?", "Mulai dengan memilih kategori produk atau menjelaskan kebutuhan Anda melalui konsultasi. Setelah kebutuhan dibahas, Cinderella Printing dapat menyusun penawaran sesuai spesifikasi yang disepakati."],
    ["Apakah harus tahu semua spesifikasi?", "Tidak. Anda dapat memulai dari jenis produk atau fungsi kemasan yang dibutuhkan. Jumlah, ukuran, material, dan detail lain dapat dibahas saat konsultasi."],
    ["Berapa minimum pemesanannya?", "Minimum pemesanan bergantung pada produk dan spesifikasi. Informasi MOQ perlu dikonfirmasi saat konsultasi."],
    ["Bagaimana mengetahui harga produk?", "Harga tidak ditetapkan hanya dari contoh katalog. Penawaran dibahas berdasarkan jenis produk, jumlah, ukuran, material, dan kebutuhan kustomisasi."],
    ["Apakah bisa konsultasi tanpa desain final?", "Anda dapat memulai konsultasi tanpa desain final. Gambar referensi, sketsa, atau penjelasan kebutuhan dapat digunakan sebagai bahan diskusi."],
    ["Berapa lama proses produksinya?", "Estimasi waktu produksi perlu dikonfirmasi setelah spesifikasi, jumlah, dan desain dibahas."],
    ["Apa pilihan material dan ukuran yang tersedia?", "Pilihan material dan ukuran bergantung pada kategori serta kebutuhan produk. Detail yang tersedia dikonfirmasi saat konsultasi."],
    ["Bagaimana proses pengirimannya?", "Metode dan jadwal pengiriman dibahas berdasarkan lokasi serta kebutuhan pesanan setelah detail produksi disepakati."],
  ];

  return (
    <div className="faq-list">
      {faqs.map(([question, answer]) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}
