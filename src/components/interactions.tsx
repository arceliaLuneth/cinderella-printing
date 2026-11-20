"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Boxes,
  Gift,
  Megaphone,
  Package,
  Tag,
  Tags,
} from "lucide-react";
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

const categoryIcons = {
  Packaging: Package,
  Branding: Tag,
  Promosi: Megaphone,
  Office: Briefcase,
  "Kemasan Khusus": Gift,
  "Label & Sleeve": Tags,
  Lainnya: Boxes,
};

function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`product-image ${className}`} data-motion-image>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 31vw"
        className="product-image__img"
      />
    </div>
  );
}

export function ProductGrid({ limit }: { limit?: number }) {
  const shown = limit ? products.slice(0, limit) : products;
  return (
    <div className="product-grid" data-motion-group>
      {shown.map((product) => (
        <article className="product-card" key={product.id} data-motion-item>
          <Link href={`/produk/${product.slug}`} className="product-card__image-link" aria-label={`Lihat ${product.name}`}>
            <ProductImage src={product.image} alt={product.imageAlt} />
          </Link>
          <div className="card-body">
            <p className="card-kicker">{product.category} · Dokumentasi produk</p>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <Link href={`/produk/${product.slug}`} className="text-link">Lihat detail →</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CategoryGrid() {
  return (
    <div className="category-grid" data-motion-group>
      {categories.map((category, index) => {
        const Icon = categoryIcons[category];
        return (
          <article className="category-card category-card--icon" key={category} data-motion-item>
            <div className="category-icon" aria-hidden="true"><Icon size={25} strokeWidth={1.7} /></div>
            <div className="card-body">
              <p className="card-kicker">{String(index + 1).padStart(2, "0")} / KATEGORI</p>
              <h3>{category}</h3>
              <p>{categoryDescriptions[category]}</p>
              <Link href={`/produk?kategori=${encodeURIComponent(category)}`} className="text-link">
                Jelajahi kategori →
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function CatalogBrowser() {
  const [category, setCategory] = useState("Semua Kategori");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("kategori");
    if (selected && categories.includes(selected as ProductCategory)) setCategory(selected);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    return products.filter((item) => {
      const categoryMatch = category === "Semua Kategori" || item.category === category;
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
          {["Semua Kategori", ...categories].map((name) => (
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
          placeholder="Contoh: box roti, fried chicken, pizza…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-describedby="catalog-result-count"
        />
        <div className="result-meta">
          <p id="catalog-result-count" aria-live="polite" aria-atomic="true">
            Menampilkan {filtered.length} foto produk · {category}
          </p>
          {(query || category !== "Semua Kategori") && (
            <button type="button" className="text-button" onClick={() => { setQuery(""); setCategory("Semua Kategori"); }}>
              Hapus filter
            </button>
          )}
        </div>
        {filtered.length > 0 ? (
          <div className="product-grid catalog-products" data-motion-group>
            {filtered.map((product) => (
              <article className="product-card" key={product.id} data-motion-item>
                <Link href={`/produk/${product.slug}`} className="product-card__image-link" aria-label={`Lihat ${product.name}`}>
                  <ProductImage src={product.image} alt={product.imageAlt} />
                </Link>
                <div className="card-body">
                  <p className="card-kicker">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <Link href={`/produk/${product.slug}`} className="text-link">Lihat detail →</Link>
                </div>
              </article>
            ))}
          </div>
        ) : category !== "Semua Kategori" && !query ? (
          <div className="category-empty-state" role="status">
            <p className="eyebrow">{category.toUpperCase()}</p>
            <h3>{category}</h3>
            <p>{categoryDescriptions[category as ProductCategory]}</p>
            <p className="muted">Foto contoh untuk kategori ini belum tersedia di galeri. Informasi produk dan ketersediaannya dapat ditanyakan langsung.</p>
            <Link href={`/konsultasi?kategori=${encodeURIComponent(category)}`} className="button button-dark">Tanyakan kategori ini →</Link>
          </div>
        ) : (
          <div className="empty-state" role="status">
            <h3>Produk belum ditemukan</h3>
            <p>Coba kata kunci lain atau tampilkan seluruh foto produk.</p>
            <button type="button" className="button button-outline" onClick={() => { setQuery(""); setCategory("Semua Kategori"); }}>
              Tampilkan semua produk
            </button>
          </div>
        )}
        <p className="notice">
          Foto menampilkan contoh hasil produksi yang tersedia. Jumlah minimum, bahan, ukuran,
          finishing, harga, dan ketersediaan setiap opsi dikonfirmasi saat konsultasi.
        </p>
      </div>
    </div>
  );
}

export function PortfolioBrowser() {
  const [category, setCategory] = useState("Semua");
  const trackRef = useRef<HTMLDivElement>(null);
  const filtered = category === "Semua"
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === category);

  function scrollCarousel(left: number) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trackRef.current?.scrollBy({ left, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function moveCarousel(direction: -1 | 1) {
    scrollCarousel(direction * 360);
  }

  return (
    <>
      <div className="portfolio-toolbar">
        <div className="filter-chips" role="group" aria-label="Filter hasil produksi">
          {["Semua", ...categories].map((item) => (
            <button
              type="button"
              key={item}
              className={`chip ${category === item ? "active" : ""}`}
              aria-pressed={category === item}
              onClick={() => {
                setCategory(item);
                scrollCarousel(-(trackRef.current?.scrollLeft ?? 0));
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="carousel-controls">
          <button type="button" className="carousel-control" onClick={() => moveCarousel(-1)} aria-label="Geser galeri ke kiri"><ArrowLeft size={18} /></button>
          <button type="button" className="carousel-control" onClick={() => moveCarousel(1)} aria-label="Geser galeri ke kanan"><ArrowRight size={18} /></button>
        </div>
      </div>
      <p className="result-meta" aria-live="polite">Menampilkan {filtered.length} dokumentasi hasil produksi.</p>
      {filtered.length ? (
        <div className="portfolio-track" ref={trackRef} tabIndex={0} aria-label="Galeri hasil produksi Cinderella Printing">
          {filtered.map((item) => (
            <article className="portfolio-slide product-card" key={item.id}>
              <Link href={`/produk/${item.slug}`} className="product-card__image-link" aria-label={`Lihat detail ${item.name}`}>
                <ProductImage src={item.image} alt={item.imageAlt} />
              </Link>
              <div className="card-body">
                <p className="card-kicker">Hasil produksi · {item.category}</p>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <Link href={`/konsultasi?produk=${encodeURIComponent(item.name)}`} className="text-link">Diskusikan produk serupa →</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="category-empty-state" role="status">
          <h3>Foto kategori ini belum tersedia</h3>
          <p>{categoryDescriptions[category as ProductCategory]}</p>
          <Link href={`/konsultasi?kategori=${encodeURIComponent(category)}`} className="button button-outline">Tanyakan kategori ini →</Link>
        </div>
      )}
      <p className="notice">Galeri ini menampilkan dokumentasi produk yang diberikan untuk website. Spesifikasi teknis setiap produk tidak disimpulkan dari foto.</p>
    </>
  );
}

export function GuidedDiscovery() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const [preparation, setPreparation] = useState("");

  const consultationHref = selectedCategory
    ? `/konsultasi?kategori=${encodeURIComponent(selectedCategory)}&kebutuhan=${encodeURIComponent(preparation)}`
    : "/konsultasi";

  return (
    <section className="discovery-wizard" aria-labelledby="discovery-heading">
      <div className="discovery-progress" aria-label={`Langkah ${step} dari 2`}>
        <span className={step >= 1 ? "is-active" : ""}>01</span>
        <i className={step >= 2 ? "is-active" : ""} />
        <span className={step >= 2 ? "is-active" : ""}>02</span>
      </div>

      {step === 1 ? (
        <div className="discovery-panel" key="step-1" data-motion-step>
          <p className="eyebrow">LANGKAH 01 / PILIH KEBUTUHAN</p>
          <h2 id="discovery-heading">Apa yang ingin Anda buat?</h2>
          <p className="section-desc">Pilih kategori yang paling mendekati kebutuhan. Pilihan ini hanya membantu mengarahkan konsultasi.</p>
          <div className="discovery-options">
            {categories.map((category) => {
              const Icon = categoryIcons[category];
              return (
                <button
                  type="button"
                  key={category}
                  className={`discovery-option ${selectedCategory === category ? "is-selected" : ""}`}
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  <Icon size={22} />
                  <span>{category}</span>
                  <span className="discovery-option__check" aria-hidden="true">{selectedCategory === category ? "✓" : "＋"}</span>
                </button>
              );
            })}
          </div>
          <div className="discovery-actions">
            <span className="helper">Tidak yakin? Pilih kategori yang paling mendekati.</span>
            <button type="button" className="button button-dark" disabled={!selectedCategory} onClick={() => setStep(2)}>Lanjutkan →</button>
          </div>
        </div>
      ) : (
        <div className="discovery-panel" key="step-2" data-motion-step>
          <p className="eyebrow">LANGKAH 02 / KESIAPAN ANDA</p>
          <h2 id="discovery-heading">Apa yang sudah Anda siapkan?</h2>
          <p className="section-desc">Tidak ada jawaban yang salah. Pilih kondisi yang paling sesuai saat ini.</p>
          <div className="discovery-options discovery-options--stacked">
            {[
              "Saya sudah punya desain atau contoh produk",
              "Saya perlu bantuan menentukan ukuran dan bahan",
              "Saya masih mencari gambaran dan ingin berdiskusi",
            ].map((option) => (
              <button
                type="button"
                key={option}
                className={`discovery-option ${preparation === option ? "is-selected" : ""}`}
                aria-pressed={preparation === option}
                onClick={() => setPreparation(option)}
              >
                <span>{option}</span>
                <span className="discovery-option__check" aria-hidden="true">{preparation === option ? "✓" : "＋"}</span>
              </button>
            ))}
          </div>
          <div className="discovery-actions">
            <button type="button" className="button button-outline" onClick={() => setStep(1)}>← Kembali</button>
            <Link className={`button button-dark ${!preparation ? "is-disabled" : ""}`} aria-disabled={!preparation} href={preparation ? consultationHref : "#discovery-heading"} onClick={(event) => { if (!preparation) event.preventDefault(); }}>
              Siapkan Konsultasi →
            </Link>
          </div>
        </div>
      )}
    </section>
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
    const needParam = params.get("kebutuhan") ?? "";
    const selectedProduct = products.find((item) => item.name === productParam);
    const selectedCategory = categories.includes(productParam as ProductCategory)
      ? productParam
      : selectedProduct?.category ?? "";

    setDraft({
      ...saved,
      product: selectedProduct?.name || selectedCategory || saved.product,
      notes: [
        referenceParam ? `Referensi yang ingin dibahas: ${referenceParam}` : "",
        needParam ? `Kondisi kebutuhan: ${needParam}` : "",
        saved.notes,
      ].filter(Boolean).join("\n"),
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
      // The summary page explains the local-only behavior if storage is unavailable.
    }
    window.location.assign("/konfirmasi");
  }

  if (!ready) return <div className="form-loading" role="status">Menyiapkan formulir konsultasi…</div>;

  return (
    <form className="consultation-form" onSubmit={submit}>
      <section className="form-section" aria-labelledby="form-product-heading" data-motion="reveal">
        <h2 id="form-product-heading">1. Kebutuhan produk</h2>
        <p className="muted">Isi informasi yang sudah diketahui. Bagian yang belum pasti boleh dikosongkan.</p>
        <label className="field-label" htmlFor="consult-product">Produk atau kategori</label>
        <select id="consult-product" className="text-input" value={draft.product} onChange={(event) => update("product", event.target.value)}>
          <option value="">Pilih kategori atau belum tahu</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          <option value="Belum tahu">Belum tahu</option>
        </select>
        <div className="form-grid">
          <label className="field-label" htmlFor="consult-quantity">Perkiraan jumlah
            <input id="consult-quantity" className="text-input" value={draft.quantity} onChange={(event) => update("quantity", event.target.value)} placeholder="Contoh: 500 pcs / belum tahu" />
          </label>
          <label className="field-label" htmlFor="consult-size">Perkiraan ukuran
            <input id="consult-size" className="text-input" value={draft.size} onChange={(event) => update("size", event.target.value)} placeholder="Contoh: 10 × 15 cm / belum tahu" />
          </label>
          <label className="field-label" htmlFor="consult-material">Bahan yang diinginkan
            <input id="consult-material" className="text-input" value={draft.material} onChange={(event) => update("material", event.target.value)} placeholder="Contoh: Ivory, Duplex, Kraft / belum tahu" />
          </label>
          <label className="field-label" htmlFor="consult-shape">Bentuk atau model
            <input id="consult-shape" className="text-input" value={draft.shape} onChange={(event) => update("shape", event.target.value)} placeholder="Contoh: box, sleeve, pouch / belum tahu" />
          </label>
        </div>
        <label className="field-label" htmlFor="consult-budget">Perkiraan anggaran (opsional)
          <input id="consult-budget" className="text-input" value={draft.budget} onChange={(event) => update("budget", event.target.value)} placeholder="Boleh dikosongkan" />
        </label>
        <p className="helper">Informasi ini hanya bahan diskusi awal, bukan harga atau penawaran yang mengikat.</p>
      </section>

      <section className="form-section" aria-labelledby="form-reference-heading" data-motion="reveal">
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
        <p className="helper">File belum diunggah ke server. Setelah WhatsApp terbuka, lampirkan file tersebut secara manual di chat.</p>
        {draft.referenceFileName && <p className="selected-file">File dipilih: {draft.referenceFileName}</p>}
        <label className="field-label" htmlFor="consult-notes">Catatan kebutuhan (opsional)
          <textarea id="consult-notes" className="text-input text-area" value={draft.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Ceritakan fungsi produk, contoh penggunaan, atau hal khusus yang perlu diketahui." rows={4} />
        </label>
      </section>

      <section className="form-section" aria-labelledby="form-contact-heading" data-motion="reveal">
        <h2 id="form-contact-heading">3. Informasi kontak</h2>
        <p className="muted">Informasi ini dapat dimasukkan ke dalam pesan konsultasi.</p>
        <div className="form-grid">
          <label className="field-label" htmlFor="consult-name">Nama
            <input id="consult-name" className="text-input" autoComplete="name" value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="Nama Anda" />
          </label>
          <label className="field-label" htmlFor="consult-whatsapp">Nomor WhatsApp Anda (opsional)
            <input id="consult-whatsapp" className="text-input" type="tel" autoComplete="tel" value={draft.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} placeholder="Contoh: 08xxxxxxxxxx" />
          </label>
        </div>
        <p className="helper">Data ini hanya digunakan untuk membuat ringkasan sementara di browser, bukan dikirim ke server.</p>
      </section>

      <div className="form-actions">
        <button className="button button-dark" type="submit">Tinjau Ringkasan →</button>
        <button className="button button-quiet" type="button" onClick={() => {
          setDraft(emptyDraft);
          try { sessionStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* Ignore storage failure. */ }
        }}>
          Kosongkan formulir
        </button>
      </div>
      <p className="helper">Ringkasan WhatsApp bukan pesanan yang telah dikonfirmasi atau persetujuan pembayaran.</p>
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
      setCopyStatus("Penyalinan otomatis tidak tersedia. Salin teks secara manual dari ringkasan.");
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
          Ringkasan dibuat di browser dan belum dikirim ke database. File referensi
          juga belum terunggah; lampirkan file secara manual setelah chat WhatsApp terbuka.
        </p>
        <Link href="/konsultasi" className="button button-outline">← Ubah informasi</Link>
      </section>
      <aside className="summary-aside">
        <h2>Lanjutkan konsultasi</h2>
        <p>Pesan WhatsApp akan disiapkan dari ringkasan. Tinjau kembali sebelum menekan tombol kirim di WhatsApp.</p>
        {whatsappUrl ? (
          <a className="button button-dark button-full" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Buka WhatsApp dengan Ringkasan ↗
          </a>
        ) : (
          <button type="button" className="button button-dark button-full" onClick={copySummary}>Salin Ringkasan</button>
        )}
        <button type="button" className="button button-outline button-full" onClick={copySummary}>Salin Teks Ringkasan</button>
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
      "Pilih kategori yang paling mendekati kebutuhan, lihat contoh hasil produksi, lalu hubungi Cinderella Printing. Anda juga dapat menyiapkan ringkasan kebutuhan sebelum membuka WhatsApp.",
    ],
    [
      "Apakah formulir konsultasi langsung membuat pesanan?",
      "Tidak. Formulir hanya membantu menyusun ringkasan kebutuhan. Pesanan dicatat dan dikelola admin setelah konsultasi, rincian produk, harga, dan persetujuan pesanan dikonfirmasi.",
    ],
    [
      "Apakah saya harus memiliki desain final?",
      "Tidak harus. Anda dapat memulai dengan ide, sketsa, atau contoh visual. Jika sudah memiliki file desain, lampirkan secara manual pada percakapan WhatsApp.",
    ],
    [
      "Pilihan bahan apa yang dapat dibahas?",
      "Katalog Cinderella Printing memperkenalkan bahan Ivory, Duplex, dan Kraft untuk kebutuhan kemasan. Kesesuaian bahan bergantung pada produk dan spesifikasi yang dibutuhkan, sehingga perlu dikonfirmasi saat konsultasi.",
    ],
    [
      "Apakah ukuran kemasan bisa disesuaikan?",
      "Katalog menampilkan opsi ukuran custom. Sampaikan ukuran produk atau contoh kemasan yang diinginkan agar tim dapat membantu membahas dimensi yang sesuai.",
    ],
    [
      "Berapa jumlah minimum pemesanan?",
      "Jumlah minimum dapat berbeda menurut jenis produk dan spesifikasinya. Tanyakan jumlah minimum untuk kebutuhan Anda saat konsultasi.",
    ],
    [
      "Bagaimana cara mengetahui harga?",
      "Harga dibahas melalui penawaran setelah produk, jumlah, ukuran, bahan, desain, dan kebutuhan kustomisasi diperjelas. Foto dan referensi pada website bukan daftar harga transaksi.",
    ],
    [
      "Apakah tersedia sistem re-stock?",
      "Katalog Cinderella Printing menampilkan opsi sistem re-stock untuk kebutuhan berulang. Pembagian jumlah, jadwal pengiriman, dan ketentuannya perlu disepakati sesuai pesanan.",
    ],
    [
      "Berapa lama proses produksi dan pengiriman?",
      "Estimasi perlu dikonfirmasi setelah jenis produk, jumlah, spesifikasi, desain, dan lokasi tujuan dibahas. Waktu tidak disamaratakan untuk semua pesanan.",
    ],
  ];

  return (
    <div className="faq-list" data-motion-group>
      {faqs.map(([question, answer]) => (
        <details key={question} data-motion-item>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}
