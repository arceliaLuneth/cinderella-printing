import Link from "next/link";
import {
  BUSINESS_ADDRESS,
  BUSINESS_EMAIL,
  BUSINESS_HOURS,
  WHATSAPP_NUMBER,
} from "@/lib/site-data";

const nav = [
  ["Beranda", "/"],
  ["Produk", "/produk"],
  ["Inspirasi Produk", "/portofolio"],
  ["Tentang Kami", "/tentang"],
  ["FAQ & Kontak", "/faq-kontak"],
] as const;

export function WhatsAppLink({
  label = "WhatsApp",
  className = "button button-outline",
  message,
}: {
  label?: string;
  className?: string;
  message?: string;
}) {
  const base = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : "/faq-kontak";
  const href = WHATSAPP_NUMBER && message
    ? `${base}?text=${encodeURIComponent(message)}`
    : base;

  return (
    <a
      className={className}
      href={href}
      target={WHATSAPP_NUMBER ? "_blank" : undefined}
      rel={WHATSAPP_NUMBER ? "noopener noreferrer" : undefined}
    >
      {label} ↗
    </a>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Cinderella Printing — Beranda">
          <span>Cinderella Printing</span>
          <small>CUSTOM PRINTING &amp; PACKAGING</small>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <WhatsAppLink label="Tanya via WhatsApp" />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>Cinderella Printing</h3>
          <p>
            Jelajahi referensi cetak dan kemasan, lalu siapkan kebutuhan produk
            untuk dibahas melalui konsultasi. Spesifikasi dan penawaran
            dikonfirmasi sebelum pesanan diproses.
          </p>
        </div>
        <div>
          <h4>Jelajahi</h4>
          <Link href="/produk">Katalog Produk</Link>
          <Link href="/cari-produk">Bantu Saya Memilih</Link>
          <Link href="/portofolio">Inspirasi Produk</Link>
          <Link href="/tentang">Tentang &amp; Cara Pesan</Link>
          <Link href="/faq-kontak">FAQ &amp; Kontak</Link>
        </div>
        <div>
          <h4>Hubungi Kami</h4>
          {WHATSAPP_NUMBER ? (
            <p>WhatsApp: +{WHATSAPP_NUMBER}</p>
          ) : (
            <p>Kontak WhatsApp resmi akan ditampilkan setelah dikonfirmasi.</p>
          )}
          {BUSINESS_EMAIL && <p>Email: {BUSINESS_EMAIL}</p>}
          {BUSINESS_ADDRESS && <p>Alamat: {BUSINESS_ADDRESS}</p>}
          {BUSINESS_HOURS && <p>Jam operasional: {BUSINESS_HOURS}</p>}
          <WhatsAppLink label="Mulai Konsultasi" className="button button-outline" />
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Cinderella Printing · Informasi Produk &amp; Konsultasi</span>
        <span>Pesanan dikonfirmasi setelah konsultasi dan persetujuan dengan pihak usaha.</span>
      </div>
    </footer>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumb: string;
}) {
  return (
    <div className="container page-intro">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link> / <span aria-current="page">{breadcrumb}</span>
      </nav>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
    </div>
  );
}

export function CtaBand({
  title = "Mulai dari kebutuhan produk Anda.",
  text = "Pilih kategori yang paling mendekati kebutuhan, atau siapkan ringkasan untuk dibahas bersama Cinderella Printing.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="cta-band">
      <div className="container cta-inner">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="button-row">
          <Link className="button button-dark" href="/konsultasi">Siapkan Konsultasi</Link>
          <WhatsAppLink label="Tanya via WhatsApp" />
        </div>
      </div>
    </section>
  );
}
