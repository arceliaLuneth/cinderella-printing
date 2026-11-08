import Link from "next/link";
import { BUSINESS_ADDRESS, BUSINESS_EMAIL, BUSINESS_HOURS, WHATSAPP_NUMBER } from "@/lib/site-data";
import { CtaBand, PageIntro, WhatsAppLink } from "@/components/site";
import { FaqList } from "@/components/interactions";

export default function FaqContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="INFORMASI & BANTUAN"
        title="FAQ & Kontak"
        description="Temukan panduan awal tentang produk, konsultasi, dan pemesanan. Untuk kebutuhan yang lebih spesifik, lanjutkan komunikasi dengan Cinderella Printing."
        breadcrumb="FAQ & Kontak"
      />
      <section className="section container faq-layout">
        <aside>
          <h2>Pertanyaan Umum</h2>
          <p className="muted">Belum menemukan jawaban? Sampaikan kebutuhan Anda melalui kanal konsultasi yang tersedia.</p>
          <WhatsAppLink label="Hubungi Cinderella Printing" />
        </aside>
        <FaqList />
      </section>
      <section className="section-soft">
        <div className="container">
          <h2>Hubungi Cinderella Printing</h2>
          <p className="section-desc">Gunakan informasi kontak yang tersedia untuk memulai percakapan.</p>
          <div className="contact-grid">
            <div className="contact-information">
              <h3>Konsultasi</h3>
              {WHATSAPP_NUMBER ? (
                <p>WhatsApp: +{WHATSAPP_NUMBER}</p>
              ) : (
                <p>Nomor WhatsApp akan ditampilkan setelah informasi kontak resmi dikonfirmasi.</p>
              )}
              <WhatsAppLink label="Mulai Konsultasi" className="button button-dark" />
              {(BUSINESS_EMAIL || BUSINESS_HOURS) && (
                <div className="contact-pair">
                  {BUSINESS_EMAIL && <div><h4>Email</h4><p>{BUSINESS_EMAIL}</p></div>}
                  {BUSINESS_HOURS && <div><h4>Jam Operasional</h4><p>{BUSINESS_HOURS}</p></div>}
                </div>
              )}
              <p className="muted">Anda juga dapat menyiapkan kebutuhan melalui formulir konsultasi singkat.</p>
              <Link href="/konsultasi" className="button button-outline">Buka Formulir Konsultasi →</Link>
            </div>
            <div className="contact-address">
              <h3>Alamat</h3>
              {BUSINESS_ADDRESS ? (
                <p>{BUSINESS_ADDRESS}</p>
              ) : (
                <p>Alamat perusahaan akan ditampilkan setelah data resmi dikonfirmasi.</p>
              )}
              <p className="small muted">Informasi alamat dan jam operasional perlu diverifikasi sebelum website dipublikasikan.</p>
            </div>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
