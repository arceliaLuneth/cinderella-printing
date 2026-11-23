import Link from "next/link";
import {
  BUSINESS_ADDRESS,
  BUSINESS_EMAIL,
  BUSINESS_HOURS,
  BUSINESS_MEETING_NOTE,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_NUMBER,
} from "@/lib/site-data";

const nav = [
  ["Beranda", "/"],
  ["Produk", "/produk"],
  ["Portofolio", "/portofolio"],
  ["Tentang & Cara Pesan", "/tentang"],
  ["FAQ & Kontak", "/faq-kontak"],
] as const;

export function WhatsAppLink({
  label = "WhatsApp",
  className = "button button-outline",
  message = "Halo Cinderella Printing, saya ingin bertanya mengenai produk dan layanan cetak/kemasan.",
}: {
  label?: string;
  className?: string;
  message?: string;
}) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {label} ↗
    </a>
  );
}

export function Header() {
  return (
    <>
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
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
          <WhatsAppLink label="Konsultasi ↗" className="button button-dark header-cta" />
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>Cinderella Printing</h3>
          <p>
            Solusi cetak dan kemasan untuk kebutuhan bisnis. Jelajahi hasil produksi,
            pahami pilihan awal, lalu diskusikan spesifikasi sebelum penawaran disusun.
          </p>
          <p className="footer-tagline">Print ideas. Crafted for business.</p>
        </div>
        <div>
          <h4>Jelajahi</h4>
          <Link href="/produk">Katalog Produk</Link>
          <Link href="/cari-produk">Bantu Saya Memilih</Link>
          <Link href="/portofolio">Hasil Produksi</Link>
          <Link href="/tentang">Tentang &amp; Cara Pesan</Link>
          <Link href="/faq-kontak">FAQ &amp; Kontak</Link>
        </div>
        <div>
          <h4>Hubungi Kami</h4>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            WhatsApp: +{WHATSAPP_NUMBER}
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Instagram: {INSTAGRAM_HANDLE}
          </a>
          {BUSINESS_EMAIL && <p>Email: {BUSINESS_EMAIL}</p>}
          {BUSINESS_ADDRESS && <p>Office &amp; meeting point: {BUSINESS_ADDRESS}</p>}
          <p className="footer-note">{BUSINESS_MEETING_NOTE}</p>
          {BUSINESS_HOURS && <p>Jam operasional: {BUSINESS_HOURS}</p>}
          <WhatsAppLink label="Mulai Konsultasi" className="button button-outline" />
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Cinderella Printing · Informasi Produk &amp; Konsultasi</span>
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
    <div className="container page-intro" data-motion="reveal">
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
  title = "Punya kebutuhan cetak atau kemasan?",
  text = "Ceritakan kebutuhan awal Anda. Tim Cinderella Printing akan membantu membahas pilihan dan spesifikasi yang sesuai.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="cta-band" data-motion="reveal">
      <div className="container cta-inner">
        <div>
          <p className="eyebrow cta-eyebrow">MULAI DARI KEBUTUHAN ANDA</p>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="button-row">
          <Link className="button button-light" href="/konsultasi">Siapkan Konsultasi</Link>
          <WhatsAppLink label="WhatsApp ↗" className="button button-outline cta-outline" />
        </div>
      </div>
    </section>
  );
}
