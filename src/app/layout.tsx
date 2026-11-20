import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cinderella Printing | Custom Printing & Packaging",
    template: "%s | Cinderella Printing",
  },
  description:
    "Jelajahi hasil produksi, kategori cetak dan kemasan, serta siapkan konsultasi kebutuhan bisnis bersama Cinderella Printing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
