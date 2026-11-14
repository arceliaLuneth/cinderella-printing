import Link from "next/link";
import {
  BUSINESS_ADDRESS,
  BUSINESS_EMAIL,
  BUSINESS_HOURS,
  WHATSAPP_NUMBER,
} from "@/lib/site-data";
import { CtaBand, PageIntro, WhatsAppLink } from "@/components/site";
import { FaqList } from "@/components/interactions";

export default function FaqContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="INFORMASI & BANTUAN"
        title="FAQ & Kontak"
        description="Temukan jawaban awal mengenai kategori produk, konsultasi, dan proses pemesanan. Jika informasi yang dibutuhkan belum tersedia, hubungi Cinderella Printing."
        breadcrumb="FAQ & Kontak"
      />
      <section className="section container faq-layout">
        <aside>
          <h2>Pertanyaan umum</h2>
          <p className="muted">Tidak menemukan jawaban yang sesuai? Sampaikan kebutuhan atau pertanyaan spesifik melalui kontak resmi.</p>
          <WhatsAppLink label="Tanya melalui WhatsApp" />
        </aside>
        <FaqList />
      </section>
      <section className="section-soft">
        <div className="container">
          <h2>Hubungi Cinderella Printing</h2>
          <p className="section-desc">Gunakan kanal yang tersedia untuk menanyakan produk atau menyampaikan kebutuhan.</p>
          <div className="contact-grid">
            <div className="contact-information">
              <h3>WhatsApp</h3>
              {WHATSAPP_NUMBER ? (
                <p>Nomor kontak: +{WHATSAPP_NUMBER}</p>
              ) : (
                <p>Nomor WhatsApp resmi belum dimasukkan. Hubungi pengelola website untuk memperoleh kontak yang benar.</p>
              )}
              <WhatsAppLink label="Mulai percakapan" className="button button-dark" />
              {BUSINESS_EMAIL && <div className="contact-detail"><h4>Email</h4><p>{BUSINESS_EMAIL}</p></div>}
              {BUSINESS_HOURS && <div className="contact-detail"><h4>Jam operasional</h4><p>{BUSINESS_HOURS}</p></div>}
              <p className="muted">Anda juga dapat menyiapkan ringkasan kebutuhan sebelum memulai percakapan.</p>
              <Link href="/konsultasi" className="button button-outline">Siapkan Ringkasan Konsultasi →</Link>
            </div>
            <div className="contact-address">
              <h3>Alamat usaha</h3>
              {BUSINESS_ADDRESS ? (
                <p>{BUSINESS_ADDRESS}</p>
              ) : (
                <p>Alamat usaha belum ditampilkan karena masih menunggu konfirmasi data resmi.</p>
              )}
              <p className="small muted">Alamat, jam operasional, dan cakupan pengiriman harus diperiksa sebelum website dipublikasikan.</p>
            </div>
          </div>
        </div>
      </section>
      <CtaBand title="Masih memiliki pertanyaan?" text="Siapkan informasi yang sudah Anda ketahui atau hubungi Cinderella Printing melalui kontak resmi." />
    </>
  );
}
