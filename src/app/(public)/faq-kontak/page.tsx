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
import { CtaBand, PageIntro, WhatsAppLink } from "@/components/site";
import { FaqList } from "@/components/interactions";

export default function FaqContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="INFORMASI & BANTUAN"
        title="Pertanyaan dan kontak."
        description="Temukan panduan awal mengenai produk, konsultasi, dan pemesanan. Jika masih ada hal yang perlu dibahas, hubungi Cinderella Printing melalui kanal resmi."
        breadcrumb="FAQ & Kontak"
      />
      <section className="section container faq-layout">
        <aside data-motion="reveal">
          <p className="eyebrow">PUSAT BANTUAN</p>
          <h2>Punya pertanyaan spesifik?</h2>
          <p className="muted">Anda tidak harus menyelesaikan formulir untuk mulai bertanya. Hubungi kami dan ceritakan kebutuhan awal Anda.</p>
          <WhatsAppLink label="Tanya via WhatsApp ↗" className="button button-dark" />
          <p className="helper">Nomor: +{WHATSAPP_NUMBER}</p>
        </aside>
        <FaqList />
      </section>
      <section className="section-soft">
        <div className="container">
          <div className="section-heading" data-motion="reveal">
            <div>
              <p className="eyebrow">HUBUNGI KAMI</p>
              <h2>Mulai percakapan dengan Cinderella Printing.</h2>
              <p>Pilih kanal yang paling nyaman. Untuk pertemuan langsung, buat janji terlebih dahulu.</p>
            </div>
          </div>
          <div className="contact-grid contact-grid--editorial">
            <div className="contact-information" data-motion="reveal">
              <a className="contact-channel" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                <span className="contact-channel__icon">WA</span>
                <span><small>WHATSAPP</small><strong>0815-1169-3137</strong></span>
              </a>
              <a className="contact-channel" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <span className="contact-channel__icon">IG</span>
                <span><small>INSTAGRAM</small><strong>{INSTAGRAM_HANDLE}</strong></span>
              </a>
              {BUSINESS_EMAIL && (
                <div className="contact-detail"><h3>Email</h3><p>{BUSINESS_EMAIL}</p></div>
              )}
              {BUSINESS_HOURS && (
                <div className="contact-detail"><h3>Jam operasional</h3><p>{BUSINESS_HOURS}</p></div>
              )}
              <Link href="/konsultasi" className="button button-outline">Siapkan ringkasan konsultasi →</Link>
            </div>
            <div className="contact-address" data-motion="reveal">
              <p className="eyebrow">OFFICE &amp; MEETING POINT</p>
              <h3>{BUSINESS_ADDRESS}</h3>
              <p className="meeting-note">(Janji temu)</p>
              <p className="muted">{BUSINESS_MEETING_NOTE}</p>
              <WhatsAppLink label="Atur janji melalui WhatsApp →" className="button button-dark" message="Halo Cinderella Printing, saya ingin membuat janji untuk konsultasi atau pertemuan di office/meeting point." />
            </div>
          </div>
        </div>
      </section>
      <CtaBand title="Belum menemukan jawaban?" text="Sampaikan kebutuhan atau pertanyaan Anda langsung melalui WhatsApp." />
    </>
  );
}
