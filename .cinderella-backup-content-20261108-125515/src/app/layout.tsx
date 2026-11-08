import type { Metadata } from "next";
import { Header, Footer } from "@/components/site";
import MotionProvider from "@/components/motion-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cinderella Printing | Custom Printing & Packaging",
  description: "Website informasi dan konsultasi custom printing dan packaging Cinderella Printing.",
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
