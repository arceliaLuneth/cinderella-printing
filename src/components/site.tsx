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
  ["Portofolio", "/portofolio"],
  ["Tentang Kami", "/tentang"],
  ["FAQ & Kontak", "/faq-kontak"],
] as const;

export function WhatsAppLink({
  label = "WhatsApp",
  className = "button button-outline",
}: {
  label?: string;
  className?: string;
}) {
  const href = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : "/faq-kontak";

  return (
    <a
      className={className}
      href={href}
      target={WHATSAPP_NUMBER ? "_blank" : undefined}
      rel={WHATSAPP_NUMBER ? "noreferrer" : undefined}
    >
      {label} ↗
    </a>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Cinderella Printing - Beranda">
          <span>Cinderella Printing</span>
          <small>CUSTOM PRINTING &amp; PACKAGING</small>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <WhatsAppLink />
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
            Solusi cetak dan kemasan custom untuk kebutuhan bisnis. Mulai dari
            eksplorasi produk, diskusi spesifikasi, hingga penawaran berdasarkan
            kebutuhan yang dibahas bersama.
          </p>
        </div>
        <div>
          <h4>Jelajahi</h4>
          <Link href="/cari-produk">Temukan Produk</Link>
          <Link href="/produk">Katalog Produk</Link>
          <Link href="/portofolio">Referensi Produk</Link>
          <Link href="/tentang">Tentang &amp; Cara Pesan</Link>
        </div>
        <div>
          <h4>Hubungi Kami</h4>
          {WHATSAPP_NUMBER ? (
            <p>WhatsApp: +{WHATSAPP_NUMBER}</p>
          ) : (
            <p>Informasi kontak dapat diperoleh melalui halaman FAQ &amp; Kontak.</p>
          )}
          {BUSINESS_EMAIL && <p>{BUSINESS_EMAIL}</p>}
          {BUSINESS_ADDRESS && <p>{BUSINESS_ADDRESS}</p>}
          {BUSINESS_HOURS && <p>Jam operasional: {BUSINESS_HOURS}</p>}
          <WhatsAppLink label="Mulai Konsultasi" className="button button-outline" />
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Cinderella Printing · Custom Printing &amp; Packaging</span>
        <span>Informasi produk dan konsultasi kebutuhan cetak &amp; kemasan.</span>
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
      <div className="breadcrumb">Beranda / {breadcrumb}</div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
    </div>
  );
}

export function CtaBand({
  title = "Punya kebutuhan cetak atau kemasan?",
  text = "Mulai dari produk yang ingin dibuat. Detail yang belum pasti dapat dibahas saat konsultasi.",
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
          <Link className="button button-dark" href="/konsultasi">Mulai Konsultasi</Link>
          <WhatsAppLink />
        </div>
      </div>
    </section>
  );
}
