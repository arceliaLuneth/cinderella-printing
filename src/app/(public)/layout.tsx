import { Footer, Header } from "@/components/site";
import MotionProvider from "@/components/motion-provider";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <MotionProvider>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </MotionProvider>
  );
}
