import type { Metadata } from "next";
import { Header, Footer } from "@/components/site";
import MotionProvider from "@/components/motion-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cinderella Printing | Cetak & Kemasan Custom",
    template: "%s | Cinderella Printing",
  },
  description:
    "Jelajahi kategori produk cetak dan kemasan Cinderella Printing. Siapkan kebutuhan, lihat referensi, dan lanjutkan konsultasi untuk membahas spesifikasi serta penawaran.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <MotionProvider>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
