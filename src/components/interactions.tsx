"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Browser-only query/sessionStorage values are hydrated after the server render. */
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ConsultationDraft } from "@/types";
import type { CatalogCategory, CatalogProduct } from "@/lib/public-catalog";
import { WHATSAPP_NUMBER } from "@/lib/site-data";
import { ProductGrid } from "./catalog-grid";

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

export function CatalogBrowser({ categories, products }: { categories: CatalogCategory[]; products: CatalogProduct[] }) {
  const [query, setQuery] = useState("");
  const categoryParam = useSearchParams().get("kategori") ?? "";
  const [selection, setSelection] = useState<{ parameter: string; id: string }>();
  const preferredCategory = selection?.parameter === categoryParam
    ? selection.id
    : categories.find((item) => item.slug === categoryParam || item.name === categoryParam)?.id;
  const category = categories.find((item) => item.id === preferredCategory)?.id ?? "";

  const key = query.trim().toLocaleLowerCase("id-ID");
  const filtered = products.filter((item) =>
    (!category || item.category_id === category) &&
    [item.name, item.description, item.category_name].some((value) => value.toLocaleLowerCase("id-ID").includes(key))
  );

  return (
    <>
      <div className="form-grid">
        <label className="field-label">
          Cari produk
          <input type="search" className="text-input" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="field-label">
          Kategori
          <select className="text-input" value={category} onChange={(event) => setSelection({ parameter: categoryParam, id: event.target.value })}>
            <option value="">Semua kategori</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      </div>
      <p className="result-meta" aria-live="polite">{filtered.length} produk</p>
      <ProductGrid products={filtered} />
    </>
  );
}

let memoryDraft: ConsultationDraft | undefined;

function getSavedDraft(): ConsultationDraft {
  if (memoryDraft) return memoryDraft;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return emptyDraft;
    const data: unknown = JSON.parse(raw);
    const draft = { ...emptyDraft };
    if (data && typeof data === "object") {
      for (const key of Object.keys(draft) as (keyof ConsultationDraft)[]) {
        const value = (data as Record<string, unknown>)[key];
        if (typeof value === "string") draft[key] = value;
      }
    }
    return draft;
  } catch {
    return emptyDraft;
  }
}

export function ConsultationForm({ categories, products }: { categories: CatalogCategory[]; products: CatalogProduct[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ConsultationDraft>(emptyDraft);
  const [ready, setReady] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = getSavedDraft();
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get("produk") ?? params.get("kategori") ?? "";
    const referenceParam = params.get("referensi") ?? "";
    const options = [...products, ...categories];
    const selected = options.find((item) => item.slug === productParam || item.name === productParam);
    const savedChoice = options.some((item) => item.name === saved.product) || saved.product === "Belum tahu" ? saved.product : "";
    setDraft({
      ...saved,
      product: selected?.name ?? savedChoice,
      notes: referenceParam
        ? `Referensi yang ingin dibahas: ${referenceParam}`
        : saved.notes,
    });
    setReady(true);
  }, [categories, products]);

  function update(field: keyof ConsultationDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    memoryDraft = draft;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Keep the interaction usable; the following page explains the local-only behavior.
    }
    router.push("/konfirmasi");
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
          <optgroup label="Produk">{products.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</optgroup>
          <optgroup label="Kategori">{categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</optgroup>
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
          ref={fileInput}
          className="text-input file-input"
          type="file"
          accept="image/*,.pdf"
          onChange={(event) => update("referenceFileName", event.target.files?.[0]?.name ?? "")}
        />
        <p className="helper">
          Lampirkan file di percakapan setelah WhatsApp terbuka.
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
        <button className="button button-quiet" type="button" onClick={() => {
          setDraft(emptyDraft);
          memoryDraft = emptyDraft;
          if (fileInput.current) fileInput.current.value = "";
          try { sessionStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem(LEGACY_STORAGE_KEY); } catch {}
        }}>
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
