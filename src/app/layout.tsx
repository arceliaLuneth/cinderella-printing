import type { Metadata } from "next";
import { Header, Footer } from "@/components/site";
import MotionProvider from "@/components/motion-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cinderella Printing | Custom Printing & Packaging",
    template: "%s | Cinderella Printing",
  },
  description:
    "Jelajahi referensi produk cetak dan kemasan custom Cinderella Printing, lalu diskusikan kebutuhan Anda melalui konsultasi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <MotionProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
