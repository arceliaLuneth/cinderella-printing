"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import type { ConsultationDraft, ProductCategory } from "@/types";
import {
  categories,
  categoryDescriptions,
  portfolioItems,
  products,
  WHATSAPP_NUMBER,
} from "@/lib/site-data";

const STORAGE_KEY = "cinderella-consultation-v2";
const LEGACY_STORAGE_KEY = "cinderella-consultation";

const emptyDraft: ConsultationDraft = {
  product: "",
  quantity: "",
  size: "",
  material: "",
  shape: "",
  budget: "",
  name: "",
  whatsapp: "",
  referenceFileName: "",
  notes: "",
};

function PlaceholderImage({
  label,
  className = "",
}: {
  label: string;
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
          <PlaceholderImage label={`Foto ${product.category} akan ditambahkan`} />
          <div className="card-body">
            <p className="card-kicker">{product.category}</p>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="product-meta">Jumlah minimum, bahan, ukuran, dan harga dibahas saat konsultasi.</p>
            <Link href={`/produk/${product.slug}`} className="text-link">Lihat detail kategori →</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CategoryGrid() {
  return (
    <div className="category-grid">
      {categories.map((category) => (
        <article className="category-card" key={category}>
          <PlaceholderImage label={`Foto contoh ${category} akan ditambahkan`} />
          <div className="card-body">
            <h3>{category}</h3>
            <p>{categoryDescriptions[category]}</p>
            <Link href={`/produk?kategori=${encodeURIComponent(category)}`} className="text-link">
              Lihat referensi {category.toLowerCase()} →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CatalogBrowser() {
  const [category, setCategory] = useState("Semua Produk");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("kategori");
    if (selected && categories.includes(selected as ProductCategory)) setCategory(selected);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    return products.filter((item) => {
      const categoryMatch = category === "Semua Produk" || item.category === category;
      const textMatch = `${item.name} ${item.category} ${item.description}`
        .toLocaleLowerCase("id-ID")
        .includes(normalized);
      return categoryMatch && textMatch;
    });
  }, [category, query]);

  return (
    <div className="catalog-layout">
      <aside className="filter-panel" aria-label="Filter katalog produk">
        <h2 className="filter-title">Kategori produk</h2>
        <fieldset className="filter-options">
          <legend className="sr-only">Pilih kategori produk</legend>
          {["Semua Produk", ...categories].map((name) => (
            <label className="filter-option" key={name}>
              <input
                type="radio"
                name="product-category"
                value={name}
                checked={category === name}
                onChange={() => setCategory(name)}
              />
              <span>{name}</span>
            </label>
          ))}
        </fieldset>
        <p className="muted small">Belum yakin kategori yang sesuai?</p>
        <Link href="/cari-produk" className="button button-outline button-full">Bantu Saya Memilih</Link>
      </aside>

      <div className="catalog-results">
        <label className="field-label" htmlFor="product-search">Cari produk atau kategori</label>
        <input
          id="product-search"
          className="text-input"
          type="search"
          placeholder="Contoh: pouch, cup, kemasan makanan…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-describedby="catalog-result-count"
        />
        <div className="result-meta">
          <p id="catalog-result-count" aria-live="polite" aria-atomic="true">
            Menampilkan {filtered.length} dari {products.length} referensi · {category}
          </p>
          {(query || category !== "Semua Produk") && (
            <button type="button" className="text-button" onClick={() => { setQuery(""); setCategory("Semua Produk"); }}>
              Hapus filter
            </button>
          )}
        </div>
        {filtered.length > 0 ? (
          <div className="product-grid catalog-products">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <PlaceholderImage label={`Foto ${product.category} akan ditambahkan`} />
                <div className="card-body">
                  <p className="card-kicker">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <Link href={`/produk/${product.slug}`} className="text-link">Lihat detail →</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state" role="status">
            <h3>Referensi belum ditemukan</h3>
            <p>Coba kata kunci lain atau tampilkan semua kategori.</p>
            <button type="button" className="button button-outline" onClick={() => { setQuery(""); setCategory("Semua Produk"); }}>
              Tampilkan semua referensi
            </button>
          </div>
        )}
        <p className="notice">
          Katalog ini membantu memilih kategori awal. Ketersediaan produk, bahan,
          ukuran, jumlah minimum, dan harga akan dikonfirmasi saat konsultasi.
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
      <div className="filter-chips" role="group" aria-label="Filter inspirasi produk">
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
      <p className="result-meta" aria-live="polite">Menampilkan {filtered.length} kategori referensi.</p>
      <div className="product-grid portfolio-grid">
        {filtered.map((item) => (
          <article className="product-card" key={item.id}>
            <PlaceholderImage label={`Foto referensi ${item.category} akan ditambahkan`} />
            <div className="card-body">
              <p className="card-kicker">Referensi kategori</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={`/konsultasi?referensi=${encodeURIComponent(item.title)}`} className="text-link">
                Gunakan sebagai bahan konsultasi →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function getSavedDraft(): ConsultationDraft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return emptyDraft;
    return { ...emptyDraft, ...JSON.parse(raw) };
  } catch {
    return emptyDraft;
  }
}

export function ConsultationForm() {
  const [draft, setDraft] = useState<ConsultationDraft>(emptyDraft);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = getSavedDraft();
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get("produk") ?? params.get("kategori") ?? "";
    const referenceParam = params.get("referensi") ?? "";
    const selectedProduct = products.find((item) => item.name === productParam);
    const selectedCategory = categories.includes(productParam as ProductCategory)
      ? productParam
      : selectedProduct?.category ?? "";
    setDraft({
      ...saved,
      product: selectedCategory || saved.product,
      notes: referenceParam
        ? `Referensi yang ingin dibahas: ${referenceParam}`
        : saved.notes,
    });
    setReady(true);
  }, []);

  function update(field: keyof ConsultationDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Keep the interaction usable; the following page explains the local-only behavior.
    }
    window.location.assign("/konfirmasi");
  }

  if (!ready) {
    return <div className="form-loading" role="status">Menyiapkan formulir konsultasi…</div>;
  }

  return (
    <form className="consultation-form" onSubmit={submit}>
      <section className="form-section" aria-labelledby="form-product-heading">
        <h2 id="form-product-heading">1. Kebutuhan produk</h2>
        <p className="muted">Isi yang sudah Anda ketahui. Kolom boleh dikosongkan atau diisi “Belum tahu”.</p>
        <label className="field-label" htmlFor="consult-product">Produk atau kategori</label>
        <select id="consult-product" className="text-input" value={draft.product} onChange={(event) => update("product", event.target.value)}>
          <option value="">Pilih kategori atau belum tahu</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          <option value="Belum tahu">Belum tahu</option>
        </select>
        <div className="form-grid">
          <label className="field-label" htmlFor="consult-quantity">
            Perkiraan jumlah
            <input id="consult-quantity" className="text-input" value={draft.quantity} onChange={(event) => update("quantity", event.target.value)} placeholder="Contoh: 500 pcs / belum tahu" />
          </label>
          <label className="field-label" htmlFor="consult-size">
            Perkiraan ukuran
            <input id="consult-size" className="text-input" value={draft.size} onChange={(event) => update("size", event.target.value)} placeholder="Contoh: 10 × 15 cm / belum tahu" />
          </label>
          <label className="field-label" htmlFor="consult-material">
            Bahan yang diinginkan
            <input id="consult-material" className="text-input" value={draft.material} onChange={(event) => update("material", event.target.value)} placeholder="Bahan / belum tahu" />
          </label>
          <label className="field-label" htmlFor="consult-shape">
            Bentuk atau model
            <input id="consult-shape" className="text-input" value={draft.shape} onChange={(event) => update("shape", event.target.value)} placeholder="Bentuk / belum tahu" />
          </label>
        </div>
        <label className="field-label" htmlFor="consult-budget">
          Perkiraan anggaran (opsional)
          <input id="consult-budget" className="text-input" value={draft.budget} onChange={(event) => update("budget", event.target.value)} placeholder="Boleh dikosongkan" />
        </label>
        <p className="helper">Informasi ini hanya bahan diskusi awal, bukan harga atau penawaran yang mengikat.</p>
      </section>

      <section className="form-section" aria-labelledby="form-reference-heading">
        <h2 id="form-reference-heading">2. Desain atau referensi</h2>
        <p className="muted">Boleh dilewati apabila belum memiliki gambar atau desain.</p>
        <label className="field-label" htmlFor="consult-reference">Pilih gambar atau PDF referensi</label>
        <input
          id="consult-reference"
          className="text-input file-input"
          type="file"
          accept="image/*,.pdf"
          onChange={(event) => update("referenceFileName", event.target.files?.[0]?.name ?? "")}
        />
        <p className="helper">
          Untuk tahap frontend ini, file belum diunggah ke server. Setelah WhatsApp terbuka,
          lampirkan file tersebut secara manual pada percakapan.
        </p>
        {draft.referenceFileName && <p className="selected-file">File dipilih: {draft.referenceFileName}</p>}
        <label className="field-label" htmlFor="consult-notes">
          Catatan kebutuhan (opsional)
          <textarea id="consult-notes" className="text-input text-area" value={draft.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Ceritakan fungsi produk, contoh penggunaan, atau hal khusus yang perlu diketahui." rows={4} />
        </label>
      </section>

      <section className="form-section" aria-labelledby="form-contact-heading">
        <h2 id="form-contact-heading">3. Informasi kontak</h2>
        <p className="muted">Cantumkan informasi jika ingin dimasukkan ke ringkasan konsultasi.</p>
        <div className="form-grid">
          <label className="field-label" htmlFor="consult-name">
            Nama
            <input id="consult-name" className="text-input" autoComplete="name" value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="Nama Anda" />
          </label>
          <label className="field-label" htmlFor="consult-whatsapp">
            Nomor WhatsApp Anda (opsional)
            <input id="consult-whatsapp" className="text-input" type="tel" autoComplete="tel" value={draft.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} placeholder="Contoh: 08xxxxxxxxxx" />
          </label>
        </div>
        <p className="helper">Data ini belum dikirim atau disimpan ke server. Data hanya digunakan untuk membuat ringkasan di browser ini.</p>
      </section>

      <div className="form-actions">
        <button className="button button-dark" type="submit">Tinjau Ringkasan →</button>
        <button className="button button-quiet" type="button" onClick={() => { setDraft(emptyDraft); try { sessionStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem(LEGACY_STORAGE_KEY); } catch {} }}>
          Kosongkan formulir
        </button>
      </div>
      <p className="helper">Mengirim ringkasan melalui WhatsApp tidak otomatis membuat pesanan atau menyetujui harga.</p>
    </form>
  );
}

function formatConsultationMessage(draft: ConsultationDraft) {
  const value = (text: string) => text.trim() || "Belum diisi";
  return [
    "Halo Cinderella Printing, saya ingin berkonsultasi mengenai kebutuhan cetak/kemasan.",
    "",
    "RINGKASAN KEBUTUHAN",
    `Nama: ${value(draft.name)}`,
    `Nomor WhatsApp: ${value(draft.whatsapp)}`,
    `Produk/kategori: ${value(draft.product)}`,
    `Perkiraan jumlah: ${value(draft.quantity)}`,
    `Ukuran: ${value(draft.size)}`,
    `Bahan: ${value(draft.material)}`,
    `Bentuk/model: ${value(draft.shape)}`,
    `Perkiraan anggaran: ${value(draft.budget)}`,
    `Catatan: ${value(draft.notes)}`,
    `Nama file referensi: ${value(draft.referenceFileName)}`,
    draft.referenceFileName ? "Catatan: Saya akan melampirkan file referensi secara manual di chat ini." : "",
    "",
    "Mohon informasi mengenai pilihan spesifikasi dan penawaran yang sesuai. Terima kasih.",
  ].filter(Boolean).join("\n");
}

export function ConsultationSummary() {
  const [draft, setDraft] = useState<ConsultationDraft>(emptyDraft);
  const [loaded, setLoaded] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    setDraft(getSavedDraft());
    setLoaded(true);
  }, []);

  const message = useMemo(() => formatConsultationMessage(draft), [draft]);
  const whatsappUrl = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    : "";

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyStatus("Ringkasan berhasil disalin. Anda dapat menempelkannya pada percakapan WhatsApp.");
    } catch {
      setCopyStatus("Penyalinan otomatis tidak tersedia di browser ini. Pilih dan salin teks ringkasan secara manual.");
    }
  }

  if (!loaded) return <div className="form-loading" role="status">Memuat ringkasan…</div>;

  const fields: [string, string][] = [
    ["Produk atau kategori", draft.product],
    ["Perkiraan jumlah", draft.quantity],
    ["Ukuran", draft.size],
    ["Bahan", draft.material],
    ["Bentuk atau model", draft.shape],
    ["Perkiraan anggaran", draft.budget],
    ["Desain/referensi", draft.referenceFileName],
    ["Catatan", draft.notes],
    ["Nama", draft.name],
    ["Nomor WhatsApp", draft.whatsapp],
  ];

  return (
    <div className="summary-layout">
      <section className="summary-card" aria-labelledby="summary-heading">
        <h2 id="summary-heading">Ringkasan kebutuhan</h2>
        <p className="muted">Periksa kembali informasi sebelum diteruskan ke pihak Cinderella Printing.</p>
        {fields.map(([label, value]) => (
          <div className="summary-row" key={label}>
            <span>{label}</span>
            <strong>{value.trim() || "Belum diisi"}</strong>
          </div>
        ))}
        <p className="notice">
          Ringkasan ini dibuat di browser dan belum dikirim ke database. File referensi
          juga belum terunggah; lampirkan file secara manual setelah chat WhatsApp terbuka.
        </p>
        <Link href="/konsultasi" className="button button-outline">← Ubah informasi</Link>
      </section>
      <aside className="summary-aside">
        <h2>Lanjutkan konsultasi</h2>
        <p>Ringkasan akan disiapkan sebagai pesan WhatsApp. Tinjau pesan sebelum menekan tombol kirim di WhatsApp.</p>
        {whatsappUrl ? (
          <a className="button button-dark button-full" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Buka WhatsApp dengan Ringkasan ↗
          </a>
        ) : (
          <>
            <p className="helper">Nomor WhatsApp resmi belum dikonfigurasi. Salin ringkasan, lalu gunakan informasi kontak resmi pada halaman berikut.</p>
            <button type="button" className="button button-dark button-full" onClick={copySummary}>Salin Ringkasan</button>
            <Link href="/faq-kontak" className="button button-outline button-full">Lihat Kontak</Link>
          </>
        )}
        {whatsappUrl && <button type="button" className="button button-outline button-full" onClick={copySummary}>Salin Teks Ringkasan</button>}
        <p className="helper" aria-live="polite">{copyStatus}</p>
        <p className="helper">Pesan ini merupakan permintaan konsultasi, bukan pesanan yang telah dikonfirmasi atau persetujuan pembayaran.</p>
      </aside>
    </div>
  );
}

export function FaqList() {
  const faqs: [string, string][] = [
    [
      "Bagaimana cara memulai konsultasi?",
      "Pilih kategori yang paling mendekati kebutuhan Anda, lalu siapkan informasi awal melalui formulir konsultasi atau hubungi Cinderella Printing melalui WhatsApp. Anda tidak harus mengetahui seluruh spesifikasi sejak awal.",
    ],
    [
      "Apakah formulir konsultasi langsung membuat pesanan?",
      "Tidak. Formulir hanya membantu menyusun ringkasan kebutuhan untuk dibahas. Pesanan dicatat dan dikelola oleh admin setelah konsultasi, rincian produk, harga, dan persetujuan pesanan dikonfirmasi.",
    ],
    [
      "Apakah saya harus mengetahui semua spesifikasi?",
      "Tidak. Anda dapat memulai dari jenis produk, fungsi kemasan, atau contoh yang diinginkan. Jumlah, ukuran, bahan, dan detail lainnya dapat dibahas kemudian.",
    ],
    [
      "Berapa jumlah minimum pemesanan?",
      "Jumlah minimum dapat berbeda menurut jenis produk dan spesifikasinya. Tanyakan jumlah minimum untuk kebutuhan Anda saat konsultasi agar informasinya sesuai dengan produk yang dipilih.",
    ],
    [
      "Bagaimana cara mengetahui harga?",
      "Harga dibahas melalui penawaran setelah jenis produk, jumlah, ukuran, bahan, dan kebutuhan kustomisasi diperjelas. Informasi pada katalog bukan harga transaksi final.",
    ],
    [
      "Apakah bisa konsultasi tanpa desain final?",
      "Bisa. Anda dapat memulai dengan penjelasan kebutuhan, sketsa, atau contoh referensi. Jika memiliki file desain, lampirkan saat melanjutkan percakapan WhatsApp.",
    ],
    [
      "Berapa lama proses produksi?",
      "Estimasi waktu perlu dikonfirmasi setelah jenis produk, jumlah, spesifikasi, dan desain disepakati. Jangan menganggap estimasi berlaku sama untuk semua kategori.",
    ],
    [
      "Bahan dan ukuran apa saja yang tersedia?",
      "Pilihan bahan dan ukuran bergantung pada kategori serta kebutuhan produk. Sampaikan fungsi produk dan ukuran perkiraan saat konsultasi agar pilihan yang tersedia dapat diperiksa.",
    ],
    [
      "Bagaimana pengiriman dilakukan?",
      "Metode, biaya, dan jadwal pengiriman dibahas berdasarkan lokasi tujuan serta detail pesanan setelah kebutuhan produksi dikonfirmasi.",
    ],
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
