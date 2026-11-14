import { CtaBand, PageIntro, WhatsAppLink } from "@/components/site";
import { ConsultationForm } from "@/components/interactions";

export default function ConsultationPage() {
  return (
    <>
      <PageIntro
        eyebrow="RINGKASAN KEBUTUHAN AWAL"
        title="Siapkan konsultasi Anda"
        description="Isi informasi yang sudah diketahui. Jika belum tahu ukuran, bahan, atau jumlahnya, Anda dapat melewati bagian tersebut dan membahasnya saat konsultasi."
        breadcrumb="Konsultasi"
      />
      <section className="container section consultation-layout">
        <div>
          <p className="notice">
            Formulir ini hanya menyusun ringkasan kebutuhan untuk diteruskan melalui
            WhatsApp. Formulir bukan pemesanan langsung dan belum mengirim data ke server.
          </p>
          <ConsultationForm />
        </div>
        <aside className="summary-aside">
          <h2>Belum siap mengisi formulir?</h2>
          <p>Anda tetap dapat bertanya langsung. Jelaskan jenis produk atau fungsi kemasan yang dibutuhkan.</p>
          <WhatsAppLink label="Tanya melalui WhatsApp" className="button button-dark button-full" />
          <h3>Informasi yang membantu</h3>
          <ul>
            <li>Jenis produk atau barang yang akan dikemas.</li>
            <li>Perkiraan jumlah dan ukuran, jika sudah diketahui.</li>
            <li>Bahan, bentuk, atau contoh desain, jika tersedia.</li>
          </ul>
          <p className="helper">Tidak perlu menyiapkan semuanya untuk memulai konsultasi.</p>
        </aside>
      </section>
      <CtaBand title="Ingin melihat pilihan terlebih dahulu?" text="Kembali ke katalog untuk menjelajahi kategori produk sebelum menyusun ringkasan." />
    </>
  );
}
